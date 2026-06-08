-- Allow a student to mark their own class attendance as present when they click Join Live Class.
-- Admins still manage absent/rescheduled states from the admin portal.

drop policy if exists "attendance_insert_self_present" on public.attendance;
create policy "attendance_insert_self_present"
on public.attendance for insert
with check (student_id = private.current_student_id() and status = 'present');

drop policy if exists "attendance_update_self_present" on public.attendance;
create policy "attendance_update_self_present"
on public.attendance for update
using (student_id = private.current_student_id())
with check (student_id = private.current_student_id() and status = 'present');
