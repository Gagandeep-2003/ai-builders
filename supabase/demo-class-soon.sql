-- Move the demo student's next class to about five minutes from now.
-- Run this in Supabase SQL Editor when you want to test /class with student@demo.com.

do $$
declare
  demo_batch_id uuid := '20000000-0000-4000-8000-000000000001';
  demo_student_id uuid := '11111111-1111-4111-8111-111111111111';
  demo_slot_id uuid := '21000000-0000-4000-8000-000000000001';
  local_start timestamp := (now() at time zone 'Asia/Kolkata') + interval '5 minutes';
  local_end timestamp := (now() at time zone 'Asia/Kolkata') + interval '65 minutes';
  local_date date := local_start::date;
  local_day integer := extract(dow from local_start)::integer;
  start_clock time := local_start::time(0);
  end_clock time := local_end::time(0);
  demo_meet_link text := 'https://meet.google.com/abc-defg-hij';
begin
  update public.batches
  set
    name = 'Demo Test Batch - Class Soon',
    days = 'Today',
    time_slot = left(start_clock::text, 5) || ' - ' || left(end_clock::text, 5) || ' IST',
    time_zone = 'Asia/Kolkata',
    start_date = local_date,
    start_time = start_clock,
    end_time = end_clock,
    meet_link = demo_meet_link
  where id = demo_batch_id;

  delete from public.batch_class_slots
  where batch_id = demo_batch_id
    and id <> demo_slot_id;

  insert into public.batch_class_slots (
    id,
    batch_id,
    label,
    day_of_week,
    start_time,
    end_time,
    meet_link,
    sort_order
  )
  values (
    demo_slot_id,
    demo_batch_id,
    'Demo class starting soon',
    local_day,
    start_clock,
    end_clock,
    demo_meet_link,
    1
  )
  on conflict (id) do update set
    label = excluded.label,
    day_of_week = excluded.day_of_week,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    meet_link = excluded.meet_link,
    sort_order = excluded.sort_order;

  delete from public.attendance
  where student_id = demo_student_id;

  delete from public.class_join_events
  where student_id = demo_student_id;
end $$;
