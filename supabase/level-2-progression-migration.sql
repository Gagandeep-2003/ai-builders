alter table public.students
  add column if not exists course_level integer not null default 1,
  add column if not exists level_started_on date;

alter table public.students
  drop constraint if exists students_course_level_check;

alter table public.students
  add constraint students_course_level_check
  check (course_level between 1 and 2);

comment on column public.students.course_level is
  'The active course level shown to this student. Level 2 resets the module/session display sequence.';

comment on column public.students.level_started_on is
  'The first scheduled class date for the active level; used to restart Module 1 Session 1.';
