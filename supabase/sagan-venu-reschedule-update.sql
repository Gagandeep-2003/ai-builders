-- One-time June 2026 scheduling update.
-- Safe to run after the students/batches already exist. This file does not touch auth.users.
--
-- Timezone conversions:
--   Sagan: Thu/Fri 11:00 AM CDT = Thu/Fri 9:30 PM IST.
--   Venu: Tue 12:00 PM EDT = Tue 9:30 PM IST.

with sagan_batch as (
  select b.id
  from public.students s
  join public.batches b on b.id = s.batch_id
  left join public.profiles p on p.id = s.user_id
  where lower(s.full_name) like '%sagan%'
     or lower(coalesce(p.email, '')) in ('sagan@student.com', 'sagan.pandey@student.com')
  limit 1
)
update public.batches b
set
  name = 'Sagan Pandey Agentic AI Course - Thu/Fri Texas',
  days = 'Thu / Fri',
  time_slot = 'Thu 11:00 AM - 12:00 PM / Fri 11:00 AM - 12:00 PM America/Chicago',
  time_zone = 'America/Chicago',
  start_date = '2026-06-18',
  start_time = '11:00',
  end_time = '12:00'
from sagan_batch
where b.id = sagan_batch.id;

with sagan_batch as (
  select b.id
  from public.students s
  join public.batches b on b.id = s.batch_id
  left join public.profiles p on p.id = s.user_id
  where lower(s.full_name) like '%sagan%'
     or lower(coalesce(p.email, '')) in ('sagan@student.com', 'sagan.pandey@student.com')
  limit 1
)
insert into public.batch_class_slots (id, batch_id, label, day_of_week, start_time, end_time, meet_link, sort_order)
select
  slot_id,
  sagan_batch.id,
  label,
  day_of_week,
  start_time,
  end_time,
  meet_link,
  sort_order
from sagan_batch
cross join (
  values
    ('21000000-0000-4000-8000-000000000020'::uuid, 'Thursday class', 4, '11:00'::time, '12:00'::time, 'PUT_SAGAN_THURSDAY_MEET_LINK_HERE', 1),
    ('21000000-0000-4000-8000-000000000021'::uuid, 'Friday class', 5, '11:00'::time, '12:00'::time, 'PUT_SAGAN_FRIDAY_MEET_LINK_HERE', 2)
) as slots(slot_id, label, day_of_week, start_time, end_time, meet_link, sort_order)
on conflict (id) do update set
  batch_id = excluded.batch_id,
  label = excluded.label,
  day_of_week = excluded.day_of_week,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  sort_order = excluded.sort_order;

-- Venu missed Thu Jun 11, 2026 at 3:00 PM EDT. This creates a visible approved
-- one-off reschedule for Tue Jun 16, 2026 at 12:00 PM EDT.
-- The app migration creates class_reschedule_requests; run that migration before this insert.
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
  '24000000-0000-4000-8000-000000000001'::uuid,
  students.id,
  students.batch_id,
  '2026-06-11'::date,
  '2026-06-16'::date,
  '12:00',
  '13:00',
  'America/New_York',
  'Make-up class for missed Thursday 3:00 PM EDT session.',
  'approved'::public.reschedule_request_status,
  'Approved one-off make-up class for next week only.',
  'https://meet.google.com/qfv-jaud-svt',
  now()
from public.students
join public.profiles on profiles.id = students.user_id
where lower(profiles.email) = 'venu@student.com'
   or lower(students.full_name) = 'venu'
on conflict (id) do update set
  student_id = excluded.student_id,
  batch_id = excluded.batch_id,
  requested_date = excluded.requested_date,
  requested_start_time = excluded.requested_start_time,
  requested_end_time = excluded.requested_end_time,
  requested_time_zone = excluded.requested_time_zone,
  reason = excluded.reason,
  status = excluded.status,
  admin_note = excluded.admin_note,
  meet_link = excluded.meet_link,
  reviewed_at = excluded.reviewed_at;
