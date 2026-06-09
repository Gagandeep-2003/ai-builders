import {
  demoAnnouncements,
  demoAttendance,
  demoBatch,
  demoClassJoinEvents,
  demoFeedback,
  demoHomework,
  demoPasswordChangeRequests,
  demoResources,
  demoStudent,
  modules,
  sessions,
  type Announcement,
  type AttendanceItem,
  type Batch,
  type BatchClassSlot,
  type ClassJoinEvent,
  type CourseModule,
  type CourseSession,
  type FeedbackItem,
  type HomeworkItem,
  type HomeworkKind,
  type PasswordChangeRequest,
  type PasswordRequestStatus,
  type ResourceItem,
  type AttendanceStatus,
  type ResourceType,
  type SubmissionStatus,
  type StudentProfile,
} from "@/lib/course-data";
import { getCourseworkDetail } from "@/lib/coursework-details";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { applySessionStatuses } from "@/lib/time";

export type CurriculumSession = CourseSession & {
  status: "completed" | "current" | "locked";
};

export type DashboardData = {
  student: StudentProfile;
  batch: Batch;
  modules: CourseModule[];
  sessions: CurriculumSession[];
  homework: HomeworkItem[];
  resources: ResourceItem[];
  announcements: Announcement[];
  attendance: AttendanceItem[];
  feedback: FeedbackItem[];
  passwordRequests: PasswordChangeRequest[];
};

export type AdminData = {
  students: StudentProfile[];
  batches: Batch[];
  modules: CourseModule[];
  sessions: CourseSession[];
  homework: HomeworkItem[];
  resources: ResourceItem[];
  announcements: Announcement[];
  attendance: AttendanceItem[];
  feedback: FeedbackItem[];
  classJoinEvents: ClassJoinEvent[];
  passwordRequests: PasswordChangeRequest[];
};

function curriculumWithStatus(batch = demoBatch): CurriculumSession[] {
  return applySessionStatuses(sessions, batch);
}

function fallbackDashboardData(): DashboardData {
  return {
    student: demoStudent,
    batch: demoBatch,
    modules,
    sessions: curriculumWithStatus(),
    homework: demoHomework,
    resources: demoResources,
    announcements: demoAnnouncements,
    attendance: demoAttendance,
    feedback: demoFeedback,
    passwordRequests: demoPasswordChangeRequests,
  };
}

function fallbackAdminData(): AdminData {
  return {
    students: [demoStudent],
    batches: [demoBatch],
    modules,
    sessions,
    homework: demoHomework,
    resources: demoResources,
    announcements: demoAnnouncements,
    attendance: demoAttendance,
    feedback: demoFeedback,
    classJoinEvents: demoClassJoinEvents,
    passwordRequests: demoPasswordChangeRequests,
  };
}

type DbRow = Record<string, unknown>;

