create or replace function public.acknowledge_student_badge(target_award_id uuid)
returns void
language sql
security definer
set search_path = public, private
as $$
  update public.student_badges
  set seen_at = coalesce(seen_at, now())
  where id = target_award_id
    and exists (
      select 1
      from public.students
      where students.id = student_badges.student_id
        and students.user_id = auth.uid()
    );
$$;

grant execute on function public.acknowledge_student_badge(uuid) to authenticated;
