-- Leads from the mobile app contact buttons, plus the Agent Home counts.
-- Run this in the Supabase SQL editor. It does not change existing tables.

create table if not exists public.agent_leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  type text not null,
  created_at timestamptz not null default now(),
  constraint agent_leads_type_check
    check (type in ('call', 'whatsapp', 'email', 'website'))
);

create index if not exists agent_leads_agent_created_idx
  on public.agent_leads (agent_id, created_at desc);

alter table public.agent_leads enable row level security;

drop policy if exists "Logged-in users insert leads" on public.agent_leads;
create policy "Logged-in users insert leads"
  on public.agent_leads for insert to authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Agent reads own leads" on public.agent_leads;
create policy "Agent reads own leads"
  on public.agent_leads for select to authenticated
  using (
    public.is_admin()
    or agent_id in (
      select id from public.agents
      where owner_user_id = auth.uid() or user_id = auth.uid()
    )
  );

grant insert, select on public.agent_leads to authenticated;

-- Pilgrim count includes people who have not shared contact.
-- The agent_pilgrims table policy hides those rows from a normal select.
create or replace function public.own_agent_home_stats()
returns table (pilgrim_count bigint, leads_this_month bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      select count(*)
      from public.agent_pilgrims ap
      where ap.agent_id = a.id
    ),
    (
      select count(*)
      from public.agent_leads l
      where l.agent_id = a.id
        and l.created_at >= date_trunc('month', now())
    )
  from public.agents a
  where coalesce(a.owner_user_id, a.user_id) = auth.uid()
  limit 1;
$$;

revoke all on function public.own_agent_home_stats() from public, anon;
grant execute on function public.own_agent_home_stats() to authenticated;
