-- Founding offer: the first 100 agencies are FREE.
-- A verified agency goes live straight away, with no payment and no paid-until date.
-- Run this in the Supabase SQL editor (SQL first, then push the website).
-- To bring paid plans back later: run agent-require-payment.sql again and set FREE_FOR_AGENCIES = false in lib/agentPlans.ts.

-- 1) The rule: "active" with no paid-until date = live (free). A past date still = expired.
create or replace function public.agent_effective_status(p_status text, p_paid_until date)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_status = 'active' and p_paid_until is not null and p_paid_until < current_date then 'expired'
    else p_status
  end;
$$;

-- 2) Switch on every verified agency that isn't live yet (verified but unpaid / expired).
--    Suspended and hidden (test/admin) agencies are left as they are.
update public.agents
set status = 'active',
    paid_until = null
where verified = true
  and coalesce(status, '') <> 'suspended'
  and coalesce(hidden, false) = false
returning business_name, agent_code, status, paid_until;

-- 3) Check: how many real agencies have joined (for the "first 100" offer).
select
  count(*) filter (where coalesce(hidden, false) = false) as agencies_joined,
  count(*) filter (where coalesce(hidden, false) = false and verified) as agencies_verified,
  count(*) filter (where coalesce(hidden, false) = false and public.agent_effective_status(status, paid_until) = 'active') as agencies_live
from public.agents;
