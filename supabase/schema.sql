create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

create type public.app_role as enum ('student', 'admin');
create type public.submission_status as enum ('pending', 'submitted', 'reviewed');
create type public.homework_kind as enum ('class_challenge', 'home_task');
create type public.resource_type as enum ('pdf', 'link', 'video', 'note');
create type public.attendance_status as enum ('present', 'absent', 'rescheduled');
create type public.password_request_status as enum ('pending', 'approved', 'rejected', 'used');
create type public.reschedule_request_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.app_role not null default 'student',
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  order_index integer not null unique,
  session_count integer not null default 8,
  created_at timestamptz not null default now()
);

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  days text not null,
  time_slot text not null,
  time_zone text not null default 'Asia/Kolkata',
  start_date date not null default '2026-06-08',
  start_time time not null default '17:00',
  end_time time not null default '18:30',
  meet_link text not null,
  module_id uuid references public.modules(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.batch_class_slots (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  label text not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  meet_link text not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  full_name text not null,
  parent_name text not null,
  parent_email text not null,
  country text not null default '',
  time_zone text not null default 'Asia/Kolkata',
  batch_id uuid references public.batches(id) on delete set null,
  enrolled_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  session_number integer not null,
  focus text not null,
  tools_covered text[] not null default '{}',
  student_output text not null,
  description text not null,
  session_date date,
  created_at timestamptz not null default now(),
  unique (module_id, session_number)
);

create table public.homework (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete cascade,
  assigned_student_id uuid references public.students(id) on delete cascade,
  title text not null,
  description text not null,
  kind public.homework_kind not null default 'home_task',
  content_url text not null default '',
  due_date date not null,
  created_at timestamptz not null default now(),
  constraint homework_target_check check (
    batch_id is null or assigned_student_id is null
  )
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.submission_status not null default 'pending',
  notes text,
  started_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (homework_id, student_id)
);

create table public.submission_evidence (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  screen_image text,
  camera_image text,
  proof_text text,
  attachment_name text,
  attachment_mime text,
  attachment_data text,
  captured_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  user_agent text,
  browser_name text,
  browser_version text,
  os_name text,
  device_type text,
  viewport_width integer,
  viewport_height integer,
  language text,
  created_at timestamptz not null default now(),
  unique (homework_id, student_id)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  title text not null,
  type public.resource_type not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.attendance_status not null default 'present',
  date date not null,
  created_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create table public.class_join_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  joined_at timestamptz not null default now(),
  class_date date not null,
  meet_link text not null,
  created_at timestamptz not null default now()
);

create table public.class_reschedule_requests (
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

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  tutor_note text not null,
  created_at timestamptz not null default now()
);

create table public.password_change_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  status public.password_request_status not null default 'pending',
  reason text,
  admin_note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.mentor_reminder_deliveries (
  event_key text primary key,
  student_id uuid references public.students(id) on delete set null,
  class_starts_at timestamptz not null,
  sent_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_last_seen_at_idx on public.profiles (last_seen_at desc);
create index students_user_id_idx on public.students (user_id);
create index students_batch_id_idx on public.students (batch_id);
create index batch_class_slots_batch_id_idx on public.batch_class_slots (batch_id);
create index sessions_module_id_idx on public.sessions (module_id);
create index homework_batch_id_idx on public.homework (batch_id);
create index homework_assigned_student_id_idx on public.homework (assigned_student_id);
create index submissions_student_id_idx on public.submissions (student_id);
create index submission_evidence_student_id_idx on public.submission_evidence (student_id);
create index resources_module_id_idx on public.resources (module_id);
create index attendance_student_id_idx on public.attendance (student_id);
create index class_join_events_student_id_idx on public.class_join_events (student_id);
create index class_join_events_session_id_idx on public.class_join_events (session_id);
create index class_reschedule_requests_student_id_idx on public.class_reschedule_requests (student_id);
create index class_reschedule_requests_status_idx on public.class_reschedule_requests (status);
create index feedback_student_id_idx on public.feedback (student_id);
create index password_change_requests_student_id_idx on public.password_change_requests (student_id);
create index password_change_requests_status_idx on public.password_change_requests (status);
create index announcements_batch_id_idx on public.announcements (batch_id);

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function private.current_student_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select id
  from public.students
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function private.current_student_batch_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select batch_id
  from public.students
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.update_own_student_contact(
  parent_name_input text,
  parent_email_input text,
  country_input text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  cleaned_parent_name text := nullif(trim(parent_name_input), '');
  cleaned_parent_email text := lower(nullif(trim(parent_email_input), ''));
  cleaned_country text := nullif(trim(country_input), '');
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if cleaned_parent_name is null then
    raise exception 'Parent name is required';
  end if;

  if cleaned_parent_email is null or cleaned_parent_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Valid parent email is required';
  end if;

  if cleaned_country is null then
    raise exception 'Country is required';
  end if;

  update public.students
  set
    parent_name = cleaned_parent_name,
    parent_email = cleaned_parent_email,
    country = cleaned_country
  where user_id = auth.uid();

  if not found then
    raise exception 'Student profile not found';
  end if;
end;
$$;

create or replace function public.mark_password_request_used(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.password_change_requests
  set
    status = 'used',
    used_at = now()
  where id = request_id
    and status = 'approved'
    and used_at is null
    and student_id = private.current_student_id();
end;
$$;

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.batches enable row level security;
alter table public.batch_class_slots enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.homework enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_evidence enable row level security;
alter table public.resources enable row level security;
alter table public.attendance enable row level security;
alter table public.class_join_events enable row level security;
alter table public.class_reschedule_requests enable row level security;
alter table public.feedback enable row level security;
alter table public.password_change_requests enable row level security;
alter table public.announcements enable row level security;
alter table public.mentor_reminder_deliveries enable row level security;

create policy "profiles_select_self_or_admin"
on public.profiles for select
using (id = auth.uid() or private.is_admin());

create policy "profiles_insert_admin"
on public.profiles for insert
with check (private.is_admin());

create policy "profiles_update_self_limited_or_admin"
on public.profiles for update
using (id = auth.uid() or private.is_admin())
with check (id = auth.uid() or private.is_admin());

create policy "profiles_delete_admin"
on public.profiles for delete
using (private.is_admin());

create policy "modules_select_authenticated"
on public.modules for select
using (auth.uid() is not null);

create policy "modules_write_admin"
on public.modules for all
using (private.is_admin())
with check (private.is_admin());

create policy "sessions_select_authenticated"
on public.sessions for select
using (auth.uid() is not null);

create policy "sessions_write_admin"
on public.sessions for all
using (private.is_admin())
with check (private.is_admin());

create policy "students_select_self_or_admin"
on public.students for select
using (user_id = auth.uid() or private.is_admin());

create policy "students_insert_admin"
on public.students for insert
with check (private.is_admin());

create policy "students_update_admin"
on public.students for update
using (private.is_admin())
with check (private.is_admin());

create policy "students_delete_admin"
on public.students for delete
using (private.is_admin());

create policy "batches_select_student_batch_or_admin"
on public.batches for select
using (id = private.current_student_batch_id() or private.is_admin());

create policy "batches_write_admin"
on public.batches for all
using (private.is_admin())
with check (private.is_admin());

create policy "batch_class_slots_select_student_batch_or_admin"
on public.batch_class_slots for select
using (batch_id = private.current_student_batch_id() or private.is_admin());

create policy "batch_class_slots_write_admin"
on public.batch_class_slots for all
using (private.is_admin())
with check (private.is_admin());

create policy "homework_select_assigned_or_admin"
on public.homework for select
using (
  private.is_admin()
  or (batch_id is null and assigned_student_id is null)
  or assigned_student_id = private.current_student_id()
  or batch_id = private.current_student_batch_id()
);

create policy "homework_write_admin"
on public.homework for all
using (private.is_admin())
with check (private.is_admin());

create policy "submissions_select_self_or_admin"
on public.submissions for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "submissions_insert_self_or_admin"
on public.submissions for insert
with check (student_id = private.current_student_id() or private.is_admin());

create policy "submissions_update_self_status_or_admin"
on public.submissions for update
using (student_id = private.current_student_id() or private.is_admin())
with check (student_id = private.current_student_id() or private.is_admin());

create policy "submissions_delete_admin"
on public.submissions for delete
using (private.is_admin());

create policy "submission_evidence_select_self_or_admin"
on public.submission_evidence for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "submission_evidence_insert_self_or_admin"
on public.submission_evidence for insert
with check (student_id = private.current_student_id() or private.is_admin());

create policy "submission_evidence_update_self_or_admin"
on public.submission_evidence for update
using (student_id = private.current_student_id() or private.is_admin())
with check (student_id = private.current_student_id() or private.is_admin());

create policy "submission_evidence_delete_self_expired"
on public.submission_evidence for delete
using (student_id = private.current_student_id() and expires_at < now());

create policy "submission_evidence_delete_admin"
on public.submission_evidence for delete
using (private.is_admin());

create policy "resources_select_authenticated"
on public.resources for select
using (auth.uid() is not null);

create policy "resources_write_admin"
on public.resources for all
using (private.is_admin())
with check (private.is_admin());

create policy "attendance_select_self_or_admin"
on public.attendance for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "attendance_insert_self_present"
on public.attendance for insert
with check (student_id = private.current_student_id() and status = 'present');

create policy "attendance_update_self_present"
on public.attendance for update
using (student_id = private.current_student_id())
with check (student_id = private.current_student_id() and status = 'present');

create policy "attendance_write_admin"
on public.attendance for all
using (private.is_admin())
with check (private.is_admin());

create policy "class_join_events_select_self_or_admin"
on public.class_join_events for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "class_join_events_insert_self_or_admin"
on public.class_join_events for insert
with check (student_id = private.current_student_id() or private.is_admin());

create policy "class_join_events_delete_admin"
on public.class_join_events for delete
using (private.is_admin());

create policy "class_reschedule_requests_select_self_or_admin"
on public.class_reschedule_requests for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "class_reschedule_requests_insert_self_or_admin"
on public.class_reschedule_requests for insert
with check (student_id = private.current_student_id() or private.is_admin());

create policy "class_reschedule_requests_update_admin"
on public.class_reschedule_requests for update
using (private.is_admin())
with check (private.is_admin());

create policy "class_reschedule_requests_delete_admin"
on public.class_reschedule_requests for delete
using (private.is_admin());

create policy "feedback_select_self_or_admin"
on public.feedback for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "feedback_write_admin"
on public.feedback for all
using (private.is_admin())
with check (private.is_admin());

create policy "password_change_requests_select_self_or_admin"
on public.password_change_requests for select
using (student_id = private.current_student_id() or private.is_admin());

create policy "password_change_requests_insert_self_or_admin"
on public.password_change_requests for insert
with check (student_id = private.current_student_id() or private.is_admin());

create policy "password_change_requests_update_admin"
on public.password_change_requests for update
using (private.is_admin())
with check (private.is_admin());

create policy "password_change_requests_delete_admin"
on public.password_change_requests for delete
using (private.is_admin());

create policy "announcements_select_batch_or_admin"
on public.announcements for select
using (
  private.is_admin()
  or batch_id is null
  or batch_id = private.current_student_batch_id()
);

create policy "announcements_write_admin"
on public.announcements for all
using (private.is_admin())
with check (private.is_admin());

create policy "mentor_reminder_deliveries_admin"
on public.mentor_reminder_deliveries for all
using (private.is_admin())
with check (private.is_admin());

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.modules to authenticated;
grant select, insert, update, delete on public.batches to authenticated;
grant select, insert, update, delete on public.batch_class_slots to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.homework to authenticated;
grant select, insert, update, delete on public.submissions to authenticated;
grant select, insert, update, delete on public.submission_evidence to authenticated;
grant select, insert, update, delete on public.resources to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;
grant select, insert, update, delete on public.class_join_events to authenticated;
grant select, insert, update, delete on public.class_reschedule_requests to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, insert, update, delete on public.password_change_requests to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.mentor_reminder_deliveries to authenticated;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_student_id() to authenticated;
grant execute on function private.current_student_batch_id() to authenticated;
grant execute on function public.update_own_student_contact(text, text, text) to authenticated;
grant execute on function public.mark_password_request_used(uuid) to authenticated;
