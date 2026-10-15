-- The language the agent last chose on the website.
-- Emails can use this later. Existing rows become English.
-- Run this in the Supabase SQL editor.

alter table public.agents
  add column if not exists language text default 'en';

update public.agents
set language = 'en'
where language is null;
