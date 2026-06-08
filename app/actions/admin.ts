"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function getAdminClient() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? supabase : null;
}

function getHomeworkTarget(formData: FormData) {
  const combinedTarget = String(formData.get("target") ?? "");
  if (combinedTarget.includes(":")) {
    const [targetType, targetId] = combinedTarget.split(":");
    return { targetType, targetId };
  }

  return {
    targetType: String(formData.get("targetType") ?? "batch"),
    targetId: String(formData.get("targetId") ?? ""),
  };
}

export async function createStudentAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/students");
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const parentName = String(formData.get("parentName") ?? "");
  const parentEmail = String(formData.get("parentEmail") ?? "");
  const country = String(formData.get("country") ?? "");
  const timeZone = String(formData.get("timeZone") ?? "Asia/Kolkata");
  const batchId = String(formData.get("batchId") ?? "");

  if (!userId || !fullName || !email || !parentName || !parentEmail || !batchId) return;

  await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName,
    role: "student",
  });

  await supabase.from("students").insert({
    user_id: userId,
    full_name: fullName,
    parent_name: parentName,
    parent_email: parentEmail,
    country,
    time_zone: timeZone,
    batch_id: batchId,
  });

  revalidatePath("/admin/students");
}

export async function updateStudentAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/students");
    return;
  }

  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) return;

  await supabase
    .from("students")
    .update({
      full_name: String(formData.get("fullName") ?? ""),
      parent_name: String(formData.get("parentName") ?? ""),
      parent_email: String(formData.get("parentEmail") ?? ""),
      country: String(formData.get("country") ?? ""),
      time_zone: String(formData.get("timeZone") ?? "Asia/Kolkata"),
      batch_id: String(formData.get("batchId") ?? ""),
    })
    .eq("id", studentId);

  revalidatePath("/admin/students");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function removeStudentAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/students");
    return;
  }

  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) return;

  await supabase.from("students").delete().eq("id", studentId);

  revalidatePath("/admin");
  revalidatePath("/admin/students");
}

export async function createBatchAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/batches");
    return;
  }

  const { data: batch } = await supabase
    .from("batches")
    .insert({
      name: String(formData.get("name") ?? ""),
      days: String(formData.get("days") ?? ""),
      time_slot: String(formData.get("timeSlot") ?? ""),
      time_zone: String(formData.get("timeZone") ?? "Asia/Kolkata"),
      start_date: String(formData.get("startDate") ?? "2026-06-08"),
      start_time: String(formData.get("startTime") ?? "17:00"),
      end_time: String(formData.get("endTime") ?? "18:30"),
      meet_link: String(formData.get("meetLink") ?? ""),
      module_id: String(formData.get("moduleId") ?? ""),
    })
    .select("id")
    .single();

  if (batch?.id) {
    const firstSlotDay = Number(formData.get("slot1Day") ?? 1);
    const secondSlotDay = Number(formData.get("slot2Day") ?? 3);
    const firstMeetLink = String(formData.get("slot1MeetLink") ?? formData.get("meetLink") ?? "");
    const secondMeetLink = String(formData.get("slot2MeetLink") ?? formData.get("meetLink") ?? "");

    await supabase.from("batch_class_slots").insert([
      {
        batch_id: batch.id,
        label: String(formData.get("slot1Label") ?? "Class 1"),
        day_of_week: firstSlotDay,
        start_time: String(formData.get("slot1StartTime") ?? formData.get("startTime") ?? "17:00"),
        end_time: String(formData.get("slot1EndTime") ?? formData.get("endTime") ?? "18:30"),
        meet_link: firstMeetLink,
        sort_order: 1,
      },
      {
        batch_id: batch.id,
        label: String(formData.get("slot2Label") ?? "Class 2"),
        day_of_week: secondSlotDay,
        start_time: String(formData.get("slot2StartTime") ?? formData.get("startTime") ?? "17:00"),
        end_time: String(formData.get("slot2EndTime") ?? formData.get("endTime") ?? "18:30"),
        meet_link: secondMeetLink,
        sort_order: 2,
      },
    ]);
  }

  revalidatePath("/admin/batches");
}

