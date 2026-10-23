-- Paystack payments (card, bank transfer, USSD, OPay through Paystack).
-- Run once in the Supabase SQL editor.

-- Allow "paystack" as a method for agent payments.
alter table public.agent_payments drop constraint if exists agent_payments_method_check;
alter table public.agent_payments
  add constraint agent_payments_method_check check (method in ('paypal', 'opay', 'nita', 'paystack', 'other'));

-- One row per Paystack reference, so a payment is never counted twice
-- (the webhook and the "back from Paystack" page can both arrive).
create unique index if not exists agent_payments_paystack_reference
  on public.agent_payments (reference) where method = 'paystack';
create unique index if not exists premium_payments_paystack_reference
  on public.premium_payments (reference) where method = 'paystack';

-- ─── Paystack auto-renew subscriptions (card charged automatically each month / year) ───
-- One row per customer + plan. Filled from the first payment (which carries our user id)
-- and from Paystack's "subscription.create" event (which carries the subscription code).
create table if not exists public.paystack_subscriptions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('premium', 'agent')),
  user_id uuid references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  plan text not null,
  plan_code text not null,
  customer_code text not null,
  subscription_code text,
  email_token text,
  status text not null default 'pending',
  next_payment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_code, plan_code)
);
create index if not exists paystack_subscriptions_user on public.paystack_subscriptions (user_id, kind, status);
alter table public.paystack_subscriptions enable row level security;
-- No policies: only the website server (service role) reads and writes this table.
