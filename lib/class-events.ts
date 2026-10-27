import type {
  AttendanceItem,
  Batch,
  ClassRescheduleRequest,
  CourseSession,
  StudentCourseEnrollment,
  StudentProfile,
} from "@/lib/course-data";
import { buildCourseCurricula } from "@/lib/level-two";
import {
  applySessionStatuses,
  formatInTimeZone,
  getSessionDateTimes,
  getSessionScheduleDate,
  zonedDateTimeToUtc,
} from "@/lib/time";

export type ClassEventKind = "regular" | "makeup" | "rescheduled";

export type ClassEvent = {
  id: string;
  kind: ClassEventKind;
  startsAt: Date;
  endsAt: Date;
  meetLink: string;
  batch: Batch;
  student?: StudentProfile;
  session?: CourseSession;
  request?: ClassRescheduleRequest;
  title: string;
  detail: string;
  status: string;
  tag: string;
};

function addCalendarDay(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function getRescheduleRequestDateTimes(request: ClassRescheduleRequest) {
  const startsAt = zonedDateTimeToUtc(
    request.requestedDate,
    request.requestedStartTime,
    request.requestedTimeZone,
  );
  let endsAt = zonedDateTimeToUtc(
    request.requestedDate,
    request.requestedEndTime,
    request.requestedTimeZone,
  );

  // A class ending after midnight belongs to the following local calendar day.
  if (endsAt.getTime() <= startsAt.getTime()) {
    endsAt = zonedDateTimeToUtc(
      addCalendarDay(request.requestedDate),
      request.requestedEndTime,
      request.requestedTimeZone,
    );
  }

  return { startsAt, endsAt };
}

export function formatClassEventTime(event: Pick<ClassEvent, "startsAt" | "endsAt">, timeZone: string) {
  const date = formatInTimeZone(event.startsAt, timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const start = formatInTimeZone(event.startsAt, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = formatInTimeZone(event.endsAt, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${date} · ${start} - ${end}`;
}

export function formatRescheduleRequestTime(request: ClassRescheduleRequest, timeZone: string) {
  return formatClassEventTime(getRescheduleRequestDateTimes(request), timeZone);
}

export function getRescheduleRequestKind(request: Pick<ClassRescheduleRequest, "originalDate">) {
  return request.originalDate ? "rescheduled" as const : "makeup" as const;
}

function getRequestNoticeTime(request: ClassRescheduleRequest) {
  const preferredDate = request.reviewedAt || request.requestedAt;
  const preferredTime = preferredDate ? new Date(preferredDate).getTime() : Number.NaN;
  if (Number.isFinite(preferredTime)) return preferredTime;
  return getRescheduleRequestDateTimes(request).startsAt.getTime();
}

export function getActiveRejectedClassRequest(
  requests: ClassRescheduleRequest[],
  events: Pick<ClassEvent, "startsAt" | "endsAt">[],
  now = new Date(),
) {
  return requests
    .filter((request) => request.status === "rejected")
    .sort((a, b) => getRequestNoticeTime(b) - getRequestNoticeTime(a))
    .find((request) => {
      const noticeTime = getRequestNoticeTime(request);
      const nextClassAfterDecision = events.find((event) => event.startsAt.getTime() > noticeTime);
      return Boolean(nextClassAfterDecision && nextClassAfterDecision.endsAt.getTime() >= now.getTime());
    });
}

export function getClassEventLabel(event: Pick<ClassEvent, "kind">) {
  if (event.kind === "rescheduled") return "Rescheduled";
  if (event.kind === "makeup") return "Make-up";
  return "Regular";
}

export function daysUntilClassEvent(event: Pick<ClassEvent, "startsAt">, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const target = new Date(event.startsAt);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

export function getStudentClassEvents({
  student,
  batch,
  sessions,
  requests,
  now = new Date(),
}: {
  student: StudentProfile;
  batch: Batch;
  sessions: Array<CourseSession & { status?: string }>;
  requests: ClassRescheduleRequest[];
  now?: Date;
}) {
  const approvedRequests = requests.filter((request) => request.status === "approved");
  const replacedDates = new Set(
    approvedRequests
      .map((request) => request.originalDate)
      .filter((date): date is string => Boolean(date)),
  );
  const regularEvents: ClassEvent[] = sessions.flatMap((session) => {
    if (session.status === "skipped" || session.status === "not_enrolled") return [];
    if (replacedDates.has(getSessionScheduleDate(session, batch))) return [];
    const schedule = getSessionDateTimes(session, batch);
    return [{
      id: `regular-${session.id}`,
      kind: "regular" as const,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      meetLink: schedule.meetLink,
      batch,
      student,
      session,
      title: session.title,
      detail: `Level ${session.courseLevel ?? 1} · Module ${session.moduleNumber ?? Math.ceil(session.globalNumber / 8)} · Session ${session.sessionNumber}`,
      status: session.status ?? "current",
      tag: "Regular",
    }];
  });

  const makeupEvents: ClassEvent[] = requests
    .filter((request) => request.status === "approved")
    .flatMap((request) => {
      const schedule = getRescheduleRequestDateTimes(request);
      const kind = getRescheduleRequestKind(request);
      const originalSession = request.originalDate
        ? sessions.find((session) => getSessionScheduleDate(session, batch) === request.originalDate)
        : undefined;
      return [{
        id: `${kind}-${request.id}`,
        kind,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        meetLink: request.meetLink || batch.meetLink,
        batch,
        student,
        session: originalSession,
        request,
        title: originalSession?.title ?? (kind === "rescheduled" ? "Rescheduled class" : "Make-up class"),
        detail:
          request.adminNote ||
          (kind === "rescheduled"
            ? `Moved from ${request.originalDate}`
            : "One-off class added by admin"),
        status: schedule.endsAt.getTime() <= now.getTime() ? "completed" : "current",
        tag: getClassEventLabel({ kind }),
      }];
    });

  return [...regularEvents, ...makeupEvents].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
}

export function getNextClassEvent(events: ClassEvent[], now = new Date()) {
  return events.find((event) => event.endsAt.getTime() >= now.getTime()) ?? events.at(-1);
}

function inferredLevelOneEnrollment(
  student: StudentProfile,
  levelTwo: StudentCourseEnrollment | undefined,
): StudentCourseEnrollment {
  return {
    studentId: student.id,
    courseLevel: 1,
    status: levelTwo?.source === "direct" ? "not_enrolled" : "enrolled",
    startsAt: student.enrolledAt || levelTwo?.startsAt,
    endsAt: levelTwo?.source === "promotion" ? levelTwo.startsAt : undefined,
    startModuleNumber: 1,
    startSessionNumber: 1,
    source: "legacy",
  };
}

/**
 * Returns only the regular sessions that belong to this student's own course
 * timeline. Level 2 is never added globally: it appears only when the student
 * has a stored Level 2 enrollment. Level 1 history is retained up to a
 * promotion boundary, while direct Level 2 students do not receive Level 1.
 */
export function getStudentScheduledSessions({
  student,
  batch,
  levelOneSessions,
  now = new Date(),
}: {
  student: StudentProfile;
  batch: Batch;
  levelOneSessions: CourseSession[];
  now?: Date;
}) {
  const legacySessions = levelOneSessions.filter((session) => (session.courseLevel ?? 1) === 1);
  const storedEnrollments = student.courseEnrollments;
  if (!storedEnrollments?.length) {
    return applySessionStatuses(legacySessions, batch, now);
  }

  const levelTwo = storedEnrollments.find((enrollment) => enrollment.courseLevel === 2);
  const levelOne = storedEnrollments.find((enrollment) => enrollment.courseLevel === 1)
    ?? inferredLevelOneEnrollment(student, levelTwo);
  const enrollments = [
    levelOne,
    ...storedEnrollments.filter((enrollment) => enrollment.courseLevel !== 1),
  ];
  const curricula = buildCourseCurricula({
    modules: [],
    sessions: legacySessions,
    batch,
    enrollments,
    includeLevelTwo: Boolean(levelTwo),
    now,
  });

  return curricula.flatMap((curriculum) => curriculum.sessions).filter(
    (session) => session.status !== "skipped" && session.status !== "not_enrolled",
  );
}

export function getAdminClassEvents({
  students,
  batches,
  sessions,
  requests,
  attendance,
  now = new Date(),
}: {
  students: StudentProfile[];
  batches: Batch[];
  sessions: Array<CourseSession & { status?: string }>;
  requests: ClassRescheduleRequest[];
  attendance: AttendanceItem[];
  now?: Date;
}) {
  const regularEvents: ClassEvent[] = students.flatMap((student) => {
    const batch = batches.find((item) => item.id === student.batchId);
    if (!batch) return [];
    const studentSessions = getStudentScheduledSessions({
      student,
      batch,
      levelOneSessions: sessions,
      now,
    });
    const replacedDates = new Set(
      requests
        .filter(
          (request) =>
            request.studentId === student.id &&
            request.status === "approved" &&
            request.originalDate,
        )
        .map((request) => request.originalDate as string),
    );

    return studentSessions.flatMap((session) => {
      if (replacedDates.has(getSessionScheduleDate(session, batch))) return [];
      const schedule = getSessionDateTimes(session, batch);
      const attendanceStatus = attendance.find(
        (item) => item.studentId === student.id && item.sessionId === session.id,
      )?.status;

      return [{
        id: `regular-${student.id}-${session.id}`,
        kind: "regular" as const,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        meetLink: schedule.meetLink,
        batch,
        student,
        session,
        title: session.title,
        detail: `Level ${session.courseLevel ?? 1} · Module ${session.moduleNumber ?? Math.ceil(session.globalNumber / 8)} · Session ${session.sessionNumber}`,
        status: attendanceStatus ?? "current",
        tag: "Regular",
      }];
    });
  });

  const makeupEvents: ClassEvent[] = requests
    .filter((request) => request.status === "approved")
    .flatMap((request) => {
      const batch = batches.find((item) => item.id === request.batchId);
      const student = students.find((item) => item.id === request.studentId);
      if (!batch || !student) return [];

      const schedule = getRescheduleRequestDateTimes(request);
      const kind = getRescheduleRequestKind(request);
      const studentSessions = getStudentScheduledSessions({
        student,
        batch,
        levelOneSessions: sessions,
        now,
      });
      const originalSession = request.originalDate
        ? studentSessions.find((session) => getSessionScheduleDate(session, batch) === request.originalDate)
        : undefined;
      return [{
        id: `${kind}-${request.id}`,
        kind,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        meetLink: request.meetLink || batch.meetLink,
        batch,
        student,
        session: originalSession,
        request,
        title: originalSession?.title ?? (kind === "rescheduled" ? "Rescheduled class" : "Make-up class"),
        detail:
          request.adminNote ||
          request.reason ||
          (kind === "rescheduled" ? `Moved from ${request.originalDate}` : "One-off class"),
        status: schedule.endsAt.getTime() <= now.getTime() ? "completed" : "current",
        tag: getClassEventLabel({ kind }),
      }];
    });

  return [...regularEvents, ...makeupEvents].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
}
