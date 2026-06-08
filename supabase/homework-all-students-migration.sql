-- Allow a homework row to target every student.
-- Global homework uses batch_id = null and assigned_student_id = null.

alter table public.homework
  drop constraint if exists homework_target_check;

alter table public.homework
  add constraint homework_target_check check (
    batch_id is null or assigned_student_id is null
  );

drop policy if exists "homework_select_assigned_or_admin" on public.homework;

create policy "homework_select_assigned_or_admin"
on public.homework for select
using (
  private.is_admin()
  or (batch_id is null and assigned_student_id is null)
  or assigned_student_id = private.current_student_id()
  or batch_id = private.current_student_batch_id()
);