function isDbRow(value: unknown): value is DbRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(row: DbRow, key: string, fallback = "") {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function num(row: DbRow, key: string, fallback = 0) {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function textList(row: DbRow, key: string) {
  const value = row[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function relation(row: DbRow, key: string) {
  const value = row[key];
  if (Array.isArray(value)) return isDbRow(value[0]) ? value[0] : null;
  return isDbRow(value) ? value : null;
}

function relationRows(row: DbRow, key: string) {
  const value = row[key];
  return Array.isArray(value) ? value.filter(isDbRow) : [];
}

function mapModule(row: DbRow): CourseModule {
  return {
    id: text(row, "id"),
    title: text(row, "title"),
    description: text(row, "description"),
    orderIndex: num(row, "order_index"),
    sessionCount: num(row, "session_count", 8),
  };
}

function mapSession(row: DbRow, globalNumber: number): CourseSession {
  return {
    id: text(row, "id"),
    moduleId: text(row, "module_id"),
    title: text(row, "title"),
    sessionNumber: num(row, "session_number"),
    globalNumber,
    focus: text(row, "focus"),
    toolsCovered: textList(row, "tools_covered"),
    studentOutput: text(row, "student_output"),
    description: text(row, "description"),
    date: text(row, "session_date"),
  };
}

function mapBatchClassSlot(row: DbRow, batchId: string): BatchClassSlot {
  return {
    id: text(row, "id"),
    batchId,
    label: text(row, "label"),
    dayOfWeek: num(row, "day_of_week"),
    startTime: text(row, "start_time", "17:00"),
    endTime: text(row, "end_time", "18:30"),
    meetLink: text(row, "meet_link"),
    sortOrder: num(row, "sort_order"),
  };
}

function mapBatch(row: DbRow, studentsCount = 0): Batch {
  const id = text(row, "id");
  const classSlots = relationRows(row, "batch_class_slots").map((slot) =>
    mapBatchClassSlot(slot, id),
  );

  return {
    id,
    name: text(row, "name"),
    days: text(row, "days"),
    timeSlot: text(row, "time_slot"),
    timeZone: text(row, "time_zone", "Asia/Kolkata"),
    startDate: text(row, "start_date", "2026-06-15"),
    startTime: text(row, "start_time", "17:00"),
    endTime: text(row, "end_time", "18:30"),
    meetLink: text(row, "meet_link"),
    moduleId: text(row, "module_id"),
    studentsCount,
    classSlots,
  };
}

function mapStudent(row: DbRow): StudentProfile {
  const profile = relation(row, "profiles");

  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    fullName: text(row, "full_name"),
    email: profile ? text(profile, "email") : text(row, "email"),
    parentName: text(row, "parent_name"),
    parentEmail: text(row, "parent_email"),
    country: text(row, "country", "India"),
    timeZone: text(row, "time_zone", "Asia/Kolkata"),
    batchId: text(row, "batch_id"),
    enrolledAt: text(row, "enrolled_at"),
  };
}

function mapHomework(row: DbRow): HomeworkItem {
  const session = relation(row, "sessions");
  const submission = relation(row, "submissions");
  const submissions = relationRows(row, "submissions");
  const startedAt = submission ? text(submission, "started_at") : "";
  const submittedAt = submission ? text(submission, "submitted_at") : "";
  const completedSubmissionTimes = submissions
    .map((item) => {
      const started = text(item, "started_at");
      const submitted = text(item, "submitted_at");
      if (!started || !submitted) return null;
      return Math.max(0, Math.round((new Date(submitted).getTime() - new Date(started).getTime()) / 1000));
    })
    .filter((value): value is number => typeof value === "number");
  const submissionSummaries = submissions.map((item) => {
    const itemStartedAt = text(item, "started_at");
    const itemSubmittedAt = text(item, "submitted_at");
    return {
      studentId: text(item, "student_id"),
      status: text(item, "status", "pending") as SubmissionStatus,
      startedAt: itemStartedAt || undefined,
      submittedAt: itemSubmittedAt || undefined,
      timeSpentSeconds:
        itemStartedAt && itemSubmittedAt
          ? Math.max(0, Math.round((new Date(itemSubmittedAt).getTime() - new Date(itemStartedAt).getTime()) / 1000))
          : undefined,
    };
  });
  const timeSpentSeconds =
    startedAt && submittedAt
      ? Math.max(0, Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000))
      : undefined;
  const rowTitle = text(row, "title");
  const rowKind = text(row, "kind", "home_task") as HomeworkKind;
  const courseworkDetail = getCourseworkDetail({
    contentUrl: text(row, "content_url"),
    title: rowTitle,
    kind: rowKind,
  });

  return {
    id: text(row, "id"),
    sessionId: text(row, "session_id"),
    batchId: text(row, "batch_id"),
    assignedStudentId: text(row, "assigned_student_id") || undefined,
    title: courseworkDetail?.title ?? rowTitle,
    description: courseworkDetail?.description ?? text(row, "description"),
    details: courseworkDetail,
    kind: rowKind,
    contentUrl: text(row, "content_url"),
    dueDate: text(row, "due_date"),
    createdAt: text(row, "created_at"),
    sessionName: session ? text(session, "title", "Session") : "Session",
    moduleId: session ? text(session, "module_id", "m1") : "m1",
    status: (submission ? text(submission, "status", "pending") : "pending") as SubmissionStatus,
    notes: submission ? text(submission, "notes") || undefined : undefined,
    startedAt: startedAt || undefined,
    submittedAt: submittedAt || undefined,
    timeSpentSeconds,
    submittedCount: submissions.filter((item) => ["submitted", "reviewed"].includes(text(item, "status"))).length,
    averageTimeSpentSeconds:
      completedSubmissionTimes.length > 0
        ? Math.round(completedSubmissionTimes.reduce((sum, value) => sum + value, 0) / completedSubmissionTimes.length)
        : undefined,
    submissions: submissionSummaries,
  };
}

function mapResource(row: DbRow): ResourceItem {
  const session = relation(row, "sessions");

  return {
    id: text(row, "id"),
    moduleId: text(row, "module_id"),
    sessionId: text(row, "session_id"),
    title: text(row, "title"),
    type: text(row, "type", "link") as ResourceType,
    url: text(row, "url"),
    createdAt: text(row, "created_at"),
    sessionName: session ? text(session, "title", "Session") : "Session",
  };
}

function mapAnnouncement(row: DbRow): Announcement {
  return {
    id: text(row, "id"),
    batchId: text(row, "batch_id"),
    message: text(row, "message"),
    createdAt: text(row, "created_at"),
  };
}

function mapAttendance(row: DbRow): AttendanceItem {
  return {
    id: text(row, "id"),
    sessionId: text(row, "session_id"),
    studentId: text(row, "student_id"),
    status: text(row, "status", "present") as AttendanceStatus,
    date: text(row, "date"),
  };
}

function mapFeedback(row: DbRow): FeedbackItem {
  const session = relation(row, "sessions");

  return {
    id: text(row, "id"),
    studentId: text(row, "student_id"),
    sessionId: text(row, "session_id"),
    sessionName: session ? text(session, "title", "Session") : "Session",
    tutorNote: text(row, "tutor_note"),
    createdAt: text(row, "created_at"),
  };
}

function mapClassJoinEvent(row: DbRow): ClassJoinEvent {
  const student = relation(row, "students");
  const session = relation(row, "sessions");

  return {
    id: text(row, "id"),
    sessionId: text(row, "session_id"),
    studentId: text(row, "student_id"),
    batchId: text(row, "batch_id"),
    joinedAt: text(row, "joined_at"),
    classDate: text(row, "class_date"),
    meetLink: text(row, "meet_link"),
    studentName: student ? text(student, "full_name", "Student") : "Student",
    sessionName: session ? text(session, "title", "Session") : "Session",
  };
}

function mapPasswordChangeRequest(row: DbRow): PasswordChangeRequest {
  const student = relation(row, "students");

  return {
    id: text(row, "id"),
    studentId: text(row, "student_id"),
    studentName: student ? text(student, "full_name", "Student") : "Student",
    status: text(row, "status", "pending") as PasswordRequestStatus,
    reason: text(row, "reason"),
    adminNote: text(row, "admin_note"),
    requestedAt: text(row, "requested_at"),
    reviewedAt: text(row, "reviewed_at"),
    usedAt: text(row, "used_at"),
  };
}

export async function getCurriculum(): Promise<{
  modules: CourseModule[];
  sessions: CurriculumSession[];
}>;
export async function getCurriculum(batch: Batch): Promise<{
  modules: CourseModule[];
  sessions: CurriculumSession[];
}>;
export async function getCurriculum(batch = demoBatch): Promise<{
  modules: CourseModule[];
  sessions: CurriculumSession[];
}> {
  if (!isSupabaseConfigured()) {
    return { modules, sessions: curriculumWithStatus(batch) };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { modules, sessions: curriculumWithStatus(batch) };

  const [{ data: moduleRows }, { data: sessionRows }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, title, description, order_index, session_count")
      .order("order_index", { ascending: true }),
    supabase
      .from("sessions")
      .select("id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date, modules(order_index)")
      .order("session_number", { ascending: true }),
  ]);

  if (!moduleRows || !sessionRows) return { modules, sessions: curriculumWithStatus(batch) };

  const mappedModules = moduleRows.map((row) => mapModule(row));
  const sortedSessions = sessionRows
    .map((row) => ({
      row,
      moduleOrder: num(relation(row, "modules") ?? {}, "order_index", 99),
      sessionNumber: num(row, "session_number", 99),
    }))
    .sort((a, b) => a.moduleOrder - b.moduleOrder || a.sessionNumber - b.sessionNumber)
    .map(({ row }, index) => mapSession(row, index + 1));

  return { modules: mappedModules, sessions: applySessionStatuses(sortedSessions, batch) };
}

export async function getStudentDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured()) return fallbackDashboardData();

  const supabase = await createServerSupabaseClient();
  if (!supabase) return fallbackDashboardData();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fallbackDashboardData();

  const { data: ownedStudentRow } = await supabase
    .from("students")
    .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email), batches(id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, batch_class_slots(id, label, day_of_week, start_time, end_time, meet_link, sort_order))")
    .eq("user_id", user.id)
    .maybeSingle();

  let studentRow = ownedStudentRow;

  if (!studentRow) {
    const { data: firstStudentRow } = await supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email), batches(id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, batch_class_slots(id, label, day_of_week, start_time, end_time, meet_link, sort_order))")
      .limit(1)
      .maybeSingle();

    studentRow = firstStudentRow;
  }

  if (!studentRow) return fallbackDashboardData();

  const effectiveStudent = mapStudent(studentRow);

  const batchRow = relation(studentRow, "batches");
  const effectiveBatch = batchRow ? mapBatch(batchRow) : fallbackDashboardData().batch;
  const curriculum = await getCurriculum(effectiveBatch);

  const [
    { data: homeworkRows },
    { data: resourceRows },
    { data: announcementRows },
    { data: attendanceRows },
    { data: feedbackRows },
    { data: passwordRequestRows },
  ] =
    await Promise.all([
      supabase
        .from("homework")
        .select("id, session_id, batch_id, assigned_student_id, title, description, kind, content_url, due_date, created_at, sessions(title, module_id), submissions(status, notes, started_at, submitted_at)")
        .or(`batch_id.eq.${effectiveBatch.id},assigned_student_id.eq.${effectiveStudent.id},and(batch_id.is.null,assigned_student_id.is.null)`)
        .order("due_date", { ascending: true }),
      supabase
        .from("resources")
        .select("id, module_id, session_id, title, type, url, created_at, sessions(title)")
        .order("created_at", { ascending: false }),
      supabase
        .from("announcements")
        .select("id, batch_id, message, created_at")
        .or(`batch_id.eq.${effectiveBatch.id},batch_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("attendance")
        .select("id, session_id, student_id, status, date")
        .eq("student_id", effectiveStudent.id),
      supabase
        .from("feedback")
        .select("id, student_id, session_id, tutor_note, created_at, sessions(title)")
        .eq("student_id", effectiveStudent.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("password_change_requests")
        .select("id, student_id, status, reason, admin_note, requested_at, reviewed_at, used_at, students(full_name)")
        .eq("student_id", effectiveStudent.id)
        .order("requested_at", { ascending: false })
        .limit(5),
    ]);

  const homework = homeworkRows?.map((row) => mapHomework(row)) ?? demoHomework;
  const resources = resourceRows?.map((row) => mapResource(row)) ?? demoResources;
  const feedback = feedbackRows?.map((row) => mapFeedback(row)) ?? demoFeedback;
  const attendance = attendanceRows?.map((row) => mapAttendance(row)) ?? demoAttendance;

  return {
    student: effectiveStudent,
    batch: effectiveBatch,
    modules: curriculum.modules,
    sessions: curriculum.sessions,
    homework,
    resources,
    announcements: announcementRows?.map((row) => mapAnnouncement(row)) ?? demoAnnouncements,
    attendance,
    feedback,
    passwordRequests: passwordRequestRows?.map((row) => mapPasswordChangeRequest(row)) ?? demoPasswordChangeRequests,
  };
}

export async function getAdminData(): Promise<AdminData> {
  if (!isSupabaseConfigured()) return fallbackAdminData();

  const supabase = await createServerSupabaseClient();
  if (!supabase) return fallbackAdminData();

  await supabase.from("submission_evidence").delete().lt("expires_at", new Date().toISOString());

  const [
    { data: studentRows },
    { data: batchRows },
    { data: moduleRows },
    { data: sessionRows },
    { data: homeworkRows },
    { data: resourceRows },
    { data: announcementRows },
    { data: attendanceRows },
    { data: feedbackRows },
    { data: classJoinEventRows },
    { data: passwordRequestRows },
    { data: evidenceRows },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email)")
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("batches")
      .select("id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, students(id), batch_class_slots(id, label, day_of_week, start_time, end_time, meet_link, sort_order)")
      .order("created_at", { ascending: false }),
    supabase
      .from("modules")
      .select("id, title, description, order_index, session_count")
      .order("order_index", { ascending: true }),
    supabase
      .from("sessions")
      .select("id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date, modules(order_index)")
      .order("session_number", { ascending: true }),
    supabase
      .from("homework")
      .select("id, session_id, batch_id, assigned_student_id, title, description, kind, content_url, due_date, created_at, sessions(title, module_id), submissions(student_id, status, started_at, submitted_at)")
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("id, module_id, session_id, title, type, url, created_at, sessions(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("announcements")
      .select("id, batch_id, message, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("id, session_id, student_id, status, date"),
    supabase
      .from("feedback")
      .select("id, student_id, session_id, tutor_note, created_at, sessions(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("class_join_events")
      .select("id, session_id, student_id, batch_id, joined_at, class_date, meet_link, students(full_name), sessions(title)")
      .order("joined_at", { ascending: false })
      .limit(20),
    supabase
      .from("password_change_requests")
      .select("id, student_id, status, reason, admin_note, requested_at, reviewed_at, used_at, students(full_name)")
      .order("requested_at", { ascending: false })
      .limit(20),
    supabase
      .from("submission_evidence")
      .select("homework_id, student_id, screen_image, camera_image, captured_at, expires_at")
      .gt("expires_at", new Date().toISOString()),
  ]);

  if (!moduleRows || !sessionRows) return fallbackAdminData();

  const mappedModules = moduleRows.map((row) => mapModule(row));
  const mappedSessions = sessionRows
    .map((row) => ({
      row,
      moduleOrder: num(relation(row, "modules") ?? {}, "order_index", 99),
      sessionNumber: num(row, "session_number", 99),
    }))
    .sort((a, b) => a.moduleOrder - b.moduleOrder || a.sessionNumber - b.sessionNumber)
    .map(({ row }, index) => mapSession(row, index + 1));

  const evidenceBySubmission = new Map(
    (evidenceRows ?? []).map((row) => [`${text(row, "homework_id")}:${text(row, "student_id")}`, row]),
  );

  return {
    students: studentRows?.map((row) => mapStudent(row)) ?? [demoStudent],
    batches:
      batchRows?.map((row) => mapBatch(row, relationRows(row, "students").length)) ?? [demoBatch],
    modules: mappedModules,
    sessions: mappedSessions,
    homework:
      homeworkRows?.map((row) => {
        const mapped = mapHomework(row);
        const submissions = relationRows(row, "submissions");
        const submissionsWithEvidence = mapped.submissions?.map((submission) => {
          const evidence = evidenceBySubmission.get(`${mapped.id}:${submission.studentId}`);
          if (!evidence) return submission;
          return {
            ...submission,
            screenImage: text(evidence, "screen_image") || undefined,
            cameraImage: text(evidence, "camera_image") || undefined,
            proofCapturedAt: text(evidence, "captured_at") || undefined,
            proofExpiresAt: text(evidence, "expires_at") || undefined,
          };
        });
        return {
          ...mapped,
          submissions: submissionsWithEvidence,
          status: submissions.some((submission) => text(submission, "status") === "submitted")
            ? "submitted"
            : mapped.status,
        };
      }) ?? demoHomework,
    resources: resourceRows?.map((row) => mapResource(row)) ?? demoResources,
    announcements: announcementRows?.map((row) => mapAnnouncement(row)) ?? demoAnnouncements,
    attendance: attendanceRows?.map((row) => mapAttendance(row)) ?? demoAttendance,
    feedback: feedbackRows?.map((row) => mapFeedback(row)) ?? demoFeedback,
    classJoinEvents: classJoinEventRows?.map((row) => mapClassJoinEvent(row)) ?? demoClassJoinEvents,
    passwordRequests: passwordRequestRows?.map((row) => mapPasswordChangeRequest(row)) ?? demoPasswordChangeRequests,
  };
}
