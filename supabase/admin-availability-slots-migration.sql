create table if not exists public.admin_availability_slots (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  unique (day_of_week, start_time)
);

create index if not exists admin_availability_slots_day_start_idx
  on public.admin_availability_slots (day_of_week, start_time);

alter table public.admin_availability_slots enable row level security;

drop policy if exists "admin_availability_slots_select_authenticated" on public.admin_availability_slots;
create policy "admin_availability_slots_select_authenticated"
  on public.admin_availability_slots
  for select
  using (auth.uid() is not null);

drop policy if exists "admin_availability_slots_admin_write" on public.admin_availability_slots;
create policy "admin_availability_slots_admin_write"
  on public.admin_availability_slots
  for all
  using (private.is_admin())
  with check (private.is_admin());

grant select, insert, update, delete on public.admin_availability_slots to authenticated;

insert into public.admin_availability_slots (day_of_week, start_time, end_time)
values
  (0, '03:30', '04:30'),
  (0, '08:30', '09:30'),
  (0, '22:30', '23:30'),
  (1, '04:30', '05:30'),
  (1, '07:30', '08:30'),
  (1, '21:30', '22:30'),
  (2, '08:30', '09:30'),
  (2, '18:30', '19:30'),
  (2, '19:30', '20:30'),
  (2, '22:30', '23:30'),
  (3, '04:30', '05:30'),
  (3, '08:30', '09:30'),
  (3, '19:30', '20:30'),
  (3, '22:30', '23:30'),
  (4, '02:30', '03:30'),
  (4, '08:30', '09:30'),
  (4, '19:30', '20:30'),
  (4, '22:30', '23:30'),
  (5, '04:30', '05:30'),
  (5, '07:30', '08:30'),
  (5, '08:30', '09:30'),
  (5, '17:30', '18:30'),
  (5, '19:30', '20:30'),
  (5, '22:30', '23:30'),
  (6, '00:30', '01:30'),
  (6, '08:30', '09:30'),
  (6, '20:30', '21:30')
on conflict (day_of_week, start_time) do update
set end_time = excluded.end_time;
