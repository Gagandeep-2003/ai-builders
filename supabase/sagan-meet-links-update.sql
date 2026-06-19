-- Safe one-time update for Sagan Pandey's current Thu/Fri schedule.
-- Run in Supabase SQL Editor. It only updates Sagan's batch and class-slot links.

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
set meet_link = 'https://meet.google.com/zic-xmpx-vct'
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
update public.batch_class_slots slot
set meet_link = case
  when slot.day_of_week = 4 then 'https://meet.google.com/zic-xmpx-vct'
  when slot.day_of_week = 5 then 'https://meet.google.com/fdt-xtrm-eug'
  else slot.meet_link
end
from sagan_batch
where slot.batch_id = sagan_batch.id
  and slot.day_of_week in (4, 5);
