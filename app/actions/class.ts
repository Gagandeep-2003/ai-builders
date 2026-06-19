"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMentorScheduleData, getStudentDashboardData } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeMeetLink } from "@/lib/meet-links";
import { getStudentRescheduleOptions } from "@/lib/reschedule-options";
import { getBookedSlots } from "@/lib/slot-availability";
import { getSessionDateTimes, getSessionScheduleDate, isSessionJoinWindowOpen } from "@/lib/time";

export async function joinClassAction(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");

  if (!sessionId || !isSupabaseConfigured()) {
    redirect("/class");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/class");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getStudentDashboardData();
  const session = data.sessions.find((item) => item.id === sessionId);
  if (!session) redirect("/class");
  const classDate = getSessionScheduleDate(session, data.batch);
  const wasRescheduled = data.rescheduleRequests.some(
    (request) =>
      request.status === "approved" &&
      request.originalDate === classDate,
  );
  if (wasRescheduled) redirect("/class?join=rescheduled");
  if (!isSessionJoinWindowOpen(session, data.batch)) redirect("/class?join=not-open");

  const { meetLink: rawMeetLink } = getSessionDateTimes(session, data.batch);
  const meetLink = normalizeMeetLink(rawMeetLink);
  if (!meetLink) redirect("/class?join=missing-link");
  const { error: attendanceError } = await supabase.from("attendance").upsert(
    {
      session_id: session.id,
      student_id: data.student.id,
      status: "present",
      date: classDate,
    },
    { onConflict: "session_id,student_id" },
  );

  if (attendanceError) {
    console.error("Unable to mark class attendance", attendanceError);
    redirect("/class?join=attendance-error");
  }

  const { error: joinEventError } = await supabase.from("class_join_events").insert({
    session_id: session.id,
    student_id: data.student.id,
    batch_id: data.batch.id,
    class_date: classDate,
    meet_link: meetLink,
  });

  if (joinEventError) {
    console.error("Unable to record class join event", joinEventError);
  }

  revalidatePath("/dashboard");
  revalidatePath("/curriculum");
  revalidatePath("/class");
  revalidatePath("/progress");
  revalidatePath("/admin");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/students");

  redirect(meetLink);
}

export async function requestClassRescheduleAction(formData: FormData) {
  const slot = String(formData.get("slot") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const requestType = String(formData.get("requestType") ?? "reschedule");
  const originalDate = String(formData.get("originalDate") ?? "") || null;
  const [requestedDate, requestedStartTime, requestedEndTime, requestedTimeZone] = slot.split("|");

  if (!requestedDate || !requestedStartTime || !requestedEndTime || !requestedTimeZone || !isSupabaseConfigured()) {
    redirect("/class?reschedule=invalid");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/class?reschedule=invalid");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getStudentDashboardData();
  const hasPending = data.rescheduleRequests.some((request) => request.status === "pending");
  if (hasPending) redirect("/class?reschedule=pending");
  if (requestType === "reschedule") {
    const validOriginal = data.sessions.some(
      (session) =>
        getSessionScheduleDate(session, data.batch) === originalDate &&
        getSessionDateTimes(session, data.batch).endsAt.getTime() >= Date.now(),
    );
    const alreadyMoved = data.rescheduleRequests.some(
      (request) =>
        request.status === "approved" &&
        request.originalDate === originalDate,
    );
    if (!validOriginal || alreadyMoved) redirect("/class?reschedule=invalid-original");
  }

  const mentorSchedule = await getMentorScheduleData();
  const validSlots = getStudentRescheduleOptions(data.student.timeZone, {
    bookedSlots: getBookedSlots(mentorSchedule.batches, mentorSchedule.students),
    requests: mentorSchedule.rescheduleRequests,
  });
  if (!validSlots.some((option) => option.value === slot)) {
    redirect("/class?reschedule=slot-taken");
  }

  const { error } = await supabase.from("class_reschedule_requests").insert({
    student_id: data.student.id,
    batch_id: data.batch.id,
    original_date: requestType === "reschedule" ? originalDate : null,
    requested_date: requestedDate,
    requested_start_time: requestedStartTime,
    requested_end_time: requestedEndTime,
    requested_time_zone: requestedTimeZone,
    reason,
    status: "pending",
  });

  revalidatePath("/class");
  revalidatePath("/admin/attendance");

  if (error) {
    console.error("Unable to request class reschedule", error);
    redirect("/class?reschedule=error");
  }

  redirect("/class?reschedule=requested");
}
