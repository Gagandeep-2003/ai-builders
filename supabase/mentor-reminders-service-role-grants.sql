-- Repair permissions required by the server-side mentor reminder cron.
-- Run the complete file once in Supabase SQL Editor using the postgres role.

grant usage on schema public to service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'students',
    'batches',
    'batch_class_slots',
    'batch_pauses',
    'sessions',
    'modules',
    'class_reschedule_requests',
    'mentor_reminder_deliveries',
    'submission_evidence'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'grant select, insert, update, delete on table public.%I to service_role',
        table_name
      );
    end if;
  end loop;
end
$$;

grant usage, select on all sequences in schema public to service_role;

-- Preserve access for tables and sequences created by future migrations.
alter default privileges for role postgres in schema public
grant select, insert, update, delete on tables to service_role;

alter default privileges for role postgres in schema public
grant usage, select on sequences to service_role;

-- The result must be true before testing cron-job.org again.
select has_table_privilege('service_role', 'public.students', 'select')
  as mentor_cron_students_access;
