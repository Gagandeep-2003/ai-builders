-- Repair the June 2026 student Auth accounts after changing emails to @student.com.
-- Run this in Supabase SQL Editor for production.
--
-- First set the passwords for this SQL session:
-- select set_config('app.john_password', '<john-password>', false);
-- select set_config('app.ayan_password', '<ayan-password>', false);
-- select set_config('app.venu_password', '<venu-password>', false);
--
-- Then run the rest of this file.

create extension if not exists pgcrypto with schema extensions;

create or replace function private.repair_student_auth_user(
  old_email text,
  new_email text,
  target_password text,
  full_name text
) returns uuid
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
begin
  if coalesce(target_password, '') = '' then
    raise exception 'Missing password for %', new_email;
  end if;

  select id
    into target_user_id
  from auth.users
  where lower(email) in (lower(new_email), lower(old_email))
  order by case when lower(email) = lower(new_email) then 0 else 1 end
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
      lower(new_email),
      crypt(target_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('full_name', full_name),
      false,
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
    set
      email = lower(new_email),
      encrypted_password = crypt(target_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email']),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', full_name)
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
      'email', lower(new_email),
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
  values (target_user_id, lower(new_email), full_name, 'student'::public.app_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  return target_user_id;
end $$;

select private.repair_student_auth_user(
  'john.kurian@student.placeholder.com',
  'john.kurian@student.com',
  current_setting('app.john_password', true),
  'John Kurian'
);

select private.repair_student_auth_user(
  'ayan.khadka@student.placeholder.com',
  'ayan.khadka@student.com',
  current_setting('app.ayan_password', true),
  'Ayan Khadka'
);

select private.repair_student_auth_user(
  'venu@student.placeholder.com',
  'venu@student.com',
  current_setting('app.venu_password', true),
  'Venu'
);

drop function private.repair_student_auth_user(text, text, text, text);
