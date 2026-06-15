-- Venu current make-up class time update.
-- Tue Jun 16, 2026, 2:00 PM - 3:00 PM America/New_York
-- = Tue Jun 16, 2026, 11:30 PM - Wed Jun 17, 2026, 12:30 AM Asia/Kolkata.

update public.class_reschedule_requests request
set
  requested_date = '2026-06-16'::date,
  requested_start_time = '14:00',
  requested_end_time = '15:00',
  requested_time_zone = 'America/New_York',
  admin_note = 'Approved one-off make-up class for today, 2:00 PM - 3:00 PM EDT.',
  reviewed_at = now()
from public.students student
left join public.profiles profile on profile.id = student.user_id
where request.student_id = student.id
  and request.status = 'approved'::public.reschedule_request_status
  and request.requested_date = '2026-06-16'::date
  and (
    lower(profile.email) = 'venu@student.com'
    or lower(student.full_name) = 'venu'
  );
