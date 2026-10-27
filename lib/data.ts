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
  type BatchPause,
  type ClassJoinEvent,
  type ClassRescheduleRequest,
  type ChatMessage,
  type ChatThreadSummary,
  type CourseModule,
  type CourseLevel,
  type CourseSessionStatus,
  type CourseSession,
  type FeedbackItem,
  type HomeworkItem,
  type HomeworkKind,
  type PasswordChangeRequest,
  type PasswordRequestStatus,
  type RescheduleRequestStatus,
  type ResourceItem,
  type ReferralSubmission,
  type ReferralStatus,
  type AttendanceStatus,
  type ResourceType,
  type SubmissionStatus,
  type StudentProfile,
  type StudentCourseEnrollment,
  type BadgeDefinition,
  type StudentBadge,
} from "@/lib/course-data";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getAuthIdentity } from "@/lib/auth";
import { filterUnlockedResources } from "@/lib/content-access";
import { badgeCatalog } from "@/lib/achievements";
import { getCourseworkDetail } from "@/lib/coursework-details";
import { normalizeMeetLink } from "@/lib/meet-links";
import { measureServer } from "@/lib/performance";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { applySessionStatuses } from "@/lib/time";
import {
  activeCourseLevel,
  buildAdminLevelTwoHomework,
  buildCourseCurricula,
  buildLevelTwoHomework,
  levelTwoSessions,
  type CourseLevelCurriculum,
  type LevelTwoSubmissionRow,
} from "@/lib/level-two";
import {
  availabilityBucket,
  buildAvailabilityBucket,
  type AvailabilityDay,
  type ManagedAvailabilitySlot,
} from "@/lib/slot-availability";

export type CurriculumSession = CourseSession & {
  status: CourseSessionStatus;
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
  rescheduleRequests: ClassRescheduleRequest[];
  passwordRequests: PasswordChangeRequest[];
  curricula: CourseLevelCurriculum[];
  activeCourseLevel: CourseLevel;
  coursePlacementAvailable: boolean;
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
  rescheduleRequests: ClassRescheduleRequest[];
  passwordRequests: PasswordChangeRequest[];
};

export type StudentContextData = Pick<
  DashboardData,
  | "student"
  | "batch"
  | "modules"
  | "sessions"
  | "curricula"
  | "activeCourseLevel"
  | "coursePlacementAvailable"
>;

export type StudentShellData = StudentContextData & Pick<
  DashboardData,
  "rescheduleRequests"
> & {
  pendingHomeworkCount: number;
  unreadChatCount: number;
  unseenBadge?: StudentBadge;
};

export type StudentHomeworkDetailData = StudentContextData & {
  homework?: HomeworkItem;
};

export type AdminShellData = Pick<
  AdminData,
  "students" | "batches" | "sessions" | "homework" | "attendance" | "rescheduleRequests" | "passwordRequests"
> & {
  unreadChatCount: number;
};

export type StudentChatData = StudentContextData & {
  messages: ChatMessage[];
};

export type AdminChatData = {
  students: StudentProfile[];
  threads: ChatThreadSummary[];
  selectedStudent?: StudentProfile;
  messages: ChatMessage[];
};

export type MentorScheduleData = Pick<AdminData, "students" | "batches" | "rescheduleRequests">;
export type AdminStudentsData = Pick<AdminData, "students" | "batches" | "modules"> & {
  coursePlacementAvailable: boolean;
};
export type AdminAvailabilityData = {
  bucket: AvailabilityDay[];
  managedSlots: ManagedAvailabilitySlot[];
  usesFallback: boolean;
};
export type AchievementData = {
  definitions: BadgeDefinition[];
  awards: StudentBadge[];
};

function curriculumWithStatus(batch = demoBatch): CurriculumSession[] {
  return applySessionStatuses(sessions, batch);
}

function legacyLevelOneEnrollment(student: StudentProfile): StudentCourseEnrollment {
  return {
    studentId: student.id,
    courseLevel: 1,
    status: "enrolled",
    startsAt: student.enrolledAt,
    startModuleNumber: 1,
    startSessionNumber: 1,
    source: "legacy",
  };
}

function fallbackStudentContext(): StudentContextData {
  const enrollment = legacyLevelOneEnrollment(demoStudent);
  const curricula = buildCourseCurricula({
    modules,
    sessions,
    batch: demoBatch,
    enrollments: [enrollment],
    includeLevelTwo: false,
  });
  const active = curricula[0];
  return {
    student: {
      ...demoStudent,
      courseEnrollments: [enrollment],
      activeCourseLevel: 1,
      coursePlacementAvailable: false,
    },
    batch: demoBatch,
    modules: active.modules,
    sessions: active.sessions,
    curricula,
    activeCourseLevel: 1,
    coursePlacementAvailable: false,
  };
}

function fallbackDashboardData(): DashboardData {
  const context = fallbackStudentContext();
  return {
    ...context,
    homework: demoHomework,
    resources: filterUnlockedResources(demoResources, context.sessions),
    announcements: demoAnnouncements,
    attendance: demoAttendance,
    feedback: demoFeedback,
    rescheduleRequests: [],
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
    rescheduleRequests: [],
    passwordRequests: demoPasswordChangeRequests,
  };
}

type DbRow = Record<string, unknown>;
const CLIENT_INFO_NOTE_PREFIX = "__client_info__:";

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

function optionalNum(row: DbRow, key: string) {
  const value = row[key];
  return typeof value === "number" ? value : undefined;
}

function mapCourseEnrollment(row: DbRow): StudentCourseEnrollment {
  return {
    id: text(row, "id") || undefined,
    studentId: text(row, "student_id"),
    courseLevel: num(row, "course_level", 1) === 2 ? 2 : 1,
    status: text(row, "status", "enrolled") === "not_enrolled" ? "not_enrolled" : "enrolled",
    startsAt: text(row, "starts_at") || undefined,
    endsAt: text(row, "ends_at") || undefined,
    startModuleNumber: optionalNum(row, "start_module_number"),
    startSessionNumber: optionalNum(row, "start_session_number"),
    source: ["promotion", "direct"].includes(text(row, "source"))
      ? text(row, "source") as "promotion" | "direct"
      : "legacy",
    createdAt: text(row, "created_at") || undefined,
    updatedAt: text(row, "updated_at") || undefined,
  };
}

function mapLevelTwoSubmission(row: DbRow): LevelTwoSubmissionRow {
  return {
    activityId: text(row, "activity_id"),
    studentId: text(row, "student_id"),
    status: text(row, "status", "pending") as SubmissionStatus,
    notes: text(row, "notes") || undefined,
    startedAt: text(row, "started_at") || undefined,
    submittedAt: text(row, "submitted_at") || undefined,
    reviewedAt: text(row, "reviewed_at") || undefined,
    reviewedBy: text(row, "reviewed_by") || undefined,
    mentorFeedback: text(row, "mentor_feedback") || undefined,
    timeSpentSeconds: optionalNum(row, "time_spent_seconds"),
    screenImage: text(row, "screen_image") || undefined,
    cameraImage: text(row, "camera_image") || undefined,
    proofText: text(row, "proof_text") || undefined,
    attachmentName: text(row, "attachment_name") || undefined,
    attachmentMime: text(row, "attachment_mime") || undefined,
    attachmentData: text(row, "attachment_data") || undefined,
    proofCapturedAt: text(row, "captured_at") || undefined,
    proofExpiresAt: text(row, "expires_at") || undefined,
    browserName: text(row, "browser_name") || undefined,
    browserVersion: text(row, "browser_version") || undefined,
    osName: text(row, "os_name") || undefined,
    deviceType: text(row, "device_type") || undefined,
    userAgent: text(row, "user_agent") || undefined,
    viewportWidth: optionalNum(row, "viewport_width"),
    viewportHeight: optionalNum(row, "viewport_height"),
    language: text(row, "language") || undefined,
  };
}

