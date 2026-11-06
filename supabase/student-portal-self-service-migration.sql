-- Student-managed profile details and referral submissions.
--
-- Additive and idempotent: it does not delete or rewrite student/referral data.
-- Run in the Supabase SQL Editor before deploying the matching application code.

begin;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'referral_status') then
    create type public.referral_status as enum (
      'pending',
      'contacted',
      'enrolled',
      'rewarded',
      'closed'
    );
  end if;
end
$$;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  referred_name text not null,
  referred_contact text not null,
  relationship text not null,
  note text,
  status public.referral_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists referrals_student_id_idx on public.referrals (student_id);
create index if not exists referrals_status_idx on public.referrals (status);
create index if not exists referrals_created_at_idx on public.referrals (created_at desc);

alter table public.referrals enable row level security;

drop policy if exists "referrals_select_self_or_admin" on public.referrals;
create policy "referrals_select_self_or_admin"
on public.referrals for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "referrals_insert_self_or_admin" on public.referrals;
create policy "referrals_insert_self_or_admin"
on public.referrals for insert
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "referrals_update_admin" on public.referrals;
create policy "referrals_update_admin"
on public.referrals for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "referrals_delete_admin" on public.referrals;
create policy "referrals_delete_admin"
on public.referrals for delete
using (private.is_admin());

create or replace function public.update_own_student_contact(
  parent_name_input text,
  parent_email_input text,
  country_input text
)
returns void
language plpgsql
security definer
set search_path = ''
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

create or replace function public.create_own_referral(
  referred_name_input text,
  referred_contact_input text,
  relationship_input text,
  note_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_student_id uuid;
  created_referral_id uuid;
  cleaned_name text := nullif(trim(referred_name_input), '');
  cleaned_contact text := nullif(trim(referred_contact_input), '');
  cleaned_relationship text := nullif(trim(relationship_input), '');
  cleaned_note text := nullif(trim(note_input), '');
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if cleaned_name is null or length(cleaned_name) > 120 then
    raise exception 'A valid referred learner name is required';
  end if;

  if cleaned_contact is null or length(cleaned_contact) > 320 then
    raise exception 'A valid referral contact is required';
  end if;

  if cleaned_relationship is null or length(cleaned_relationship) > 64 then
    raise exception 'A valid relationship is required';
  end if;

  if cleaned_note is not null and length(cleaned_note) > 2000 then
    raise exception 'Referral note is too long';
  end if;

  select student.id
  into current_student_id
  from public.students as student
  where student.user_id = auth.uid()
  limit 1;

  if current_student_id is null then
    raise exception 'Student profile not found';
  end if;

  insert into public.referrals (
    student_id,
    referred_name,
    referred_contact,
    relationship,
    note,
    status
  )
  values (
    current_student_id,
    cleaned_name,
    cleaned_contact,
    cleaned_relationship,
    cleaned_note,
    'pending'
  )
  returning id into created_referral_id;

  return created_referral_id;
end;
$$;

grant select, insert, update, delete on public.referrals to authenticated;
grant select, insert, update, delete on public.referrals to service_role;
grant execute on function public.update_own_student_contact(text, text, text) to authenticated;
grant execute on function public.create_own_referral(text, text, text, text) to authenticated;

commit;
