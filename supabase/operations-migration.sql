do $$
begin
  if not exists (select 1 from pg_type where typname = 'password_request_status') then
    create type public.password_request_status as enum ('pending', 'approved', 'rejected', 'used');
  end if;
end $$;

create table if not exists public.class_join_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  joined_at timestamptz not null default now(),
  class_date date not null,
  meet_link text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.password_change_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  status public.password_request_status not null default 'pending',
  reason text,
  admin_note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists class_join_events_student_id_idx on public.class_join_events (student_id);
create index if not exists class_join_events_session_id_idx on public.class_join_events (session_id);
create index if not exists password_change_requests_student_id_idx on public.password_change_requests (student_id);
create index if not exists password_change_requests_status_idx on public.password_change_requests (status);

alter table public.class_join_events enable row level security;
alter table public.password_change_requests enable row level security;

drop policy if exists "class_join_events_select_self_or_admin" on public.class_join_events;
create policy "class_join_events_select_self_or_admin"
on public.class_join_events for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "class_join_events_insert_self_or_admin" on public.class_join_events;
create policy "class_join_events_insert_self_or_admin"
on public.class_join_events for insert
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "class_join_events_delete_admin" on public.class_join_events;
create policy "class_join_events_delete_admin"
on public.class_join_events for delete
using (private.is_admin());

drop policy if exists "password_change_requests_select_self_or_admin" on public.password_change_requests;
create policy "password_change_requests_select_self_or_admin"
on public.password_change_requests for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "password_change_requests_insert_self_or_admin" on public.password_change_requests;
create policy "password_change_requests_insert_self_or_admin"
on public.password_change_requests for insert
with check (student_id = private.current_student_id() or private.is_admin());

create or replace function public.mark_password_request_used(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.password_change_requests
  set
    status = 'used',
    used_at = now()
  where id = request_id
    and status = 'approved'
    and used_at is null
    and student_id = private.current_student_id();
end;
$$;

drop policy if exists "password_change_requests_update_self_or_admin" on public.password_change_requests;
drop policy if exists "password_change_requests_update_admin" on public.password_change_requests;
create policy "password_change_requests_update_admin"
on public.password_change_requests for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "password_change_requests_delete_admin" on public.password_change_requests;
create policy "password_change_requests_delete_admin"
on public.password_change_requests for delete
using (private.is_admin());

grant select, insert, update, delete on public.class_join_events to authenticated;
grant select, insert, update, delete on public.password_change_requests to authenticated;
grant execute on function public.mark_password_request_used(uuid) to authenticated;
