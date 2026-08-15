insert into public.modules (id, title, description, order_index, session_count) values
('00000000-0000-4000-8000-000000000001', 'Agentic AI Essentials: Prompts to Projects', 'An AI essentials journey from prompting fundamentals to practical study systems, creative AI, smart data, local AI, and a polished showcase.', 1, 8),
('00000000-0000-4000-8000-000000000002', 'Vibe Coding Lab: Idea to App', 'Students turn ideas into real apps using AI, no-code builders, design tools, AI ethics, and a smart app showcase.', 2, 8),
('00000000-0000-4000-8000-000000000003', 'Automation Studio: n8n Workflows', 'Students learn n8n step by step, connect Google tools, build simple AI automations, add Streamlit interfaces, and finish with a personal assistant workflow.', 3, 8)
on conflict (order_index) do update set
  title = excluded.title,
  description = excluded.description,
  session_count = excluded.session_count;

insert into public.sessions (id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date) values
('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Welcome to the AI Era', 1, 'Understand what AI can and cannot do, learn prompt engineering fundamentals, role prompting, and chain-of-thought style reasoning.', array['ChatGPT', 'Claude', 'Gemini'], 'AI literacy prompt journal', 'AI Literacy & Prompt Engineering. Students learn what AI can and cannot do, prompt engineering fundamentals, role prompting, and chain-of-thought style reasoning.', '2026-06-15'),
('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'AI for School: Study Smarter', 2, 'Use AI to create study guides, explain complex topics, generate practice questions, summarize textbook chapters, and build flashcards for a real school subject.', array['Gemini', 'NotebookLM'], 'Complete AI study system', 'Practical AI. Students build a complete study system for one of their real school subjects.', '2026-06-17'),
('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'AI for Creative Writing', 3, 'Use AI as a writing partner for brainstorming, outlining, drafting, editing, and improving blog posts, essays, or stories.', array['QuillBot', 'ZeroGPT', 'WrizzleAI'], 'AI-assisted writing piece', 'Content and creative writing. Students write with AI assistance while learning drafting and editing workflows.', '2026-06-22'),
('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'AI Image & Video Creation', 4, 'Explore AI image generation, Canva AI, and creative media tools while discussing AI art ethics, copyright, and deepfakes.', array['Gemini', 'Canva AI', 'MidJourney'], 'Creative visual media board', 'Creative AI. Students create social media graphics or concept art and discuss responsible use.', '2026-06-24'),
('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'AI Audio Generation', 5, 'Create AI-generated music, voice, and sound effects for podcasts, games, storytelling, and creative projects.', array['Suno AI', 'ElevenLabs', 'Udio'], 'AI audio clip or soundtrack', 'Creative AI. Students experiment with AI music, voice generation, and sound effects.', '2026-06-29'),
('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'AI for Tasks Organisation: The Data Analyst', 6, 'Organize tasks, notes, and information with AI; analyze simple datasets, summarize information, create task plans, and generate insights.', array['Notion AI', 'Claude', 'OpenAI'], 'AI task and data insight system', 'Smart Data AI. Students use AI for task planning, simple data analysis, summaries, and insights.', '2026-07-01'),
('10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', 'AI without Internet: Going Local', 7, 'Run AI without internet, organize local tasks, and understand local AI project workflows.', array['Ollama', 'LM Studio', 'Gemma'], 'Local AI setup plan', 'Local AI. Students explore offline AI systems and local project organization.', '2026-07-06'),
('10000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', 'AI Presentations: Pitch Like a Pro / Showcase Session', 8, 'Create and present an AI-powered presentation showcasing the learning journey and module projects.', array['Gamma AI'], 'Module 1 showcase presentation', 'AI productivity. Students present their learning journey and module work in a polished AI-powered presentation.', '2026-07-08'),
('10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000002', 'Vibe Coding: No-Code App Magic', 1, 'Build a simple app with AI prompts without writing code, turning an idea into a working app and customizing the generated interface.', array['Bolt.new'], 'No-code app prototype', 'Vibe Coding. Students create a simple AI-generated app through prompts and interface customization.', '2026-07-13'),
('10000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000002', 'Vibe Coding: From Idea to App', 2, 'Build production-ready apps through conversation with AI agents that design, code, and deploy an application from start to finish.', array['Emergent.sh'], 'AI-built app draft', 'Vibe Coding. Students use AI agents to move from idea to production-ready app workflows.', '2026-07-15'),
('10000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000002', 'Figma AI Tools', 3, 'Design frontend screens using Figma AI design generation and Make features.', array['Figma AI'], 'Frontend design mockup', 'Vibe Coding. Students create frontend design concepts using Figma AI tools.', '2026-07-20'),
('10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000002', 'No-Code GPT Wrappers', 4, 'Build GPT wrappers and AI-powered apps around useful workflows and user-facing interfaces.', array['OpenAI GPTs'], 'GPT wrapper prototype', 'Vibe Coding. Students build GPT wrappers and AI-powered app experiences.', '2026-07-22'),
('10000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000002', 'Google AI Studio: Gemini Playground / AntiGravity', 5, 'Explore Google AI Studio and Gemini Playground for hands-on AI experimentation and creative app projects.', array['Google AI Studio', 'Gemini Playground'], 'Gemini experiment prototype', 'Vibe Coding. Students experiment with Google AI Studio and Gemini tools.', '2026-07-27'),
('10000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000002', 'Exploring Google Labs AI', 6, 'Experiment with Google Labs tools and evaluate how emerging AI features can support creative projects.', array['Google Whisk.ai'], 'Google Labs experiment log', 'Vibe Coding. Students explore emerging Google Labs AI experiments.', '2026-07-29'),
('10000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000002', 'AI Ethics & Responsibility', 7, 'Evaluate AI bias, misinformation, privacy, deepfakes, disclosure, school use, and regulation, then create an AI Ethics Code.', array['Sensity AI', 'Hive AI'], 'School AI ethics code', 'AI Ethics. Students discuss responsible AI use and create an AI ethics code for school.', '2026-08-03'),
('10000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000002', 'Showcase Session: Present Your Smart AI App', 8, 'Present AI-powered applications and projects built throughout the module with a clear product narrative.', array['Gamma AI'], 'Module 2 smart app showcase', 'AI productivity. Students present their smart AI app projects.', '2026-08-05'),
('10000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000003', 'Meet n8n: Your First Workflow', 1, 'Understand triggers, actions, nodes, connections, and test runs in n8n.', array['n8n'], 'A tested two-node workflow and a clear understanding of how data moves.', 'A friendly first look at the n8n editor. Students create, connect, and run simple nodes without credentials or complex code.', '2026-08-10'),
('10000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000000003', 'Connect Google Tools Safely', 2, 'Create a Google Cloud project, enable the required APIs, and connect Google Sheets to n8n with OAuth.', array['n8n'], 'A working Google Sheets credential and a successful test read.', 'Students follow a careful connection checklist covering Google Cloud, APIs, OAuth consent, credentials, and a safe n8n test.', '2026-08-12'),
('10000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'Quiz Champion', 3, 'Build a form workflow that checks a score, chooses a message, saves the result, and sends an email.', array['n8n'], 'A working Quiz Champion workflow with true and false branches.', 'Students combine a form trigger, an IF node, simple result messages, Google Sheets, and Gmail in one approachable project.', '2026-08-17'),
('10000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000003', 'Sheets to Gmail: Formatted HTML', 4, 'Read a new Google Sheets row, prepare clean values, send an HTML email, and mark the row complete.', array['n8n'], 'A sheet processor that sends a formatted confirmation email.', 'Students build a practical Google Sheets to Gmail automation and learn why status columns prevent the same row from being processed twice.', '2026-08-19'),
('10000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000003', 'AI Story Generator', 5, 'Send a simple prompt to Gemini, save the response, and deliver it through Gmail.', array['n8n'], 'An AI story workflow and a related mini website generator.', 'Students add a controlled Gemini request to n8n, extract the response, store the result in Sheets, and send a polished email.', '2026-08-24'),
('10000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000003', 'Streamlit Foundations', 6, 'Understand Streamlit inputs, buttons, state, feedback, and local app runs.', array['n8n'], 'A small Streamlit form that collects and displays a study request.', 'Students learn the smallest useful Streamlit patterns before connecting an interface to automation.', '2026-08-26'),
('10000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000003', 'Streamlit Meets n8n', 7, 'Send form data from Streamlit to an n8n webhook and display the returned result.', array['n8n'], 'A Streamlit interface connected to a tested n8n webhook.', 'Students connect the front end to n8n, inspect the incoming JSON, return a response, and handle simple errors.', '2026-08-31'),
('10000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000003', 'Personal Assistant Capstone', 8, 'Combine an AI agent, memory, and useful tools into one organized personal assistant workflow.', array['n8n'], 'A working personal assistant core plus one thoughtful utility upgrade.', 'Students assemble the course patterns into a final assistant that can use selected tools for messages, calendar, notes, tasks, or expenses.', '2026-09-02')
on conflict (module_id, session_number) do update set
  title = excluded.title,
  focus = excluded.focus,
  tools_covered = excluded.tools_covered,
  student_output = excluded.student_output,
  description = excluded.description,
  session_date = excluded.session_date;

with module_three_homework(id, session_id, title, description, kind, content_url) as (
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
insert into public.homework (id, session_id, title, description, kind, content_url, due_date)
select source.id, source.session_id, source.title, source.description, source.kind, source.content_url,
  coalesce(session.session_date + 14, date '2026-12-31')
from module_three_homework source
join public.sessions session on session.id = source.session_id
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

insert into public.batches (id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id) values
('20000000-0000-4000-8000-000000000001', 'Summer Alpha Cohort', 'Mon / Wed', '5:00 PM - 6:30 PM IST', 'Asia/Kolkata', '2026-06-15', '17:00', '18:30', 'https://meet.google.com/demo-ai-builders', '00000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000010', 'US Weekday Batch - Tue/Wed CDT', 'Tue / Wed', 'Tue 11:00 AM - 12:00 PM / Wed 2:00 PM - 3:00 PM America/Chicago', 'America/Chicago', '2026-06-08', '11:00', '12:00', 'https://meet.google.com/kio-bnyb-imt', '00000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000011', 'Australia Weekend Batch - Sat/Sun', 'Sat / Sun', 'Sat 12:00 PM - 1:00 PM / Sun 12:00 PM - 1:00 PM Australia/Sydney', 'Australia/Sydney', '2026-06-08', '12:00', '13:00', 'https://meet.google.com/jiw-wbre-vtc', '00000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000012', 'US Weekday Batch - Wed/Thu EDT', 'Wed / Thu', 'Wed 4:00 PM - 5:00 PM / Thu 3:00 PM - 4:00 PM America/New_York', 'America/New_York', '2026-06-08', '16:00', '17:00', 'https://meet.google.com/zzn-fvzt-qij', '00000000-0000-4000-8000-000000000001')
on conflict (id) do update set
  name = excluded.name,
  days = excluded.days,
  time_slot = excluded.time_slot,
  time_zone = excluded.time_zone,
  start_date = excluded.start_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  module_id = excluded.module_id;

insert into public.batch_class_slots (id, batch_id, label, day_of_week, start_time, end_time, meet_link, sort_order) values
('21000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Monday class', 1, '17:00', '18:30', 'https://meet.google.com/demo-ai-builders', 1),
('21000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Wednesday class', 3, '17:00', '18:30', 'https://meet.google.com/demo-ai-builders', 2),
('21000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000010', 'Tuesday class', 2, '11:00', '12:00', 'https://meet.google.com/kio-bnyb-imt', 1),
('21000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000010', 'Wednesday class', 3, '14:00', '15:00', 'https://meet.google.com/wsu-qpdz-fkm', 2),
('21000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000011', 'Saturday class', 6, '12:00', '13:00', 'https://meet.google.com/jiw-wbre-vtc', 1),
('21000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000011', 'Sunday class', 0, '12:00', '13:00', 'https://meet.google.com/xmz-gctq-yyj', 2),
('21000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000012', 'Wednesday class', 3, '16:00', '17:00', 'https://meet.google.com/zzn-fvzt-qij', 1),
('21000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000012', 'Thursday class', 4, '15:00', '16:00', 'https://meet.google.com/qfv-jaud-svt', 2)
on conflict (id) do update set
  label = excluded.label,
  day_of_week = excluded.day_of_week,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  meet_link = excluded.meet_link,
  sort_order = excluded.sort_order;

-- Hosted Supabase seed:
-- Create these users manually in Authentication first:
--   student@demo.com / student1234
--   admin@bootcamp.com / admin1234
-- Optional production admin:
--   gagandeepsingh220903@gmail.com
-- This seed links public app rows to the existing auth.users rows by email.
do $$
begin
  if not exists (select 1 from auth.users where lower(email) = 'student@demo.com') then
    raise exception 'Missing auth user: student@demo.com. Create it in Supabase Authentication before running seed.sql.';
  end if;

  if not exists (select 1 from auth.users where lower(email) = 'admin@bootcamp.com') then
    raise exception 'Missing auth user: admin@bootcamp.com. Create it in Supabase Authentication before running seed.sql.';
  end if;

end $$;

insert into public.profiles (id, email, full_name, role)
select id, email, 'Aarav Mehta', 'student'::public.app_role
from auth.users
where lower(email) = 'student@demo.com'
union all
select id, email, 'AI Builders Admin', 'admin'::public.app_role
from auth.users
where lower(email) = 'admin@bootcamp.com'
union all
select id, email, 'Gagandeep Singh', 'admin'::public.app_role
from auth.users
where lower(email) = 'gagandeepsingh220903@gmail.com'
union all
select id, email, 'John Kurian', 'student'::public.app_role
from auth.users
where lower(email) = 'john.kurian@student.com'
union all
select id, email, 'Ayan Khadka', 'student'::public.app_role
from auth.users
where lower(email) = 'ayan.khadka@student.com'
union all
select id, email, 'Venu', 'student'::public.app_role
from auth.users
where lower(email) = 'venu@student.com'
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role;

insert into public.students (id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at)
select
  '11111111-1111-4111-8111-111111111111'::uuid,
  id,
  'Aarav Mehta',
  'Priya Mehta',
  'parent@example.com',
  'India',
  'Asia/Kolkata',
  '20000000-0000-4000-8000-000000000001'::uuid,
  '2026-06-01T09:00:00Z'::timestamptz
from auth.users
where lower(email) = 'student@demo.com'
on conflict (id) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  parent_name = excluded.parent_name,
  parent_email = excluded.parent_email,
  country = excluded.country,
  time_zone = excluded.time_zone,
  batch_id = excluded.batch_id;

insert into public.students (id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at)
select
  '11111111-1111-4111-8111-111111111120'::uuid,
  id,
  'John Kurian',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'USA',
  'America/Chicago',
  '20000000-0000-4000-8000-000000000010'::uuid,
  '2026-06-08T00:00:00Z'::timestamptz
from auth.users
where lower(email) = 'john.kurian@student.com'
union all
select
  '11111111-1111-4111-8111-111111111121'::uuid,
  id,
  'Ayan Khadka',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'Australia',
  'Australia/Sydney',
  '20000000-0000-4000-8000-000000000011'::uuid,
  '2026-06-08T00:00:00Z'::timestamptz
from auth.users
where lower(email) = 'ayan.khadka@student.com'
union all
select
  '11111111-1111-4111-8111-111111111122'::uuid,
  id,
  'Venu',
  'PUT_PARENT_NAME_HERE',
  'PUT_PARENT_EMAIL_HERE',
  'USA',
  'America/New_York',
  '20000000-0000-4000-8000-000000000012'::uuid,
  '2026-06-08T00:00:00Z'::timestamptz
from auth.users
where lower(email) = 'venu@student.com'
on conflict (id) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  parent_name = excluded.parent_name,
  parent_email = excluded.parent_email,
  country = excluded.country,
  time_zone = excluded.time_zone,
  batch_id = excluded.batch_id;

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

insert into public.resources (id, module_id, session_id, title, type, url, created_at) values
('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'AI Era Prompt Journal Template', 'note', 'https://example.com/ai-use-map', '2026-06-15T10:00:00Z'),
('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'Creative Writing AI Drafting Guide', 'pdf', 'https://example.com/creative-writing-ai-guide.pdf', '2026-06-22T10:00:00Z'),
('40000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000010', 'Vibe Coding From Idea to App Demo', 'video', 'https://example.com/vibe-coding-idea-to-app', '2026-07-15T10:00:00Z')
on conflict (id) do update set
  title = excluded.title,
  type = excluded.type,
  url = excluded.url;

insert into public.attendance (session_id, student_id, status, date) values
('10000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'present', '2026-06-15'),
('10000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'present', '2026-06-17'),
('10000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'present', '2026-06-22'),
('10000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'present', '2026-06-24'),
('10000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'present', '2026-06-29')
on conflict (session_id, student_id) do update set
  status = excluded.status,
  date = excluded.date;

insert into public.feedback (student_id, session_id, tutor_note, created_at) values
('11111111-1111-4111-8111-111111111111', '10000000-0000-4000-8000-000000000003', 'Strong improvement in AI-assisted outlining. Next step: explain which edits were yours and which were AI suggestions.', '2026-06-22T13:15:00Z'),
('11111111-1111-4111-8111-111111111111', '10000000-0000-4000-8000-000000000005', 'Good creative direction on the audio idea. Next step: describe the mood, audience, and usage context more clearly.', '2026-06-29T13:15:00Z');

insert into public.announcements (id, batch_id, message, created_at) values
('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Bring one school assignment you want to improve with AI for the next session.', '2026-06-27T09:15:00Z'),
('50000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'The class link has been updated for the remaining summer sessions.', '2026-06-25T12:00:00Z')
on conflict (id) do update set
  message = excluded.message,
  created_at = excluded.created_at;
