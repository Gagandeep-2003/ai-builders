"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { normalizeMeetLink } from "@/lib/meet-links";
import { getAdminData, getMentorScheduleData } from "@/lib/data";
import { getStudentRescheduleOptions } from "@/lib/reschedule-options";
import { getBookedSlots } from "@/lib/slot-availability";
import { getSessionScheduleDate } from "@/lib/time";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

function requiredValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function scheduleFields(formData: FormData) {
  const firstDay = Number(formData.get("slot1Day") ?? 1);
  const secondDay = Number(formData.get("slot2Day") ?? 3);
  const firstStart = requiredValue(formData, "slot1StartTime") || "17:00";
  const firstEnd = requiredValue(formData, "slot1EndTime") || "18:00";
  const secondStart = requiredValue(formData, "slot2StartTime") || firstStart;
  const secondEnd = requiredValue(formData, "slot2EndTime") || firstEnd;
  const firstMeetLink = normalizeMeetLink(requiredValue(formData, "slot1MeetLink"));
  const secondMeetLink = normalizeMeetLink(requiredValue(formData, "slot2MeetLink"));

  return {
    firstDay,
    secondDay,
    firstStart,
    firstEnd,
    secondStart,
    secondEnd,
    firstMeetLink,
    secondMeetLink,
    days: `${weekdayNames[firstDay] ?? "Class 1"} / ${weekdayNames[secondDay] ?? "Class 2"}`,
    timeSlot: `${weekdayNames[firstDay] ?? "Class 1"} ${firstStart} - ${firstEnd} / ${weekdayNames[secondDay] ?? "Class 2"} ${secondStart} - ${secondEnd}`,
  };
}

function revalidateStudentManagement() {
  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath("/admin/progress");
  revalidatePath("/admin/slots");
  revalidatePath("/dashboard");
  revalidatePath("/class");
  revalidatePath("/profile");
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

export async function createStudentAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { status: "error", message: "Admin access could not be verified." };
  }

  const serviceSupabase = createServiceRoleSupabaseClient();
  if (!serviceSupabase) {
    return {
      status: "error",
      message: "Add SUPABASE_SERVICE_ROLE_KEY in Vercel before creating students from the portal.",
    };
  }

  const fullName = requiredValue(formData, "fullName");
  const email = requiredValue(formData, "email").toLowerCase();
  const password = requiredValue(formData, "password");
  const parentName = requiredValue(formData, "parentName");
  const parentEmail = requiredValue(formData, "parentEmail").toLowerCase();
  const country = requiredValue(formData, "country");
  const timeZone = requiredValue(formData, "timeZone") || "Asia/Kolkata";
  const moduleId = requiredValue(formData, "moduleId");
  const startDate = requiredValue(formData, "startDate");
  const batchName = requiredValue(formData, "batchName") || `${fullName} AI Course`;
  const schedule = scheduleFields(formData);

  if (
    !fullName ||
    !email ||
    !password ||
    !timeZone ||
    !moduleId ||
    !startDate ||
    !schedule.firstMeetLink ||
    !schedule.secondMeetLink
  ) {
    return {
      status: "error",
      message: "Complete the student, schedule, and both Meet link fields.",
    };
  }

  const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authData.user) {
    return {
      status: "error",
      message: authError?.message ?? "The student login could not be created.",
    };
  }

  const userId = authData.user.id;
  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .insert({
      name: batchName,
      days: schedule.days,
      time_slot: schedule.timeSlot,
      time_zone: timeZone,
      start_date: startDate,
      start_time: schedule.firstStart,
      end_time: schedule.firstEnd,
      meet_link: schedule.firstMeetLink,
      module_id: moduleId,
    })
    .select("id")
    .single();

  if (batchError || !batch) {
    await serviceSupabase.auth.admin.deleteUser(userId);
    return {
      status: "error",
      message: batchError?.message ?? "The class schedule could not be created.",
    };
  }

  const { error: slotError } = await supabase.from("batch_class_slots").insert([
    {
      batch_id: batch.id,
      label: `${weekdayNames[schedule.firstDay]} class`,
      day_of_week: schedule.firstDay,
      start_time: schedule.firstStart,
      end_time: schedule.firstEnd,
      meet_link: schedule.firstMeetLink,
      sort_order: 1,
    },
    {
      batch_id: batch.id,
      label: `${weekdayNames[schedule.secondDay]} class`,
      day_of_week: schedule.secondDay,
      start_time: schedule.secondStart,
      end_time: schedule.secondEnd,
      meet_link: schedule.secondMeetLink,
      sort_order: 2,
    },
  ]);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName,
    role: "student",
  });

  const { error: studentError } = await supabase.from("students").insert({
    user_id: userId,
    full_name: fullName,
    parent_name: parentName,
    parent_email: parentEmail,
    country,
    time_zone: timeZone,
    batch_id: batch.id,
  });

  if (slotError || profileError || studentError) {
    await supabase.from("batches").delete().eq("id", batch.id);
    await serviceSupabase.auth.admin.deleteUser(userId);
    return {
      status: "error",
      message:
        slotError?.message ??
        profileError?.message ??
        studentError?.message ??
        "The student setup could not be completed.",
    };
  }

  revalidateStudentManagement();
  return {
    status: "success",
    message: `${fullName} is ready with login, schedule, and Meet links.`,
  };
}

