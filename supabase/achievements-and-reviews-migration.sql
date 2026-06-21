alter type public.submission_status add value if not exists 'revision_requested' before 'reviewed';

alter table public.submissions
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists mentor_feedback text;

create table if not exists public.badge_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon_key text not null,
  color text not null,
  category text not null check (category in ('curriculum', 'homework', 'attendance', 'streak', 'mentor')),
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  target integer not null default 1 check (target > 0),
  mentor_awarded boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  badge_id uuid not null references public.badge_definitions(id) on delete cascade,
  source text not null check (source in ('automatic', 'mentor')),
  awarded_by uuid references public.profiles(id) on delete set null,
  mentor_note text,
  awarded_at timestamptz not null default now(),
  seen_at timestamptz,
  unique (student_id, badge_id)
);

create index if not exists student_badges_student_id_idx on public.student_badges (student_id);
create index if not exists student_badges_seen_at_idx on public.student_badges (student_id, seen_at);

insert into public.badge_definitions
  (id, slug, name, description, icon_key, color, category, rarity, target, mentor_awarded, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'first-session', 'First Launch', 'Attend your first live AI Builders session.', 'rocket', '#6ee7b7', 'attendance', 'common', 1, false, 10),
  ('10000000-0000-4000-8000-000000000002', 'first-reviewed', 'Proof of Progress', 'Complete your first mentor-reviewed activity.', 'check-circle', '#75a7ff', 'homework', 'common', 1, false, 20),
  ('10000000-0000-4000-8000-000000000003', 'streak-3', 'Momentum Three', 'Attend three classes in a row.', 'flame', '#fb923c', 'streak', 'rare', 3, false, 30),
  ('10000000-0000-4000-8000-000000000004', 'streak-5', 'Unbroken Five', 'Attend five classes in a row.', 'zap', '#facc15', 'streak', 'epic', 5, false, 40),
  ('10000000-0000-4000-8000-000000000005', 'reviewed-5', 'Builder Five', 'Earn mentor approval on five activities.', 'hammer', '#2dd4bf', 'homework', 'rare', 5, false, 50),
  ('10000000-0000-4000-8000-000000000006', 'reviewed-10', 'Tenfold Builder', 'Earn mentor approval on ten activities.', 'layers', '#a78bfa', 'homework', 'epic', 10, false, 60),
  ('10000000-0000-4000-8000-000000000007', 'perfect-session', 'Session Sweep', 'Complete all four activities from one session.', 'sparkles', '#f472b6', 'homework', 'epic', 4, false, 70),
  ('10000000-0000-4000-8000-000000000008', 'module-1', 'Agentic Explorer', 'Complete all eight sessions in Module 1.', 'brain', '#6ee7b7', 'curriculum', 'epic', 8, false, 80),
  ('10000000-0000-4000-8000-000000000009', 'module-2', 'App Alchemist', 'Complete all eight sessions in Module 2.', 'code', '#38bdf8', 'curriculum', 'epic', 8, false, 90),
  ('10000000-0000-4000-8000-000000000010', 'module-3', 'Automation Architect', 'Complete all eight sessions in Module 3.', 'workflow', '#c084fc', 'curriculum', 'epic', 8, false, 100),
  ('10000000-0000-4000-8000-000000000011', 'showcase-ready', 'Showcase Ready', 'Complete a mentor-reviewed showcase activity.', 'presentation', '#fb7185', 'curriculum', 'rare', 1, false, 110),
  ('10000000-0000-4000-8000-000000000012', 'course-finisher', 'AI Builders Graduate', 'Complete every module in the course.', 'trophy', '#facc15', 'curriculum', 'legendary', 24, false, 120),
  ('20000000-0000-4000-8000-000000000001', 'creative-spark', 'Creative Spark', 'Awarded by your mentor for imaginative work.', 'lightbulb', '#f472b6', 'mentor', 'rare', 1, true, 210),
  ('20000000-0000-4000-8000-000000000002', 'problem-solver', 'Problem Solver', 'Awarded by your mentor for thoughtful problem solving.', 'puzzle', '#38bdf8', 'mentor', 'rare', 1, true, 220),
  ('20000000-0000-4000-8000-000000000003', 'most-improved', 'Most Improved', 'Awarded by your mentor for meaningful growth.', 'trending-up', '#6ee7b7', 'mentor', 'epic', 1, true, 230),
  ('20000000-0000-4000-8000-000000000004', 'helpful-collaborator', 'Helpful Collaborator', 'Awarded by your mentor for supporting others.', 'users', '#a78bfa', 'mentor', 'rare', 1, true, 240),
  ('20000000-0000-4000-8000-000000000005', 'outstanding-project', 'Outstanding Project', 'Awarded by your mentor for exceptional project work.', 'star', '#facc15', 'mentor', 'legendary', 1, true, 250)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, icon_key = excluded.icon_key,
  color = excluded.color, category = excluded.category, rarity = excluded.rarity,
  target = excluded.target, mentor_awarded = excluded.mentor_awarded, sort_order = excluded.sort_order;

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
        select 1 from public.submissions sub join public.homework h on h.id = sub.homework_id
        where sub.student_id = target_student_id and sub.status = 'reviewed'
        group by h.session_id having count(distinct h.id) >= 4
      )),
      ('module-1', exists (
        select 1 from public.attendance a join public.sessions s on s.id = a.session_id
        join public.modules m on m.id = s.module_id
        where a.student_id = target_student_id and a.status = 'present' and m.order_index = 1
        group by m.id, m.session_count having count(distinct s.id) >= m.session_count
      )),
      ('module-2', exists (
        select 1 from public.attendance a join public.sessions s on s.id = a.session_id
        join public.modules m on m.id = s.module_id
        where a.student_id = target_student_id and a.status = 'present' and m.order_index = 2
        group by m.id, m.session_count having count(distinct s.id) >= m.session_count
      )),
      ('module-3', exists (
        select 1 from public.attendance a join public.sessions s on s.id = a.session_id
        join public.modules m on m.id = s.module_id
        where a.student_id = target_student_id and a.status = 'present' and m.order_index = 3
        group by m.id, m.session_count having count(distinct s.id) >= m.session_count
      )),
      ('showcase-ready', exists (
        select 1 from public.submissions sub join public.homework h on h.id = sub.homework_id
        join public.sessions s on s.id = h.session_id
        where sub.student_id = target_student_id and sub.status = 'reviewed' and s.session_number = 8
      )),
      ('course-finisher', (
        select count(*) from (
          select s.module_id from public.attendance a join public.sessions s on s.id = a.session_id
          join public.modules m on m.id = s.module_id
          where a.student_id = target_student_id and a.status = 'present'
          group by s.module_id, m.session_count having count(distinct s.id) >= m.session_count
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

create or replace function public.acknowledge_student_badge(target_award_id uuid)
returns void language sql security definer set search_path = public, private as $$
  update public.student_badges set seen_at = coalesce(seen_at, now())
  where id = target_award_id and student_id = private.current_student_id();
$$;

create or replace function public.refresh_all_student_badges()
returns integer language plpgsql security definer set search_path = public, private as $$
declare
  student_row record;
  refreshed integer := 0;
begin
  for student_row in select id from public.students loop
    perform private.evaluate_student_badges(student_row.id);
    refreshed := refreshed + 1;
  end loop;
  return refreshed;
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

drop trigger if exists submissions_refresh_badges on public.submissions;
create trigger submissions_refresh_badges after insert or update of status or delete on public.submissions
for each row execute function private.refresh_badges_after_activity();
drop trigger if exists attendance_refresh_badges on public.attendance;
create trigger attendance_refresh_badges after insert or update of status or delete on public.attendance
for each row execute function private.refresh_badges_after_activity();

alter table public.badge_definitions enable row level security;
alter table public.student_badges enable row level security;
drop policy if exists "badge_definitions_select_authenticated" on public.badge_definitions;
create policy "badge_definitions_select_authenticated" on public.badge_definitions for select using (auth.uid() is not null);
drop policy if exists "badge_definitions_write_admin" on public.badge_definitions;
create policy "badge_definitions_write_admin" on public.badge_definitions for all using (private.is_admin()) with check (private.is_admin());
drop policy if exists "student_badges_select_self_or_admin" on public.student_badges;
create policy "student_badges_select_self_or_admin" on public.student_badges for select
using (student_id = private.current_student_id() or private.is_admin());
drop policy if exists "student_badges_write_admin" on public.student_badges;
create policy "student_badges_write_admin" on public.student_badges for all using (private.is_admin()) with check (private.is_admin());

grant select, insert, update, delete on public.badge_definitions to authenticated, service_role;
grant select, insert, update, delete on public.student_badges to authenticated, service_role;
grant execute on function public.acknowledge_student_badge(uuid) to authenticated;
grant execute on function public.refresh_all_student_badges() to service_role;
grant execute on function private.evaluate_student_badges(uuid) to service_role;

do $$ declare student_row record; begin
  for student_row in select id from public.students loop
    perform private.evaluate_student_badges(student_row.id);
  end loop;
end $$;
