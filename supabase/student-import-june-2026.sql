-- Hosted Supabase import for the June 2026 fresh international batches.
-- Create these Auth users first in Supabase Authentication:
--   john.kurian@student.placeholder.com / john@123
--   ayan.khadka@student.placeholder.com / ayan@123
--   venu@student.placeholder.com / venu@123
-- This file does not insert into auth.users.

insert into public.batches (id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id) values
('20000000-0000-4000-8000-000000000010', 'US Weekday Batch - Tue/Wed CDT', 'Tue / Wed', 'Tue 11:00 AM - 12:00 PM / Wed 2:00 PM - 3:00 PM America/Chicago', 'America/Chicago', '2026-06-08', '11:00', '12:00', 'https://meet.google.com/kio-bnyb-imt', '00000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000011', 'Australia Weekend Batch - Sat/Sun', 'Sat / Sun', 'Sat 12:00 PM - 1:00 PM / Sun 12:00 PM - 1:00 PM Australia/Sydney', 'Australia/Sydney', '2026-06-08', '12:00', '13:00', 'https://meet.google.com/jiw-wbre-vtc', '00000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000012', 'US Weekday Batch - Wed/Thu EDT', 'Wed / Thu', 'Wed 4:00 PM - 5:00 PM / Thu 3:00 PM - 4:00 PM America/New_York', 'America/New_York', '2026-06-08', '16:00', '17:00', 'https://meet.google.com/zzn-fvzt-qij', '00000000-0000-4000-8000-000000000001')
on conflict (id) do update set
  name = excluded.name,
  days = excluded.days,
  time_slot = excluded.time_slot,
  time_zone = excluded.time_zone,
  start_date = excluded.start_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  module_id = excluded.module_id;

insert into public.batch_class_slots (id, batch_id, label, day_of_week, start_time, end_time, meet_link, sort_order) values
('21000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000010', 'Tuesday class', 2, '11:00', '12:00', 'https://meet.google.com/kio-bnyb-imt', 1),
('21000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000010', 'Wednesday class', 3, '14:00', '15:00', 'https://meet.google.com/wsu-qpdz-fkm', 2),
('21000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000011', 'Saturday class', 6, '12:00', '13:00', 'https://meet.google.com/jiw-wbre-vtc', 1),
('21000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000011', 'Sunday class', 0, '12:00', '13:00', 'https://meet.google.com/xmz-gctq-yyj', 2),
('21000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000012', 'Wednesday class', 3, '16:00', '17:00', 'https://meet.google.com/zzn-fvzt-qij', 1),
('21000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000012', 'Thursday class', 4, '15:00', '16:00', 'https://meet.google.com/qfv-jaud-svt', 2)
on conflict (id) do update set
  label = excluded.label,
  day_of_week = excluded.day_of_week,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  sort_order = excluded.sort_order;

insert into public.profiles (id, email, full_name, role)
select id, email, 'John Kurian', 'student'::public.app_role
from auth.users
where lower(email) = 'john.kurian@student.placeholder.com'
union all
select id, email, 'Ayan Khadka', 'student'::public.app_role
from auth.users
where lower(email) = 'ayan.khadka@student.placeholder.com'
union all
select id, email, 'Venu', 'student'::public.app_role
from auth.users
where lower(email) = 'venu@student.placeholder.com'
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role;

insert into public.students (id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at)
select
  '11111111-1111-4111-8111-111111111120'::uuid,
  id,
  'John Kurian',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'USA',
  'America/Chicago',
  '20000000-0000-4000-8000-000000000010'::uuid,
  '2026-06-08T00:00:00Z'::timestamptz
from auth.users
where lower(email) = 'john.kurian@student.placeholder.com'
union all
select
  '11111111-1111-4111-8111-111111111121'::uuid,
  id,
  'Ayan Khadka',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'Australia',
  'Australia/Sydney',
  '20000000-0000-4000-8000-000000000011'::uuid,
  '2026-06-08T00:00:00Z'::timestamptz
from auth.users
where lower(email) = 'ayan.khadka@student.placeholder.com'
union all
select
  '11111111-1111-4111-8111-111111111122'::uuid,
  id,
  'Venu',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'USA',
  'America/New_York',
  '20000000-0000-4000-8000-000000000012'::uuid,
  '2026-06-08T00:00:00Z'::timestamptz
from auth.users
where lower(email) = 'venu@student.placeholder.com'
on conflict (id) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  parent_name = excluded.parent_name,
  parent_email = excluded.parent_email,
  country = excluded.country,
  time_zone = excluded.time_zone,
  batch_id = excluded.batch_id;

select email as missing_auth_user
from (
  values
    ('john.kurian@student.placeholder.com'),
    ('ayan.khadka@student.placeholder.com'),
    ('venu@student.placeholder.com')
) expected(email)
where not exists (
  select 1
  from auth.users
  where lower(auth.users.email) = expected.email
);
