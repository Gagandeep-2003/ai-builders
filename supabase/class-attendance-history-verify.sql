-- Run after class-attendance-history-migration.sql in staging, then run the
-- migration a second time and run this file again. Every *_violation_count
-- must be 0. The final summaries are informational and should be compared
-- with the pre-migration legacy table counts captured for the environment.

do $$
begin
  if to_regclass('public.student_class_occurrences') is null then
    raise exception 'student_class_occurrences is missing';
  end if;
  if to_regclass('public.student_class_occurrence_audit') is null then
    raise exception 'student_class_occurrence_audit is missing';
  end if;
  if to_regprocedure('public.record_student_class_join(uuid)') is null then
    raise exception 'record_student_class_join(uuid) is missing';
  end if;
  if to_regprocedure(
    'public.override_student_class_attendance(uuid,public.attendance_status,text)'
  ) is null then
    raise exception 'override_student_class_attendance is missing';
  end if;
  if to_regprocedure('public.reconcile_student_class_history(timestamp with time zone)') is null then
    raise exception 'reconcile_student_class_history is missing';
  end if;
end;
$$;

select count(*) as duplicate_occurrence_key_violation_count
from (
  select occurrence_key
  from public.student_class_occurrences
  group by occurrence_key
  having count(*) > 1
) as duplicate_keys;

select count(*) as invalid_present_source_violation_count
from public.student_class_occurrences
where status = 'present'
  and joined_at is null
  and source not in ('admin_override', 'legacy');

select count(*) as invalid_module_number_violation_count
from public.student_class_occurrences
where module_number is not null
  and (
    module_number < 1
    or (course_level = 2 and module_number > 3)
  );

select count(*) as empty_override_reason_violation_count
from public.student_class_occurrence_audit
where nullif(trim(reason), '') is null;

select count(*) as replaced_original_marked_absent_violation_count
from public.student_class_occurrences as occurrence
join public.class_reschedule_requests as request
  on request.student_id = occurrence.student_id
 and request.status = 'approved'
 and request.original_date = (
   occurrence.scheduled_starts_at at time zone occurrence.batch_time_zone
 )::date
where occurrence.kind = 'regular'
  and occurrence.status = 'absent';

select count(*) as legacy_level_one_join_without_history_violation_count
from public.class_join_events as join_event
where not exists (
  select 1
  from public.student_class_occurrences as occurrence
  where occurrence.student_id = join_event.student_id
    and occurrence.course_level = 1
    and occurrence.session_id = join_event.session_id::text
    and occurrence.status = 'present'
);

select count(*) as legacy_level_two_join_without_history_violation_count
from public.course_class_join_events as join_event
where not exists (
  select 1
  from public.student_class_occurrences as occurrence
  where occurrence.student_id = join_event.student_id
    and occurrence.course_level = 2
    and occurrence.session_id = join_event.session_id
    and occurrence.status = 'present'
);

-- Multiple attended occurrences may share a curriculum session only when an
-- audited correction or a genuinely attended retry exists. Progress still
-- completes the session once because application logic uses distinct IDs.
select
  student_id,
  course_level,
  session_id,
  count(*) as present_occurrences
from public.student_class_occurrences
where status = 'present' and session_id is not null
group by student_id, course_level, session_id
having count(*) > 1
order by present_occurrences desc, student_id;

select status, kind, source, count(*)
from public.student_class_occurrences
group by status, kind, source
order by status, kind, source;

select
  student_id,
  count(*) filter (where status = 'present') as lifetime_attended_classes,
  count(distinct (course_level, session_id)) filter (
    where status = 'present' and session_id is not null
  ) as completed_curriculum_sessions
from public.student_class_occurrences
group by student_id
order by student_id;
