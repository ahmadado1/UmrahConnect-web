-- Premium paid by OPay / MyNita transfer (checked by hand).
-- Run once in the Supabase SQL editor (copy everything in this file).
-- The pilgrim reports the transfer -> a "pending" row. The admin checks their own OPay / MyNita
-- account and presses Confirm on /admin/agents -> Premium switches on.

alter table public.premium_payments
  add column if not exists receipt_path text,
  add column if not exists admin_note text,
  add column if not exists confirmed_at timestamptz;

create index if not exists premium_payments_status
  on public.premium_payments (status, created_at desc);

drop policy if exists "Admins read all premium payments" on public.premium_payments;
create policy "Admins read all premium payments"
  on public.premium_payments for select
  to authenticated
  using (public.is_admin());
