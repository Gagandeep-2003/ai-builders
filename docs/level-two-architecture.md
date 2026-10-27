# ADR-002: Add Level 2 as an additive static catalog

**Status:** Accepted
**Date:** 2026-10-22
**Decision owners:** AI Builders product and engineering

## Context

Level 1 is represented by database rows in `modules`, `sessions`, and `homework`. Its class timing and meeting links come from `students`, `batches`, and the batch scheduling tables. Level 2 is a versioned application catalog with stable text IDs, while student-specific enrollment, work, attendance, and join history still need durable storage.

Changing the legacy curriculum or scheduling rows would couple the Level 2 launch to existing Level 1 behavior and make a mixed-version deployment unsafe. The database change is therefore additive.

## Decision

The application owns the static Level 2 catalog. The database owns only student-specific state:

| Table | Purpose | Stable catalog references |
| --- | --- | --- |
| `student_course_enrollments` | Level access window and selected starting position | `course_level`, module number, session number |
| `course_activity_submissions` | Submission lifecycle, proof, and mentor review | `activity_id`, module number, session number, kind |
| `course_session_attendance` | One current attendance result per student and Level 2 session | `session_id`, module number, session number |
| `course_class_join_events` | Append-only audit of class joins | `session_id`, module number, session number |

Level 2 IDs are deterministic:

- Session: `l2-m{module}-s{session}`, for modules 1-3 and sessions 1-8.
- Activity: `{session-id}-cc{1|2}` for class challenges and `{session-id}-ht{1|2}` for home tasks.

Database constraints reject an ID that disagrees with its module, session, or activity kind. No foreign key points from the new state tables to the legacy curriculum tables because the Level 2 catalog is not stored there.

## Invariants

1. The migration never inserts into or changes `modules`, `sessions`, `homework`, `students`, `batches`, class slots, pauses, or meeting-link configuration.
2. A student has at most one enrollment row per course level.
3. An `enrolled` row must have `starts_at`. An enrollment is active at time `t` only when `status = 'enrolled'`, `starts_at <= t`, and `ends_at` is null or `t < ends_at`.
4. A historical enrollment remains `enrolled`; `ends_at` closes its half-open access window. `not_enrolled` is an explicit disabled/placeholder state, not the normal representation of a completed level, and may omit `starts_at` (for example, a student created directly in Level 2 has a Level 1 placeholder).
5. Promotion uses the caller-supplied `timestamptz` without truncation. The Level 1 `ends_at` and Level 2 `starts_at` values are exactly equal, so there is no overlap or gap.
6. A future-dated promotion leaves Level 1 active until the boundary and leaves Level 2 scheduled until the same boundary.
7. Promotion requires an open Level 1 enrollment and rejects any existing Level 2 enrollment, regardless of that row's status. Concurrent attempts serialize on the student row.
8. The selected Level 2 starting module/session is an access floor. Submissions, attendance, and joins before that catalog position are rejected.
9. Submission identity fields are immutable after insert. Students cannot set mentor review fields or review-only statuses, and cannot change a reviewed submission. Admins may review after enrollment ends, but every new submission must belong to an actively eligible enrollment.
10. Students can read only their own rows. Direct enrollment, attendance, and join-event writes are admin-only; student joins go through the validating RPC. Admin access is determined by `private.is_admin()`.
11. `SECURITY DEFINER` functions use an empty, locked `search_path`, schema-qualify stored objects, revoke default/public execution, and perform their own authorization checks.
12. Meeting links and batch IDs recorded in join events are snapshots. Neither RPC updates the student's batch, the batch schedule, a class slot, or its meeting link.

## Write paths

### Promote a student

Call:

```sql
select public.promote_student_to_level_two(
  p_student_id := '<student uuid>',
  p_start_module_number := 1::smallint,
  p_start_session_number := 1::smallint,
  p_starts_at := '2026-11-03T17:00:00+05:30'::timestamptz
);
```

The authenticated caller must be an admin. In one transaction, the RPC locks the student, rejects an existing Level 2 row, closes Level 1 at the exact boundary, and returns the inserted Level 2 enrollment. A failure rolls back both changes.

### Record a Level 2 class join

Call:

```sql
select public.record_level_two_class_join(
  p_session_id := 'l2-m1-s1',
  p_module_number := 1::smallint,
  p_session_number := 1::smallint,
  p_class_date := '2026-11-03'::date,
  p_meet_link := 'https://meet.google.com/example'
);
```

The RPC resolves the student from `auth.uid()`; callers cannot provide another student's ID. It validates the stable session ID, the enrollment window against the verified stored class occurrence, and the selected starting position. Comparing the enrollment boundary with the class start (rather than the click time) preserves the normal 15-minute early join window for the first Level 2 class. It then upserts `present` attendance and appends a join event atomically. It returns JSON containing `attendance_id`, `join_event_id`, and `joined_at`.

## Options considered

### Extend the legacy curriculum tables

Rejected. It would mix database-generated UUID curriculum with the static Level 2 catalog, require generated homework rows for every batch, and expose Level 1 code paths to Level 2 rollout risk.

### Store all progress in the application catalog

