"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionDateTimes, getSessionScheduleDate } from "@/lib/time";

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

  const { meetLink } = getSessionDateTimes(session, data.batch);
  const classDate = getSessionScheduleDate(session, data.batch);

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
