-- Student referral workflow for the AI Builders portal.
-- Run once in Supabase SQL Editor as the postgres role.

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

grant select, insert, update, delete on public.referrals to authenticated;
grant select, insert, update, delete on public.referrals to service_role;
