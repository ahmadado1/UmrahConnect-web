-- Stop the database from sending agent emails. The website sends them now.
-- Tables, the email log, and agent_emails_due() stay in place.

drop trigger if exists notify_agent_email on public.agents;

-- The old daily job calls the Supabase function at 06:00 UTC.
-- Turn it off so reminder emails are not sent twice.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'agent-emails-daily') then
    perform cron.unschedule('agent-emails-daily');
  end if;
exception
  when undefined_table then
    raise notice 'pg_cron is not installed; nothing to unschedule';
  when others then
    raise notice 'daily agent email job not removed: %', sqlerrm;
end $$;
