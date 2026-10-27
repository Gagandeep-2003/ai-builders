-- Additive persistence for the static Level 2 catalog.
--
-- Level 2 modules, sessions, and activities live in the application catalog and
-- use stable text identifiers (for example l2-m1-s1 and l2-m1-s1-cc1). This
-- migration deliberately does not add to or update the legacy modules,
-- sessions, homework, students, batches, or batch scheduling tables.

begin;

-- The existing profile update policy lets a user update their own profile row.
-- Keep that behavior for contact/profile fields, but never let a student turn
-- themselves into an admin and thereby bypass the Level 2 admin controls.
create or replace function private.guard_profile_role_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and coalesce(auth.role(), '') <> 'service_role'
    and not private.is_admin() then
    raise exception 'Only an admin can change a profile role'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_profile_role_update() from public;

drop trigger if exists profiles_guard_role_update on public.profiles;
create trigger profiles_guard_role_update
before update on public.profiles
for each row execute function private.guard_profile_role_update();

create table if not exists public.student_course_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_level smallint not null check (course_level in (1, 2)),
  status text not null check (status in ('enrolled', 'not_enrolled')),
  starts_at timestamptz,
  ends_at timestamptz,
  start_module_number smallint not null default 1
    check (start_module_number between 1 and 3),
  start_session_number smallint not null default 1
    check (start_session_number between 1 and 8),
  source text not null check (source in ('legacy', 'promotion', 'direct')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_course_enrollments_enrolled_requires_start
    check (status = 'not_enrolled' or starts_at is not null),
  constraint student_course_enrollments_valid_window
    check (ends_at is null or starts_at is null or ends_at >= starts_at),
  constraint student_course_enrollments_student_level_key
    unique (student_id, course_level)
);

create table if not exists public.course_activity_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  activity_id text not null,
  module_number smallint not null check (module_number between 1 and 3),
  session_number smallint not null check (session_number between 1 and 8),
  kind public.homework_kind not null,
  status public.submission_status not null default 'pending',
  notes text,
  started_at timestamptz,
  submitted_at timestamptz,
  time_spent_seconds integer check (
    time_spent_seconds is null or time_spent_seconds >= 0
  ),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  mentor_feedback text,
  screen_image text,
  camera_image text,
  proof_text text,
  attachment_name text,
  attachment_mime text,
  attachment_data text,
  captured_at timestamptz,
  expires_at timestamptz,
  user_agent text,
  browser_name text,
  browser_version text,
  os_name text,
  device_type text,
  viewport_width integer,
  viewport_height integer,
  language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_activity_submissions_student_activity_key
    unique (student_id, activity_id),
  constraint course_activity_submissions_stable_activity_id check (
    activity_id in (
      'l2-m' || module_number::text || '-s' || session_number::text ||
        case when kind = 'class_challenge' then '-cc1' else '-ht1' end,
      'l2-m' || module_number::text || '-s' || session_number::text ||
        case when kind = 'class_challenge' then '-cc2' else '-ht2' end
    )
  ),
  constraint course_activity_submissions_valid_proof_expiry check (
    expires_at is null or captured_at is null or expires_at >= captured_at
  )
);

create table if not exists public.course_session_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id text not null,
  module_number smallint not null check (module_number between 1 and 3),
  session_number smallint not null check (session_number between 1 and 8),
  status public.attendance_status not null default 'present',
  class_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_session_attendance_student_session_key
    unique (student_id, session_id),
  constraint course_session_attendance_stable_session_id check (
    session_id =
      'l2-m' || module_number::text || '-s' || session_number::text
  )
);

create table if not exists public.course_class_join_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id text not null,
  module_number smallint not null check (module_number between 1 and 3),
  session_number smallint not null check (session_number between 1 and 8),
  batch_id uuid references public.batches(id) on delete set null,
  joined_at timestamptz not null default now(),
  class_date date not null,
  meet_link text not null,
  created_at timestamptz not null default now(),
  constraint course_class_join_events_stable_session_id check (
    session_id =
      'l2-m' || module_number::text || '-s' || session_number::text
  ),
  constraint course_class_join_events_nonempty_meet_link check (
    length(trim(meet_link)) > 0
  )
);

