-- Student profile self-edit and homework submission device metadata.
-- Run this once in Supabase SQL editor.

create or replace function public.update_own_student_contact(
  parent_name_input text,
  parent_email_input text,
  country_input text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  cleaned_parent_name text := nullif(trim(parent_name_input), '');
  cleaned_parent_email text := lower(nullif(trim(parent_email_input), ''));
  cleaned_country text := nullif(trim(country_input), '');
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if cleaned_parent_name is null then
    raise exception 'Parent name is required';
  end if;

  if cleaned_parent_email is null or cleaned_parent_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Valid parent email is required';
  end if;

  if cleaned_country is null then
    raise exception 'Country is required';
  end if;

  update public.students
  set
    parent_name = cleaned_parent_name,
    parent_email = cleaned_parent_email,
    country = cleaned_country
  where user_id = auth.uid();

  if not found then
    raise exception 'Student profile not found';
  end if;
end;
$$;

grant execute on function public.update_own_student_contact(text, text, text) to authenticated;

create table if not exists public.submission_evidence (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  screen_image text,
  camera_image text,
  proof_text text,
  attachment_name text,
  attachment_mime text,
  attachment_data text,
  captured_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  unique (homework_id, student_id)
);

alter table public.submission_evidence
  add column if not exists expires_at timestamptz not null default (now() + interval '14 days');

alter table public.submission_evidence
  add column if not exists proof_text text,
  add column if not exists attachment_name text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_data text,
  add column if not exists user_agent text,
  add column if not exists browser_name text,
  add column if not exists browser_version text,
  add column if not exists os_name text,
  add column if not exists device_type text,
  add column if not exists viewport_width integer,
  add column if not exists viewport_height integer,
  add column if not exists language text;

update public.submission_evidence
set expires_at = captured_at + interval '14 days'
where expires_at is null;

create index if not exists submission_evidence_student_id_idx
on public.submission_evidence (student_id);

create index if not exists submission_evidence_expires_at_idx
on public.submission_evidence (expires_at);

alter table public.submission_evidence enable row level security;

drop policy if exists "submission_evidence_select_self_or_admin" on public.submission_evidence;
create policy "submission_evidence_select_self_or_admin"
on public.submission_evidence for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "submission_evidence_insert_self_or_admin" on public.submission_evidence;
create policy "submission_evidence_insert_self_or_admin"
on public.submission_evidence for insert
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "submission_evidence_update_self_or_admin" on public.submission_evidence;
create policy "submission_evidence_update_self_or_admin"
on public.submission_evidence for update
using (student_id = private.current_student_id() or private.is_admin())
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "submission_evidence_delete_self_expired" on public.submission_evidence;
create policy "submission_evidence_delete_self_expired"
on public.submission_evidence for delete
using (student_id = private.current_student_id() and expires_at < now());

drop policy if exists "submission_evidence_delete_admin" on public.submission_evidence;
create policy "submission_evidence_delete_admin"
on public.submission_evidence for delete
using (private.is_admin());

grant select, insert, update, delete on public.submission_evidence to authenticated;
