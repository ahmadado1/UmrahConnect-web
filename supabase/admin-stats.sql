-- Admin report: one function that counts everything for the website's Reports page.
-- Only the website server (service role) can call it; the page itself checks you are an admin.
-- Run in the Supabase SQL editor. Safe to run again after changes.
create or replace function public.admin_stats()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  result jsonb := '{}'::jsonb;
  n bigint;
  j json;
begin
  -- ─── Users (all accounts) ───────────────────────────────────────────────
  select json_build_object(
    'total', count(*),
    'new_today', count(*) filter (where created_at >= date_trunc('day', now())),
    'new_7d', count(*) filter (where created_at > now() - interval '7 days'),
    'new_30d', count(*) filter (where created_at > now() - interval '30 days'),
    'signed_in_7d', count(*) filter (where last_sign_in_at > now() - interval '7 days'),
    'signed_in_30d', count(*) filter (where last_sign_in_at > now() - interval '30 days'),
    'agents', count(*) filter (where is_agency),
    'pilgrims', count(*) filter (where not is_agency and not is_admin)
  ) into j from (
    -- An agency account: chose "Travel agent" in the app, or owns an agency (website sign-up)
    select u.*,
      (u.raw_user_meta_data->>'user_type' = 'agent'
        or exists (select 1 from public.agents a where a.owner_user_id = u.id or a.user_id = u.id)) as is_agency,
      exists (select 1 from public.profiles p where p.id = u.id and p.role = 'admin') as is_admin
    from auth.users u
  ) users;
  result := result || jsonb_build_object('users', j);

  -- Sign-in method (email, google, apple, phone)
  select coalesce(json_object_agg(provider, c), '{}'::json) into j from (
    select coalesce(raw_app_meta_data->>'provider', 'email') as provider, count(*) c
    from auth.users group by 1 order by 2 desc
  ) t;
  result := result || jsonb_build_object('providers', j);

  -- App language
  select coalesce(json_object_agg(lang, c), '{}'::json) into j from (
    select coalesce(nullif(left(raw_user_meta_data->>'language', 2), ''), 'not set') as lang, count(*) c
    from auth.users group by 1 order by 2 desc
  ) t;
  result := result || jsonb_build_object('languages', j);

  -- Nationality (top 12)
  select coalesce(json_agg(json_build_object('name', name, 'count', c)), '[]'::json) into j from (
    select coalesce(nullif(trim(raw_user_meta_data->>'nationality'), ''), 'Not set') as name, count(*) c
    from auth.users group by 1 order by 2 desc limit 12
  ) t;
  result := result || jsonb_build_object('nationalities', j);

  -- New accounts per day, last 30 days
  select coalesce(json_agg(json_build_object('day', d::date, 'count', coalesce(c, 0)) order by d), '[]'::json) into j
  from generate_series(current_date - 29, current_date, interval '1 day') d
  left join (
    select created_at::date as day, count(*) c from auth.users
    where created_at > now() - interval '31 days' group by 1
  ) s on s.day = d::date;
  result := result || jsonb_build_object('signups_daily', j);

  -- Admins
  select count(*) into n from public.profiles where role = 'admin';
  result := result || jsonb_build_object('admins', n);

  -- ─── Premium ────────────────────────────────────────────────────────────
  begin
    select json_build_object(
      'active', count(*) filter (where premium_until >= current_date or store_until >= now()),
      'store', count(*) filter (where store_until >= now()),
      'website', count(*) filter (where premium_until >= current_date and not coalesce(store_until >= now(), false)),
      'ever', count(*)
    ) into j from public.user_premium;
    result := result || jsonb_build_object('premium', j);
  exception when undefined_table or undefined_column then null;
  end;

  -- ─── Agencies (hidden test/admin agencies not counted) ───────────────────
  select json_build_object(
    'total', count(*),
    'live', count(*) filter (where verified and public.agent_effective_status(status, paid_until) = 'active'),
    'verified', count(*) filter (where verified),
    'pending', count(*) filter (where status = 'pending'),
    'docs_ready', count(*) filter (where not coalesce(verified, false) and status = 'pending'
        and coalesce(licence_number, '') <> '' and doc_business_reg is not null and doc_licence is not null
        and doc_owner_id is not null and doc_office_photo is not null),
    'suspended', count(*) filter (where status = 'suspended'),
    'new_7d', count(*) filter (where created_at > now() - interval '7 days'),
    'founding_left', greatest(0, 100 - count(*))
  ) into j from public.agents where not coalesce(hidden, false);
  result := result || jsonb_build_object('agencies', j);

  select coalesce(json_agg(json_build_object('name', name, 'count', c, 'live', live)), '[]'::json) into j from (
    select coalesce(nullif(trim(country), ''), 'Not set') as name, count(*) c,
           count(*) filter (where verified and public.agent_effective_status(status, paid_until) = 'active') live
    from public.agents where not coalesce(hidden, false) group by 1 order by 2 desc limit 12
  ) t;
  result := result || jsonb_build_object('agency_countries', j);

  -- ─── Agency activity ────────────────────────────────────────────────────
  begin
    select count(*) into n from public.agent_pilgrims;
    result := result || jsonb_build_object('pilgrims_linked', n);
  exception when undefined_table then null;
  end;
  begin
    select count(*) into n from public.agent_leads where created_at > now() - interval '30 days';
    result := result || jsonb_build_object('agency_contacts_30d', n);
  exception when undefined_table or undefined_column then null;
  end;
  begin
    select count(*) into n from public.agent_link_clicks where created_at > now() - interval '30 days';
    result := result || jsonb_build_object('agent_link_clicks_30d', n);
  exception when undefined_table or undefined_column then null;
  end;
  begin
    -- Per currency: { "USD": { count, owed, paid }, "NGN": {...} }
    select coalesce(json_object_agg(currency, json_build_object('count', c, 'owed', owed, 'paid', paid)), '{}'::json) into j from (
      select currency,
             count(*) filter (where status <> 'reversed') c,
             coalesce(sum(commission) filter (where status = 'earned'), 0) owed,
             coalesce(sum(commission) filter (where status = 'paid'), 0) paid
      from public.agent_commissions group by currency
    ) t;
    result := result || jsonb_build_object('commissions', j);
  exception when undefined_table or undefined_column then null;
  end;

  -- ─── App usage ──────────────────────────────────────────────────────────
  begin
    select json_build_object(
      'questions_7d', count(*) filter (where created_at > now() - interval '7 days'),
      'questions_30d', count(*) filter (where created_at > now() - interval '30 days'),
      'people_7d', count(distinct user_id) filter (where created_at > now() - interval '7 days')
    ) into j from public.ai_usage;
    result := result || jsonb_build_object('ai', j);
  exception when undefined_table or undefined_column then null;
  end;
  begin
    select count(*) into n from public.user_settings;
    result := result || jsonb_build_object('settings_backups', n);
  exception when undefined_table then null;
  end;

  result := result || jsonb_build_object('generated_at', now());
  return result::json;
end;
$$;

revoke all on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to service_role;

-- Try it:
select public.admin_stats();