function parseSubmissionClientInfo(notes?: string) {
  if (!notes?.startsWith(CLIENT_INFO_NOTE_PREFIX)) return {};

  try {
    const parsed = JSON.parse(notes.slice(CLIENT_INFO_NOTE_PREFIX.length));
    if (!isDbRow(parsed)) return {};

    return {
      userAgent: text(parsed, "userAgent") || undefined,
      browserName: text(parsed, "browserName") || undefined,
      browserVersion: text(parsed, "browserVersion") || undefined,
      osName: text(parsed, "osName") || undefined,
      deviceType: text(parsed, "deviceType") || undefined,
      viewportWidth: num(parsed, "viewportWidth") || undefined,
      viewportHeight: num(parsed, "viewportHeight") || undefined,
      language: text(parsed, "language") || undefined,
    };
  } catch {
    return {};
  }
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
    courseLevel: 1,
    levelOrderIndex: num(row, "order_index"),
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
    courseLevel: 1,
    moduleNumber: Math.ceil(globalNumber / 8),
  };
}

const LEGACY_LEVEL_ONE_MODULE_COUNT = 3;

function isLegacyLevelOneModuleOrder(orderIndex: number) {
  return orderIndex >= 1 && orderIndex <= LEGACY_LEVEL_ONE_MODULE_COUNT;
}

function mapLegacyLevelOneModules(rows: DbRow[]) {
  return rows
    .map((row) => mapModule(row))
    .filter((module) => isLegacyLevelOneModuleOrder(module.orderIndex));
}

function mapLegacyLevelOneSessions(rows: DbRow[]) {
  return rows
    .map((row) => ({
      row,
      moduleOrder: num(relation(row, "modules") ?? {}, "order_index", 99),
      sessionNumber: num(row, "session_number", 99),
    }))
    .filter(({ moduleOrder }) => isLegacyLevelOneModuleOrder(moduleOrder))
    .sort((a, b) => a.moduleOrder - b.moduleOrder || a.sessionNumber - b.sessionNumber)
    .map(({ row }, index) => mapSession(row, index + 1));
}

function mapBatchClassSlot(row: DbRow, batchId: string): BatchClassSlot {
  return {
    id: text(row, "id"),
    batchId,
    label: text(row, "label"),
    dayOfWeek: num(row, "day_of_week"),
    startTime: text(row, "start_time", "17:00"),
    endTime: text(row, "end_time", "18:30"),
    meetLink: normalizeMeetLink(text(row, "meet_link")),
    sortOrder: num(row, "sort_order"),
  };
}

function mapManagedAvailabilitySlot(row: DbRow): ManagedAvailabilitySlot {
  return {
    id: text(row, "id"),
    dayIndex: num(row, "day_of_week"),
    startTime: text(row, "start_time", "00:00").slice(0, 5),
    endTime: text(row, "end_time", "01:00").slice(0, 5),
  };
}

function mapBatchPause(row: DbRow): BatchPause {
  return {
    id: text(row, "id"),
    batchId: text(row, "batch_id"),
    startsOn: text(row, "starts_on"),
    resumesOn: text(row, "resumes_on"),
    reason: text(row, "reason"),
    createdAt: text(row, "created_at"),
  };
}

function attachBatchPauses(batch: Batch, rows: DbRow[] | null | undefined): Batch {
  return {
    ...batch,
    pauses: (rows ?? [])
      .filter((row) => text(row, "batch_id") === batch.id)
      .map(mapBatchPause),
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
    meetLink: normalizeMeetLink(text(row, "meet_link")),
    moduleId: text(row, "module_id"),
    studentsCount,
    classSlots,
    pauses: relationRows(row, "batch_pauses").map(mapBatchPause),
  };
}

function mapStudent(row: DbRow): StudentProfile {
  const profile = relation(row, "profiles");

  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    fullName: text(row, "full_name"),
    email: profile ? text(profile, "email") : text(row, "email"),
    lastSeenAt: profile ? text(profile, "last_seen_at") || undefined : undefined,
    parentName: text(row, "parent_name"),
    parentEmail: text(row, "parent_email"),
    country: text(row, "country", "India"),
    timeZone: text(row, "time_zone", "Asia/Kolkata"),
    batchId: text(row, "batch_id"),
    enrolledAt: text(row, "enrolled_at"),
  };
}

function mapChatMessage(row: DbRow): ChatMessage {
  return {
    id: text(row, "id"),
    studentId: text(row, "student_id"),
    senderRole: text(row, "sender_role", "student") as ChatMessage["senderRole"],
    senderUserId: text(row, "sender_user_id") || undefined,
    kind: text(row, "kind", "text") as ChatMessage["kind"],
    body: text(row, "body"),
    voiceData: text(row, "voice_data") || undefined,
    voiceMime: text(row, "voice_mime") || undefined,
    voiceDurationSeconds: num(row, "voice_duration_seconds") || undefined,
    createdAt: text(row, "created_at"),
    readByStudentAt: text(row, "read_by_student_at") || undefined,
    readByAdminAt: text(row, "read_by_admin_at") || undefined,
  };
}

function mapBadgeDefinition(row: DbRow): BadgeDefinition {
  return {
    id: text(row, "id"),
    slug: text(row, "slug"),
    name: text(row, "name"),
    description: text(row, "description"),
    iconKey: text(row, "icon_key", "award"),
    color: text(row, "color", "#6ee7b7"),
    category: text(row, "category", "curriculum") as BadgeDefinition["category"],
    rarity: text(row, "rarity", "common") as BadgeDefinition["rarity"],
    target: num(row, "target", 1),
    mentorAwarded: Boolean(row.mentor_awarded),
    sortOrder: num(row, "sort_order"),
  };
}

function mapStudentBadge(row: DbRow): StudentBadge | null {
  const definition = relation(row, "badge_definitions");
  if (!definition) return null;
  return {
    id: text(row, "id"),
    studentId: text(row, "student_id"),
    badgeId: text(row, "badge_id"),
    source: text(row, "source", "automatic") as StudentBadge["source"],
    mentorNote: text(row, "mentor_note"),
    awardedAt: text(row, "awarded_at"),
    seenAt: text(row, "seen_at"),
    definition: mapBadgeDefinition(definition),
  };
}

function mapReferral(row: DbRow): ReferralSubmission {
  const student = relation(row, "students");
  return {
    id: text(row, "id"),
    studentId: text(row, "student_id"),
    studentName: student ? text(student, "full_name") : text(row, "student_name"),
    referredName: text(row, "referred_name"),
    referredContact: text(row, "referred_contact"),
    relationship: text(row, "relationship"),
    note: text(row, "note"),
    status: text(row, "status", "pending") as ReferralStatus,
    adminNote: text(row, "admin_note"),
    createdAt: text(row, "created_at"),
    reviewedAt: text(row, "reviewed_at"),
  };
}

function studentContactFromUserMetadata(metadata: unknown) {
  if (!isDbRow(metadata)) return null;
  const contact = isDbRow(metadata.student_contact) ? metadata.student_contact : metadata;
  const parentName = text(contact, "parentName").trim();
  const parentEmail = text(contact, "parentEmail").trim().toLowerCase();
  const country = text(contact, "country").trim();

  if (!parentName && !parentEmail && !country) return null;

  return {
    parentName,
    parentEmail,
    country,
  };
}

function applyStudentContactOverride(
  student: StudentProfile,
  metadata: unknown,
): StudentProfile {
  const contact = studentContactFromUserMetadata(metadata);
  if (!contact) return student;

  return {
    ...student,
    parentName: contact.parentName || student.parentName,
    parentEmail: contact.parentEmail || student.parentEmail,
    country: contact.country || student.country,
  };
}

