-- Unified, occurrence-based class attendance and history.
--
-- This migration is additive and idempotent. It preserves the legacy Level 1
-- and Level 2 attendance tables during the rollout, backfills their existing
-- records, and makes a validated Join click the source of truth going forward.

begin;

create table if not exists public.class_history_settings (
  singleton boolean primary key default true check (singleton),
  tracking_started_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

insert into public.class_history_settings (singleton)
values (true)
on conflict (singleton) do nothing;

create table if not exists public.student_class_occurrences (
  id uuid primary key default gen_random_uuid(),
  occurrence_key text not null unique,
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  reschedule_request_id uuid references public.class_reschedule_requests(id) on delete set null,
  kind text not null check (kind in ('regular', 'makeup', 'rescheduled')),
  course_level smallint check (course_level in (1, 2)),
  module_number smallint check (module_number between 1 and 3),
  session_number smallint check (session_number between 1 and 8),
  session_id text,
  session_title text not null default 'Extra class',
  scheduled_starts_at timestamptz not null,
  scheduled_ends_at timestamptz not null,
  joined_at timestamptz,
  status public.attendance_status not null,
  source text not null check (source in ('join_button', 'admin_override', 'legacy', 'reconciled')),
  meet_link text not null default '',
  batch_time_zone text not null,
  student_time_zone text not null,
  override_reason text,
  overridden_by uuid references public.profiles(id) on delete set null,
  overridden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_class_occurrences_valid_window
    check (scheduled_ends_at > scheduled_starts_at),
  constraint student_class_occurrences_present_join
    check (status <> 'present' or joined_at is not null or source in ('admin_override', 'legacy'))
);

create index if not exists student_class_occurrences_student_time_idx
  on public.student_class_occurrences(student_id, scheduled_starts_at desc);
create index if not exists student_class_occurrences_status_time_idx
  on public.student_class_occurrences(status, scheduled_starts_at desc);
create index if not exists student_class_occurrences_session_idx
  on public.student_class_occurrences(student_id, course_level, session_id)
  where session_id is not null;
create index if not exists student_class_occurrences_request_idx
  on public.student_class_occurrences(reschedule_request_id)
  where reschedule_request_id is not null;

create table if not exists public.student_class_occurrence_audit (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.student_class_occurrences(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  previous_status public.attendance_status not null,
  new_status public.attendance_status not null,
  reason text not null check (length(trim(reason)) > 0),
  changed_by uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now()
);

create index if not exists student_class_occurrence_audit_occurrence_idx
  on public.student_class_occurrence_audit(occurrence_id, changed_at desc);

create or replace function private.next_student_curriculum_session(
  p_student_id uuid,
  p_at timestamptz
)
returns table (
  course_level smallint,
  module_number smallint,
  session_number smallint,
  session_id text,
  session_title text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  level_two public.student_course_enrollments%rowtype;
  ordinal integer;
  candidate_session_id text;
begin
  select enrollment.*
  into level_two
  from public.student_course_enrollments as enrollment
  where enrollment.student_id = p_student_id
    and enrollment.course_level = 2
    and enrollment.status = 'enrolled'
    and enrollment.starts_at <= p_at
    and (enrollment.ends_at is null or p_at < enrollment.ends_at)
  limit 1;

  if found then
    for ordinal in
      ((coalesce(level_two.start_module_number, 1)::integer - 1) * 8
        + coalesce(level_two.start_session_number, 1)::integer)..24
    loop
      course_level := 2;
      module_number := ((ordinal - 1) / 8 + 1)::smallint;
      session_number := ((ordinal - 1) % 8 + 1)::smallint;
      candidate_session_id := 'l2-m' || module_number::text || '-s' || session_number::text;
      session_id := candidate_session_id;
      session_title := 'Level 2 · Module ' || module_number::text || ' · Session ' || session_number::text;
      if not exists (
        select 1
        from public.student_class_occurrences as occurrence
        where occurrence.student_id = p_student_id
          and occurrence.course_level = 2
          and occurrence.session_id = candidate_session_id
          and occurrence.status = 'present'
      ) then
        return next;
        return;
      end if;
    end loop;
    return;
  end if;

  return query
  select
    1::smallint,
    module.order_index::smallint,
    session.session_number::smallint,
    session.id::text,
    session.title
  from public.sessions as session
  join public.modules as module on module.id = session.module_id
  where not exists (
    select 1
    from public.student_course_enrollments as enrollment
    where enrollment.student_id = p_student_id
      and enrollment.course_level = 1
      and enrollment.status = 'not_enrolled'
  )
    and not exists (
      select 1
      from public.student_class_occurrences as occurrence
      where occurrence.student_id = p_student_id
        and occurrence.course_level = 1
        and occurrence.session_id = session.id::text
        and occurrence.status = 'present'
    )
  order by module.order_index, session.session_number
  limit 1;
end;
$$;

create or replace function public.record_student_class_join(
  p_reschedule_request_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  joined_at_value timestamptz := now();
  student_row public.students%rowtype;
  batch_row public.batches%rowtype;
  request_row public.class_reschedule_requests%rowtype;
  pending_session record;
  slot_row record;
  class_date date;
  starts_at timestamptz;
  ends_at timestamptz;
  stored_meet_link text;
  occurrence_kind text;
  occurrence_key_value text;
  occurrence_id_value uuid;
  already_present boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select student.*
  into student_row
  from public.students as student
  where student.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Student profile was not found' using errcode = 'P0002';
  end if;

  select batch.* into batch_row
  from public.batches as batch
  where batch.id = student_row.batch_id;

  if not found then
    raise exception 'Student batch was not found' using errcode = 'P0002';
  end if;

  if p_reschedule_request_id is not null then
    select request.*
    into request_row
    from public.class_reschedule_requests as request
    where request.id = p_reschedule_request_id
      and request.student_id = student_row.id
      and request.status = 'approved';

    if not found then
      raise exception 'Approved class request was not found' using errcode = '42501';
    end if;

    starts_at := (request_row.requested_date + request_row.requested_start_time)
      at time zone request_row.requested_time_zone;
    ends_at := (request_row.requested_date + request_row.requested_end_time)
      at time zone request_row.requested_time_zone;
    if ends_at <= starts_at then ends_at := ends_at + interval '1 day'; end if;

    if joined_at_value < starts_at - interval '15 minutes' or joined_at_value > ends_at then
      raise exception 'This class is not currently open' using errcode = '42501';
    end if;

    class_date := request_row.requested_date;
    if exists (
      select 1 from public.batch_pauses as pause
      where pause.batch_id = batch_row.id
        and class_date >= pause.starts_on and class_date < pause.resumes_on
    ) then
      raise exception 'The batch is paused on this date' using errcode = '42501';
    end if;
    occurrence_kind := case when request_row.original_date is null then 'makeup' else 'rescheduled' end;
    occurrence_key_value := 'request:' || request_row.id::text;
    stored_meet_link := coalesce(nullif(trim(request_row.meet_link), ''), nullif(trim(batch_row.meet_link), ''));
  else
    select slot.*, candidate.class_date
    into slot_row
    from public.batch_class_slots as slot
    cross join lateral (
      values
        ((joined_at_value at time zone batch_row.time_zone)::date),
        ((joined_at_value at time zone batch_row.time_zone)::date - 1)
    ) as candidate(class_date)
    where slot.batch_id = batch_row.id
      and slot.day_of_week = extract(dow from candidate.class_date)::integer
      and joined_at_value >= (
        ((candidate.class_date + slot.start_time)
          at time zone batch_row.time_zone) - interval '15 minutes'
      )
      and joined_at_value <= (
        (
          candidate.class_date + slot.end_time
          + case when slot.end_time <= slot.start_time then interval '1 day' else interval '0 days' end
        ) at time zone batch_row.time_zone
      )
    order by candidate.class_date desc, slot.start_time desc, slot.sort_order
    limit 1;

    if not found then
      raise exception 'No regular class is currently open' using errcode = '42501';
    end if;

    class_date := slot_row.class_date;
    if exists (
      select 1 from public.batch_pauses as pause
      where pause.batch_id = batch_row.id
        and class_date >= pause.starts_on and class_date < pause.resumes_on
    ) then
      raise exception 'The batch is paused on this date' using errcode = '42501';
    end if;
    if exists (
      select 1 from public.class_reschedule_requests as request
      where request.student_id = student_row.id
        and request.status = 'approved'
        and request.original_date = class_date
    ) then
      raise exception 'This regular class was rescheduled' using errcode = '42501';
    end if;

    starts_at := (class_date + slot_row.start_time) at time zone batch_row.time_zone;
    ends_at := (
      class_date + slot_row.end_time
      + case when slot_row.end_time <= slot_row.start_time then interval '1 day' else interval '0 days' end
    ) at time zone batch_row.time_zone;
    occurrence_kind := 'regular';
    occurrence_key_value := 'regular:' || student_row.id::text || ':' || slot_row.id::text || ':' || class_date::text;
    stored_meet_link := coalesce(nullif(trim(slot_row.meet_link), ''), nullif(trim(batch_row.meet_link), ''));
  end if;

  if stored_meet_link is null then
    raise exception 'This class does not have a Meet link' using errcode = '22004';
  end if;

  select * into pending_session
  from private.next_student_curriculum_session(student_row.id, starts_at);

  select occurrence.status = 'present'
  into already_present
  from public.student_class_occurrences as occurrence
  where occurrence.occurrence_key = occurrence_key_value
  for update;
  already_present := coalesce(already_present, false);

  insert into public.student_class_occurrences (
    occurrence_key, student_id, batch_id, reschedule_request_id, kind,
    course_level, module_number, session_number, session_id, session_title,
    scheduled_starts_at, scheduled_ends_at, joined_at, status, source,
    meet_link, batch_time_zone, student_time_zone
  ) values (
    occurrence_key_value, student_row.id, batch_row.id, p_reschedule_request_id, occurrence_kind,
    pending_session.course_level, pending_session.module_number, pending_session.session_number,
    pending_session.session_id, coalesce(pending_session.session_title, 'Extra class'),
    starts_at, ends_at, joined_at_value, 'present', 'join_button',
    stored_meet_link, batch_row.time_zone, student_row.time_zone
  )
  on conflict (occurrence_key) do update set
    status = 'present',
    joined_at = coalesce(public.student_class_occurrences.joined_at, excluded.joined_at),
    source = 'join_button',
    override_reason = null,
    overridden_by = null,
    overridden_at = null,
    meet_link = excluded.meet_link,
    updated_at = now()
  returning id into occurrence_id_value;

  -- Keep the legacy projections current during the mixed-version rollout.
  if not already_present and pending_session.session_id is not null then
    if pending_session.course_level = 2 then
      insert into public.course_session_attendance (
        student_id, session_id, module_number, session_number, status, class_date
      ) values (
        student_row.id, pending_session.session_id, pending_session.module_number,
        pending_session.session_number, 'present', class_date
      )
      on conflict (student_id, session_id) do update set
        status = 'present', class_date = excluded.class_date, updated_at = joined_at_value;

      insert into public.course_class_join_events (
        student_id, session_id, module_number, session_number, batch_id,
        joined_at, class_date, meet_link
      ) values (
        student_row.id, pending_session.session_id, pending_session.module_number,
        pending_session.session_number, batch_row.id, joined_at_value, class_date, stored_meet_link
      );
    else
      insert into public.attendance (session_id, student_id, status, date)
      values (pending_session.session_id::uuid, student_row.id, 'present', class_date)
      on conflict (session_id, student_id) do update set status = 'present', date = excluded.date;

      insert into public.class_join_events (
        session_id, student_id, batch_id, joined_at, class_date, meet_link
      ) values (
        pending_session.session_id::uuid, student_row.id, batch_row.id,
        joined_at_value, class_date, stored_meet_link
      );
    end if;
  end if;

  return jsonb_build_object(
    'occurrence_id', occurrence_id_value,
    'joined_at', joined_at_value,
    'meet_link', stored_meet_link,
    'course_level', pending_session.course_level,
    'session_id', pending_session.session_id,
    'already_present', already_present
  );
end;
$$;

create or replace function public.override_student_class_attendance(
  p_occurrence_id uuid,
  p_status public.attendance_status,
  p_reason text
)
returns public.student_class_occurrences
language plpgsql
security definer
set search_path = ''
as $$
declare
  occurrence public.student_class_occurrences%rowtype;
  previous public.attendance_status;
begin
  if not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if nullif(trim(p_reason), '') is null then
    raise exception 'An override reason is required' using errcode = '22023';
  end if;

  select * into occurrence
  from public.student_class_occurrences
  where id = p_occurrence_id
  for update;
  if not found then raise exception 'Class occurrence was not found' using errcode = 'P0002'; end if;
  previous := occurrence.status;

  update public.student_class_occurrences
  set
    status = p_status,
    source = 'admin_override',
    override_reason = trim(p_reason),
    overridden_by = auth.uid(),
    overridden_at = now(),
    updated_at = now()
  where id = p_occurrence_id
  returning * into occurrence;

  insert into public.student_class_occurrence_audit (
    occurrence_id, student_id, previous_status, new_status, reason, changed_by
  ) values (
    occurrence.id, occurrence.student_id, previous, p_status, trim(p_reason), auth.uid()
  );

  -- Keep legacy projections aligned during the mixed-version rollout. The
  -- audit table remains the authoritative explanation for this correction.
  if occurrence.session_id is not null then
    if occurrence.course_level = 2 then
      insert into public.course_session_attendance (
        student_id, session_id, module_number, session_number, status, class_date
      ) values (
        occurrence.student_id, occurrence.session_id, occurrence.module_number,
        occurrence.session_number, p_status,
        (occurrence.scheduled_starts_at at time zone occurrence.batch_time_zone)::date
      )
      on conflict (student_id, session_id) do update set
        status = excluded.status,
        class_date = excluded.class_date,
        updated_at = now();
    elsif occurrence.course_level = 1 then
      insert into public.attendance (session_id, student_id, status, date)
      values (
        occurrence.session_id::uuid, occurrence.student_id, p_status,
        (occurrence.scheduled_starts_at at time zone occurrence.batch_time_zone)::date
      )
      on conflict (session_id, student_id) do update set
        status = excluded.status,
        date = excluded.date;
    end if;
  end if;

  return occurrence;
end;
$$;

create or replace function public.reconcile_student_class_history(
  p_through timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  tracking_start timestamptz;
  event record;
  pending_session record;
  inserted_count integer := 0;
  affected integer;
begin
  if auth.role() <> 'service_role' and not private.is_admin() then
    raise exception 'Admin or service role required' using errcode = '42501';
  end if;

  select tracking_started_at into tracking_start
  from public.class_history_settings where singleton = true;

  for event in
    select
      student.id as student_id,
      student.time_zone as student_time_zone,
      batch.id as batch_id,
      batch.time_zone as batch_time_zone,
      slot.id as slot_id,
      coalesce(nullif(trim(slot.meet_link), ''), nullif(trim(batch.meet_link), '')) as meet_link,
      occurrence.day_value::date as class_date,
      ((occurrence.day_value::date + slot.start_time) at time zone batch.time_zone) as starts_at,
      ((occurrence.day_value::date + slot.end_time
        + case when slot.end_time <= slot.start_time then interval '1 day' else interval '0 days' end)
        at time zone batch.time_zone) as ends_at,
      exists (
        select 1 from public.class_reschedule_requests as request
        where request.student_id = student.id and request.status = 'approved'
          and request.original_date = occurrence.day_value::date
      ) as was_rescheduled
    from public.students as student
    join public.batches as batch on batch.id = student.batch_id
    join public.batch_class_slots as slot on slot.batch_id = batch.id
    cross join lateral generate_series(
      greatest(
        (tracking_start at time zone batch.time_zone)::date,
        batch.start_date
      )::timestamp,
      (p_through at time zone batch.time_zone)::date::timestamp,
      interval '1 day'
    ) as occurrence(day_value)
    where slot.day_of_week = extract(dow from occurrence.day_value)::integer
      and not exists (
        select 1 from public.batch_pauses as pause
        where pause.batch_id = batch.id
          and occurrence.day_value::date >= pause.starts_on
          and occurrence.day_value::date < pause.resumes_on
      )
    order by student.id, starts_at
  loop
    if event.ends_at > p_through or event.ends_at < tracking_start then continue; end if;
    select * into pending_session
    from private.next_student_curriculum_session(event.student_id, event.starts_at);

    insert into public.student_class_occurrences (
      occurrence_key, student_id, batch_id, kind, course_level, module_number,
      session_number, session_id, session_title, scheduled_starts_at,
      scheduled_ends_at, status, source, meet_link, batch_time_zone, student_time_zone
    ) values (
      'regular:' || event.student_id::text || ':' || event.slot_id::text || ':' || event.class_date::text,
      event.student_id, event.batch_id, 'regular', pending_session.course_level,
      pending_session.module_number, pending_session.session_number, pending_session.session_id,
      coalesce(pending_session.session_title, 'Extra class'), event.starts_at, event.ends_at,
      case when event.was_rescheduled then 'rescheduled'::public.attendance_status else 'absent'::public.attendance_status end,
      'reconciled', coalesce(event.meet_link, ''), event.batch_time_zone, event.student_time_zone
    )
    on conflict (occurrence_key) do nothing;
    get diagnostics affected = row_count;
    inserted_count := inserted_count + affected;
  end loop;

  for event in
    select
      request.id as request_id,
      request.student_id,
      request.batch_id,
      student.time_zone as student_time_zone,
      batch.time_zone as batch_time_zone,
      request.requested_date as class_date,
      ((request.requested_date + request.requested_start_time) at time zone request.requested_time_zone) as starts_at,
      ((request.requested_date + request.requested_end_time
        + case when request.requested_end_time <= request.requested_start_time then interval '1 day' else interval '0 days' end)
        at time zone request.requested_time_zone) as ends_at,
      case when request.original_date is null then 'makeup' else 'rescheduled' end as kind,
      coalesce(nullif(trim(request.meet_link), ''), nullif(trim(batch.meet_link), '')) as meet_link
    from public.class_reschedule_requests as request
    join public.students as student on student.id = request.student_id
    join public.batches as batch on batch.id = request.batch_id
    where request.status = 'approved'
  loop
    if event.ends_at > p_through or event.ends_at < tracking_start then continue; end if;
    select * into pending_session
    from private.next_student_curriculum_session(event.student_id, event.starts_at);

    insert into public.student_class_occurrences (
      occurrence_key, student_id, batch_id, reschedule_request_id, kind,
      course_level, module_number, session_number, session_id, session_title,
      scheduled_starts_at, scheduled_ends_at, status, source, meet_link,
      batch_time_zone, student_time_zone
    ) values (
      'request:' || event.request_id::text, event.student_id, event.batch_id,
      event.request_id, event.kind, pending_session.course_level, pending_session.module_number,
      pending_session.session_number, pending_session.session_id,
      coalesce(pending_session.session_title, 'Extra class'), event.starts_at, event.ends_at,
      'absent', 'reconciled', coalesce(event.meet_link, ''), event.batch_time_zone,
      event.student_time_zone
    )
    on conflict (occurrence_key) do nothing;
    get diagnostics affected = row_count;
    inserted_count := inserted_count + affected;
  end loop;

  return inserted_count;
end;
$$;

-- Preserve legacy Level 1 join history without changing the old tables.
insert into public.student_class_occurrences (
  occurrence_key, student_id, batch_id, kind, course_level, module_number,
  session_number, session_id, session_title, scheduled_starts_at,
  scheduled_ends_at, joined_at, status, source, meet_link, batch_time_zone,
  student_time_zone
)
select
  'legacy-l1-join:' || join_event.student_id::text || ':' || join_event.session_id::text || ':' || join_event.class_date::text,
  join_event.student_id,
  join_event.batch_id,
  'regular',
  1,
  module.order_index,
  session.session_number,
  session.id::text,
  session.title,
  coalesce(schedule.starts_at, join_event.joined_at),
  coalesce(schedule.ends_at, join_event.joined_at + interval '1 hour'),
  join_event.joined_at,
  'present',
  'legacy',
  join_event.meet_link,
  batch.time_zone,
  student.time_zone
from public.class_join_events as join_event
join public.students as student on student.id = join_event.student_id
join public.batches as batch on batch.id = join_event.batch_id
join public.sessions as session on session.id = join_event.session_id
join public.modules as module on module.id = session.module_id
left join lateral (
  select
    ((join_event.class_date + slot.start_time) at time zone batch.time_zone) as starts_at,
    ((join_event.class_date + slot.end_time
      + case when slot.end_time <= slot.start_time then interval '1 day' else interval '0 days' end)
      at time zone batch.time_zone) as ends_at
  from public.batch_class_slots as slot
  where slot.batch_id = batch.id
    and slot.day_of_week = extract(dow from join_event.class_date)::integer
  order by slot.sort_order, slot.start_time
  limit 1
) as schedule on true
on conflict (occurrence_key) do nothing;

-- Preserve legacy Level 1 attendance decisions that have no stored Join event.
insert into public.student_class_occurrences (
  occurrence_key, student_id, batch_id, kind, course_level, module_number,
  session_number, session_id, session_title, scheduled_starts_at,
  scheduled_ends_at, joined_at, status, source, meet_link, batch_time_zone,
  student_time_zone
)
select
  'legacy-l1-attendance:' || attendance.id::text,
  attendance.student_id,
  student.batch_id,
  'regular', 1, module.order_index, session.session_number, session.id::text,
  session.title,
  coalesce(schedule.starts_at, (attendance.date + batch.start_time) at time zone batch.time_zone),
  coalesce(
    schedule.ends_at,
    (attendance.date + batch.end_time
      + case when batch.end_time <= batch.start_time then interval '1 day' else interval '0 days' end)
      at time zone batch.time_zone
  ),
  case when attendance.status = 'present' then attendance.created_at else null end,
  attendance.status,
  'legacy',
  coalesce(schedule.meet_link, batch.meet_link, ''),
  batch.time_zone,
  student.time_zone
from public.attendance as attendance
join public.students as student on student.id = attendance.student_id
join public.batches as batch on batch.id = student.batch_id
join public.sessions as session on session.id = attendance.session_id
join public.modules as module on module.id = session.module_id
left join lateral (
  select
    ((attendance.date + slot.start_time) at time zone batch.time_zone) as starts_at,
    ((attendance.date + slot.end_time
      + case when slot.end_time <= slot.start_time then interval '1 day' else interval '0 days' end)
      at time zone batch.time_zone) as ends_at,
    slot.meet_link
  from public.batch_class_slots as slot
  where slot.batch_id = batch.id
    and slot.day_of_week = extract(dow from attendance.date)::integer
  order by slot.sort_order, slot.start_time
  limit 1
) as schedule on true
where not exists (
  select 1 from public.class_join_events as join_event
  where join_event.student_id = attendance.student_id
    and join_event.session_id = attendance.session_id
)
on conflict (occurrence_key) do nothing;

-- Preserve Level 2 joins when that additive migration is installed.
do $$
begin
  if to_regclass('public.course_class_join_events') is not null then
    execute $backfill$
      insert into public.student_class_occurrences (
        occurrence_key, student_id, batch_id, kind, course_level, module_number,
        session_number, session_id, session_title, scheduled_starts_at,
        scheduled_ends_at, joined_at, status, source, meet_link, batch_time_zone,
        student_time_zone
      )
      select
        'legacy-l2-join:' || join_event.student_id::text || ':' || join_event.session_id || ':' || join_event.class_date::text,
        join_event.student_id,
        join_event.batch_id,
        'regular', 2, join_event.module_number, join_event.session_number,
        join_event.session_id,
        'Level 2 · Module ' || join_event.module_number::text || ' · Session ' || join_event.session_number::text,
        coalesce(schedule.starts_at, join_event.joined_at),
        coalesce(schedule.ends_at, join_event.joined_at + interval '1 hour'),
        join_event.joined_at, 'present', 'legacy', join_event.meet_link,
        batch.time_zone, student.time_zone
      from public.course_class_join_events as join_event
      join public.students as student on student.id = join_event.student_id
      join public.batches as batch on batch.id = join_event.batch_id
      left join lateral (
        select
          ((join_event.class_date + slot.start_time) at time zone batch.time_zone) as starts_at,
          ((join_event.class_date + slot.end_time
            + case when slot.end_time <= slot.start_time then interval '1 day' else interval '0 days' end)
            at time zone batch.time_zone) as ends_at
        from public.batch_class_slots as slot
        where slot.batch_id = batch.id
          and slot.day_of_week = extract(dow from join_event.class_date)::integer
        order by slot.sort_order, slot.start_time
        limit 1
      ) as schedule on true
      on conflict (occurrence_key) do nothing
    $backfill$;

    execute $backfill_attendance$
      insert into public.student_class_occurrences (
        occurrence_key, student_id, batch_id, kind, course_level, module_number,
        session_number, session_id, session_title, scheduled_starts_at,
        scheduled_ends_at, joined_at, status, source, meet_link, batch_time_zone,
        student_time_zone
      )
      select
        'legacy-l2-attendance:' || attendance.id::text,
        attendance.student_id,
        student.batch_id,
        'regular', 2, attendance.module_number, attendance.session_number,
        attendance.session_id,
        'Level 2 · Module ' || attendance.module_number::text || ' · Session ' || attendance.session_number::text,
        coalesce(schedule.starts_at, (attendance.class_date + batch.start_time) at time zone batch.time_zone),
        coalesce(
          schedule.ends_at,
          (attendance.class_date + batch.end_time
            + case when batch.end_time <= batch.start_time then interval '1 day' else interval '0 days' end)
            at time zone batch.time_zone
        ),
        case when attendance.status = 'present' then attendance.created_at else null end,
        attendance.status, 'legacy', coalesce(schedule.meet_link, batch.meet_link, ''),
        batch.time_zone, student.time_zone
      from public.course_session_attendance as attendance
      join public.students as student on student.id = attendance.student_id
      join public.batches as batch on batch.id = student.batch_id
      left join lateral (
        select
          ((attendance.class_date + slot.start_time) at time zone batch.time_zone) as starts_at,
          ((attendance.class_date + slot.end_time
            + case when slot.end_time <= slot.start_time then interval '1 day' else interval '0 days' end)
            at time zone batch.time_zone) as ends_at,
          slot.meet_link
        from public.batch_class_slots as slot
        where slot.batch_id = batch.id
          and slot.day_of_week = extract(dow from attendance.class_date)::integer
        order by slot.sort_order, slot.start_time
        limit 1
      ) as schedule on true
      where not exists (
        select 1 from public.course_class_join_events as join_event
        where join_event.student_id = attendance.student_id
          and join_event.session_id = attendance.session_id
      )
      on conflict (occurrence_key) do nothing
    $backfill_attendance$;
  end if;
end;
$$;

alter table public.class_history_settings enable row level security;
alter table public.student_class_occurrences enable row level security;
alter table public.student_class_occurrence_audit enable row level security;

drop policy if exists "class_history_settings_admin_select" on public.class_history_settings;
create policy "class_history_settings_admin_select"
on public.class_history_settings for select using (private.is_admin());

drop policy if exists "student_class_occurrences_select_self_or_admin" on public.student_class_occurrences;
create policy "student_class_occurrences_select_self_or_admin"
on public.student_class_occurrences for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "student_class_occurrence_audit_admin_select" on public.student_class_occurrence_audit;
create policy "student_class_occurrence_audit_admin_select"
on public.student_class_occurrence_audit for select using (private.is_admin());

revoke all on public.class_history_settings from anon, authenticated;
revoke all on public.student_class_occurrences from anon, authenticated;
revoke all on public.student_class_occurrence_audit from anon, authenticated;
grant select on public.student_class_occurrences to authenticated, service_role;
grant select on public.student_class_occurrence_audit to authenticated, service_role;
grant select on public.class_history_settings to authenticated, service_role;
grant all on public.student_class_occurrences to service_role;
grant all on public.student_class_occurrence_audit to service_role;

revoke all on function public.record_student_class_join(uuid) from public, anon;
grant execute on function public.record_student_class_join(uuid) to authenticated, service_role;
revoke all on function private.next_student_curriculum_session(uuid, timestamptz) from public;
revoke all on function public.override_student_class_attendance(uuid, public.attendance_status, text) from public, anon;
grant execute on function public.override_student_class_attendance(uuid, public.attendance_status, text) to authenticated, service_role;
revoke all on function public.reconcile_student_class_history(timestamptz) from public, anon;
grant execute on function public.reconcile_student_class_history(timestamptz) to authenticated, service_role;

commit;

-- Verification: these should return rows without changing legacy counts.
select count(*) as occurrence_count from public.student_class_occurrences;
select status, count(*) from public.student_class_occurrences group by status order by status;
