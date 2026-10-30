-- Add seven additional classes for Sagan Pandey after his 24-session course.
--
-- Run once in the Supabase SQL Editor. The script is intentionally limited to
-- the exact profile email below. It does not change curriculum, attendance,
-- course progress, batch timing, or any other student.
--
-- The first class is Friday, October 30, 2026. The following six dates, all
-- times, the timezone, and Meet links are derived from Sagan's current batch
-- class slots. This deliberately avoids assuming which weekdays he attends.

begin;

do $$
declare
  matching_students integer;
  target_batch_id uuid;
  available_occurrences integer;
  today_has_class boolean;
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

  select students.batch_id
  into target_batch_id
  from public.students
  join public.profiles on profiles.id = students.user_id
  where lower(profiles.email) = 'sagan.pandey@student.com';

  if target_batch_id is null then
    raise exception 'Sagan Pandey does not have a batch assigned';
  end if;

  select exists (
    select 1
    from public.batch_class_slots as slot
    join public.batches as batch on batch.id = slot.batch_id
    where slot.batch_id = target_batch_id
      and slot.day_of_week = extract(dow from date '2026-10-30')::integer
      and slot.end_time > slot.start_time
      and coalesce(
        nullif(trim(slot.meet_link), ''),
        nullif(trim(batch.meet_link), '')
      ) is not null
  ) into today_has_class;

  if not today_has_class then
    raise exception
      'Sagan does not have a usable regular class slot on 2026-10-30';
  end if;

  select count(*)
  into available_occurrences
  from generate_series(
    date '2026-10-30',
    date '2027-01-31',
    interval '1 day'
  ) as occurrence(class_date)
  join public.batch_class_slots as slot
    on slot.batch_id = target_batch_id
    and slot.day_of_week = extract(dow from occurrence.class_date)::integer
  join public.batches as batch on batch.id = target_batch_id
  where slot.end_time > slot.start_time
    and coalesce(
      nullif(trim(slot.meet_link), ''),
      nullif(trim(batch.meet_link), '')
    ) is not null
    and not exists (
      select 1
      from public.batch_pauses as pause
      where pause.batch_id = target_batch_id
        and occurrence.class_date::date >= pause.starts_on
        and occurrence.class_date::date < pause.resumes_on
    );

  if available_occurrences < 7 then
    raise exception
      'Sagan has only % usable regular class occurrences after 2026-10-30',
      available_occurrences;
  end if;
end;
$$;

with sagan as (
  select
    students.id as student_id,
    students.batch_id,
    batches.time_zone,
    batches.meet_link as batch_meet_link
  from public.students
  join public.profiles on profiles.id = students.user_id
  join public.batches on batches.id = students.batch_id
  where lower(profiles.email) = 'sagan.pandey@student.com'
),
extra_session_ids(session_number, id) as (
  values
    (1, '26000000-0000-4000-8000-000000000001'::uuid),
    (2, '26000000-0000-4000-8000-000000000002'::uuid),
    (3, '26000000-0000-4000-8000-000000000003'::uuid),
    (4, '26000000-0000-4000-8000-000000000004'::uuid),
    (5, '26000000-0000-4000-8000-000000000005'::uuid),
    (6, '26000000-0000-4000-8000-000000000006'::uuid),
    (7, '26000000-0000-4000-8000-000000000007'::uuid)
),
scheduled_occurrences as (
  select
    occurrence.class_date::date as class_date,
    slot.start_time,
    slot.end_time,
    coalesce(
      nullif(trim(slot.meet_link), ''),
      nullif(trim(sagan.batch_meet_link), '')
    ) as meet_link,
    row_number() over (
      order by occurrence.class_date, slot.start_time, slot.sort_order
    )::integer as session_number
  from sagan
  cross join generate_series(
    date '2026-10-30',
    date '2027-01-31',
    interval '1 day'
  ) as occurrence(class_date)
  join public.batch_class_slots as slot
    on slot.batch_id = sagan.batch_id
    and slot.day_of_week = extract(dow from occurrence.class_date)::integer
  where slot.end_time > slot.start_time
    and coalesce(
      nullif(trim(slot.meet_link), ''),
      nullif(trim(sagan.batch_meet_link), '')
    ) is not null
    and not exists (
      select 1
      from public.batch_pauses as pause
      where pause.batch_id = sagan.batch_id
        and occurrence.class_date::date >= pause.starts_on
        and occurrence.class_date::date < pause.resumes_on
    )
  order by occurrence.class_date, slot.start_time, slot.sort_order
  limit 7
),
extra_sessions as (
  select
    extra_session_ids.id,
    scheduled_occurrences.session_number,
    scheduled_occurrences.class_date,
    scheduled_occurrences.start_time,
    scheduled_occurrences.end_time,
    scheduled_occurrences.meet_link
  from scheduled_occurrences
  join extra_session_ids using (session_number)
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
  extra_sessions.start_time,
  extra_sessions.end_time,
  sagan.time_zone,
  'Seven-session course extension after completion of the original 24 sessions.',
  'approved'::public.reschedule_request_status,
  'Extra session ' || extra_sessions.session_number::text || ' of 7 · Regular weekly schedule.',
  extra_sessions.meet_link,
  now()
from sagan
cross join extra_sessions
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
