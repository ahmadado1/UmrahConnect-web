-- ============================================================================
-- UmrahConnect agencies: the rules, in one place.  Safe to run more than once.
-- Run in the Supabase SQL editor, THEN push the website.
--
--   • Verified = live.  An agency only appears in the app once an admin verifies it.
--   • Free mode (now): verified agencies are live with no payment.
--   • Paid mode (later): one switch, see the bottom of this file.
--   • Admins (you + your mum) verify on myumrahconnect.com/agents/admin.
-- ============================================================================


-- 1) THE SWITCH: free or paid ------------------------------------------------
create table if not exists public.agency_settings (
  id boolean primary key default true check (id),      -- only one row
  agencies_free boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.agency_settings (id, agencies_free) values (true, true)
on conflict (id) do nothing;

alter table public.agency_settings enable row level security;
drop policy if exists "agency settings readable" on public.agency_settings;
create policy "agency settings readable" on public.agency_settings for select using (true);
-- (no insert/update policy: only the SQL editor / server can change it)

create or replace function public.agencies_free()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select agencies_free from public.agency_settings limit 1), true);
$$;


-- 2) WHAT "LIVE" MEANS ---------------------------------------------------------
--   active + paid-until in the past           → expired (hidden)
--   active + no paid-until, in PAID mode        → unpaid  (hidden)
--   active + no paid-until, in FREE mode        → active  (live)
create or replace function public.agent_effective_status(p_status text, p_paid_until date)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_status = 'active' and p_paid_until is not null and p_paid_until < current_date then 'expired'
    when p_status = 'active' and p_paid_until is null and not public.agencies_free() then 'unpaid'
    else p_status
  end;
$$;


-- 3) GUARD RAIL: verified = live, unverified = never live ----------------------
--   • An unverified agency can't be "active" (it stays pending), whoever edits it.
--   • In free mode, ticking "verified" (website Admin, or the Table Editor) makes it live.
--   Hidden test/admin agencies are left alone.
create or replace function public.agents_verified_live()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(new.hidden, false) then
    return new;
  end if;

  if coalesce(new.verified, false) = false and new.status = 'active' then
    new.status := 'pending';
  end if;

  if public.agencies_free()
     and coalesce(new.verified, false)
     and (tg_op = 'INSERT' or coalesce(old.verified, false) = false)
     and new.status in ('pending', 'expired') then
    new.status := 'active';
    if new.paid_until is not null and new.paid_until < current_date then
      new.paid_until := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists zzzz_agents_verified_live on public.agents;
create trigger zzzz_agents_verified_live
  before insert or update on public.agents
  for each row
  execute function public.agents_verified_live();


-- 4) COLUMNS THE WEBSITE USES ---------------------------------------------------
alter table public.agents add column if not exists language text default 'en';      -- email language
update public.agents set language = 'en' where language is null;
alter table public.agents add column if not exists docs_notified_at timestamptz;    -- "documents received" sent once
alter table public.agents add column if not exists hidden boolean not null default false;


-- 5) ADMINS: you + your mum ------------------------------------------------------
insert into public.profiles (id, role)
select id, 'admin' from auth.users
where lower(email) in ('ahmadado6002@gmail.com', 'kanko24@yahoo.com', 'lellelamido@gmail.com')
on conflict (id) do update set role = 'admin';


-- 6) CLEAN UP TODAY'S DATA ----------------------------------------------------
-- Unverified listings go back to pending (hidden until verified).
update public.agents
set status = 'pending'
where coalesce(verified, false) = false
  and status in ('active', 'expired')
  and coalesce(hidden, false) = false;

-- Verified agencies are live (free mode).
update public.agents
set status = 'active', paid_until = null
where verified = true
  and status in ('pending', 'expired')
  and coalesce(hidden, false) = false
  and public.agencies_free();


-- 7) CHECK ----------------------------------------------------------------------
select
  (select agencies_free from public.agency_settings) as free_mode,
  count(*) filter (where not coalesce(hidden, false)) as agencies_signed_up,
  count(*) filter (where not coalesce(hidden, false) and verified) as verified,
  count(*) filter (where not coalesce(hidden, false) and public.agent_effective_status(status, paid_until) = 'active') as live_in_app,
  count(*) filter (where not coalesce(hidden, false) and status = 'pending') as waiting_for_review
from public.agents;


-- ============================================================================
-- LATER: SWITCH TO PAID PLANS (don't run now)
--   1. Supabase:  update public.agency_settings set agencies_free = false, updated_at = now();
--   2. Vercel:    Settings → Environment Variables → NEXT_PUBLIC_AGENCIES_FREE = false → Redeploy
--   3. Give existing free agencies time before they must pay, e.g. 30 days:
--      update public.agents set paid_until = current_date + 30
--      where status = 'active' and paid_until is null and not coalesce(hidden, false);
-- ============================================================================
