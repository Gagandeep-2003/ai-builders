import { getAdminClassEvents } from "@/lib/class-events";
import type {
  Batch,
  ClassRescheduleRequest,
  CourseSession,
  StudentProfile,
} from "@/lib/course-data";
import { normalizeMeetLink } from "@/lib/meet-links";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_TIME_ZONE, formatInTimeZone } from "@/lib/time";

export const runtime = "nodejs";

type StudentRow = {
  id: string;
  user_id: string;
  full_name: string;
  parent_name: string;
  parent_email: string;
  country: string;
  time_zone: string;
  batch_id: string;
  enrolled_at: string;
};

type SlotRow = {
  id: string;
  batch_id: string;
  label: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  meet_link: string;
  sort_order: number;
};

type BatchRow = {
  id: string;
  name: string;
  days: string;
  time_slot: string;
  time_zone: string;
  start_date: string;
  start_time: string;
  end_time: string;
  meet_link: string;
  module_id: string;
  batch_class_slots: SlotRow[];
};

type SessionRow = {
  id: string;
  module_id: string;
  title: string;
  session_number: number;
  focus: string;
  tools_covered: string[];
  student_output: string;
  description: string;
  session_date: string;
  modules: { order_index: number } | Array<{ order_index: number }> | null;
};

type RequestRow = {
  id: string;
  student_id: string;
  batch_id: string;
  original_date: string | null;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  requested_time_zone: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  meet_link: string | null;
  requested_at: string;
  reviewed_at: string | null;
};

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function moduleOrder(row: SessionRow) {
  if (Array.isArray(row.modules)) return row.modules[0]?.order_index ?? 99;
  return row.modules?.order_index ?? 99;
}

function mapStudent(row: StudentRow): StudentProfile {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: "",
    parentName: row.parent_name,
    parentEmail: row.parent_email,
    country: row.country,
    timeZone: row.time_zone,
    batchId: row.batch_id,
    enrolledAt: row.enrolled_at,
  };
}

