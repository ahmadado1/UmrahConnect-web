-- New website signups must stay pending until an admin approves them.
-- This does not update any existing agent row.
--
-- Why new rows were showing as Active:
-- agents_sync_legacy() is security definer, so it runs as the database owner.
-- agent_subscription_fields_unlocked() treated that owner session as a
-- dashboard edit and skipped the rule that forces status = pending.
-- The original agents.status default was active, so a signup that did not
-- get that rule kept Active, with the trial plan.

create or replace function public.agent_subscription_fields_unlocked()
returns boolean
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := nullif(current_setting('request.jwt.claim.role', true), '');

  if jwt_role = 'service_role' then
    return true;
  end if;

  -- A signed-in app user. Do not look at session_user here: inside the
  -- security definer sync trigger that value is postgres, not the pilgrim.
  if jwt_role in ('anon', 'authenticated') then
    return public.is_admin();
  end if;

  -- SQL editor and the Supabase dashboard have no user JWT.
  if auth.uid() is null then
    return true;
  end if;

  return public.is_admin();
end;
$$;

-- Runs after agents_sync_legacy (name sorts later) and only on insert.
create or replace function public.force_new_agent_pending()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text := nullif(current_setting('request.jwt.claim.role', true), '');
begin
  if jwt_role = 'service_role' or public.is_admin() then
    return new;
  end if;
  if jwt_role is null and auth.uid() is null then
    return new;
  end if;

  new.status := 'pending';
  new.plan := 'basic';
  new.verified := false;
  new.paid_until := null;
  return new;
end;
$$;

drop trigger if exists zzz_force_new_agent_pending on public.agents;
create trigger zzz_force_new_agent_pending
  before insert on public.agents
  for each row
  execute function public.force_new_agent_pending();

alter table public.agents alter column status set default 'pending';
alter table public.agents alter column verified set default false;
