insert into public.modules (id, title, description, order_index, session_count) values
('00000000-0000-4000-8000-000000000001', 'Agentic AI Essentials: Prompts to Projects', 'An AI essentials journey from prompting fundamentals to practical study systems, creative AI, smart data, local AI, and a polished showcase.', 1, 8),
('00000000-0000-4000-8000-000000000002', 'Vibe Coding Lab: Idea to App', 'Students turn ideas into real apps using AI, no-code builders, design tools, AI ethics, and a smart app showcase.', 2, 8),
('00000000-0000-4000-8000-000000000003', 'Automation Studio: Agents & Workflows', 'Students move from AI agent foundations to real automation workflows with n8n, Zapier, ClawBot, and a final showcase.', 3, 8)
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
('10000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000003', 'AI Agents and Tools', 1, 'Understand how AI agents work, what tools power them, and how agents differ from ordinary AI chat workflows.', array['AI Tools'], 'AI agent concept map', 'AI Agents. Students learn the foundations of AI agents and tool-powered workflows.', '2026-08-10'),
('10000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000000003', 'Introduction to AI Automation', 2, 'Learn automation logic through examples such as n8n workflows that summarize emails and post to Slack.', array['n8n'], 'Automation logic map', 'AI Automation. Students understand if-this-then-that automation logic through practical demos.', '2026-08-12'),
('10000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'Build Your First AI Workflow', 3, 'Build a trigger-to-output workflow where a form submission is processed by AI and routed to an output such as an email notification.', array['n8n', 'Gemini'], 'First AI workflow', 'AI Automation. Students build a simple trigger, AI processing, and output workflow.', '2026-08-17'),
('10000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000003', 'AI Workflow: Content Pipeline', 4, 'Build a complete content pipeline where AI generates a blog post, social caption, image alt text, and a ready-to-publish package.', array['n8n'], 'AI content pipeline', 'AI Automation. Students create a zero-code AI content pipeline.', '2026-08-19'),
('10000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000003', 'Advanced Automations using Zapier', 5, 'Create advanced multi-step automation workflows that connect apps and automate complex processes.', array['Zapier'], 'Advanced Zapier workflow', 'AI Automation. Students connect apps and automate complex multi-step processes.', '2026-08-24'),
('10000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000003', 'Introduction to ClawBot', 6, 'Install, configure, and launch a VPS-based automation hub with ClawBot foundations.', array['ClawBot'], 'ClawBot automation hub setup', 'AI Automation. Students set up ClawBot foundations and an automation hub.', '2026-08-26'),
('10000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000003', 'Mastering ClawBot Skills', 7, 'Implement document and file handling skills, integrate channel connectors, and extend ClawBot with custom skills.', array['ClawBot'], 'Custom ClawBot skill', 'AI Automation. Students build file-handling skills and channel connector workflows.', '2026-08-31'),
('10000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000003', 'Showcase Session: Present Your Smart AI App', 8, 'Present final automation projects built throughout the module and explain the workflow, tools, and impact.', array['ClawBot', 'Gamma AI'], 'Module 3 automation showcase', 'AI productivity. Students present final AI automation projects.', '2026-09-02')
on conflict (module_id, session_number) do update set
  title = excluded.title,
  focus = excluded.focus,
  tools_covered = excluded.tools_covered,
  student_output = excluded.student_output,
  description = excluded.description,
  session_date = excluded.session_date;

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
select id, email, 'Bootcamp Admin', 'admin'::public.app_role
from auth.users
where lower(email) = 'admin@bootcamp.com'
union all
select id, email, 'John Kurian', 'student'::public.app_role
from auth.users
where lower(email) = 'john.kurian@student.placeholder.com'
union all
select id, email, 'Ayan Khadka', 'student'::public.app_role
from auth.users
where lower(email) = 'ayan.khadka@student.placeholder.com'
union all
select id, email, 'Venu', 'student'::public.app_role
from auth.users
where lower(email) = 'venu@student.placeholder.com'
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
where lower(email) = 'john.kurian@student.placeholder.com'
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
where lower(email) = 'ayan.khadka@student.placeholder.com'
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
where lower(email) = 'venu@student.placeholder.com'
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