function mapHomework(row: DbRow, currentStudentId?: string): HomeworkItem {
  const session = relation(row, "sessions");
  const submissions = relationRows(row, "submissions");
  const submission = currentStudentId
    ? (submissions.find((item) => text(item, "student_id") === currentStudentId) ?? null)
    : relation(row, "submissions");
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
    const clientInfo = parseSubmissionClientInfo(text(item, "notes"));
    return {
      studentId: text(item, "student_id"),
      status: text(item, "status", "pending") as SubmissionStatus,
      startedAt: itemStartedAt || undefined,
      submittedAt: itemSubmittedAt || undefined,
      mentorFeedback: text(item, "mentor_feedback") || undefined,
      reviewedAt: text(item, "reviewed_at") || undefined,
      reviewedBy: text(item, "reviewed_by") || undefined,
      timeSpentSeconds:
        itemStartedAt && itemSubmittedAt
          ? Math.max(0, Math.round((new Date(itemSubmittedAt).getTime() - new Date(itemStartedAt).getTime()) / 1000))
          : undefined,
      ...clientInfo,
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
    mentorFeedback: submission ? text(submission, "mentor_feedback") || undefined : undefined,
    reviewedAt: submission ? text(submission, "reviewed_at") || undefined : undefined,
    startedAt: startedAt || undefined,
    submittedAt: submittedAt || undefined,
    timeSpentSeconds,
    submittedCount: submissions.filter((item) => ["submitted", "reviewed"].includes(text(item, "status"))).length,
    averageTimeSpentSeconds:
      completedSubmissionTimes.length > 0
        ? Math.round(completedSubmissionTimes.reduce((sum, value) => sum + value, 0) / completedSubmissionTimes.length)
        : undefined,
    submissions: submissionSummaries,
    courseLevel: 1,
    catalogManaged: false,
  };
}

async function getSubmissionEvidenceRows(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  if (!supabase) return [];

  const expiresAt = new Date().toISOString();
  const coreColumns = "homework_id, student_id, screen_image, camera_image, proof_text, attachment_name, attachment_mime, attachment_data, captured_at, expires_at";
  const coreWithExpiry = await supabase
    .from("submission_evidence")
    .select(coreColumns)
    .gt("expires_at", expiresAt);

  let coreRows: DbRow[] = coreWithExpiry.error ? [] : coreWithExpiry.data ?? [];

  if (coreWithExpiry.error) {
    const coreWithoutExpiry = await supabase
      .from("submission_evidence")
      .select("homework_id, student_id, screen_image, camera_image, proof_text, attachment_name, attachment_mime, attachment_data, captured_at");
    if (!coreWithoutExpiry.error) coreRows = coreWithoutExpiry.data ?? [];
  }

  if (coreRows.length > 0) {
    const metadata = await supabase
      .from("submission_evidence")
      .select("homework_id, student_id, user_agent, browser_name, browser_version, os_name, device_type, viewport_width, viewport_height, language");

    if (!metadata.error) {
      const metadataBySubmission = new Map(
        (metadata.data ?? []).map((row) => [`${text(row, "homework_id")}:${text(row, "student_id")}`, row]),
      );
      return coreRows.map((row) => ({
        ...row,
        ...metadataBySubmission.get(`${text(row, "homework_id")}:${text(row, "student_id")}`),
      }));
    }

    return coreRows;
  }

  const imagesWithExpiry = await supabase
    .from("submission_evidence")
    .select("homework_id, student_id, screen_image, camera_image, captured_at, expires_at")
    .gt("expires_at", expiresAt);

  if (!imagesWithExpiry.error) return imagesWithExpiry.data ?? [];

  const legacy = await supabase
    .from("submission_evidence")
    .select("homework_id, student_id, screen_image, camera_image, captured_at");

  return legacy.data ?? [];
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
    meetLink: normalizeMeetLink(text(row, "meet_link")),
    studentName: student ? text(student, "full_name", "Student") : "Student",
    sessionName: session ? text(session, "title", "Session") : "Session",
  };
}

function mapRescheduleRequest(row: DbRow): ClassRescheduleRequest {
  const student = relation(row, "students");

  return {
    id: text(row, "id"),
    studentId: text(row, "student_id"),
    studentName: student ? text(student, "full_name", "Student") : "Student",
    batchId: text(row, "batch_id"),
    originalDate: text(row, "original_date") || undefined,
    requestedDate: text(row, "requested_date"),
    requestedStartTime: text(row, "requested_start_time"),
    requestedEndTime: text(row, "requested_end_time"),
    requestedTimeZone: text(row, "requested_time_zone"),
    reason: text(row, "reason"),
    status: text(row, "status", "pending") as RescheduleRequestStatus,
    adminNote: text(row, "admin_note"),
    meetLink: normalizeMeetLink(text(row, "meet_link")),
    requestedAt: text(row, "requested_at"),
    reviewedAt: text(row, "reviewed_at"),
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

const getCachedCurriculumRows = unstable_cache(
  async () => {
    const supabase = createServiceRoleSupabaseClient();
    if (!supabase) return null;

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

    return moduleRows && sessionRows ? { moduleRows, sessionRows } : null;
  },
  ["course-curriculum"],
  { revalidate: 3600, tags: ["curriculum"] },
);

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

  const cachedRows = await getCachedCurriculumRows();
  let moduleRows = cachedRows?.moduleRows;
  let sessionRows = cachedRows?.sessionRows;

  if (!moduleRows || !sessionRows) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return { modules, sessions: curriculumWithStatus(batch) };
    const results = await Promise.all([
      supabase
        .from("modules")
        .select("id, title, description, order_index, session_count")
        .order("order_index", { ascending: true }),
      supabase
        .from("sessions")
        .select("id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date, modules(order_index)")
        .order("session_number", { ascending: true }),
    ]);
    moduleRows = results[0].data ?? undefined;
    sessionRows = results[1].data ?? undefined;
  }

  if (!moduleRows || !sessionRows) return { modules, sessions: curriculumWithStatus(batch) };

  const mappedModules = mapLegacyLevelOneModules(moduleRows);
  const sortedSessions = mapLegacyLevelOneSessions(sessionRows);

  return { modules: mappedModules, sessions: applySessionStatuses(sortedSessions, batch) };
}

const studentSelect =
  "id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email, last_seen_at), batches(id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, batch_class_slots(id, label, day_of_week, start_time, end_time, meet_link, sort_order))";
const homeworkSelect =
  "id, session_id, batch_id, assigned_student_id, title, description, kind, content_url, due_date, created_at, sessions(title, module_id), submissions(student_id, status, notes, started_at, submitted_at, reviewed_at, reviewed_by, mentor_feedback)";
const shellHomeworkSelect =
  "id, session_id, batch_id, assigned_student_id, submissions(student_id, status)";
const rescheduleSelect =
  "id, student_id, batch_id, original_date, requested_date, requested_start_time, requested_end_time, requested_time_zone, reason, status, admin_note, meet_link, requested_at, reviewed_at, students(full_name)";
const studentRescheduleSelect =
  "id, student_id, batch_id, original_date, requested_date, requested_start_time, requested_end_time, requested_time_zone, reason, status, admin_note, meet_link, requested_at, reviewed_at";

type ServerSupabaseClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

const optionalCourseSchemaCodes = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function logOptionalCourseError(scope: string, error: { code?: string; message?: string } | null) {
  if (!error || optionalCourseSchemaCodes.has(error.code ?? "")) return;
  console.error(`[${scope}] Optional Level 2 data could not be loaded.`, {
    code: error.code,
    message: error.message,
  });
}

async function loadStudentCourseEnrollments(
  supabase: ServerSupabaseClient,
  studentId: string,
): Promise<{ available: boolean; rows: StudentCourseEnrollment[] }> {
  const result = await supabase
    .from("student_course_enrollments")
    .select("*")
    .eq("student_id", studentId)
    .order("course_level", { ascending: true });
  if (result.error) {
    logOptionalCourseError("student-course-enrollments", result.error);
    return { available: false, rows: [] };
  }
  return { available: true, rows: (result.data ?? []).map((row) => mapCourseEnrollment(row)) };
}

async function loadAllCourseEnrollments(
  supabase: ServerSupabaseClient,
): Promise<{ available: boolean; rows: StudentCourseEnrollment[] }> {
  const result = await supabase
    .from("student_course_enrollments")
    .select("*")
    .order("course_level", { ascending: true });
  if (result.error) {
    logOptionalCourseError("admin-course-enrollments", result.error);
    return { available: false, rows: [] };
  }
  return { available: true, rows: (result.data ?? []).map((row) => mapCourseEnrollment(row)) };
}

async function loadLevelTwoSubmissions(
  supabase: ServerSupabaseClient,
  studentId: string,
): Promise<LevelTwoSubmissionRow[]> {
  const result = await supabase
    .from("course_activity_submissions")
    .select("*")
    .eq("student_id", studentId);
  if (result.error) {
    logOptionalCourseError("level-two-submissions", result.error);
    return [];
  }
  return (result.data ?? []).map((row) => mapLevelTwoSubmission(row));
}

