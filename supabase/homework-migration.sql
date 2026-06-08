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

insert into public.homework (id, session_id, batch_id, title, description, kind, content_url, due_date, created_at) values
('30000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000010', 'Session 1 Class Challenge', 'Complete the in-class prompt and reflection challenge for Welcome to the AI Era.', 'class_challenge', 'https://docs.google.com/document/d/1C0I22ZjEqAs-YN5Q5xqt3qKxgly_rEItJVgnV43fFbU/edit?usp=sharing', '2026-06-10', now()),
('30000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000010', 'Session 1 Home Task', 'Complete the home task for Welcome to the AI Era and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/166ROF2jMqKAtzMhx1VXyBkk0iy0W0UzdhyKF2kDTTmA/edit?usp=sharing', '2026-06-12', now()),
('30000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000010', 'Session 2 Class Challenge', 'Complete the in-class study system challenge for AI for School: Study Smarter.', 'class_challenge', 'https://docs.google.com/document/d/1CQh5XrIXikVHZ9dq9GJi1TBf3nJscCG3_ONY4SWl6GM/edit?usp=sharing', '2026-06-11', now()),
('30000000-0000-4000-8000-000000000104', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000010', 'Session 2 Home Task', 'Complete the home task for AI for School: Study Smarter and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-13', now()),
('30000000-0000-4000-8000-000000000105', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000010', 'Session 3 Class Challenge', 'Complete the in-class creative writing challenge for AI for Creative Writing.', 'class_challenge', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-17', now()),
('30000000-0000-4000-8000-000000000106', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000010', 'Session 3 Home Task', 'Complete the home task for AI for Creative Writing and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1tTUOerSCutvkHhMvj6rRT-QBOirOtdeeM4HVex2eBec/edit?usp=sharing', '2026-06-19', now()),
('30000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000011', 'Session 1 Class Challenge', 'Complete the in-class prompt and reflection challenge for Welcome to the AI Era.', 'class_challenge', 'https://docs.google.com/document/d/1C0I22ZjEqAs-YN5Q5xqt3qKxgly_rEItJVgnV43fFbU/edit?usp=sharing', '2026-06-14', now()),
('30000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000011', 'Session 1 Home Task', 'Complete the home task for Welcome to the AI Era and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/166ROF2jMqKAtzMhx1VXyBkk0iy0W0UzdhyKF2kDTTmA/edit?usp=sharing', '2026-06-16', now()),
('30000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000011', 'Session 2 Class Challenge', 'Complete the in-class study system challenge for AI for School: Study Smarter.', 'class_challenge', 'https://docs.google.com/document/d/1CQh5XrIXikVHZ9dq9GJi1TBf3nJscCG3_ONY4SWl6GM/edit?usp=sharing', '2026-06-15', now()),
('30000000-0000-4000-8000-000000000204', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000011', 'Session 2 Home Task', 'Complete the home task for AI for School: Study Smarter and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-17', now()),
('30000000-0000-4000-8000-000000000205', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000011', 'Session 3 Class Challenge', 'Complete the in-class creative writing challenge for AI for Creative Writing.', 'class_challenge', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-21', now()),
('30000000-0000-4000-8000-000000000206', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000011', 'Session 3 Home Task', 'Complete the home task for AI for Creative Writing and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1tTUOerSCutvkHhMvj6rRT-QBOirOtdeeM4HVex2eBec/edit?usp=sharing', '2026-06-23', now()),
('30000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000012', 'Session 1 Class Challenge', 'Complete the in-class prompt and reflection challenge for Welcome to the AI Era.', 'class_challenge', 'https://docs.google.com/document/d/1C0I22ZjEqAs-YN5Q5xqt3qKxgly_rEItJVgnV43fFbU/edit?usp=sharing', '2026-06-11', now()),
('30000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000012', 'Session 1 Home Task', 'Complete the home task for Welcome to the AI Era and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/166ROF2jMqKAtzMhx1VXyBkk0iy0W0UzdhyKF2kDTTmA/edit?usp=sharing', '2026-06-13', now()),
('30000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000012', 'Session 2 Class Challenge', 'Complete the in-class study system challenge for AI for School: Study Smarter.', 'class_challenge', 'https://docs.google.com/document/d/1CQh5XrIXikVHZ9dq9GJi1TBf3nJscCG3_ONY4SWl6GM/edit?usp=sharing', '2026-06-12', now()),
('30000000-0000-4000-8000-000000000304', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000012', 'Session 2 Home Task', 'Complete the home task for AI for School: Study Smarter and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-14', now()),
('30000000-0000-4000-8000-000000000305', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000012', 'Session 3 Class Challenge', 'Complete the in-class creative writing challenge for AI for Creative Writing.', 'class_challenge', 'https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing', '2026-06-18', now()),
('30000000-0000-4000-8000-000000000306', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000012', 'Session 3 Home Task', 'Complete the home task for AI for Creative Writing and mark it complete after reviewing the document.', 'home_task', 'https://docs.google.com/document/d/1tTUOerSCutvkHhMvj6rRT-QBOirOtdeeM4HVex2eBec/edit?usp=sharing', '2026-06-20', now())
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  kind = excluded.kind,
  content_url = excluded.content_url,
  due_date = excluded.due_date;
