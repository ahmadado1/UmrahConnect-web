-- Public logo bucket for partner agents.
-- Run this in the Supabase SQL editor. It does not change the agents table.
-- Uploads go to agent-logos/{auth user id}/filename.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-logos',
  'agent-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Public read agent logos" on storage.objects;
create policy "Public read agent logos"
  on storage.objects for select
  to public
  using (bucket_id = 'agent-logos');

drop policy if exists "Agents upload own logos" on storage.objects;
create policy "Agents upload own logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'agent-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Agents update own logos" on storage.objects;
create policy "Agents update own logos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'agent-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Agents delete own logos" on storage.objects;
create policy "Agents delete own logos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'agent-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
