-- Add seven additional classes for Sagan Pandey after his 24-session course.
--
-- Run once in the Supabase SQL Editor. The script is intentionally limited to
-- the exact profile email below. It does not change curriculum, attendance,
-- course progress, batch timing, or any other student.
--
-- The dates continue Sagan's existing Thu/Fri batch cadence, beginning with
-- Friday, October 30, 2026. Times, timezone, and Meet links are read from his
-- current batch class slots so the added classes stay aligned with his regular
-- schedule.

begin;

do $$
declare
  matching_students integer;
  target_student_id uuid;
  target_batch_id uuid;
  missing_slot_dates text;
begin
  select count(*)
  into matching_students
  from public.students
  join public.profiles on profiles.id = students.user_id
  where lower(profiles.email) = 'sagan.pandey@student.com';

  if matching_students <> 1 then
    raise exception
      'Expected exactly one student for sagan.pandey@student.com, found %',
      matching_students;
  end if;

  select students.id, students.batch_id
  into target_student_id, target_batch_id
  from public.students
  join public.profiles on profiles.id = students.user_id
  where lower(profiles.email) = 'sagan.pandey@student.com';

  if target_batch_id is null then
    raise exception 'Sagan Pandey does not have a batch assigned';
  end if;

  select string_agg(schedule.class_date::text, ', ' order by schedule.class_date)
  into missing_slot_dates
  from (
    values
      (date '2026-10-30'),
      (date '2026-11-05'),
      (date '2026-11-06'),
      (date '2026-11-12'),
      (date '2026-11-13'),
      (date '2026-11-19'),
      (date '2026-11-20')
  ) as schedule(class_date)
  where not exists (
    select 1
    from public.batch_class_slots as slot
    where slot.batch_id = target_batch_id
      and slot.day_of_week = extract(dow from schedule.class_date)::integer
      and slot.end_time > slot.start_time
      and nullif(trim(slot.meet_link), '') is not null
  );

  if missing_slot_dates is not null then
    raise exception
      'Sagan is missing a usable regular class slot for: %',
      missing_slot_dates;
  end if;
end;
$$;

with sagan as (
  select
    students.id as student_id,
    students.batch_id,
    batches.time_zone
  from public.students
  join public.profiles on profiles.id = students.user_id
  join public.batches on batches.id = students.batch_id
  where lower(profiles.email) = 'sagan.pandey@student.com'
),
extra_sessions(id, session_number, class_date) as (
  values
    ('26000000-0000-4000-8000-000000000001'::uuid, 1, date '2026-10-30'),
    ('26000000-0000-4000-8000-000000000002'::uuid, 2, date '2026-11-05'),
    ('26000000-0000-4000-8000-000000000003'::uuid, 3, date '2026-11-06'),
    ('26000000-0000-4000-8000-000000000004'::uuid, 4, date '2026-11-12'),
    ('26000000-0000-4000-8000-000000000005'::uuid, 5, date '2026-11-13'),
    ('26000000-0000-4000-8000-000000000006'::uuid, 6, date '2026-11-19'),
    ('26000000-0000-4000-8000-000000000007'::uuid, 7, date '2026-11-20')
)
insert into public.class_reschedule_requests (
  id,
  student_id,
  batch_id,
  original_date,
  requested_date,
  requested_start_time,
  requested_end_time,
  requested_time_zone,
  reason,
  status,
  admin_note,
  meet_link,
  reviewed_at
)
select
  extra_sessions.id,
  sagan.student_id,
  sagan.batch_id,
  null,
  extra_sessions.class_date,
  class_slot.start_time,
  class_slot.end_time,
  sagan.time_zone,
  'Seven-session course extension after completion of the original 24 sessions.',
  'approved'::public.reschedule_request_status,
  'Extra session ' || extra_sessions.session_number::text || ' of 7 · Regular Thu/Fri schedule.',
  class_slot.meet_link,
  now()
from sagan
cross join extra_sessions
join lateral (
  select
    slot.start_time,
    slot.end_time,
    trim(slot.meet_link) as meet_link
  from public.batch_class_slots as slot
  where slot.batch_id = sagan.batch_id
    and slot.day_of_week = extract(dow from extra_sessions.class_date)::integer
    and slot.end_time > slot.start_time
    and nullif(trim(slot.meet_link), '') is not null
  order by slot.sort_order, slot.start_time
  limit 1
) as class_slot on true
on conflict (id) do update set
  student_id = excluded.student_id,
  batch_id = excluded.batch_id,
  original_date = excluded.original_date,
  requested_date = excluded.requested_date,
  requested_start_time = excluded.requested_start_time,
  requested_end_time = excluded.requested_end_time,
  requested_time_zone = excluded.requested_time_zone,
  reason = excluded.reason,
  status = excluded.status,
  admin_note = excluded.admin_note,
  meet_link = excluded.meet_link,
  reviewed_at = excluded.reviewed_at;

commit;

-- Verification: this must return exactly seven approved rows.
select
  requests.requested_date,
  requests.requested_start_time,
  requests.requested_end_time,
  requests.requested_time_zone,
  requests.status,
  requests.admin_note,
  requests.meet_link
from public.class_reschedule_requests as requests
join public.students on students.id = requests.student_id
join public.profiles on profiles.id = students.user_id
where lower(profiles.email) = 'sagan.pandey@student.com'
  and requests.id between
    '26000000-0000-4000-8000-000000000001'::uuid
    and '26000000-0000-4000-8000-000000000007'::uuid
order by requests.requested_date;

-- Recovery, if ever needed:
-- delete from public.class_reschedule_requests
-- where id between
--   '26000000-0000-4000-8000-000000000001'::uuid
--   and '26000000-0000-4000-8000-000000000007'::uuid;
