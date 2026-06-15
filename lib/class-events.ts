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
  zonedDateTimeToUtc,
} from "@/lib/time";

export type ClassEventKind = "regular" | "makeup";

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
    timeZoneName: "short",
  });
  const end = formatInTimeZone(event.endsAt, timeZone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `${date} · ${start} - ${end}`;
}

export function formatRescheduleRequestTime(request: ClassRescheduleRequest, timeZone: string) {
  return formatClassEventTime(getRescheduleRequestDateTimes(request), timeZone);
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
  const regularEvents: ClassEvent[] = sessions.map((session) => {
    const schedule = getSessionDateTimes(session, batch);
    return {
      id: `regular-${session.id}`,
      kind: "regular",
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
    };
  });

  const makeupEvents: ClassEvent[] = requests
    .filter((request) => request.status === "approved")
    .map((request) => {
      const schedule = getRescheduleRequestDateTimes(request);
      return {
        id: `makeup-${request.id}`,
        kind: "makeup",
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        meetLink: request.meetLink || batch.meetLink,
        batch,
        student,
        request,
        title: "Make-up class",
        detail: request.adminNote || "One-off class added by admin",
        status: schedule.endsAt.getTime() <= now.getTime() ? "completed" : "current",
        tag: "Make-up",
      };
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

    return sessions.map((session) => {
      const schedule = getSessionDateTimes(session, batch);
      const attendanceStatus = attendance.find(
        (item) => item.studentId === student.id && item.sessionId === session.id,
      )?.status;

      return {
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
      };
    });
  });

  const makeupEvents: ClassEvent[] = requests
    .filter((request) => request.status === "approved")
    .flatMap((request) => {
      const batch = batches.find((item) => item.id === request.batchId);
      const student = students.find((item) => item.id === request.studentId);
      if (!batch || !student) return [];

      const schedule = getRescheduleRequestDateTimes(request);
      return [{
        id: `makeup-${request.id}`,
        kind: "makeup" as const,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
        meetLink: request.meetLink || batch.meetLink,
        batch,
        student,
        request,
        title: "Make-up class",
        detail: request.adminNote || request.reason || "One-off class",
        status: schedule.endsAt.getTime() <= now.getTime() ? "completed" : "current",
        tag: "Make-up",
      }];
    });

  return [...regularEvents, ...makeupEvents].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
}
