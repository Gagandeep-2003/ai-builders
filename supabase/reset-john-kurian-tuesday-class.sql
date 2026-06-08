-- Run this in Supabase SQL Editor to undo John's accidental Tuesday class join.
-- It removes only John Kurian's attendance/join records for Module 1, Session 1 on 2026-06-09.

with john as (
  select s.id as student_id, s.batch_id
  from public.students s
  join public.profiles p on p.id = s.user_id
  where lower(p.email) = 'john.kurian@student.placeholder.com'
  limit 1
),
session_one as (
  select se.id as session_id
  from public.sessions se
  join public.modules m on m.id = se.module_id
  where m.order_index = 1
    and se.session_number = 1
  limit 1
)
delete from public.class_join_events cje
using john, session_one
where cje.student_id = john.student_id
  and cje.batch_id = john.batch_id
  and cje.session_id = session_one.session_id
  and cje.class_date = date '2026-06-09';

with john as (
  select s.id as student_id
  from public.students s
  join public.profiles p on p.id = s.user_id
  where lower(p.email) = 'john.kurian@student.placeholder.com'
  limit 1
),
session_one as (
  select se.id as session_id
  from public.sessions se
  join public.modules m on m.id = se.module_id
  where m.order_index = 1
    and se.session_number = 1
  limit 1
)
delete from public.attendance a
using john, session_one
where a.student_id = john.student_id
  and a.session_id = session_one.session_id
  and a.date = date '2026-06-09';
