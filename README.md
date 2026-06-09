# AI Builders Summer Bootcamp Portal

Private student learning portal for a premium AI tutoring bootcamp. Built with the latest stable Next.js App Router, Supabase Auth/Database, Tailwind CSS, Framer Motion, Lucide React, and Recharts.

## Local Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase env vars, the app runs in demo UI mode so you can review pages immediately.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.local.example` to `.env.local`.
3. Add:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. In Supabase Authentication, manually create these users:

```txt
student@demo.com / student1234
admin@bootcamp.com / admin1234
```

5. Run `supabase/schema.sql` in the SQL editor.
6. Run `supabase/seed.sql` in the SQL editor.

If you already ran `schema.sql` before the grants were added, run this once:

```txt
supabase/grants.sql
```

Then run `supabase/seed.sql`.

If you already have tables from before timezone support was added, run this once before `seed.sql`:

```txt
supabase/timezone-migration.sql
```

The hosted seed does not insert into `auth.users`. It reads the manually created user ids with:

```sql
select id from auth.users where lower(email) = ...
```

Then it creates the matching `public.profiles` and demo `public.students` rows.

## June 2026 International Student Import

For the current fresh batches, first create these Auth users manually in Supabase Authentication:

```txt
john.kurian@student.com / john@123
ayan.khadka@student.com / ayan@123
venu@student.com / venu@123
```

Then run these SQL files in order:

```txt
supabase/timezone-migration.sql
supabase/operations-migration.sql
supabase/curriculum-migration.sql
supabase/homework-migration.sql
supabase/student-import-june-2026.sql
```

The import creates:

- John Kurian: `America/Chicago`, Tue 11:00 AM and Wed 2:00 PM
- Ayan Khadka: `Australia/Sydney`, Sat/Sun 12:00 PM
- Venu: `America/New_York`, Wed 4:00 PM and Thu 3:00 PM

Preview the first sessions and IST conversions locally:

```bash
npm run preview:import-schedules
```

Use IANA timezone names, not fixed offsets or abbreviations. For example, use `Australia/Sydney`; the app will show AEST/AEDT correctly depending on the date.

## Operational Sync Features

Run this migration before using tracked class joins or password approvals:

```txt
supabase/operations-migration.sql
```

This adds:

- tracked `Join Live Class` events
- automatic attendance marking when a student joins from the portal
- admin-visible recent class joins
- student password change requests
- admin approval/rejection for password changes
- a safe database function that only marks an already-approved password request as used

## Curriculum And Homework

The PDF-based syllabus lives in:

```txt
supabase/curriculum-migration.sql
```

This updates all 3 modules and 24 sessions from the provided curriculum PDFs.

The first three Module 1 sessions have seeded work items in:

```txt
supabase/homework-migration.sql
```

Each homework item can be a `Class Challenge` or `Home Task`, can embed a Google Doc inside the student portal, and tracks:

- explicit `Start Task` time
- submitted/completed time
- time spent
- submitted count per assignment for admin review

Google Docs should be shared as view-only links. The portal converts them into embedded preview URLs automatically.

Student homework is shown module-wise:

```txt
Module 1
  Session 1
  Session 2
  ...
Module 2
  Session 1
  ...
Module 3
  Session 1
  ...
```

Students must press `Start Task` before the embedded document opens and the timer begins. `Mark Complete` stops the timer and updates admin reporting.

Admin adds unique Google Docs like this:

1. Open `/admin/homework`.
2. Expand `Add class challenge or home task`.
3. Keep target type as `Batch` for normal shared work.
4. Select the student batch.
5. Select the exact `Module` and `Session`.
6. Choose `Class Challenge` or `Home Task`.
7. Paste the unique Google Doc view-only URL.
8. Add the due date and student-facing instruction.

For each session, normally add two records:

```txt
Module 1 · Session 1 · Class Challenge
Module 1 · Session 1 · Home Task
```

Those records automatically appear for every student in that batch. No per-student assigning is needed unless there is a special one-off task.

## Security Notes

- App roles live in `public.profiles`, not `public.users`.
- Every app table has RLS enabled.
- Admin policies use `private.is_admin()` as a `SECURITY DEFINER` helper.
- Student policies scope reads/writes through `auth.uid()` and the matching student row.
- `SUPABASE_SERVICE_ROLE_KEY` is intentionally not required for V1.
- Never expose service role keys as `NEXT_PUBLIC_*`.

## V1 Routes

Public:

```txt
/
/login
```

Student:

```txt
/dashboard
/curriculum
/homework
/resources
/class
/progress
/profile
```

Admin:

```txt
/admin
/admin/students
/admin/batches
/admin/homework
/admin/resources
/admin/attendance
/admin/feedback
/admin/announcements
```

## Verification Checklist

```bash
npm run lint
npm run build
```

Manual checks:

- Public landing page loads.
- Login redirects by role.
- Student can see dashboard, curriculum, homework, resources, class, progress, and profile.
- Student can mark homework submitted.
- Admin can add student records, batches, homework, resources, attendance, feedback, and announcements.
- RLS blocks students from reading other students' private rows.

## Student Import Details

For each new student, prepare:

```txt
Full name
Student email
Temporary password
Parent name
Parent email
Country
IANA timezone, e.g. America/New_York, Europe/London, Asia/Dubai
Batch name
```

For each batch, prepare:

```txt
Batch name
Class days, e.g. Mon / Wed
Canonical class timezone, e.g. Asia/Kolkata, America/Chicago, Australia/Sydney
Start date, e.g. 2026-06-08
Class 1 day, start time, end time, meet link
Class 2 day, start time, end time, meet link
Current module
```

Use IANA timezone names rather than fixed offsets. This keeps daylight saving time correct for international students.