async function loadAllLevelTwoSubmissions(
  supabase: ServerSupabaseClient,
): Promise<{ available: boolean; rows: LevelTwoSubmissionRow[] }> {
  const result = await supabase
    .from("course_activity_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (result.error) {
    logOptionalCourseError("admin-level-two-submissions", result.error);
    return { available: false, rows: [] };
  }
  return {
    available: true,
    rows: (result.data ?? []).map((row) => mapLevelTwoSubmission(row)),
  };
}

async function loadLevelTwoAttendance(
  supabase: ServerSupabaseClient,
  studentId: string,
): Promise<AttendanceItem[]> {
  const result = await supabase
    .from("course_session_attendance")
    .select("*")
    .eq("student_id", studentId);
  if (result.error) {
    logOptionalCourseError("level-two-attendance", result.error);
    return [];
  }
  return (result.data ?? []).map((row) => ({
    id: text(row, "id"),
    sessionId: text(row, "session_id"),
    studentId: text(row, "student_id"),
    status: text(row, "status", "present") as AttendanceStatus,
    date: text(row, "class_date") || text(row, "date"),
  }));
}

async function loadAllLevelTwoAttendance(
  supabase: ServerSupabaseClient,
): Promise<AttendanceItem[]> {
  const result = await supabase
    .from("course_session_attendance")
    .select("*");
  if (result.error) {
    logOptionalCourseError("admin-level-two-attendance", result.error);
    return [];
  }
  return (result.data ?? []).map((row) => ({
    id: text(row, "id"),
    sessionId: text(row, "session_id"),
    studentId: text(row, "student_id"),
    status: text(row, "status", "present") as AttendanceStatus,
    date: text(row, "class_date") || text(row, "date"),
  }));
}

async function loadAllLevelTwoClassJoinEvents(
  supabase: ServerSupabaseClient,
): Promise<ClassJoinEvent[]> {
  const result = await supabase
    .from("course_class_join_events")
    .select("id, session_id, student_id, batch_id, joined_at, class_date, meet_link, students(full_name)")
    .order("joined_at", { ascending: false })
    .limit(20);
  if (result.error) {
    logOptionalCourseError("admin-level-two-class-joins", result.error);
    return [];
  }
  return (result.data ?? []).map((row) => {
    const student = relation(row, "students");
    const sessionId = text(row, "session_id");
    return {
      id: text(row, "id"),
      sessionId,
      studentId: text(row, "student_id"),
      batchId: text(row, "batch_id"),
      joinedAt: text(row, "joined_at"),
      classDate: text(row, "class_date"),
      meetLink: normalizeMeetLink(text(row, "meet_link")),
      studentName: student ? text(student, "full_name", "Student") : "Student",
      sessionName: levelTwoSessions.find((session) => session.id === sessionId)?.title ?? "Level 2 session",
    };
  });
}

function attachCourseEnrollmentState(
  studentsToAttach: StudentProfile[],
  result: { available: boolean; rows: StudentCourseEnrollment[] },
  now = new Date(),
) {
  const enrollmentsByStudent = new Map<string, StudentCourseEnrollment[]>();
  for (const enrollment of result.rows) {
    const stored = enrollmentsByStudent.get(enrollment.studentId) ?? [];
    stored.push(enrollment);
    enrollmentsByStudent.set(enrollment.studentId, stored);
  }

  return studentsToAttach.map((student) => {
    const stored = enrollmentsByStudent.get(student.id) ?? [];
    const courseEnrollments = stored.length ? stored : [legacyLevelOneEnrollment(student)];
    return {
      ...student,
      courseEnrollments,
      activeCourseLevel: activeCourseLevel(courseEnrollments, now),
      coursePlacementAvailable: result.available,
    };
  });
}

async function loadStudentRescheduleRequests(
  studentId: string,
  authenticatedClient: ServerSupabaseClient,
): Promise<ClassRescheduleRequest[]> {
  const authenticatedResult = await authenticatedClient
    .from("class_reschedule_requests")
    .select(studentRescheduleSelect)
    .eq("student_id", studentId)
    .order("requested_at", { ascending: false })
    .limit(50);

  if (!authenticatedResult.error && (authenticatedResult.data?.length ?? 0) > 0) {
    return (authenticatedResult.data ?? []).map((row) => mapRescheduleRequest(row));
  }

  const serviceClient = createServiceRoleSupabaseClient();
  if (!serviceClient) {
    if (authenticatedResult.error) {
      console.error("[student-reschedules] Student request loading failed.", {
        code: authenticatedResult.error.code,
        message: authenticatedResult.error.message,
      });
    }
    return [];
  }

  const serviceResult = await serviceClient
    .from("class_reschedule_requests")
    .select(studentRescheduleSelect)
    .eq("student_id", studentId)
    .order("requested_at", { ascending: false })
    .limit(50);

  if (serviceResult.error) {
    console.error("[student-reschedules] Fallback request loading failed.", {
      code: serviceResult.error.code,
      message: serviceResult.error.message,
    });
    return [];
  }

  return (serviceResult.data ?? []).map((row) => mapRescheduleRequest(row));
}

const getCachedStudentRow = unstable_cache(
  async (userId: string) => {
    const supabase = createServiceRoleSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase
      .from("students")
      .select(studentSelect)
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  },
  ["student-context-row"],
  { revalidate: 30, tags: ["student-context"] },
);

const getCachedBatchPauseRows = unstable_cache(
  async (batchId: string) => {
    const supabase = createServiceRoleSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("batch_pauses")
      .select("id, batch_id, starts_on, resumes_on, reason, created_at")
      .eq("batch_id", batchId);
    return data ?? [];
  },
  ["batch-pause-rows"],
  { revalidate: 30, tags: ["batch-pauses"] },
);

async function getStudentContextImpl(): Promise<StudentContextData> {
  const fallback = fallbackStudentContext();
  if (!isSupabaseConfigured()) {
    return fallback;
  }

  const identity = await getAuthIdentity();
  const userId = identity?.userId;
  const userMetadata = identity?.userMetadata;

  if (!userId) {
    return fallback;
  }

  let studentRow = await getCachedStudentRow(userId);

  if (!studentRow) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return fallback;
    }
    const { data: ownedStudentRow } = await supabase
      .from("students")
      .select(studentSelect)
      .eq("user_id", userId)
      .maybeSingle();
    studentRow = ownedStudentRow;
  }

  if (!studentRow) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return fallback;
    }
    const { data: firstStudentRow } = await supabase
      .from("students")
      .select(studentSelect)
      .limit(1)
      .maybeSingle();

    studentRow = firstStudentRow;
  }

  if (!studentRow) {
    return fallback;
  }

  const effectiveStudent = applyStudentContactOverride(mapStudent(studentRow), userMetadata);

  const batchRow = relation(studentRow, "batches");
  let effectiveBatch = batchRow ? mapBatch(batchRow) : fallback.batch;
  const pauseRows = effectiveBatch.id ? await getCachedBatchPauseRows(effectiveBatch.id) : [];
  effectiveBatch = attachBatchPauses(effectiveBatch, pauseRows);
  const curriculum = await getCurriculum(effectiveBatch);

  const courseClient = await createServerSupabaseClient();
  const enrollmentResult = courseClient
    ? await loadStudentCourseEnrollments(courseClient, effectiveStudent.id)
    : { available: false, rows: [] as StudentCourseEnrollment[] };
  const levelTwoEnrollment = enrollmentResult.rows.find((item) => item.courseLevel === 2);
  const levelOneEnrollment = enrollmentResult.rows.find((item) => item.courseLevel === 1)
    ?? (levelTwoEnrollment?.source === "direct"
      ? {
          studentId: effectiveStudent.id,
          courseLevel: 1 as const,
          status: "not_enrolled" as const,
          source: "direct" as const,
        }
      : {
          ...legacyLevelOneEnrollment(effectiveStudent),
          endsAt: levelTwoEnrollment?.startsAt,
        });
  const enrollments = [
    levelOneEnrollment,
    ...enrollmentResult.rows.filter((item) => item.courseLevel === 2),
  ];
  const curricula = buildCourseCurricula({
    modules: curriculum.modules,
    sessions: curriculum.sessions,
    batch: effectiveBatch,
    enrollments,
    includeLevelTwo: enrollmentResult.available,
  });
  const activeLevel = activeCourseLevel(enrollments);
  const activeCurriculum = curricula.find((item) => item.level === activeLevel) ?? curricula[0];
  const studentWithPlacement: StudentProfile = {
    ...effectiveStudent,
    courseEnrollments: enrollments,
    activeCourseLevel: activeLevel,
    coursePlacementAvailable: enrollmentResult.available,
  };

  return {
    student: studentWithPlacement,
    batch: effectiveBatch,
    modules: activeCurriculum.modules,
    sessions: activeCurriculum.sessions,
    curricula,
    activeCourseLevel: activeLevel,
    coursePlacementAvailable: enrollmentResult.available,
  };
}

