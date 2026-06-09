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

alter table public.submission_evidence
  add column if not exists user_agent text,
  add column if not exists browser_name text,
  add column if not exists browser_version text,
  add column if not exists os_name text,
  add column if not exists device_type text,
  add column if not exists viewport_width integer,
  add column if not exists viewport_height integer,
  add column if not exists language text;
