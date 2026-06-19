create table if not exists public.mentor_reminder_deliveries (
  event_key text primary key,
  student_id uuid references public.students(id) on delete set null,
  class_starts_at timestamptz not null,
  sent_at timestamptz not null default now()
);

create index if not exists mentor_reminder_deliveries_starts_at_idx
on public.mentor_reminder_deliveries (class_starts_at);

alter table public.mentor_reminder_deliveries enable row level security;

drop policy if exists "mentor_reminder_deliveries_admin" on public.mentor_reminder_deliveries;
create policy "mentor_reminder_deliveries_admin"
on public.mentor_reminder_deliveries for all
using (private.is_admin())
with check (private.is_admin());

grant select, insert, update, delete on public.mentor_reminder_deliveries to authenticated;