export const getStudentContextData = cache(() => measureServer("student.context", getStudentContextImpl));

function emptyStudentData(context: StudentContextData): DashboardData {
  return {
    ...context,
    homework: [],
    resources: [],
    announcements: [],
    attendance: [],
    feedback: [],
    rescheduleRequests: [],
    passwordRequests: [],
  };
}

function withLevelOneHomeworkAccess(
  context: StudentContextData,
  homework: HomeworkItem[],
) {
  const levelOne = context.curricula.find((curriculum) => curriculum.level === 1);
  const sessionMap = new Map(levelOne?.sessions.map((session) => [session.id, session]));
  return homework
    .filter((item) => sessionMap.has(item.sessionId))
    .map((item) => {
      const session = sessionMap.get(item.sessionId);
      const accessState = session?.status === "not_enrolled"
        ? "not_enrolled" as const
        : session?.status === "skipped"
          ? "skipped" as const
          : session?.status === "locked"
            ? "locked" as const
            : "available" as const;
      return {
        ...item,
        courseLevel: 1 as const,
        moduleNumber: session?.moduleNumber ?? item.moduleNumber,
        accessState,
      };
    });
}

async function getLevelTwoHomeworkForContext(
  context: StudentContextData,
  supabase: ServerSupabaseClient,
) {
  const levelTwo = context.curricula.find((curriculum) => curriculum.level === 2);
  if (!levelTwo) return [];
  const submissions = await loadLevelTwoSubmissions(supabase, context.student.id);
  return buildLevelTwoHomework({
    batch: context.batch,
    sessions: levelTwo.sessions,
    submissions,
    studentId: context.student.id,
  });
}

async function getStudentDashboardDataImpl(): Promise<DashboardData> {
  const context = await getStudentContextData();
  if (!isSupabaseConfigured()) return fallbackDashboardData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return fallbackDashboardData();
  const { student: effectiveStudent, batch: effectiveBatch, sessions: curriculumSessions } = context;

  const [
    { data: homeworkRows },
    { data: resourceRows },
    { data: announcementRows },
    { data: attendanceRows },
    { data: feedbackRows },
    rescheduleRequests,
    { data: passwordRequestRows },
  ] =
    await Promise.all([
      supabase
        .from("homework")
        .select(homeworkSelect)
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
      loadStudentRescheduleRequests(effectiveStudent.id, supabase),
      supabase
        .from("password_change_requests")
        .select("id, student_id, status, reason, admin_note, requested_at, reviewed_at, used_at, students(full_name)")
        .eq("student_id", effectiveStudent.id)
        .order("requested_at", { ascending: false })
        .limit(5),
    ]);

  const levelOneHomework = withLevelOneHomeworkAccess(
    context,
    homeworkRows?.map((row) => mapHomework(row, effectiveStudent.id)) ?? demoHomework,
  );
  const levelTwoHomework = await getLevelTwoHomeworkForContext(context, supabase);
  const homework = [...levelOneHomework, ...levelTwoHomework];
  const resources = filterUnlockedResources(resourceRows?.map((row) => mapResource(row)) ?? demoResources, curriculumSessions);
  const feedback = feedbackRows?.map((row) => mapFeedback(row)) ?? demoFeedback;
  const attendance = [
    ...(attendanceRows?.map((row) => mapAttendance(row)) ?? demoAttendance),
    ...(await loadLevelTwoAttendance(supabase, effectiveStudent.id)),
  ];

  return {
    ...context,
    homework,
    resources,
    announcements: announcementRows?.map((row) => mapAnnouncement(row)) ?? demoAnnouncements,
    attendance,
    feedback,
    rescheduleRequests,
    passwordRequests: passwordRequestRows?.map((row) => mapPasswordChangeRequest(row)) ?? demoPasswordChangeRequests,
  };
}

export const getStudentDashboardData = cache(() => measureServer("student.dashboard", getStudentDashboardDataImpl));

async function getStudentHomeworkDataImpl() {
  const context = await getStudentContextData();
  const data = emptyStudentData(context);
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ...data, homework: demoHomework };
  const { data: rows } = await supabase
    .from("homework")
    .select(homeworkSelect)
    .or(`batch_id.eq.${context.batch.id},assigned_student_id.eq.${context.student.id},and(batch_id.is.null,assigned_student_id.is.null)`)
    .order("due_date", { ascending: true });
  const levelOneHomework = withLevelOneHomeworkAccess(
    context,
    rows?.map((row) => mapHomework(row, context.student.id)) ?? demoHomework,
  );
  const levelTwoHomework = await getLevelTwoHomeworkForContext(context, supabase);
  return { ...data, homework: [...levelOneHomework, ...levelTwoHomework] };
}

export const getStudentHomeworkData = cache(() => measureServer("student.homework", getStudentHomeworkDataImpl));

async function getStudentHomeworkDetailDataImpl(homeworkId: string): Promise<StudentHomeworkDetailData> {
  const context = await getStudentContextData();
  if (homeworkId.startsWith("l2-")) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return { ...context };
    const homework = (await getLevelTwoHomeworkForContext(context, supabase))
      .find((item) => item.id === homeworkId);
    return homework ? { ...context, homework } : { ...context };
  }
  const fallbackHomework = demoHomework.find((item) => item.id === homeworkId);
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ...context, homework: fallbackHomework };

  const { data: row } = await supabase
    .from("homework")
    .select(homeworkSelect)
    .eq("id", homeworkId)
    .or(`batch_id.eq.${context.batch.id},assigned_student_id.eq.${context.student.id},and(batch_id.is.null,assigned_student_id.is.null)`)
    .maybeSingle();

  if (!row) return { ...context };
  const homework = withLevelOneHomeworkAccess(context, [mapHomework(row, context.student.id)])[0];
  return { ...context, homework };
}

export const getStudentHomeworkDetailData = cache((homeworkId: string) =>
  measureServer("student.homework-detail", () => getStudentHomeworkDetailDataImpl(homeworkId)),
);

async function getStudentResourcesDataImpl() {
  const context = await getStudentContextData();
  const data = emptyStudentData(context);
  const levelOneSessions = context.curricula.find((curriculum) => curriculum.level === 1)?.sessions
    ?? context.sessions;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      ...data,
      resources: filterUnlockedResources(demoResources, levelOneSessions),
    };
  }
  const { data: rows } = await supabase
    .from("resources")
    .select("id, module_id, session_id, title, type, url, created_at, sessions(title)")
    .order("created_at", { ascending: false });
  return {
    ...data,
    resources: filterUnlockedResources(
      rows?.map((row) => mapResource(row)) ?? demoResources,
      levelOneSessions,
    ),
  };
}

export const getStudentResourcesData = cache(() => measureServer("student.resources", getStudentResourcesDataImpl));

async function getStudentClassDataImpl() {
  const context = await getStudentContextData();
  const enrolledTimeline = context.curricula.flatMap((curriculum) =>
    curriculum.sessions.filter(
      (session) => session.status !== "skipped" && session.status !== "not_enrolled",
    ),
  );
  const data = {
    ...emptyStudentData(context),
    sessions: enrolledTimeline,
  };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return data;
  const rescheduleRequests = await loadStudentRescheduleRequests(context.student.id, supabase);
  return { ...data, rescheduleRequests };
}