Rejected. The catalog is immutable source data, not a safe store for per-student state, proof, review history, or attendance auditing.

### Additive static-catalog state tables

Chosen. It preserves stable IDs, keeps the legacy runtime intact, and makes application rollback possible without reversing curriculum mutations.

## Mixed-deploy behavior

The migration can ship before the Level 2 application code. Old application instances continue to use only legacy tables and are unaffected. New instances should:

1. Read enrollment rows when the new relation is available.
2. Continue the legacy Level 1 read/write path for Level 1 curriculum, homework, attendance, and joins.
3. Use the static catalog plus the four new tables only for Level 2.
4. Treat a missing new relation or RPC during a rolling deploy as "Level 2 unavailable" and fall back to the Level 1 experience; do not synthesize a Level 2 enrollment from the batch or current legacy module.

The migration backfills one Level 1 enrollment for every existing student with `starts_at = students.enrolled_at`, module 1/session 1, and `source = 'legacy'`. `ON CONFLICT DO NOTHING` makes a normal rerun non-destructive. Student creation after this deployment must create its Level 1 enrollment in the application/admin write path before promotion can occur.

If an old instance serves a student whose Level 2 promotion has already started, it cannot understand Level 2 and will show the legacy Level 1 experience. Keep the mixed-version window short and do not use old instances as the source of truth for promotion state.

## Rollout

1. Back up the database and record counts for students and the legacy curriculum/state tables.
2. Apply `supabase/level-two-course-migration.sql` in a staging project, then apply it a second time to verify practical idempotency.
3. Verify the Level 1 backfill count and RLS/RPC acceptance tests below.
4. Deploy readers with the "Level 2 unavailable" fallback while promotion controls remain disabled.
5. Deploy Level 2 submission and join write paths.
6. Enable the admin promotion control for internal test students, then a small cohort, then all intended students.
7. Monitor promotion errors, rejected submission writes, join RPC errors, and the equality of Level 1 end/Level 2 start boundaries.

## Rollback

Application rollback is the primary rollback: disable promotions and Level 2 writes, then deploy the previous application. The migration is additive and should remain in place so already-recorded Level 2 data is not lost. Legacy schedule, meeting-link, batch, and curriculum data require no restoration because they were never changed.

Before a full database rollback, export all four new tables and confirm no application instance is using them. Drop the two public RPCs first, then policies/triggers, then the four tables. This destructive cleanup is a separate, deliberate operation and is not part of the migration. Students already promoted will appear as Level 1 to a legacy application; decide operationally whether to pause their classes or restore a Level 2-capable release.

## Acceptance tests

Run with separate authenticated admin, student A, student B, and anonymous clients.

### Migration and backfill

- Apply the migration twice; the second run succeeds and creates no duplicate enrollment rows.
- Confirm every pre-migration student has exactly one Level 1 row with `source = 'legacy'`, `starts_at = students.enrolled_at`, and null `ends_at`.
- Snapshot and compare row contents of `modules`, `sessions`, `homework`, `students`, `batches`, `batch_class_slots`, and `batch_pauses`; the migration changes none of them.

### Promotion

- As admin, promote a Level 1 student with a timestamp that includes a non-UTC offset and a start at module 2/session 3. Confirm the returned Level 2 `starts_at` and Level 1 `ends_at` represent the exact same instant and the selected numbers are preserved.
- Confirm the student's `batch_id`, batch schedule, class slots, and meeting links are byte-for-byte unchanged.
- Attempt the same promotion again and confirm it fails without changing Level 1.
- Attempt promotion as a student and anonymously; both fail.
- Attempt an invalid module/session and a time before Level 1 began; both fail atomically.

### RLS and submission guard

- Student A can select A's new rows but cannot select B's. An admin can select both. Anonymous access returns no rows and cannot execute either RPC.
- Student A can insert/update A's eligible activity submission, but cannot write B's `student_id`, a malformed/mismatched activity ID, or an activity before A's selected starting position.
- A scheduled (not-yet-active) or ended Level 2 enrollment cannot create or student-update a submission.
- A student cannot change `reviewed_at`, `reviewed_by`, `mentor_feedback`, or set `revision_requested`/`reviewed`. An admin can set review fields and statuses, including after enrollment has ended.
- Neither student nor admin can update a submission's identity fields. Admin delete/reinsert is required for an identity correction.

### Class join

- As the enrolled student, call `record_level_two_class_join` for the selected starting session during its normal 15-minute early join window. Confirm one `present` attendance row and one join event are committed and the returned IDs match them, even though `joined_at` precedes the enrollment boundary at the class start.
- Repeat that check for a class shortly after midnight whose early window begins on the previous local date, and for an overnight class whose end is on the following local date.
- Call it again. Confirm attendance is updated rather than duplicated and a second audit event is appended.
- Try a stable-looking session before the selected start, a mismatched session ID/number pair, an enrollment that starts after the matched class occurrence, an ended enrollment, and a class date outside every currently open stored slot; each fails with neither attendance nor event committed.
- Call as another student and confirm the function can only write rows for the student resolved from that caller's `auth.uid()`.