export async function updateStudentAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { status: "error", message: "Admin access could not be verified." };
  }

  const studentId = requiredValue(formData, "studentId");
  const userId = requiredValue(formData, "userId");
  const batchId = requiredValue(formData, "batchId");
  const fullName = requiredValue(formData, "fullName");
  const email = requiredValue(formData, "email").toLowerCase();
  const password = requiredValue(formData, "password");
  const parentName = requiredValue(formData, "parentName");
  const parentEmail = requiredValue(formData, "parentEmail").toLowerCase();
  const country = requiredValue(formData, "country");
  const timeZone = requiredValue(formData, "timeZone") || "Asia/Kolkata";
  const moduleId = requiredValue(formData, "moduleId");
  const startDate = requiredValue(formData, "startDate");
  const batchName = requiredValue(formData, "batchName") || `${fullName} AI Course`;
  const schedule = scheduleFields(formData);
  const serviceSupabase = createServiceRoleSupabaseClient();

  if (
    !studentId ||
    !userId ||
    !batchId ||
    !fullName ||
    !email ||
    !moduleId ||
    !startDate ||
    !schedule.firstMeetLink ||
    !schedule.secondMeetLink
  ) {
    return { status: "error", message: "Student setup is missing required identifiers or fields." };
  }

  if (!serviceSupabase) {
    return {
      status: "error",
      message: "Add SUPABASE_SERVICE_ROLE_KEY in Vercel before editing student login details.",
    };
  }

  const { error: studentError } = await supabase
    .from("students")
    .update({
      full_name: fullName,
      parent_name: parentName,
      parent_email: parentEmail,
      country,
      time_zone: timeZone,
    })
    .eq("id", studentId);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, email })
    .eq("id", userId);

  const { error: batchError } = await supabase
    .from("batches")
    .update({
      name: batchName,
      days: schedule.days,
      time_slot: schedule.timeSlot,
      time_zone: timeZone,
      start_date: startDate,
      start_time: schedule.firstStart,
      end_time: schedule.firstEnd,
      meet_link: schedule.firstMeetLink,
      module_id: moduleId,
    })
    .eq("id", batchId);

  if (studentError || profileError || batchError) {
    return {
      status: "error",
      message:
        studentError?.message ??
        profileError?.message ??
        batchError?.message ??
        "The student changes could not be saved.",
    };
  }

  const { error: authUpdateError } = await serviceSupabase.auth.admin.updateUserById(userId, {
    email,
    ...(password ? { password } : {}),
    user_metadata: { full_name: fullName },
  });

  if (authUpdateError) {
    return {
      status: "error",
      message: `Profile details were saved, but the student login could not be updated: ${authUpdateError.message}`,
    };
  }

  const { data: existingSlots, error: slotsReadError } = await supabase
    .from("batch_class_slots")
    .select("id")
    .eq("batch_id", batchId)
    .order("sort_order");

  if (slotsReadError) {
    return {
      status: "error",
      message: `Student details were saved, but the weekly classes could not be loaded: ${slotsReadError.message}`,
    };
  }

  const slotPayloads = [
    {
      batch_id: batchId,
      label: `${weekdayNames[schedule.firstDay]} class`,
      day_of_week: schedule.firstDay,
      start_time: schedule.firstStart,
      end_time: schedule.firstEnd,
      meet_link: schedule.firstMeetLink,
      sort_order: 1,
    },
    {
      batch_id: batchId,
      label: `${weekdayNames[schedule.secondDay]} class`,
      day_of_week: schedule.secondDay,
      start_time: schedule.secondStart,
      end_time: schedule.secondEnd,
      meet_link: schedule.secondMeetLink,
      sort_order: 2,
    },
  ];

  let slotError: string | undefined;
  for (const [index, payload] of slotPayloads.entries()) {
    const existingId = existingSlots?.[index]?.id;
    const { error } = existingId
      ? await supabase.from("batch_class_slots").update(payload).eq("id", existingId)
      : await supabase.from("batch_class_slots").insert(payload);

    if (error) {
      slotError = error.message;
      break;
    }
  }

  if (!slotError && (existingSlots?.length ?? 0) > slotPayloads.length) {
    const extraIds = existingSlots!.slice(slotPayloads.length).map((slot) => slot.id);
    const { error } = await supabase.from("batch_class_slots").delete().in("id", extraIds);
    slotError = error?.message;
  }

  if (slotError) {
    return {
      status: "error",
      message: `Student details were saved, but the weekly classes could not be updated: ${slotError}`,
    };
  }

  revalidateStudentManagement();
  return { status: "success", message: `${fullName}'s details and schedule were updated.` };
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
      meet_link: normalizeMeetLink(String(formData.get("meetLink") ?? "")),
      module_id: String(formData.get("moduleId") ?? ""),
    })
    .select("id")
    .single();

  if (batch?.id) {
    const firstSlotDay = Number(formData.get("slot1Day") ?? 1);
    const secondSlotDay = Number(formData.get("slot2Day") ?? 3);
    const firstMeetLink = normalizeMeetLink(String(formData.get("slot1MeetLink") ?? formData.get("meetLink") ?? ""));
    const secondMeetLink = normalizeMeetLink(String(formData.get("slot2MeetLink") ?? formData.get("meetLink") ?? ""));

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
    .update({ meet_link: normalizeMeetLink(String(formData.get("meetLink") ?? "")) })
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

  const sessionId = requiredValue(formData, "sessionId");
  if (!sessionId) return;

  const { data: session } = await supabase
    .from("sessions")
    .select("module_id")
    .eq("id", sessionId)
    .single();

  if (!session?.module_id) return;

  await supabase.from("resources").insert({
    title: requiredValue(formData, "title"),
    type: requiredValue(formData, "type") || "link",
    url: requiredValue(formData, "url"),
    module_id: session.module_id,
    session_id: sessionId,
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  revalidatePath("/dashboard");
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

export async function reviewHomeworkSubmissionAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) return;
  const homeworkId = requiredValue(formData, "homeworkId");
  const studentId = requiredValue(formData, "studentId");
  const decision = requiredValue(formData, "decision");
  const mentorFeedback = requiredValue(formData, "mentorFeedback");
  if (!homeworkId || !studentId || !["approved", "revision_requested"].includes(decision)) return;
  if (decision === "revision_requested" && !mentorFeedback) return;

  const { data: userData } = await supabase.auth.getUser();
  await supabase
    .from("submissions")
    .update({
      status: decision === "approved" ? "reviewed" : "revision_requested",
      mentor_feedback: mentorFeedback || null,
      reviewed_by: userData.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("homework_id", homeworkId)
    .eq("student_id", studentId)
    .in("status", ["submitted", "reviewed", "revision_requested"]);

  for (const path of ["/admin", "/admin/homework", "/admin/progress", "/dashboard", "/homework", `/homework/${homeworkId}`, "/progress", "/league"]) {
    revalidatePath(path);
  }
}

export async function awardMentorBadgeAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) return;
  const studentId = requiredValue(formData, "studentId");
  const badgeId = requiredValue(formData, "badgeId");
  const mentorNote = requiredValue(formData, "mentorNote");
  if (!studentId || !badgeId) return;

  const [{ data: definition }, { data: userData }] = await Promise.all([
    supabase.from("badge_definitions").select("id, mentor_awarded").eq("id", badgeId).maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!definition?.mentor_awarded) return;

  await supabase.from("student_badges").upsert(
    {
      student_id: studentId,
      badge_id: badgeId,
      source: "mentor",
      awarded_by: userData.user?.id ?? null,
      mentor_note: mentorNote || null,
      awarded_at: new Date().toISOString(),
      seen_at: null,
    },
    { onConflict: "student_id,badge_id" },
  );
  for (const path of ["/admin/progress", "/dashboard", "/progress", "/journey", "/league"]) revalidatePath(path);
}

export async function revokeMentorBadgeAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) return;
  const awardId = requiredValue(formData, "awardId");
  if (!awardId) return;
  await supabase.from("student_badges").delete().eq("id", awardId).eq("source", "mentor");
  for (const path of ["/admin/progress", "/dashboard", "/progress", "/journey", "/league"]) revalidatePath(path);
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

export async function reviewRescheduleRequestAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/attendance");
    return;
  }

  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!requestId || !["approved", "rejected"].includes(status)) return;

  const { data: request } = await supabase
    .from("class_reschedule_requests")
    .select("id, student_id, batch_id, original_date, requested_date, requested_start_time, requested_end_time, requested_time_zone, batches(meet_link)")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return;

  const originalDateOverride = String(formData.get("originalDate") ?? "").trim();
  const originalDate = originalDateOverride || String(request.original_date ?? "") || null;

  if (status === "approved") {
    const [adminData, mentorSchedule] = await Promise.all([
      getAdminData(),
      getMentorScheduleData(),
    ]);
    const student = adminData.students.find((item) => item.id === request.student_id);
    const batchForStudent = adminData.batches.find((item) => item.id === request.batch_id);
    if (!student || !batchForStudent) redirect("/admin/attendance?reschedule=invalid");

    if (
      originalDate &&
      !adminData.sessions.some(
        (session) => getSessionScheduleDate(session, batchForStudent) === originalDate,
      )
    ) {
      redirect("/admin/attendance?reschedule=invalid-original");
    }
    const alreadyMoved = mentorSchedule.rescheduleRequests.some(
      (item) =>
        item.id !== requestId &&
        item.studentId === request.student_id &&
        item.status === "approved" &&
        item.originalDate === originalDate,
    );
    if (originalDate && alreadyMoved) {
      redirect("/admin/attendance?reschedule=invalid-original");
    }

    const requestSlot = [
      request.requested_date,
      request.requested_start_time,
      request.requested_end_time,
      request.requested_time_zone,
    ].join("|");
    const validSlots = getStudentRescheduleOptions(student.timeZone, {
      bookedSlots: getBookedSlots(mentorSchedule.batches, mentorSchedule.students),
      requests: mentorSchedule.rescheduleRequests.filter((item) => item.id !== requestId),
    });
    if (!validSlots.some((option) => option.value === requestSlot)) {
      redirect("/admin/attendance?reschedule=slot-taken");
    }
  }

  const batch = request?.batches;
  const batchMeetLink =
    Array.isArray(batch)
      ? String((batch[0] as { meet_link?: unknown } | undefined)?.meet_link ?? "")
      : String((batch as { meet_link?: unknown } | null | undefined)?.meet_link ?? "");
  const meetLink =
    normalizeMeetLink(String(formData.get("meetLink") ?? "")) ||
    normalizeMeetLink(batchMeetLink);

  await supabase
    .from("class_reschedule_requests")
    .update({
      status,
      original_date: status === "approved" ? originalDate : request.original_date,
      admin_note: String(formData.get("adminNote") ?? ""),
      meet_link: status === "approved" ? meetLink : null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  revalidatePath("/class");
  revalidatePath("/dashboard");
}

export async function updateApprovedRescheduleOriginalAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) return;

  const requestId = requiredValue(formData, "requestId");
  const originalDate = requiredValue(formData, "originalDate");
  if (!requestId || !originalDate) return;

  const { data: request } = await supabase
    .from("class_reschedule_requests")
    .select("student_id, batch_id")
    .eq("id", requestId)
    .eq("status", "approved")
    .maybeSingle();
  if (!request) return;

  const data = await getAdminData();
  const batch = data.batches.find((item) => item.id === request.batch_id);
  const validOriginal = batch && data.sessions.some(
    (session) => getSessionScheduleDate(session, batch) === originalDate,
  );
  const alreadyMoved = data.rescheduleRequests.some(
    (item) =>
      item.id !== requestId &&
      item.studentId === request.student_id &&
      item.status === "approved" &&
      item.originalDate === originalDate,
  );
  if (!validOriginal || alreadyMoved) {
    redirect("/admin/attendance?reschedule=invalid-original");
  }

  await supabase
    .from("class_reschedule_requests")
    .update({ original_date: originalDate })
    .eq("id", requestId);

  revalidatePath("/admin");
  revalidatePath("/admin/attendance");
  revalidatePath("/class");
  revalidatePath("/dashboard");
  redirect("/admin/attendance?reschedule=updated");
}

