-- Repair permissions required by the server-side mentor reminder cron.
-- Run this once in Supabase SQL Editor as the postgres role.

grant usage on schema public to service_role;

grant select on table public.students to service_role;
grant select on table public.batches to service_role;
grant select on table public.batch_class_slots to service_role;
grant select on table public.sessions to service_role;
grant select on table public.modules to service_role;
grant select on table public.class_reschedule_requests to service_role;

grant select, insert, delete on table public.mentor_reminder_deliveries to service_role;
grant select, delete on table public.submission_evidence to service_role;

-- Keep table-owner changes from silently removing cron access later.
alter default privileges in schema public
grant select, insert, update, delete on tables to service_role;
