-- "Need more info": the admin writes a message, the agency gets an email
-- and sees it in Agent Home with a button to edit its application.
-- Run once in the Supabase SQL editor.

alter table public.agents add column if not exists info_request text;
alter table public.agents add column if not exists info_requested_at timestamptz;

-- Agencies can read their own message (new columns added at the end of the view).
create or replace view public.own_agents
with (security_invoker = true) as
select
  a.id,
  coalesce(a.owner_user_id, a.user_id) as owner_user_id,
  coalesce(a.business_name, a.agency_name) as business_name,
  a.logo_url,
  a.license_number,
  a.country,
  a.cities,
  a.phone,
  a.whatsapp,
  a.email,
  a.website,
  coalesce(a.description, a.bio) as description,
  coalesce(a.agent_code, a.referral_code) as agent_code,
  public.agent_effective_status(a.status, a.paid_until) as status,
  case when a.plan = 'pro' then 'featured' else 'listed' end as plan,
  a.verified,
  a.paid_until,
  a.created_at,
  a.owner_name,
  a.nationality,
  a.years_experience,
  a.pilgrims_managed,
  a.licence_number,
  a.licence_authority,
  a.business_reg_number,
  a.office_address,
  a.doc_business_reg,
  a.doc_licence,
  a.doc_owner_id,
  a.doc_office_photo,
  a.references_note,
  a.info_request,
  a.info_requested_at
from public.agents a
where coalesce(a.owner_user_id, a.user_id) = auth.uid();

-- Agencies cannot write the message themselves (only the admin / server can).
create or replace function public.agents_lock_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text := nullif(current_setting('request.jwt.claim.role', true), '');
begin
  if jwt_role = 'service_role' then
    return new;
  end if;
  if jwt_role is null and auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.verification_notes := old.verification_notes;
    new.verified := old.verified;
    new.status := old.status;
    new.plan := old.plan;
    new.info_request := old.info_request;
    new.info_requested_at := old.info_requested_at;
  else
    new.verification_notes := null;
    new.info_request := null;
    new.info_requested_at := null;
  end if;
  return new;
end;
$$;
