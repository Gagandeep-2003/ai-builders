import type {
  AttendanceItem,
  Batch,
  ClassRescheduleRequest,
  CourseSession,
  StudentProfile,
} from "@/lib/course-data";
import {
  formatInTimeZone,
  getSessionDateTimes,
  getSessionScheduleDate,
  dateKeyInTimeZone,
  isBatchPausedOnDate,
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

export function getRescheduleRequestDateTimes(request: ClassRescheduleRequest) {
  return {
    startsAt: zonedDateTimeToUtc(
      request.requestedDate,
      request.requestedStartTime,
      request.requestedTimeZone,
    ),
    endsAt: zonedDateTimeToUtc(
      request.requestedDate,
      request.requestedEndTime,
      request.requestedTimeZone,
    ),
  };
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
      detail: `Module ${Math.ceil(session.globalNumber / 8)} · Session ${session.sessionNumber}`,
      status: session.status ?? "current",
      tag: "Regular",
    }];
  });

  const makeupEvents: ClassEvent[] = requests
    .filter((request) => request.status === "approved")
    .flatMap((request) => {
      const schedule = getRescheduleRequestDateTimes(request);
      if (isBatchPausedOnDate(batch, dateKeyInTimeZone(schedule.startsAt, batch.timeZone))) {
        return [];
      }
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

    return sessions.flatMap((session) => {
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
        detail: `Module ${Math.ceil(session.globalNumber / 8)} · Session ${session.sessionNumber}`,
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
      if (isBatchPausedOnDate(batch, dateKeyInTimeZone(schedule.startsAt, batch.timeZone))) {
        return [];
      }
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
