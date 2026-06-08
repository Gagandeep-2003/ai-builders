-- Reset the demo student workbook after the homework/task-timer upgrade.
-- Run this in Supabase SQL Editor if student@demo.com shows old submitted tasks
-- such as "Build your study hub" with impossible time spent.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'homework_kind') then
    create type public.homework_kind as enum ('class_challenge', 'home_task');
  end if;
end $$;

alter table public.homework
  add column if not exists kind public.homework_kind not null default 'home_task',
  add column if not exists content_url text not null default '';

alter table public.submissions
  add column if not exists started_at timestamptz;

-- Remove the original demo seed homework rows. They were pre-submitted samples
-- and do not match the new explicit Start Task -> Mark Complete workflow.
delete from public.homework
where id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003'
);

insert into public.homework (id, session_id, batch_id, title, description, kind, content_url, due_date, created_at) values
('30000000-0000-4000-8000-000000000401', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Session 1 Class Challenge', 'Complete the in-class prompt and reflection challenge for Welcome to the AI Era.', 'class_challenge', 'https://docs.google.com/document/d/1C0I22ZjEqAs-YN5Q5xqt3qKxgly_rEItJVgnV43fFbU/edit?usp=sharing', '2026-06-10', now()),
('30000000-0000-4000-8000-000000000402', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Session 1 Home Task', 'Complete the home task for Welcome to the AI Era and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/166ROF2jMqKAtzMhx1VXyBkk0iy0W0UzdhyKF2kDTTmA/edit?usp=sharing', '2026-06-12', now()),
('30000000-0000-4000-8000-000000000403', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Session 2 Class Challenge', 'Complete the in-class study system challenge for AI for School: Study Smarter.', 'class_challenge', 'https://docs.google.com/document/d/1CQh5XrIXikVHZ9dq9GJi1TBf3nJscCG3_ONY4SWl6GM/edit?usp=sharing', '2026-06-17', now()),
('30000000-0000-4000-8000-000000000404', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Session 2 Home Task', 'Complete the home task for AI for School: Study Smarter and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-19', now()),
('30000000-0000-4000-8000-000000000405', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'Session 3 Class Challenge', 'Complete the in-class creative writing challenge for AI for Creative Writing.', 'class_challenge', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-24', now()),
('30000000-0000-4000-8000-000000000406', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'Session 3 Home Task', 'Complete the home task for AI for Creative Writing and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1tTUOerSCutvkHhMvj6rRT-QBOirOtdeeM4HVex2eBec/edit?usp=sharing', '2026-06-26', now())
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  kind = excluded.kind,
  content_url = excluded.content_url,
  due_date = excluded.due_date;

-- Force the demo account back to fresh pending state for the new workbook rows.
delete from public.submissions
where student_id = '11111111-1111-4111-8111-111111111111'
  and homework_id in (
    '30000000-0000-4000-8000-000000000401',
    '30000000-0000-4000-8000-000000000402',
    '30000000-0000-4000-8000-000000000403',
    '30000000-0000-4000-8000-000000000404',
    '30000000-0000-4000-8000-000000000405',
    '30000000-0000-4000-8000-000000000406'
  );
