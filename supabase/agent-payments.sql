-- Agent subscription payments (PayPal automatic + OPay / Nita manual).
-- Run this in the Supabase SQL editor.
-- Writes go through the website server (service role). Agents and admins can only read.

create table if not exists public.agent_payments (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  plan text not null check (plan in ('listed', 'featured')),
  months int not null default 1 check (months between 1 and 24),
  amount numeric(12, 2) not null,
  currency text not null check (currency in ('USD', 'NGN', 'XOF')),
  method text not null check (method in ('paypal', 'opay', 'nita', 'other')),
  reference text,
  receipt_path text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- One row per PayPal transaction, so a payment is never counted twice.
create unique index if not exists agent_payments_paypal_reference
  on public.agent_payments (reference)
  where method = 'paypal';

create index if not exists agent_payments_agent_created
  on public.agent_payments (agent_id, created_at desc);

create index if not exists agent_payments_status
  on public.agent_payments (status, created_at desc);

alter table public.agent_payments enable row level security;

drop policy if exists "Agents read own payments" on public.agent_payments;
create policy "Agents read own payments"
  on public.agent_payments for select
  to authenticated
  using (
    agent_id in (
      select a.id from public.agents a
      where coalesce(a.owner_user_id, a.user_id) = auth.uid()
    )
  );

drop policy if exists "Admins read all payments" on public.agent_payments;
create policy "Admins read all payments"
  on public.agent_payments for select
  to authenticated
  using (public.is_admin());

-- PayPal subscription currently linked to the agent.
alter table public.agents
  add column if not exists paypal_subscription_id text,
  add column if not exists paypal_status text;
