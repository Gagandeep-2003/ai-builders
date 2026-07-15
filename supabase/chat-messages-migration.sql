do $$
begin
  create type public.chat_sender_role as enum ('student', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.chat_message_kind as enum ('text', 'voice');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  sender_role public.chat_sender_role not null,
  sender_user_id uuid references public.profiles(id) on delete set null,
  kind public.chat_message_kind not null default 'text',
  body text not null default '',
  voice_data text,
  voice_mime text,
  voice_duration_seconds integer,
  created_at timestamptz not null default now(),
  read_by_student_at timestamptz,
  read_by_admin_at timestamptz,
  constraint chat_messages_body_or_voice check (
    length(trim(body)) > 0 or voice_data is not null
  )
);

create index if not exists chat_messages_student_created_idx
  on public.chat_messages(student_id, created_at desc);

create index if not exists chat_messages_unread_idx
  on public.chat_messages(student_id, sender_role, read_by_student_at, read_by_admin_at);

alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_self_or_admin" on public.chat_messages;
create policy "chat_messages_select_self_or_admin"
  on public.chat_messages
  for select
  using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "chat_messages_insert_self_or_admin" on public.chat_messages;
create policy "chat_messages_insert_self_or_admin"
  on public.chat_messages
  for insert
  with check (
    (
      sender_role = 'student'
      and student_id = private.current_student_id()
      and sender_user_id = auth.uid()
    )
    or (
      sender_role = 'admin'
      and private.is_admin()
      and sender_user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_update_read_self_or_admin" on public.chat_messages;
create policy "chat_messages_update_read_self_or_admin"
  on public.chat_messages
  for update
  using (student_id = private.current_student_id() or private.is_admin())
  with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "chat_messages_delete_admin" on public.chat_messages;
create policy "chat_messages_delete_admin"
  on public.chat_messages
  for delete
  using (private.is_admin());

grant select, insert, update, delete on public.chat_messages to authenticated;
grant select, insert, update, delete on public.chat_messages to service_role;
