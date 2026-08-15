begin;

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  quiz_id text not null,
  session_id uuid not null references public.sessions(id) on delete cascade,
  selected_answers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(selected_answers) = 'array'),
  score integer not null check (score >= 0),
  total_questions integer not null default 5
    check (total_questions > 0 and score <= total_questions),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_student_completed_idx
  on public.quiz_attempts (student_id, completed_at desc);
create index if not exists quiz_attempts_session_student_idx
  on public.quiz_attempts (session_id, student_id);

alter table public.quiz_attempts enable row level security;

drop policy if exists "quiz_attempts_select_self_or_admin" on public.quiz_attempts;
create policy "quiz_attempts_select_self_or_admin"
on public.quiz_attempts for select
using (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "quiz_attempts_insert_self_or_admin" on public.quiz_attempts;
create policy "quiz_attempts_insert_self_or_admin"
on public.quiz_attempts for insert
with check (student_id = private.current_student_id() or private.is_admin());

drop policy if exists "quiz_attempts_delete_admin" on public.quiz_attempts;
create policy "quiz_attempts_delete_admin"
on public.quiz_attempts for delete
using (private.is_admin());

grant select, insert, delete on public.quiz_attempts to authenticated;
grant all on public.quiz_attempts to service_role;

update public.modules
set
  title = 'Automation Studio: n8n Workflows',
  description = 'Students learn n8n step by step, connect Google tools, build simple AI automations, add Streamlit interfaces, and finish with a personal assistant workflow.',
  session_count = 8
where order_index = 3;

with module_three_sessions(
  id,
  title,
  session_number,
  focus,
  tools_covered,
  student_output,
  description
) as (
  values
    ('10000000-0000-4000-8000-000000000017'::uuid, 'Meet n8n: Your First Workflow', 1, 'Understand triggers, actions, nodes, connections, and test runs in n8n.', array['n8n']::text[], 'A tested two-node workflow and a clear understanding of how data moves.', 'A friendly first look at the n8n editor. Students create, connect, and run simple nodes without credentials or complex code.'),
    ('10000000-0000-4000-8000-000000000018'::uuid, 'Connect Google Tools Safely', 2, 'Create a Google Cloud project, enable the required APIs, and connect Google Sheets to n8n with OAuth.', array['n8n']::text[], 'A working Google Sheets credential and a successful test read.', 'Students follow a careful connection checklist covering Google Cloud, APIs, OAuth consent, credentials, and a safe n8n test.'),
    ('10000000-0000-4000-8000-000000000019'::uuid, 'Quiz Champion', 3, 'Build a form workflow that checks a score, chooses a message, saves the result, and sends an email.', array['n8n']::text[], 'A working Quiz Champion workflow with true and false branches.', 'Students combine a form trigger, an IF node, simple result messages, Google Sheets, and Gmail in one approachable project.'),
    ('10000000-0000-4000-8000-000000000020'::uuid, 'Sheets to Gmail: Formatted HTML', 4, 'Read a new Google Sheets row, prepare clean values, send an HTML email, and mark the row complete.', array['n8n']::text[], 'A sheet processor that sends a formatted confirmation email.', 'Students build a practical Google Sheets to Gmail automation and learn why status columns prevent the same row from being processed twice.'),
    ('10000000-0000-4000-8000-000000000021'::uuid, 'AI Story Generator', 5, 'Send a simple prompt to Gemini, save the response, and deliver it through Gmail.', array['n8n']::text[], 'An AI story workflow and a related mini website generator.', 'Students add a controlled Gemini request to n8n, extract the response, store the result in Sheets, and send a polished email.'),
    ('10000000-0000-4000-8000-000000000022'::uuid, 'Streamlit Foundations', 6, 'Understand Streamlit inputs, buttons, state, feedback, and local app runs.', array['n8n']::text[], 'A small Streamlit form that collects and displays a study request.', 'Students learn the smallest useful Streamlit patterns before connecting an interface to automation.'),
    ('10000000-0000-4000-8000-000000000023'::uuid, 'Streamlit Meets n8n', 7, 'Send form data from Streamlit to an n8n webhook and display the returned result.', array['n8n']::text[], 'A Streamlit interface connected to a tested n8n webhook.', 'Students connect the front end to n8n, inspect the incoming JSON, return a response, and handle simple errors.'),
    ('10000000-0000-4000-8000-000000000024'::uuid, 'Personal Assistant Capstone', 8, 'Combine an AI agent, memory, and useful tools into one organized personal assistant workflow.', array['n8n']::text[], 'A working personal assistant core plus one thoughtful utility upgrade.', 'Students assemble the course patterns into a final assistant that can use selected tools for messages, calendar, notes, tasks, or expenses.')
)
update public.sessions as session
set
  title = source.title,
  session_number = source.session_number,
  focus = source.focus,
  tools_covered = source.tools_covered,
  student_output = source.student_output,
  description = source.description
from module_three_sessions as source
where session.id = source.id;

with module_three_homework(
  id,
  session_id,
  title,
  description,
  kind,
  content_url
) as (
  values
    ('30000000-0000-4000-8000-000000000301'::uuid, '10000000-0000-4000-8000-000000000017'::uuid, 'Build Your First n8n Workflow', 'Create a manual trigger, connect one Set node, add your name and one goal, run the workflow, and confirm the output.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s1/class-challenge'),
    ('30000000-0000-4000-8000-000000000302'::uuid, '10000000-0000-4000-8000-000000000017'::uuid, 'Daily Goal Generator', 'Create a two-node workflow that stores one daily goal and a short success message. Run it once and submit the result.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s1/home-task'),
    ('30000000-0000-4000-8000-000000000303'::uuid, '10000000-0000-4000-8000-000000000018'::uuid, 'Connect Google Sheets to n8n', 'Enable the required Google APIs, create the OAuth connection, choose one practice sheet, and complete one successful test read.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s2/class-challenge'),
    ('30000000-0000-4000-8000-000000000304'::uuid, '10000000-0000-4000-8000-000000000018'::uuid, 'Google Connection Checklist', 'Create a short checklist showing the Google Cloud project, enabled APIs, OAuth consent screen, credential, and successful n8n connection.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s2/home-task'),
    ('30000000-0000-4000-8000-000000000305'::uuid, '10000000-0000-4000-8000-000000000019'::uuid, 'Build Quiz Champion', 'Build the form, score condition, two result messages, Google Sheets row, and Gmail message shown in class. Test both score branches.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s3/class-challenge'),
    ('30000000-0000-4000-8000-000000000306'::uuid, '10000000-0000-4000-8000-000000000019'::uuid, 'Reading Challenge Checker', 'Adapt Quiz Champion into a reading challenge. Ask for pages read, choose a simple target, save the result, and send a matching email.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s3/home-task'),
    ('30000000-0000-4000-8000-000000000307'::uuid, '10000000-0000-4000-8000-000000000020'::uuid, 'Sheet Submission Emailer', 'Process one new sheet row, prepare the values, send a readable HTML email, and update the row status to Sent.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s4/class-challenge'),
    ('30000000-0000-4000-8000-000000000308'::uuid, '10000000-0000-4000-8000-000000000020'::uuid, 'Event Registration Confirmation', 'Adapt the class workflow for an event registration sheet and email a confirmation containing the name, event, date, and next step.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s4/home-task'),
    ('30000000-0000-4000-8000-000000000309'::uuid, '10000000-0000-4000-8000-000000000021'::uuid, 'AI Adventure Story Generator', 'Collect a story request, prepare a controlled Gemini prompt, generate the story, save it in Sheets, and email it to the requester.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s5/class-challenge'),
    ('30000000-0000-4000-8000-000000000310'::uuid, '10000000-0000-4000-8000-000000000021'::uuid, 'AI Mini Website Generator', 'Adapt the story workflow to generate a small one-page website outline with a title, hero text, three sections, and a call to action, then email the result.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s5/home-task'),
    ('30000000-0000-4000-8000-000000000311'::uuid, '10000000-0000-4000-8000-000000000022'::uuid, 'Build a Streamlit Input App', 'Create a Streamlit app with a title, text input, select box, button, and a clear confirmation message.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s6/class-challenge'),
    ('30000000-0000-4000-8000-000000000312'::uuid, '10000000-0000-4000-8000-000000000022'::uuid, 'Study Request Interface', 'Build a small Streamlit form that collects a subject, study goal, available time, and difficulty, then displays a tidy request summary.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s6/home-task'),
    ('30000000-0000-4000-8000-000000000313'::uuid, '10000000-0000-4000-8000-000000000023'::uuid, 'Connect Streamlit to an n8n Webhook', 'Send the Streamlit form values to an n8n webhook, inspect the JSON, return one message, and show that message in the app.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s7/class-challenge'),
    ('30000000-0000-4000-8000-000000000314'::uuid, '10000000-0000-4000-8000-000000000023'::uuid, 'Homework Reminder Request App', 'Create a Streamlit form that sends a homework subject and deadline to n8n, then returns a friendly reminder confirmation.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s7/home-task'),
    ('30000000-0000-4000-8000-000000000315'::uuid, '10000000-0000-4000-8000-000000000024'::uuid, 'Build the Personal Assistant Core', 'Connect the assistant trigger, AI agent, memory, and at least two tested tools. Demonstrate one complete request from start to finish.', 'class_challenge'::public.homework_kind, 'internal://module3-n8n/m3s8/class-challenge'),
    ('30000000-0000-4000-8000-000000000316'::uuid, '10000000-0000-4000-8000-000000000024'::uuid, 'Personal Assistant Upgrade', 'Add one useful capability such as notes, tasks, calendar, Gmail, or expense tracking. Test it and explain the safety rule you used.', 'home_task'::public.homework_kind, 'internal://module3-n8n/m3s8/home-task')
)
insert into public.homework (
  id,
  session_id,
  title,
  description,
  kind,
  content_url,
  due_date
)
select
  source.id,
  source.session_id,
  source.title,
  source.description,
  source.kind,
  source.content_url,
  coalesce(session.session_date + 14, date '2026-12-31')
from module_three_homework as source
join public.sessions as session on session.id = source.session_id
where not exists (
  select 1 from public.homework existing where existing.content_url = source.content_url
)
on conflict (id) do update set
  session_id = excluded.session_id,
  title = excluded.title,
  description = excluded.description,
  kind = excluded.kind,
  content_url = excluded.content_url,
  due_date = excluded.due_date;

update public.badge_definitions
set
  description = 'Complete every project and the knowledge check from one session.',
  target = 1
where slug = 'perfect-session';

create or replace function private.evaluate_student_badges(target_student_id uuid)
returns void language plpgsql security definer set search_path = public, private as $$
declare
  present_count integer;
  reviewed_count integer;
  current_streak integer := 0;
  attendance_row record;
  badge_slug text;
begin
  select count(*) into present_count from public.attendance
  where student_id = target_student_id and status = 'present';
  select count(*) into reviewed_count from public.submissions
  where student_id = target_student_id and status = 'reviewed';

  for attendance_row in
    select status from public.attendance
    where student_id = target_student_id and status <> 'rescheduled'
    order by date desc
  loop
    exit when attendance_row.status <> 'present';
    current_streak := current_streak + 1;
  end loop;

  for badge_slug in select slug from (
    values
      ('first-session', present_count >= 1),
      ('first-reviewed', reviewed_count >= 1),
      ('streak-3', current_streak >= 3),
      ('streak-5', current_streak >= 5),
      ('reviewed-5', reviewed_count >= 5),
      ('reviewed-10', reviewed_count >= 10),
      ('perfect-session', exists (
        select 1
        from public.sessions session
        join public.modules module on module.id = session.module_id
        where
          (
            module.order_index in (1, 2)
            and (
              select count(distinct homework.id)
              from public.homework homework
              join public.submissions submission on submission.homework_id = homework.id
              where homework.session_id = session.id
                and submission.student_id = target_student_id
                and submission.status = 'reviewed'
            ) >= 4
          )
          or (
            module.order_index = 3
            and (
              select count(distinct homework.id)
              from public.homework homework
              join public.submissions submission on submission.homework_id = homework.id
              where homework.session_id = session.id
                and homework.content_url like 'internal://module3-n8n/%'
                and submission.student_id = target_student_id
                and submission.status = 'reviewed'
            ) >= 2
            and exists (
              select 1 from public.quiz_attempts attempt
              where attempt.student_id = target_student_id
                and attempt.session_id = session.id
            )
          )
      )),
      ('module-1', exists (
        select 1 from public.attendance attendance join public.sessions session on session.id = attendance.session_id
        join public.modules module on module.id = session.module_id
        where attendance.student_id = target_student_id and attendance.status = 'present' and module.order_index = 1
        group by module.id, module.session_count having count(distinct session.id) >= module.session_count
      )),
      ('module-2', exists (
        select 1 from public.attendance attendance join public.sessions session on session.id = attendance.session_id
        join public.modules module on module.id = session.module_id
        where attendance.student_id = target_student_id and attendance.status = 'present' and module.order_index = 2
        group by module.id, module.session_count having count(distinct session.id) >= module.session_count
      )),
      ('module-3', exists (
        select 1 from public.attendance attendance join public.sessions session on session.id = attendance.session_id
        join public.modules module on module.id = session.module_id
        where attendance.student_id = target_student_id and attendance.status = 'present' and module.order_index = 3
        group by module.id, module.session_count having count(distinct session.id) >= module.session_count
      )),
      ('showcase-ready', exists (
        select 1 from public.submissions submission join public.homework homework on homework.id = submission.homework_id
        join public.sessions session on session.id = homework.session_id
        where submission.student_id = target_student_id and submission.status = 'reviewed' and session.session_number = 8
      )),
      ('course-finisher', (
        select count(*) from (
          select session.module_id from public.attendance attendance join public.sessions session on session.id = attendance.session_id
          join public.modules module on module.id = session.module_id
          where attendance.student_id = target_student_id and attendance.status = 'present'
          group by session.module_id, module.session_count having count(distinct session.id) >= module.session_count
        ) complete_modules
      ) >= 3)
  ) rules(slug, earned) where earned
  loop
    insert into public.student_badges (student_id, badge_id, source)
    select target_student_id, id, 'automatic' from public.badge_definitions where slug = badge_slug
    on conflict (student_id, badge_id) do nothing;
  end loop;
end;
$$;

create or replace function private.refresh_badges_after_activity()
returns trigger language plpgsql security definer set search_path = public, private as $$
begin
  if tg_op = 'DELETE' then
    perform private.evaluate_student_badges(old.student_id);
    return old;
  end if;
  perform private.evaluate_student_badges(new.student_id);
  return new;
end;
$$;

drop trigger if exists quiz_attempts_refresh_badges on public.quiz_attempts;
create trigger quiz_attempts_refresh_badges
after insert or delete on public.quiz_attempts
for each row execute function private.refresh_badges_after_activity();

do $$
declare
  student_row record;
begin
  for student_row in select id from public.students loop
    perform private.evaluate_student_badges(student_row.id);
  end loop;
end $$;

commit;