create index if not exists student_course_enrollments_student_idx
  on public.student_course_enrollments (student_id);
create index if not exists student_course_enrollments_active_idx
  on public.student_course_enrollments (student_id, course_level, starts_at, ends_at);
create index if not exists course_activity_submissions_student_idx
  on public.course_activity_submissions (student_id);
create index if not exists course_activity_submissions_review_queue_idx
  on public.course_activity_submissions (status, submitted_at)
  where status in ('submitted', 'revision_requested');
create index if not exists course_session_attendance_student_idx
  on public.course_session_attendance (student_id);
create index if not exists course_session_attendance_session_idx
  on public.course_session_attendance (session_id, class_date);
create index if not exists course_class_join_events_student_idx
  on public.course_class_join_events (student_id, joined_at desc);
create index if not exists course_class_join_events_session_idx
  on public.course_class_join_events (session_id, class_date);

create or replace function private.touch_student_course_enrollment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.touch_student_course_enrollment() from public;

drop trigger if exists student_course_enrollments_touch_updated_at
  on public.student_course_enrollments;
create trigger student_course_enrollments_touch_updated_at
before update on public.student_course_enrollments
for each row execute function private.touch_student_course_enrollment();

create or replace function private.guard_course_activity_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_privileged boolean :=
    private.is_admin() or coalesce(auth.role(), '') = 'service_role';
  is_eligible boolean;
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.student_id is distinct from old.student_id
      or new.activity_id is distinct from old.activity_id
      or new.module_number is distinct from old.module_number
      or new.session_number is distinct from old.session_number
      or new.kind is distinct from old.kind
      or new.created_at is distinct from old.created_at then
      raise exception 'Course submission identity fields are immutable'
        using errcode = '22000';
    end if;

    if not is_privileged then
      if old.status = 'reviewed' then
        raise exception 'Reviewed course submissions cannot be changed by students'
          using errcode = '42501';
      end if;

      if new.reviewed_at is distinct from old.reviewed_at
        or new.reviewed_by is distinct from old.reviewed_by
        or new.mentor_feedback is distinct from old.mentor_feedback then
        raise exception 'Only an admin can change course submission review fields'
          using errcode = '42501';
      end if;
    end if;
  elsif not is_privileged and (
    new.reviewed_at is not null
    or new.reviewed_by is not null
    or new.mentor_feedback is not null
  ) then
    raise exception 'Only an admin can set course submission review fields'
      using errcode = '42501';
  end if;

  if not is_privileged then
    if auth.uid() is null or new.student_id is distinct from private.current_student_id() then
      raise exception 'Students can only change their own course submissions'
        using errcode = '42501';
    end if;

    if new.status not in ('pending', 'submitted') then
      raise exception 'Only an admin can set a review status'
        using errcode = '42501';
    end if;
  end if;

  -- Inserts always require an active Level 2 enrollment. Student updates do as
  -- well; admins may still review a submission after that enrollment has ended.
  if tg_op = 'INSERT' or not is_privileged then
    select exists (
      select 1
      from public.student_course_enrollments as enrollment
      where enrollment.student_id = new.student_id
        and enrollment.course_level = 2
        and enrollment.status = 'enrolled'
        and enrollment.starts_at <= now()
        and (enrollment.ends_at is null or now() < enrollment.ends_at)
        and (
          (new.module_number::integer - 1) * 8 + new.session_number::integer
        ) >= (
          (enrollment.start_module_number::integer - 1) * 8
          + enrollment.start_session_number::integer
        )
    ) into is_eligible;

    if not is_eligible then
      raise exception 'Student is not eligible for this Level 2 activity'
        using errcode = '42501';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.guard_course_activity_submission() from public;

drop trigger if exists course_activity_submissions_guard
  on public.course_activity_submissions;
create trigger course_activity_submissions_guard
before insert or update on public.course_activity_submissions
for each row execute function private.guard_course_activity_submission();

