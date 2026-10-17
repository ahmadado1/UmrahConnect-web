-- Premium renewal reminders + one-time announcements (e.g. "new way to pay: Paystack").
-- Run once in the Supabase SQL editor (copy everything in this file).
-- Only the website server (service role) reads/writes these tables.

-- One row per reminder sent, so nobody gets the same reminder twice.
create table if not exists public.premium_email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('reminder_3_days', 'ended')),
  premium_until date not null,
  sent_at timestamptz not null default now(),
  unique (user_id, type, premium_until)
);
alter table public.premium_email_log enable row level security;

-- One row per person per announcement, so pressing "Send" twice never emails twice.
create table if not exists public.broadcast_log (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  email text not null,
  sent_at timestamptz not null default now(),
  unique (key, email)
);
alter table public.broadcast_log enable row level security;
