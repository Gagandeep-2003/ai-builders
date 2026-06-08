-- Consent-based student submission proof.
-- Stores compressed screen/camera snapshots captured by the browser after student permission.

create table if not exists public.submission_evidence (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  screen_image text,
  camera_image text,
  captured_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  unique (homework_id, student_id)
);

alter table public.submission_evidence
  add column if not exists expires_at timestamptz not null default (now() + interval '30 days');

update public.submission_evidence
set expires_at = captured_at + interval '30 days'
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
