alter table public.students
  add column if not exists country text not null default '',
  add column if not exists time_zone text not null default 'Asia/Kolkata';

alter table public.batches
  add column if not exists time_zone text not null default 'Asia/Kolkata',
  add column if not exists start_date date not null default '2026-06-08',
  add column if not exists start_time time not null default '17:00',
  add column if not exists end_time time not null default '18:30';

create table if not exists public.batch_class_slots (
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

create index if not exists batch_class_slots_batch_id_idx on public.batch_class_slots (batch_id);

update public.batches
set
  time_zone = coalesce(nullif(time_zone, ''), 'Asia/Kolkata'),
  start_date = coalesce(start_date, '2026-06-08'::date),
  start_time = coalesce(start_time, '17:00'::time),
  end_time = coalesce(end_time, '18:30'::time);

update public.students
set
  time_zone = coalesce(nullif(time_zone, ''), 'Asia/Kolkata'),
  country = coalesce(country, '');

alter table public.batch_class_slots enable row level security;

drop policy if exists "batch_class_slots_select_student_batch_or_admin" on public.batch_class_slots;
create policy "batch_class_slots_select_student_batch_or_admin"
on public.batch_class_slots for select
using (batch_id = private.current_student_batch_id() or private.is_admin());

drop policy if exists "batch_class_slots_write_admin" on public.batch_class_slots;
create policy "batch_class_slots_write_admin"
on public.batch_class_slots for all
using (private.is_admin())
with check (private.is_admin());

grant select, insert, update, delete on public.batch_class_slots to authenticated;