-- Every student who predates this migration receives a Level 1 enrollment.
-- ON CONFLICT preserves any enrollment already created by an earlier deploy.
insert into public.student_course_enrollments (
  student_id,
  course_level,
  status,
  starts_at,
  ends_at,
  start_module_number,
  start_session_number,
  source
)
select
  student.id,
  1,
  'enrolled',
  student.enrolled_at,
  null,
  1,
  1,
  'legacy'
from public.students as student
on conflict (student_id, course_level) do nothing;

create or replace function public.promote_student_to_level_two(
  p_student_id uuid,
  p_start_module_number smallint,
  p_start_session_number smallint,
  p_starts_at timestamptz
)
returns public.student_course_enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  level_one public.student_course_enrollments%rowtype;
  level_two public.student_course_enrollments%rowtype;
begin
  if not private.is_admin() then
    raise exception 'Only an admin can promote a student to Level 2'
      using errcode = '42501';
  end if;

  if p_starts_at is null then
    raise exception 'Level 2 starts_at is required'
      using errcode = '22004';
  end if;

  if p_start_module_number is null
    or p_start_module_number not between 1 and 3
    or p_start_session_number is null
    or p_start_session_number not between 1 and 8 then
    raise exception 'Level 2 start must identify module 1-3 and session 1-8'
      using errcode = '22023';
  end if;

  -- Serializes concurrent promotion attempts without touching the student row.
  perform 1
  from public.students
  where id = p_student_id
  for update;

  if not found then
    raise exception 'Student % was not found', p_student_id
      using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.student_course_enrollments
    where student_id = p_student_id
      and course_level = 2
  ) then
    raise exception 'Student % already has a Level 2 enrollment', p_student_id
      using errcode = '23505';
  end if;

  select enrollment.*
  into level_one
  from public.student_course_enrollments as enrollment
  where enrollment.student_id = p_student_id
    and enrollment.course_level = 1
  for update;

  if not found then
    raise exception 'Student % does not have a Level 1 enrollment', p_student_id
      using errcode = 'P0002';
  end if;

  if level_one.status <> 'enrolled' or level_one.ends_at is not null then
    raise exception 'Student % does not have an open Level 1 enrollment', p_student_id
      using errcode = '22000';
  end if;

  if p_starts_at < level_one.starts_at then
    raise exception 'Level 2 cannot start before the Level 1 enrollment'
      using errcode = '22007';
  end if;

  update public.student_course_enrollments
  set ends_at = p_starts_at
  where id = level_one.id;

  insert into public.student_course_enrollments (
    student_id,
    course_level,
    status,
    starts_at,
    ends_at,
    start_module_number,
    start_session_number,
    source
  ) values (
    p_student_id,
    2,
    'enrolled',
    p_starts_at,
    null,
    p_start_module_number,
    p_start_session_number,
    'promotion'
  )
  returning * into level_two;

  return level_two;
end;
$$;

