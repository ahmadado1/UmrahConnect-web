-- Pilgrim Premium: who has Premium until when, and their payments.
-- Run once in the Supabase SQL editor (copy everything in this file).

-- One row per user who ever had Premium.
create table if not exists public.user_premium (
  user_id uuid primary key references auth.users(id) on delete cascade,
  premium_until date,
  plan text check (plan in ('monthly', 'yearly')),
  source text not null default 'web',           -- 'web' now, 'apple' / 'google' later (in-app purchase)
  paypal_subscription_id text,
  paypal_status text,
  updated_at timestamptz not null default now()
);

alter table public.user_premium enable row level security;
drop policy if exists "Users read own premium" on public.user_premium;
create policy "Users read own premium"
  on public.user_premium for select
  using (auth.uid() = user_id);
-- No insert/update policy: only the website server (service role) writes here.

-- Every Premium payment.
create table if not exists public.premium_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  months int not null,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  method text not null default 'paypal',
  reference text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- The same PayPal payment can never be counted twice.
create unique index if not exists premium_payments_paypal_ref
  on public.premium_payments (reference) where method = 'paypal';

alter table public.premium_payments enable row level security;
drop policy if exists "Users read own premium payments" on public.premium_payments;
create policy "Users read own premium payments"
  on public.premium_payments for select
  using (auth.uid() = user_id);

-- Quick yes/no for the app: is the logged-in user Premium today?
create or replace function public.is_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_premium
    where user_id = auth.uid() and premium_until >= current_date
  );
$$;

grant execute on function public.is_premium() to authenticated;

-- ─── AI guide limit ─────────────────────────────────────────────────────────
-- Free users: 12 questions per 7 days. Premium: unlimited.

create table if not exists public.ai_usage (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;
drop policy if exists "Users read own ai usage" on public.ai_usage;
create policy "Users read own ai usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- Called by the ai-guide function before each question.
-- Returns {allowed, used, limit, premium}. limit is null for Premium (unlimited).
create or replace function public.ai_use_request()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  free_limit int := 12;
  used int;
  premium boolean;
begin
  if uid is null then
    return json_build_object('allowed', false, 'reason', 'login');
  end if;

  select exists (
    select 1 from public.user_premium where user_id = uid and premium_until >= current_date
  ) into premium;

  select count(*) into used
  from public.ai_usage
  where user_id = uid and created_at > now() - interval '7 days';

  if not premium and used >= free_limit then
    return json_build_object('allowed', false, 'reason', 'limit', 'used', used, 'limit', free_limit, 'premium', false);
  end if;

  insert into public.ai_usage (user_id) values (uid);
  return json_build_object(
    'allowed', true,
    'used', used + 1,
    'limit', case when premium then null else free_limit end,
    'premium', premium
  );
end;
$$;

grant execute on function public.ai_use_request() to authenticated;