export const getStudentClassData = cache(() => measureServer("student.class", getStudentClassDataImpl));

async function getStudentProgressDataImpl() {
  const context = await getStudentContextData();
  const data = await getStudentHomeworkData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ...data, attendance: demoAttendance, feedback: demoFeedback };
  const [{ data: attendanceRows }, { data: feedbackRows }] = await Promise.all([
    supabase
      .from("attendance")
      .select("id, session_id, student_id, status, date")
      .eq("student_id", context.student.id),
    supabase
      .from("feedback")
      .select("id, student_id, session_id, tutor_note, created_at, sessions(title)")
      .eq("student_id", context.student.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  return {
    ...data,
    attendance: [
      ...(attendanceRows?.map((row) => mapAttendance(row)) ?? demoAttendance),
      ...(await loadLevelTwoAttendance(supabase, context.student.id)),
    ],
    feedback: feedbackRows?.map((row) => mapFeedback(row)) ?? demoFeedback,
  };
}

export const getStudentProgressData = cache(() => measureServer("student.progress", getStudentProgressDataImpl));

async function getStudentAchievementDataImpl(): Promise<AchievementData> {
  const context = await getStudentContextData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { definitions: badgeCatalog, awards: [] };
  const [{ data: definitionRows }, { data: awardRows }] = await Promise.all([
    supabase.from("badge_definitions").select("*").order("sort_order"),
    supabase
      .from("student_badges")
      .select("id, student_id, badge_id, source, mentor_note, awarded_at, seen_at, badge_definitions(*)")
      .eq("student_id", context.student.id)
      .order("awarded_at", { ascending: false }),
  ]);
  return {
    definitions: definitionRows?.length ? definitionRows.map(mapBadgeDefinition) : badgeCatalog,
    awards: (awardRows ?? []).map(mapStudentBadge).filter((item): item is StudentBadge => Boolean(item)),
  };
}

export const getStudentAchievementData = cache(() =>
  measureServer("student.achievements", getStudentAchievementDataImpl),
);

async function getAdminAchievementDataImpl(): Promise<AchievementData> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { definitions: badgeCatalog, awards: [] };
  const [{ data: definitionRows }, { data: awardRows }] = await Promise.all([
    supabase.from("badge_definitions").select("*").order("sort_order"),
    supabase
      .from("student_badges")
      .select("id, student_id, badge_id, source, mentor_note, awarded_at, seen_at, badge_definitions(*)")
      .order("awarded_at", { ascending: false }),
  ]);
  return {
    definitions: definitionRows?.length ? definitionRows.map(mapBadgeDefinition) : badgeCatalog,
    awards: (awardRows ?? []).map(mapStudentBadge).filter((item): item is StudentBadge => Boolean(item)),
  };
}

export const getAdminAchievementData = cache(() =>
  measureServer("admin.achievements", getAdminAchievementDataImpl),
);

export async function getStudentReferralData(): Promise<ReferralSubmission[]> {
  const context = await getStudentContextData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("referrals")
    .select("id, student_id, referred_name, referred_contact, relationship, note, status, admin_note, created_at, reviewed_at")
    .eq("student_id", context.student.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data?.map((row) => mapReferral(row)) ?? [];
}

export async function getAdminReferralData(): Promise<ReferralSubmission[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("referrals")
    .select("id, student_id, referred_name, referred_contact, relationship, note, status, admin_note, created_at, reviewed_at, students(full_name)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data?.map((row) => mapReferral(row)) ?? [];
}

export async function getStudentChatData(): Promise<StudentChatData> {
  const context = await getStudentContextData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ...context, messages: [] };

  const { data } = await supabase
    .from("chat_messages")
    .select("id, student_id, sender_role, sender_user_id, kind, body, voice_data, voice_mime, voice_duration_seconds, created_at, read_by_student_at, read_by_admin_at")
    .eq("student_id", context.student.id)
    .order("created_at", { ascending: true })
    .limit(200);

  return {
    ...context,
    messages: data?.map((row) => mapChatMessage(row)) ?? [],
  };
}

export async function getAdminChatData(selectedStudentId?: string): Promise<AdminChatData> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { students: [demoStudent], threads: [], selectedStudent: demoStudent, messages: [] };
  }

  const [{ data: studentRows }, { data: messageRows }] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email, last_seen_at)")
      .order("full_name", { ascending: true }),
    supabase
      .from("chat_messages")
      .select("id, student_id, sender_role, sender_user_id, kind, body, voice_data, voice_mime, voice_duration_seconds, created_at, read_by_student_at, read_by_admin_at")
      .order("created_at", { ascending: false })
      .limit(600),
  ]);

  const students = studentRows?.map((row) => mapStudent(row)) ?? [];
  const messagesDescending = messageRows?.map((row) => mapChatMessage(row)) ?? [];
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const grouped = new Map<string, ChatMessage[]>();

  for (const message of messagesDescending) {
    const bucket = grouped.get(message.studentId) ?? [];
    bucket.push(message);
    grouped.set(message.studentId, bucket);
  }

  const threads = students
    .map((student) => {
      const messages = grouped.get(student.id) ?? [];
      const unreadCount = messages.filter(
        (message) => message.senderRole === "student" && !message.readByAdminAt,
      ).length;
      return {
        student,
        lastMessage: messages[0],
        unreadCount,
      };
    })
    .sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime || a.student.fullName.localeCompare(b.student.fullName);
    });

  const selectedStudent =
    (selectedStudentId ? studentMap.get(selectedStudentId) : undefined) ??
    threads.find((thread) => thread.unreadCount > 0)?.student ??
    threads[0]?.student ??
    students[0];

  if (!selectedStudent) return { students, threads, messages: [] };

  const selectedMessages = (grouped.get(selectedStudent.id) ?? [])
    .slice()
    .reverse()
    .slice(-200);

  return {
    students,
    threads,
    selectedStudent,
    messages: selectedMessages,
  };
}

async function getStudentProfileDataImpl() {
  const context = await getStudentContextData();
  const data = emptyStudentData(context);
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ...data, passwordRequests: demoPasswordChangeRequests };
  const { data: rows } = await supabase
    .from("password_change_requests")
    .select("id, student_id, status, reason, admin_note, requested_at, reviewed_at, used_at, students(full_name)")
    .eq("student_id", context.student.id)
    .order("requested_at", { ascending: false })
    .limit(5);
  return {
    ...data,
    passwordRequests: rows?.map((row) => mapPasswordChangeRequest(row)) ?? demoPasswordChangeRequests,
  };
}

export const getStudentProfileData = cache(() => measureServer("student.profile", getStudentProfileDataImpl));

async function getStudentShellDataImpl(): Promise<StudentShellData> {
  const context = await getStudentContextData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      ...context,
      pendingHomeworkCount: demoHomework
        .filter((item) => item.status === "pending" || item.status === "revision_requested").length,
      unreadChatCount: 0,
      rescheduleRequests: [],
    };
  }
  const homeworkQuery = supabase
    .from("homework")
    .select(shellHomeworkSelect)
    .or(`batch_id.eq.${context.batch.id},assigned_student_id.eq.${context.student.id},and(batch_id.is.null,assigned_student_id.is.null)`);
  const [{ data: homeworkRows }, rescheduleRequests, { data: unseenRows }, chatUnread] = await Promise.all([
    homeworkQuery,
    loadStudentRescheduleRequests(context.student.id, supabase),
    supabase
      .from("student_badges")
      .select("id, student_id, badge_id, source, mentor_note, awarded_at, seen_at, badge_definitions(*)")
      .eq("student_id", context.student.id)
      .is("seen_at", null)
      .order("awarded_at", { ascending: true })
      .limit(1),
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("student_id", context.student.id)
      .eq("sender_role", "admin")
      .is("read_by_student_at", null),
  ]);
  const actionableSessionIds = new Set(
    context.sessions
      .filter((session) => session.status === "completed" || session.status === "current")
      .map((session) => session.id),
  );
  const pendingLevelOneCount = context.activeCourseLevel === 1 ? (homeworkRows ?? []).filter((row) => {
    if (!actionableSessionIds.has(text(row, "session_id"))) return false;
    const submission = relationRows(row, "submissions")
      .find((item) => text(item, "student_id") === context.student.id);
    const status = submission ? text(submission, "status", "pending") : "pending";
    return status === "pending" || status === "revision_requested";
  }).length : 0;
  const levelTwoHomework = context.activeCourseLevel === 2
    ? await getLevelTwoHomeworkForContext(context, supabase)
    : [];
  const pendingHomeworkCount = pendingLevelOneCount + levelTwoHomework.filter(
    (item) => item.accessState === "available" &&
      (item.status === "pending" || item.status === "revision_requested"),
  ).length;
  const unseenBadge = unseenRows?.[0] ? mapStudentBadge(unseenRows[0]) ?? undefined : undefined;
  return {
    ...context,
    pendingHomeworkCount,
    unreadChatCount: chatUnread.count ?? 0,
    rescheduleRequests,
    unseenBadge,
  };
}