create or replace function public.record_level_two_class_join(
  p_session_id text,
  p_module_number smallint,
  p_session_number smallint,
  p_class_date date,
  p_meet_link text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_student_id uuid;
  current_batch_id uuid;
  current_batch_time_zone text;
  enrollment public.student_course_enrollments%rowtype;
  matched_class_starts_at timestamptz;
  matched_meet_link text;
  occurrence_count integer;
  expected_session_ordinal integer;
  attendance_id uuid;
  join_event_id uuid;
  joined_at timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if p_module_number is null
    or p_module_number not between 1 and 3
    or p_session_number is null
    or p_session_number not between 1 and 8 then
    raise exception 'Level 2 session must identify module 1-3 and session 1-8'
      using errcode = '22023';
  end if;

  if p_session_id is distinct from (
    'l2-m' || p_module_number::text || '-s' || p_session_number::text
  ) then
    raise exception 'Level 2 session ID does not match its module and session'
      using errcode = '22023';
  end if;

  if p_class_date is null then
    raise exception 'Class date is required'
      using errcode = '22004';
  end if;

  if nullif(trim(p_meet_link), '') is null then
    raise exception 'Meet link is required'
      using errcode = '22004';
  end if;

  select student.id, student.batch_id
  into current_student_id, current_batch_id
  from public.students as student
  where student.user_id = auth.uid();

  if current_student_id is null then
    raise exception 'Student profile was not found'
      using errcode = 'P0002';
  end if;

  -- Never trust the caller's date, link, or session position. Match the current
  -- time to this student's stored weekly slot and reject paused/out-of-window
  -- calls. The stored slot link is written to the audit row below.
  select
    batch.time_zone,
    ((p_class_date + slot.start_time) at time zone batch.time_zone),
    trim(slot.meet_link)
  into
    current_batch_time_zone,
    matched_class_starts_at,
    matched_meet_link
  from public.batches as batch
  join public.batch_class_slots as slot on slot.batch_id = batch.id
  where batch.id = current_batch_id
    -- p_class_date is the scheduled slot date. Its 15-minute opening or an
    -- overnight end may fall on the adjacent local date, so the verified UTC
    -- window below is the authoritative current-time check.
    and slot.day_of_week = extract(dow from p_class_date)::integer
    and nullif(trim(slot.meet_link), '') is not null
    and joined_at >= (
      ((p_class_date + slot.start_time) at time zone batch.time_zone)
      - interval '15 minutes'
    )
    and joined_at <= (
      (
        p_class_date + slot.end_time
        + case
            when slot.end_time <= slot.start_time then interval '1 day'
            else interval '0 days'
          end
      ) at time zone batch.time_zone
    )
    and not exists (
      select 1
      from public.batch_pauses as pause
      where pause.batch_id = batch.id
        and p_class_date >= pause.starts_on
        and p_class_date < pause.resumes_on
    )
  order by slot.start_time desc, slot.sort_order
  limit 1;

  if not found then
    raise exception 'No joinable weekly class is open for this student'
      using errcode = '42501';
  end if;

  select candidate.*
  into enrollment
  from public.student_course_enrollments as candidate
  where candidate.student_id = current_student_id
    and candidate.course_level = 2
    and candidate.status = 'enrolled'
    -- The verified class window opens 15 minutes before the scheduled start.
    -- Check placement against that stored class occurrence so the first Level 2
    -- class can be joined during the same early window as every other class.
    and candidate.starts_at <= matched_class_starts_at
    and (
      candidate.ends_at is null
      or matched_class_starts_at < candidate.ends_at
    )
  for share;

  if not found then
    raise exception 'Student does not have an active Level 2 enrollment'
      using errcode = '42501';
  end if;

  if (
    (p_module_number::integer - 1) * 8 + p_session_number::integer
  ) < (
    (enrollment.start_module_number::integer - 1) * 8
    + enrollment.start_session_number::integer
  ) then
    raise exception 'Level 2 session is before the student''s selected start'
      using errcode = '42501';
  end if;

  select count(*)::integer
  into occurrence_count
  from generate_series(
    ((enrollment.starts_at at time zone current_batch_time_zone)::date)::timestamp,
    p_class_date::timestamp,
    interval '1 day'
  ) as occurrence(day_value)
  join public.batch_class_slots as slot
    on slot.batch_id = current_batch_id
    and slot.day_of_week = extract(dow from occurrence.day_value)::integer
  where (
      ((occurrence.day_value::date + slot.start_time) at time zone current_batch_time_zone)
      >= enrollment.starts_at
    )
    and (
      ((occurrence.day_value::date + slot.start_time) at time zone current_batch_time_zone)
      <= matched_class_starts_at
    )
    and not exists (
      select 1
      from public.batch_pauses as pause
      where pause.batch_id = current_batch_id
        and occurrence.day_value::date >= pause.starts_on
        and occurrence.day_value::date < pause.resumes_on
    );

  if occurrence_count is null or occurrence_count < 1 then
    raise exception 'The Level 2 class position could not be verified'
      using errcode = '42501';
  end if;

  expected_session_ordinal :=
    (enrollment.start_module_number::integer - 1) * 8
    + enrollment.start_session_number::integer
    + occurrence_count
    - 1;

  if expected_session_ordinal > 24 or expected_session_ordinal is distinct from (
    (p_module_number::integer - 1) * 8 + p_session_number::integer
  ) then
    raise exception 'The requested Level 2 session is not the current scheduled class'
      using errcode = '42501';
  end if;

  insert into public.course_session_attendance (
    student_id,
    session_id,
    module_number,
    session_number,
    status,
    class_date
  ) values (
    current_student_id,
    p_session_id,
    p_module_number,
    p_session_number,
    'present',
    p_class_date
  )
  on conflict (student_id, session_id) do update set
    module_number = excluded.module_number,
    session_number = excluded.session_number,
    status = 'present',
    class_date = excluded.class_date,
    updated_at = joined_at
  returning id into attendance_id;

  insert into public.course_class_join_events (
    student_id,
    session_id,
    module_number,
    session_number,
    batch_id,
    joined_at,
    class_date,
    meet_link
  ) values (
    current_student_id,
    p_session_id,
    p_module_number,
    p_session_number,
    current_batch_id,
    joined_at,
    p_class_date,
    matched_meet_link
  )
  returning id into join_event_id;

  return jsonb_build_object(
    'attendance_id', attendance_id,
    'join_event_id', join_event_id,
    'joined_at', joined_at
  );
end;
$$;

alter table public.student_course_enrollments enable row level security;
alter table public.course_activity_submissions enable row level security;
alter table public.course_session_attendance enable row level security;
alter table public.course_class_join_events enable row level security;

drop policy if exists "student_course_enrollments_select_self_or_admin"
  on public.student_course_enrollments;
create policy "student_course_enrollments_select_self_or_admin"
on public.student_course_enrollments for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "student_course_enrollments_write_admin"
  on public.student_course_enrollments;
create policy "student_course_enrollments_write_admin"
on public.student_course_enrollments for all
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "course_activity_submissions_select_self_or_admin"
  on public.course_activity_submissions;
create policy "course_activity_submissions_select_self_or_admin"
on public.course_activity_submissions for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "course_activity_submissions_insert_self_or_admin"
  on public.course_activity_submissions;
create policy "course_activity_submissions_insert_self_or_admin"
on public.course_activity_submissions for insert
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "course_activity_submissions_update_self_or_admin"
  on public.course_activity_submissions;
create policy "course_activity_submissions_update_self_or_admin"
on public.course_activity_submissions for update
using (student_id = private.current_student_id() or private.is_admin())
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "course_activity_submissions_delete_admin"
  on public.course_activity_submissions;
create policy "course_activity_submissions_delete_admin"
on public.course_activity_submissions for delete
using (private.is_admin());

drop policy if exists "course_session_attendance_select_self_or_admin"
  on public.course_session_attendance;
create policy "course_session_attendance_select_self_or_admin"
on public.course_session_attendance for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "course_session_attendance_write_admin"
  on public.course_session_attendance;
create policy "course_session_attendance_write_admin"
on public.course_session_attendance for all
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "course_class_join_events_select_self_or_admin"
  on public.course_class_join_events;
create policy "course_class_join_events_select_self_or_admin"
on public.course_class_join_events for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "course_class_join_events_write_admin"
  on public.course_class_join_events;
create policy "course_class_join_events_write_admin"
on public.course_class_join_events for all
using (private.is_admin())
with check (private.is_admin());

revoke all on public.student_course_enrollments from anon;
revoke all on public.course_activity_submissions from anon;
revoke all on public.course_session_attendance from anon;
revoke all on public.course_class_join_events from anon;

grant select, insert, update, delete
  on public.student_course_enrollments to authenticated, service_role;
grant select, insert, update, delete
  on public.course_activity_submissions to authenticated, service_role;
grant select, insert, update, delete
  on public.course_session_attendance to authenticated, service_role;
grant select, insert, update, delete
  on public.course_class_join_events to authenticated, service_role;

revoke all on function public.promote_student_to_level_two(uuid, smallint, smallint, timestamptz)
  from public, anon, authenticated;
grant execute on function public.promote_student_to_level_two(uuid, smallint, smallint, timestamptz)
  to authenticated;

revoke all on function public.record_level_two_class_join(text, smallint, smallint, date, text)
  from public, anon, authenticated;
grant execute on function public.record_level_two_class_join(text, smallint, smallint, date, text)
  to authenticated;

commit;