export async function updateMeetLinkAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/batches");
    return;
  }

  await supabase
    .from("batches")
    .update({ meet_link: String(formData.get("meetLink") ?? "") })
    .eq("id", String(formData.get("batchId") ?? ""));

  revalidatePath("/admin/batches");
  revalidatePath("/class");
}

export async function createHomeworkAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/homework");
    return;
  }

  const { targetType, targetId } = getHomeworkTarget(formData);

  await supabase.from("homework").insert({
    session_id: String(formData.get("sessionId") ?? ""),
    batch_id: targetType === "batch" ? targetId : null,
    assigned_student_id: targetType === "student" ? targetId : null,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    kind: String(formData.get("kind") ?? "home_task"),
    content_url: String(formData.get("contentUrl") ?? ""),
    due_date: String(formData.get("dueDate") ?? ""),
  });

  revalidatePath("/admin/homework");
  revalidatePath("/homework");
  revalidatePath("/dashboard");
}

export async function updateHomeworkAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/homework");
    return;
  }

  const homeworkId = String(formData.get("homeworkId") ?? "");
  const { targetType, targetId } = getHomeworkTarget(formData);
  if (!homeworkId || (targetType !== "all" && !targetId)) return;

  await supabase
    .from("homework")
    .update({
      session_id: String(formData.get("sessionId") ?? ""),
      batch_id: targetType === "batch" ? targetId : null,
      assigned_student_id: targetType === "student" ? targetId : null,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      kind: String(formData.get("kind") ?? "home_task"),
      content_url: String(formData.get("contentUrl") ?? ""),
      due_date: String(formData.get("dueDate") ?? ""),
    })
    .eq("id", homeworkId);

  revalidatePath("/admin/homework");
  revalidatePath("/homework");
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function deleteHomeworkAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/homework");
    return;
  }

  const homeworkId = String(formData.get("homeworkId") ?? "");
  if (!homeworkId) return;

  await supabase.from("homework").delete().eq("id", homeworkId);

  revalidatePath("/admin/homework");
  revalidatePath("/homework");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

export async function createResourceAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/resources");
    return;
  }

  await supabase.from("resources").insert({
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? "link"),
    url: String(formData.get("url") ?? ""),
    module_id: String(formData.get("moduleId") ?? ""),
    session_id: String(formData.get("sessionId") ?? "") || null,
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function deleteResourceAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/resources");
    return;
  }

  await supabase.from("resources").delete().eq("id", String(formData.get("resourceId") ?? ""));
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function saveAttendanceAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/attendance");
    return;
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");

  await supabase.from("attendance").upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      status: String(formData.get("status") ?? "present"),
      date: String(formData.get("date") ?? new Date().toISOString().slice(0, 10)),
    },
    { onConflict: "session_id,student_id" },
  );

  revalidatePath("/admin/attendance");
  revalidatePath("/progress");
}

export async function saveFeedbackAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/feedback");
    return;
  }

  await supabase.from("feedback").insert({
    student_id: String(formData.get("studentId") ?? ""),
    session_id: String(formData.get("sessionId") ?? "") || null,
    tutor_note: String(formData.get("tutorNote") ?? ""),
  });

  revalidatePath("/admin/feedback");
  revalidatePath("/progress");
}

export async function postAnnouncementAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/announcements");
    return;
  }

  const batchId = String(formData.get("batchId") ?? "");
  await supabase.from("announcements").insert({
    batch_id: batchId === "all" ? null : batchId,
    message: String(formData.get("message") ?? ""),
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function deleteAnnouncementAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/announcements");
    return;
  }

  await supabase.from("announcements").delete().eq("id", String(formData.get("announcementId") ?? ""));
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard");
}

export async function reviewPasswordRequestAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin");
    return;
  }

  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!requestId || !["approved", "rejected"].includes(status)) return;

  await supabase
    .from("password_change_requests")
    .update({
      status,
      admin_note: String(formData.get("adminNote") ?? ""),
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  revalidatePath("/admin");
  revalidatePath("/profile");
}