export const getStudentShellData = cache(() => measureServer("student.shell", getStudentShellDataImpl));

async function getAdminShellDataImpl(): Promise<AdminShellData> {
  if (!isSupabaseConfigured()) {
    const fallback = fallbackAdminData();
    return {
      students: fallback.students,
      batches: fallback.batches,
      sessions: fallback.sessions,
      homework: fallback.homework,
      attendance: fallback.attendance,
      rescheduleRequests: fallback.rescheduleRequests,
      passwordRequests: fallback.passwordRequests,
      unreadChatCount: 0,
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    const fallback = fallbackAdminData();
    return {
      students: fallback.students,
      batches: fallback.batches,
      sessions: fallback.sessions,
      homework: fallback.homework,
      attendance: fallback.attendance,
      rescheduleRequests: fallback.rescheduleRequests,
      passwordRequests: fallback.passwordRequests,
      unreadChatCount: 0,
    };
  }

  const [
    { data: studentRows },
    { data: batchRows },
    { data: sessionRows },
    { data: homeworkRows },
    { data: attendanceRows },
    { data: rescheduleRequestRows },
    { data: passwordRequestRows },
    { data: pauseRows },
    chatUnread,
    enrollmentResult,
    levelTwoAttendance,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email, last_seen_at)")
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("batches")
      .select("id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, students(id), batch_class_slots(id, label, day_of_week, start_time, end_time, meet_link, sort_order)")
      .order("created_at", { ascending: false }),
    supabase
      .from("sessions")
      .select("id, module_id, title, session_number, focus, tools_covered, student_output, description, session_date, modules(order_index)")
      .order("session_number", { ascending: true }),
    supabase
      .from("homework")
      .select(homeworkSelect)
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("id, session_id, student_id, status, date"),
    supabase
      .from("class_reschedule_requests")
      .select(rescheduleSelect)
      .order("requested_at", { ascending: false })
      .limit(30),
    supabase
      .from("password_change_requests")
      .select("id, student_id, status, reason, admin_note, requested_at, reviewed_at, used_at, students(full_name)")
      .order("requested_at", { ascending: false })
      .limit(20),
    supabase
      .from("batch_pauses")
      .select("id, batch_id, starts_on, resumes_on, reason, created_at"),
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_role", "student")
      .is("read_by_admin_at", null),
    loadAllCourseEnrollments(supabase),
    loadAllLevelTwoAttendance(supabase),
  ]);

  const mappedSessions = mapLegacyLevelOneSessions(sessionRows ?? []);
  const effectiveSessions = mappedSessions.length ? mappedSessions : sessions;
  const legacySessionIds = mappedSessions.length
    ? new Set(mappedSessions.map((session) => session.id))
    : null;

  return {
    students: attachCourseEnrollmentState(
      studentRows?.map((row) => mapStudent(row)) ?? [demoStudent],
      enrollmentResult,
    ),
    batches: batchRows?.map((row) => attachBatchPauses(
      mapBatch(row, relationRows(row, "students").length),
      pauseRows,
    )) ?? [demoBatch],
    sessions: effectiveSessions,
    homework: homeworkRows
      ?.map((row) => {
        const mapped = mapHomework(row);
        return {
          ...mapped,
          status: relationRows(row, "submissions").some((submission) => text(submission, "status") === "submitted")
            ? "submitted" as const
            : mapped.status,
        };
      })
      .filter((item) => !legacySessionIds || legacySessionIds.has(item.sessionId)) ?? demoHomework,
    attendance: [
      ...(attendanceRows?.map((row) => mapAttendance(row)) ?? demoAttendance),
      ...levelTwoAttendance,
    ],
    rescheduleRequests: rescheduleRequestRows?.map((row) => mapRescheduleRequest(row)) ?? [],
    passwordRequests: passwordRequestRows?.map((row) => mapPasswordChangeRequest(row)) ?? demoPasswordChangeRequests,
    unreadChatCount: chatUnread.count ?? 0,
  };
}

export const getAdminShellData = cache(() => measureServer("admin.shell", getAdminShellDataImpl));

async function getAdminStudentsDataImpl(): Promise<AdminStudentsData> {
  if (!isSupabaseConfigured()) {
    const fallback = fallbackAdminData();
    return { students: fallback.students, batches: fallback.batches, modules: fallback.modules, coursePlacementAvailable: false };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    const fallback = fallbackAdminData();
    return { students: fallback.students, batches: fallback.batches, modules: fallback.modules, coursePlacementAvailable: false };
  }
  const [
    { data: studentRows },
    { data: batchRows },
    { data: moduleRows },
    { data: pauseRows },
    enrollmentResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email, last_seen_at)")
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
      .from("batch_pauses")
      .select("id, batch_id, starts_on, resumes_on, reason, created_at"),
    loadAllCourseEnrollments(supabase),
  ]);
  const enrollmentsByStudent = new Map<string, StudentCourseEnrollment[]>();
  for (const enrollment of enrollmentResult.rows) {
    const studentEnrollments = enrollmentsByStudent.get(enrollment.studentId) ?? [];
    studentEnrollments.push(enrollment);
    enrollmentsByStudent.set(enrollment.studentId, studentEnrollments);
  }
  return {
    students: studentRows?.map((row) => {
      const student = mapStudent(row);
      const stored = enrollmentsByStudent.get(student.id) ?? [];
      const enrollments = stored.length
        ? stored
        : [legacyLevelOneEnrollment(student)];
      return {
        ...student,
        courseEnrollments: enrollments,
        activeCourseLevel: activeCourseLevel(enrollments),
        coursePlacementAvailable: enrollmentResult.available,
      };
    }) ?? [{ ...demoStudent, coursePlacementAvailable: false }],
    batches: batchRows?.map((row) => attachBatchPauses(
      mapBatch(row, relationRows(row, "students").length),
      pauseRows,
    )) ?? [demoBatch],
    modules: moduleRows ? mapLegacyLevelOneModules(moduleRows) : modules,
    coursePlacementAvailable: enrollmentResult.available,
  };
}

export const getAdminStudentsData = cache(() =>
  measureServer("admin.students", getAdminStudentsDataImpl),
);

async function getAdminAvailabilityDataImpl(): Promise<AdminAvailabilityData> {
  if (!isSupabaseConfigured()) {
    return { bucket: availabilityBucket, managedSlots: [], usesFallback: true };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { bucket: availabilityBucket, managedSlots: [], usesFallback: true };
  }

  const { data: rows, error } = await supabase
    .from("admin_availability_slots")
    .select("id, day_of_week, start_time, end_time")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !rows) {
    return { bucket: availabilityBucket, managedSlots: [], usesFallback: true };
  }

  const managedSlots = rows.map((row) => mapManagedAvailabilitySlot(row));
  return {
    bucket: buildAvailabilityBucket(managedSlots),
    managedSlots,
    usesFallback: false,
  };
}

export const getAdminAvailabilityData = cache(() =>
  measureServer("admin.availability", getAdminAvailabilityDataImpl),
);

