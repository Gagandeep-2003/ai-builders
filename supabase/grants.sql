grant usage on schema public to authenticated;
grant usage on schema private to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.modules to authenticated;
grant select, insert, update, delete on public.batches to authenticated;
grant select, insert, update, delete on public.batch_class_slots to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.homework to authenticated;
grant select, insert, update, delete on public.submissions to authenticated;
grant select, insert, update, delete on public.resources to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;
grant select, insert, update, delete on public.class_join_events to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, insert, update, delete on public.password_change_requests to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_student_id() to authenticated;
grant execute on function private.current_student_batch_id() to authenticated;