export async function createAdminRescheduleAction(formData: FormData) {
  const supabase = await getAdminClient();
  if (!supabase) {
    revalidatePath("/admin/attendance");
    return;
  }

  const studentId = String(formData.get("studentId") ?? "");
  const requestedDate = String(formData.get("requestedDate") ?? "");
  const requestedStartTime = String(formData.get("requestedStartTime") ?? "");
  const requestedEndTime = String(formData.get("requestedEndTime") ?? "");
  const requestedTimeZone = String(formData.get("requestedTimeZone") ?? "Asia/Kolkata");
  const meetLink = normalizeMeetLink(String(formData.get("meetLink") ?? ""));
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || "Scheduled by admin";
  const requestType = String(formData.get("requestType") ?? "makeup");
  const originalDate = requestType === "reschedule"
    ? String(formData.get("originalDate") ?? "").trim() || null
    : null;

  if (
    !studentId ||
    !requestedDate ||
    !requestedStartTime ||
    !requestedEndTime ||
    (requestType === "reschedule" && !originalDate)
  ) {
    revalidatePath("/admin/attendance");
    return;
  }

  const { data: student } = await supabase
    .from("students")
    .select("batch_id, batches(meet_link)")
    .eq("id", studentId)
    .maybeSingle();

  const batchId = String(student?.batch_id ?? "");
  if (!batchId) {
    revalidatePath("/admin/attendance");
    return;
  }

  const batch = student?.batches;
  const batchMeetLink =
    Array.isArray(batch)
      ? String((batch[0] as { meet_link?: unknown } | undefined)?.meet_link ?? "")
      : String((batch as { meet_link?: unknown } | null | undefined)?.meet_link ?? "");

  if (originalDate) {
    const data = await getAdminData();
    const mappedBatch = data.batches.find((item) => item.id === batchId);
    const validOriginal = mappedBatch && data.sessions.some(
      (session) => getSessionScheduleDate(session, mappedBatch) === originalDate,
    );
    const alreadyMoved = data.rescheduleRequests.some(
      (request) =>
        request.studentId === studentId &&
        request.status === "approved" &&
        request.originalDate === originalDate,
    );
    if (!validOriginal || alreadyMoved) {
      redirect("/admin/attendance?reschedule=invalid-original");
    }
  }

  await supabase.from("class_reschedule_requests").insert({
    student_id: studentId,
    batch_id: batchId,
    original_date: originalDate,
    requested_date: requestedDate,
    requested_start_time: requestedStartTime,
    requested_end_time: requestedEndTime,
    requested_time_zone: requestedTimeZone,
    reason,
    status: "approved",
    admin_note: adminNote,
    meet_link: meetLink || normalizeMeetLink(batchMeetLink),
    reviewed_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/attendance");
  revalidatePath("/class");
  revalidatePath("/dashboard");
}