async function getAdminDataImpl(): Promise<AdminData> {
  if (!isSupabaseConfigured()) return fallbackAdminData();

  const supabase = await createServerSupabaseClient();
  if (!supabase) return fallbackAdminData();

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
    { data: rescheduleRequestRows },
    { data: passwordRequestRows },
    { data: pauseRows },
    enrollmentResult,
    levelTwoAttendance,
    levelTwoClassJoinEvents,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email, last_seen_at)")
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
      .select(homeworkSelect)
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
      .from("class_reschedule_requests")
      .select("id, student_id, batch_id, original_date, requested_date, requested_start_time, requested_end_time, requested_time_zone, reason, status, admin_note, meet_link, requested_at, reviewed_at, students(full_name)")
      .order("requested_at", { ascending: false })
      .limit(30),
    supabase
      .from("password_change_requests")
      .select("id, student_id, status, reason, admin_note, requested_at, reviewed_at, used_at, students(full_name)")
      .order("requested_at", { ascending: false })
      .limit(20),
    supabase
      .from("batch_pauses")
      .select("id, batch_id, starts_on, resumes_on, reason, created_at"),
    loadAllCourseEnrollments(supabase),
    loadAllLevelTwoAttendance(supabase),
    loadAllLevelTwoClassJoinEvents(supabase),
  ]);

  const mappedModules = mapLegacyLevelOneModules(moduleRows ?? []);
  const mappedSessions = mapLegacyLevelOneSessions(sessionRows ?? []);
  const effectiveSessions = mappedSessions.length ? mappedSessions : sessions;
  const legacySessionIds = mappedSessions.length
    ? new Set(mappedSessions.map((session) => session.id))
    : null;

  return {
    students: attachCourseEnrollmentState(
      studentRows?.map((row) => mapStudent(row)) ?? [demoStudent],
      enrollmentResult,
    ),
    batches:
      batchRows?.map((row) => attachBatchPauses(
        mapBatch(row, relationRows(row, "students").length),
        pauseRows,
      )) ?? [demoBatch],
    modules: mappedModules.length ? mappedModules : modules,
    sessions: effectiveSessions,
    homework:
      homeworkRows?.map((row) => {
        const mapped = mapHomework(row);
        const submissions = relationRows(row, "submissions");
        return {
          ...mapped,
          status: submissions.some((submission) => text(submission, "status") === "submitted")
            ? "submitted"
            : mapped.status,
        };
      }).filter((item) => !legacySessionIds || legacySessionIds.has(item.sessionId)) ?? demoHomework,
    resources: resourceRows?.map((row) => mapResource(row)) ?? demoResources,
    announcements: announcementRows?.map((row) => mapAnnouncement(row)) ?? demoAnnouncements,
    attendance: [
      ...(attendanceRows?.map((row) => mapAttendance(row)) ?? demoAttendance),
      ...levelTwoAttendance,
    ],
    feedback: feedbackRows?.map((row) => mapFeedback(row)) ?? demoFeedback,
    classJoinEvents: [
      ...(classJoinEventRows?.map((row) => mapClassJoinEvent(row)) ?? demoClassJoinEvents),
      ...levelTwoClassJoinEvents,
    ].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 20),
    rescheduleRequests: rescheduleRequestRows?.map((row) => mapRescheduleRequest(row)) ?? [],
    passwordRequests: passwordRequestRows?.map((row) => mapPasswordChangeRequest(row)) ?? demoPasswordChangeRequests,
  };
}

export const getAdminData = cache(() => measureServer("admin.page", getAdminDataImpl));

async function getAdminHomeworkDataImpl(): Promise<AdminData> {
  const data = await getAdminData();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return data;

  const [evidenceRows, enrollmentResult, levelTwoSubmissionResult] = await Promise.all([
    getSubmissionEvidenceRows(supabase),
    loadAllCourseEnrollments(supabase),
    loadAllLevelTwoSubmissions(supabase),
  ]);
  const evidenceBySubmission = new Map(
    (evidenceRows ?? []).map((row) => [`${text(row, "homework_id")}:${text(row, "student_id")}`, row]),
  );
  const enrollmentsByStudent = new Map<string, StudentCourseEnrollment[]>();
  for (const enrollment of enrollmentResult.rows) {
    const studentEnrollments = enrollmentsByStudent.get(enrollment.studentId) ?? [];
    studentEnrollments.push(enrollment);
    enrollmentsByStudent.set(enrollment.studentId, studentEnrollments);
  }

  const levelOneHomework = data.homework.map((homework) => ({
    ...homework,
    submissions: homework.submissions?.map((submission) => {
      const evidence = evidenceBySubmission.get(`${homework.id}:${submission.studentId}`);
      if (!evidence) return submission;
      return {
        ...submission,
        screenImage: text(evidence, "screen_image") || undefined,
        cameraImage: text(evidence, "camera_image") || undefined,
        proofText: text(evidence, "proof_text") || undefined,
        attachmentName: text(evidence, "attachment_name") || undefined,
        attachmentMime: text(evidence, "attachment_mime") || undefined,
        attachmentData: text(evidence, "attachment_data") || undefined,
        proofCapturedAt: text(evidence, "captured_at") || undefined,
        proofExpiresAt: text(evidence, "expires_at") || undefined,
        userAgent: text(evidence, "user_agent") || undefined,
        browserName: text(evidence, "browser_name") || undefined,
        browserVersion: text(evidence, "browser_version") || undefined,
        osName: text(evidence, "os_name") || undefined,
        deviceType: text(evidence, "device_type") || undefined,
        viewportWidth: num(evidence, "viewport_width") || undefined,
        viewportHeight: num(evidence, "viewport_height") || undefined,
        language: text(evidence, "language") || undefined,
      };
    }),
  }));
  const levelTwoAvailable = enrollmentResult.available && levelTwoSubmissionResult.available;
  const levelTwoHomework = levelTwoAvailable
    ? buildAdminLevelTwoHomework(data.batches[0] ?? demoBatch, levelTwoSubmissionResult.rows)
    : [];

  return {
    ...data,
    students: data.students.map((student) => {
      if (!enrollmentResult.available) return student;
      const stored = enrollmentsByStudent.get(student.id) ?? [];
      const courseEnrollments = stored.length ? stored : [legacyLevelOneEnrollment(student)];
      return {
        ...student,
        courseEnrollments,
        activeCourseLevel: activeCourseLevel(courseEnrollments),
        coursePlacementAvailable: true,
      };
    }),
    sessions: levelTwoAvailable ? [...data.sessions, ...levelTwoSessions] : data.sessions,
    homework: [...levelOneHomework, ...levelTwoHomework],
  };
}

export const getAdminHomeworkData = cache(() => measureServer("admin.homework", getAdminHomeworkDataImpl));

async function getMentorScheduleDataImpl(): Promise<MentorScheduleData> {
  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    const fallback = fallbackAdminData();
    return {
      students: fallback.students,
      batches: fallback.batches,
      rescheduleRequests: fallback.rescheduleRequests,
    };
  }

  const [
    { data: studentRows },
    { data: batchRows },
    { data: requestRows },
    { data: pauseRows },
    enrollmentResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, full_name, parent_name, parent_email, country, time_zone, batch_id, enrolled_at, profiles(email, last_seen_at)"),
    supabase
      .from("batches")
      .select("id, name, days, time_slot, time_zone, start_date, start_time, end_time, meet_link, module_id, students(id), batch_class_slots(id, label, day_of_week, start_time, end_time, meet_link, sort_order)"),
    supabase
      .from("class_reschedule_requests")
      .select("id, student_id, batch_id, original_date, requested_date, requested_start_time, requested_end_time, requested_time_zone, reason, status, admin_note, meet_link, requested_at, reviewed_at, students(full_name)")
      .in("status", ["pending", "approved"]),
    supabase
      .from("batch_pauses")
      .select("id, batch_id, starts_on, resumes_on, reason, created_at"),
    loadAllCourseEnrollments(supabase),
  ]);

  return {
    students: attachCourseEnrollmentState(
      studentRows?.map((row) => mapStudent(row)) ?? [],
      enrollmentResult,
    ),
    batches: batchRows?.map((row) => attachBatchPauses(
      mapBatch(row, relationRows(row, "students").length),
      pauseRows,
    )) ?? [],
    rescheduleRequests: requestRows?.map((row) => mapRescheduleRequest(row)) ?? [],
  };
}

export const getMentorScheduleData = cache(getMentorScheduleDataImpl);
