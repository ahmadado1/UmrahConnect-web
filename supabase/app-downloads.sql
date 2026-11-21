-- Store download numbers typed in by an admin (from App Store Connect and Google Play Console),
-- so the Reports page can show downloads next to accounts. Only admins can read or write.
create table if not exists public.app_downloads (
  id uuid primary key default gen_random_uuid(),
  recorded_on date not null default current_date,
  apple integer not null default 0,
  google integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);
alter table public.app_downloads enable row level security;
drop policy if exists "Admins only" on public.app_downloads;
create policy "Admins only" on public.app_downloads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
