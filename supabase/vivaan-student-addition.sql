-- One-time production setup for Vivaan's AI Course.
-- Run this in Supabase SQL Editor.
--
-- First set the temporary password only for this SQL session:
-- select set_config('app.vivaan_password', '<temporary-password>', false);
--
-- Then run the rest of this file.
--
-- Student email:
--   vivaan@student.com
--
-- Schedule:
--   Monday 8:00 PM - 9:00 PM CDT  = Tuesday 6:30 AM - 7:30 AM IST
--   Friday 4:00 PM - 5:00 PM CDT  = Saturday 2:30 AM - 3:30 AM IST
--
-- The batch starts from Friday, June 19, 2026 because the first Monday of
-- the week is being treated as missed. Session 1 will therefore be Friday,
-- then the schedule continues Monday/Friday from the following week.

create extension if not exists pgcrypto with schema extensions;

create or replace function private.ensure_vivaan_auth_user(
  target_email text,
  target_password text,
  target_name text
) returns uuid
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
begin
  if coalesce(target_password, '') = '' then
    raise exception 'Missing password for %', target_email;
  end if;

  select id
    into target_user_id
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if target_user_id is null then
    target_user_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      target_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(target_email),
      crypt(target_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('full_name', target_name),
      false,
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
    set
      email = lower(target_email),
      encrypted_password = crypt(target_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email']),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', target_name)
    where id = target_user_id;
  end if;

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    target_user_id::text,
    target_user_id,
    jsonb_build_object(
      'sub', target_user_id::text,
      'email', lower(target_email),
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do update set
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.profiles (id, email, full_name, role)
  values (target_user_id, lower(target_email), target_name, 'student'::public.app_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  return target_user_id;
end $$;

insert into public.batches (
  id,
  name,
  days,
  time_slot,
  time_zone,
  start_date,
  start_time,
  end_time,
  meet_link,
  module_id
) values (
  '20000000-0000-4000-8000-000000000016',
  'Vivaan AI Course - Mon/Fri Texas',
  'Mon / Fri',
  'Mon 8:00 PM - 9:00 PM / Fri 4:00 PM - 5:00 PM America/Chicago',
  'America/Chicago',
  '2026-06-19',
  '20:00',
  '21:00',
  'https://meet.google.com/wck-wuoj-cjq',
  '00000000-0000-4000-8000-000000000001'
)
on conflict (id) do update set
  name = excluded.name,
  days = excluded.days,
  time_slot = excluded.time_slot,
  time_zone = excluded.time_zone,
  start_date = excluded.start_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  module_id = excluded.module_id;

insert into public.batch_class_slots (
  id,
  batch_id,
  label,
  day_of_week,
  start_time,
  end_time,
  meet_link,
  sort_order
) values
  (
    '21000000-0000-4000-8000-000000000024',
    '20000000-0000-4000-8000-000000000016',
    'Monday class',
    1,
    '20:00',
    '21:00',
    'https://meet.google.com/wck-wuoj-cjq',
    1
  ),
  (
    '21000000-0000-4000-8000-000000000025',
    '20000000-0000-4000-8000-000000000016',
    'Friday class',
    5,
    '16:00',
    '17:00',
    'https://meet.google.com/qwr-urrr-fvg',
    2
  )
on conflict (id) do update set
  batch_id = excluded.batch_id,
  label = excluded.label,
  day_of_week = excluded.day_of_week,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  sort_order = excluded.sort_order;

with vivaan_user as (
  select private.ensure_vivaan_auth_user(
    'vivaan@student.com',
    current_setting('app.vivaan_password', true),
    'Vivaan'
  ) as user_id
)
insert into public.students (
  id,
  user_id,
  full_name,
  parent_name,
  parent_email,
  country,
  time_zone,
  batch_id,
  enrolled_at
)
select
  '11111111-1111-4111-8111-111111111126'::uuid,
  vivaan_user.user_id,
  'Vivaan',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'USA',
  'America/Chicago',
  '20000000-0000-4000-8000-000000000016'::uuid,
  '2026-06-19T00:00:00Z'::timestamptz
from vivaan_user
on conflict (id) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  parent_name = excluded.parent_name,
  parent_email = excluded.parent_email,
  country = excluded.country,
  time_zone = excluded.time_zone,
  batch_id = excluded.batch_id,
  enrolled_at = excluded.enrolled_at;

drop function private.ensure_vivaan_auth_user(text, text, text);
