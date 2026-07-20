create table if not exists public.face_unlock_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid not null,
  login_email text not null,
  secret_hash text not null,
  friendly_name text not null default 'Browser',
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create index if not exists face_unlock_devices_lookup_idx
  on public.face_unlock_devices (device_id, login_email)
  where revoked_at is null;

alter table public.face_unlock_devices enable row level security;

revoke all on table public.face_unlock_devices from anon, authenticated;
grant select, insert, update, delete on public.face_unlock_devices to service_role;

comment on table public.face_unlock_devices is
  'Revocable same-browser credentials for optional camera Face Unlock. Face descriptors and images are never stored here.';
comment on column public.face_unlock_devices.secret_hash is
  'SHA-256 hash of a random browser secret. This is not biometric data.';