function mapBatch(row: BatchRow): Batch {
  return {
    id: row.id,
    name: row.name,
    days: row.days,
    timeSlot: row.time_slot,
    timeZone: row.time_zone,
    startDate: row.start_date,
    startTime: row.start_time,
    endTime: row.end_time,
    meetLink: normalizeMeetLink(row.meet_link),
    moduleId: row.module_id,
    studentsCount: 0,
    classSlots: [...(row.batch_class_slots ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((slot) => ({
        id: slot.id,
        batchId: slot.batch_id,
        label: slot.label,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        meetLink: normalizeMeetLink(slot.meet_link),
        sortOrder: slot.sort_order,
      })),
  };
}

function mapRequest(row: RequestRow): ClassRescheduleRequest {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: "",
    batchId: row.batch_id,
    originalDate: row.original_date ?? undefined,
    requestedDate: row.requested_date,
    requestedStartTime: row.requested_start_time,
    requestedEndTime: row.requested_end_time,
    requestedTimeZone: row.requested_time_zone,
    reason: row.reason ?? "",
    status: row.status,
    adminNote: row.admin_note ?? "",
    meetLink: normalizeMeetLink(row.meet_link),
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at ?? "",
  };
}

function istClassTime(startsAt: Date, endsAt: Date) {
  const date = formatInTimeZone(startsAt, ADMIN_TIME_ZONE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const start = formatInTimeZone(startsAt, ADMIN_TIME_ZONE, {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = formatInTimeZone(endsAt, ADMIN_TIME_ZONE, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date}, ${start} - ${end} IST`;
}

async function sendEmail(templateParams: Record<string, string>) {
  const serviceId = process.env.EMAILJS_SERVICE_ID ?? "service_620d95s";
  const templateId = process.env.EMAILJS_TEMPLATE_ID ?? "template_yqqin4y";
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!publicKey) {
    throw new Error("EMAILJS_PUBLIC_KEY is missing.");
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      ...(privateKey ? { accessToken: privateKey } : {}),
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || `EmailJS returned ${response.status}.`);
  }
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentorEmail =
    process.env.MENTOR_REMINDER_EMAIL ?? "gagandeepsingh220903@gmail.com";
  const testMode = new URL(request.url).searchParams.get("test") === "1";
  if (testMode) {
    try {
      await sendEmail({
        mentor_email: mentorEmail,
        student_name: "Test Student",
        class_time_ist: "Friday, June 19, 2026, 9:30 PM - 10:30 PM IST",
        module_number: "1",
        session_number: "1",
        session_name: "Welcome to the AI Era",
        class_type: "Reminder test",
        meet_link: "https://meet.google.com/test-link",
      });
      return Response.json({ sent: true, message: "EmailJS test reminder sent." });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Test email failed." },
        { status: 500 },
      );
    }
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase service role is not configured." }, { status: 500 });
  }

  const warnings: string[] = [];
  const cleanupResult = await supabase
    .from("submission_evidence")
    .delete()
    .lt("expires_at", new Date().toISOString());
  if (cleanupResult.error) {
    warnings.push(`Evidence cleanup skipped: ${cleanupResult.error.message}`);
  }

  const ledgerProbe = await supabase
    .from("mentor_reminder_deliveries")
    .select("event_key")
    .limit(1);
  const ledgerAvailable = !ledgerProbe.error;
  if (ledgerProbe.error) {
    warnings.push(
      "Reminder delivery ledger is unavailable. Using the narrow cron window fallback.",
    );
  }

  const [
    { data: studentData, error: studentError },
    batchResult,
    sessionResult,
    requestResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at"),
    supabase
      .from("batches")
      .select("id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, batch_class_slots(id, batch_id, label, day_of_week, start_time, end_time, meet_link, sort_order)"),
    supabase
      .from("sessions")
      .select("id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date, modules(order_index)"),
    supabase
      .from("class_reschedule_requests")
      .select("id, student_id, batch_id, original_date, requested_date, requested_start_time, requested_end_time, requested_time_zone, reason, status, admin_note, meet_link, requested_at, reviewed_at")
      .eq("status", "approved"),
  ]);

  let batchData: unknown = batchResult.data;
  let batchError = batchResult.error;
  if (batchError) {
    const fallback = await supabase
      .from("batches")
      .select("id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id");
    batchData = (fallback.data ?? []).map((batch) => ({
      ...batch,
      batch_class_slots: [],
    }));
    batchError = fallback.error;
  }

  let sessionData: unknown = sessionResult.data;
  let sessionError = sessionResult.error;
  if (sessionError) {
    const fallback = await supabase
      .from("sessions")
      .select("id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date");
    sessionData = (fallback.data ?? []).map((session) => ({
      ...session,
      modules: null,
    }));
    sessionError = fallback.error;
  }

  const requestData = requestResult.error ? [] : requestResult.data;
  if (requestResult.error) {
    console.warn("Make-up classes were skipped by mentor reminders", requestResult.error);
  }

  const coreErrors = [
    ["students", studentError],
    ["batches", batchError],
    ["sessions", sessionError],
  ] as const;
  const failedSource = coreErrors.find(([, error]) => error);
  if (failedSource) {
    const [source, error] = failedSource;
    return Response.json(
      {
        error: `Unable to load ${source} for mentor reminders.`,
        source,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      },
      { status: 500 },
    );
  }

  const students = (studentData as unknown as StudentRow[]).map(mapStudent);
  const batches = (batchData as unknown as BatchRow[]).map(mapBatch);
  const sessions: CourseSession[] = (sessionData as unknown as SessionRow[])
    .sort((a, b) => moduleOrder(a) - moduleOrder(b) || a.session_number - b.session_number)
    .map((session, index) => ({
      id: session.id,
      moduleId: session.module_id,
      title: session.title,
      sessionNumber: session.session_number,
      globalNumber: index + 1,
      focus: session.focus,
      toolsCovered: session.tools_covered ?? [],
      studentOutput: session.student_output,
      description: session.description,
      date: session.session_date,
    }));
  const requests = (requestData as unknown as RequestRow[]).map(mapRequest);
  const now = new Date();
  const events = getAdminClassEvents({
    students,
    batches,
    sessions,
    requests,
    attendance: [],
    now,
  }).filter((event) => {
    const minutesUntil = (event.startsAt.getTime() - now.getTime()) / 60_000;
    return ledgerAvailable
      ? minutesUntil >= 45 && minutesUntil <= 75
      : minutesUntil >= 53 && minutesUntil <= 67;
  });

  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ event: string; error: string }> = [];

  for (const event of events) {
    const eventKey = `${event.id}:${event.startsAt.toISOString()}`;
    if (ledgerAvailable) {
      const { error: deliveryError } = await supabase
        .from("mentor_reminder_deliveries")
        .insert({
          event_key: eventKey,
          student_id: event.student?.id ?? null,
          class_starts_at: event.startsAt.toISOString(),
        });

      if (deliveryError?.code === "23505") {
        skipped.push(eventKey);
        continue;
      }
      if (deliveryError) {
        failed.push({ event: eventKey, error: deliveryError.message });
        continue;
      }
    }

    try {
      await sendEmail({
        mentor_email: mentorEmail,
        student_name: event.student?.fullName ?? "Student",
        class_time_ist: istClassTime(event.startsAt, event.endsAt),
        module_number: event.session
          ? String(Math.ceil(event.session.globalNumber / 8))
          : event.kind === "rescheduled" ? "Rescheduled" : "Make-up",
        session_number: event.session ? String(event.session.sessionNumber) : "One-off",
        session_name: event.session?.title ?? (event.kind === "rescheduled" ? "Rescheduled class" : "Make-up class"),
        class_type: event.kind === "makeup"
          ? "Make-up class"
          : event.kind === "rescheduled"
            ? "Rescheduled class"
            : "Regular class",
        meet_link: event.meetLink,
      });
      sent.push(eventKey);
    } catch (error) {
      if (ledgerAvailable) {
        await supabase
          .from("mentor_reminder_deliveries")
          .delete()
          .eq("event_key", eventKey);
      }
      failed.push({
        event: eventKey,
        error: error instanceof Error ? error.message : "Email could not be sent.",
      });
    }
  }

  return Response.json({
    checkedAt: now.toISOString(),
    matchingClasses: events.length,
    ledgerAvailable,
    sent,
    skipped,
    failed,
    warnings,
  });
}
