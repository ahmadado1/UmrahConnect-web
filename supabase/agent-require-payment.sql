-- Verify first, pay later: a verified agent with no paid-until date must NOT show in the app yet.
-- Until now, status 'active' with an empty paid_until counted as live.
-- Run this in the Supabase SQL editor.

-- 1) Preview: these agencies would be hidden until they pay (or you give them free time).
select id, business_name, agency_name, status, plan, paid_until
from public.agents
where status = 'active' and paid_until is null;

-- 2) The rule: active + no paid date = 'unpaid' (hidden), active + past date = 'expired' (hidden).
create or replace function public.agent_effective_status(p_status text, p_paid_until date)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_status = 'active' and p_paid_until is null then 'unpaid'
    when p_status = 'active' and p_paid_until < current_date then 'expired'
    else p_status
  end;
$$;

-- 3) Optional: give an existing agency free time instead of hiding it (change the id and date).
-- update public.agents set paid_until = '2026-12-31' where id = '<agent id>';
