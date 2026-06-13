-- Student class reschedule request workflow.
-- Run this once in Supabase SQL editor before using reschedule requests.

do $$
begin
  create type public.reschedule_request_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.class_reschedule_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  original_date date,
  requested_date date not null,
  requested_start_time time not null,
  requested_end_time time not null,
  requested_time_zone text not null,
  reason text,
  status public.reschedule_request_status not null default 'pending',
  admin_note text,
  meet_link text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists class_reschedule_requests_student_id_idx
on public.class_reschedule_requests (student_id);

create index if not exists class_reschedule_requests_status_idx
on public.class_reschedule_requests (status);

alter table public.class_reschedule_requests enable row level security;

drop policy if exists "class_reschedule_requests_select_self_or_admin" on public.class_reschedule_requests;
create policy "class_reschedule_requests_select_self_or_admin"
on public.class_reschedule_requests for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "class_reschedule_requests_insert_self_or_admin" on public.class_reschedule_requests;
create policy "class_reschedule_requests_insert_self_or_admin"
on public.class_reschedule_requests for insert
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "class_reschedule_requests_update_admin" on public.class_reschedule_requests;
create policy "class_reschedule_requests_update_admin"
on public.class_reschedule_requests for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "class_reschedule_requests_delete_admin" on public.class_reschedule_requests;
create policy "class_reschedule_requests_delete_admin"
on public.class_reschedule_requests for delete
using (private.is_admin());

grant select, insert, update, delete on public.class_reschedule_requests to authenticated;
