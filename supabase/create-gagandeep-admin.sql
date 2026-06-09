-- Create or repair the production admin account for Gagandeep.
-- Run this in the Supabase SQL Editor for the production project.
-- Before running the block, set the password only for this SQL session:
-- select set_config('app.gagandeep_admin_password', '<temporary-password>', false);

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  target_email text := 'gagandeepsingh220903@gmail.com';
  target_password text := current_setting('app.gagandeep_admin_password', true);
  target_name text := 'Gagandeep Singh';
  target_user_id uuid;
begin
  if coalesce(target_password, '') = '' then
    raise exception 'Set app.gagandeep_admin_password before running this script.';
  end if;

  select id
    into target_user_id
  from auth.users
  where lower(email) = target_email
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
      target_email,
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
      'email', target_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  insert into public.profiles (id, email, full_name, role)
  values (target_user_id, target_email, target_name, 'admin'::public.app_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;
end $$;
