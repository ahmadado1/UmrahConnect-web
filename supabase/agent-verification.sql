-- Private verification documents for partner agents.
-- Run this in the Supabase SQL editor.
-- Files go to agent-docs/{auth user id}/filename. The bucket is not public.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-docs',
  'agent-docs',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Agents read own docs" on storage.objects;
create policy "Agents read own docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'agent-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Agents upload own docs" on storage.objects;
create policy "Agents upload own docs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'agent-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins read agent docs" on storage.objects;
create policy "Admins read agent docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'agent-docs'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Agents replace own docs" on storage.objects;
create policy "Agents replace own docs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'agent-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'agent-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

alter table public.agents
  add column if not exists licence_number text,
  add column if not exists licence_authority text,
  add column if not exists business_reg_number text,
  add column if not exists office_address text,
  add column if not exists doc_business_reg text,
  add column if not exists doc_licence text,
  add column if not exists doc_owner_id text,
  add column if not exists doc_office_photo text,
  add column if not exists references_note text,
  add column if not exists verification_notes text;

-- Agents can read their own documents through this view.
-- verification_notes stays off the view.
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
  a.references_note
from public.agents a
where coalesce(a.owner_user_id, a.user_id) = auth.uid();

-- Signed-in agents cannot change admin-only fields.
-- The service role and the SQL editor still can.
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
  else
    new.verification_notes := null;
  end if;
  return new;
end;
$$;

drop trigger if exists agents_lock_admin_fields on public.agents;
create trigger agents_lock_admin_fields
  before insert or update on public.agents
  for each row
  execute function public.agents_lock_admin_fields();
