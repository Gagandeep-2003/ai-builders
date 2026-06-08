import type { Batch, BatchClassSlot, CourseSession } from "@/lib/course-data";

export const ADMIN_TIME_ZONE = "Asia/Kolkata";
export const DEFAULT_TIME_ZONE = "Asia/Kolkata";

export const commonTimeZones = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
];

export type SessionScheduleStatus = "completed" | "current" | "locked";

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayOfWeekForDateKey(date: string) {
  const { year, month, day } = parseDate(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addDays(date: string, days: number) {
  const { year, month, day } = parseDate(date);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return toDateKey(value);
}

function sortedClassSlots(batch: Batch) {
  return [...(batch.classSlots ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime),
  );
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour === 24 ? 0 : parts.hour,
    minute: parts.minute,
  };
}

export function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const { year, month, day } = parseDate(date);
  const { hour, minute } = parseTime(time);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let utcMs = desiredAsUtc;

  for (let index = 0; index < 4; index += 1) {
    const parts = getZonedParts(new Date(utcMs), timeZone);
    const currentAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    const diff = desiredAsUtc - currentAsUtc;
    if (diff === 0) break;
    utcMs += diff;
  }

  return new Date(utcMs);
}

export function getSessionClassSlot(session: CourseSession, batch: Batch): BatchClassSlot | null {
  const slots = sortedClassSlots(batch);
  if (slots.length === 0 || !batch.startDate) return null;

  let matchedCount = 0;
  for (let dayOffset = 0; dayOffset < 240; dayOffset += 1) {
    const date = addDays(batch.startDate, dayOffset);
    const dayOfWeek = dayOfWeekForDateKey(date);
    const daySlots = slots.filter((slot) => slot.dayOfWeek === dayOfWeek);

    for (const slot of daySlots) {
      matchedCount += 1;
      if (matchedCount === session.globalNumber) {
        return slot;
      }
    }
  }

  return null;
}

export function getSessionScheduleDate(session: CourseSession, batch: Batch) {
  const slots = sortedClassSlots(batch);
  if (slots.length === 0 || !batch.startDate) return session.date;

  let matchedCount = 0;
  for (let dayOffset = 0; dayOffset < 240; dayOffset += 1) {
    const date = addDays(batch.startDate, dayOffset);
    const dayOfWeek = dayOfWeekForDateKey(date);
    const daySlots = slots.filter((slot) => slot.dayOfWeek === dayOfWeek);

    for (let index = 0; index < daySlots.length; index += 1) {
      matchedCount += 1;
      if (matchedCount === session.globalNumber) {
        return date;
      }
    }
  }

  return session.date;
}

export function getSessionDateTimes(session: CourseSession, batch: Batch) {
  const timeZone = batch.timeZone || DEFAULT_TIME_ZONE;
  const classSlot = getSessionClassSlot(session, batch);
  const sessionDate = getSessionScheduleDate(session, batch);

  return {
    startsAt: zonedDateTimeToUtc(sessionDate, classSlot?.startTime ?? batch.startTime, timeZone),
    endsAt: zonedDateTimeToUtc(sessionDate, classSlot?.endTime ?? batch.endTime, timeZone),
    meetLink: classSlot?.meetLink || batch.meetLink,
    slot: classSlot,
  };
}

export function getSessionJoinWindow(session: CourseSession, batch: Batch) {
  const { startsAt, endsAt } = getSessionDateTimes(session, batch);

  return {
    startsAt,
    endsAt,
    opensAt: new Date(startsAt.getTime() - 15 * 60_000),
    closesAt: endsAt,
  };
}

export function isSessionJoinWindowOpen(session: CourseSession, batch: Batch, now = new Date()) {
  const { opensAt, closesAt } = getSessionJoinWindow(session, batch);
  return now.getTime() >= opensAt.getTime() && now.getTime() <= closesAt.getTime();
}

export function applySessionStatuses(
  sessions: CourseSession[],
  batch: Batch,
  now = new Date(),
): Array<CourseSession & { status: SessionScheduleStatus }> {
  let currentAssigned = false;

  return sessions.map((session) => {
    const { endsAt } = getSessionDateTimes(session, batch);
    const completed = endsAt.getTime() <= now.getTime();
    const status: SessionScheduleStatus = completed
      ? "completed"
      : currentAssigned
        ? "locked"
        : "current";

    if (!completed && !currentAssigned) {
      currentAssigned = true;
    }

    return {
      ...session,
      status,
    };
  });
}

export function formatInTimeZone(
  date: Date | string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en", {
    timeZone,
    ...options,
  }).format(value);
}

export function formatSessionTime(
  session: CourseSession,
  batch: Batch,
  timeZone = batch.timeZone || DEFAULT_TIME_ZONE,
) {
  const { startsAt, endsAt } = getSessionDateTimes(session, batch);
  const date = formatInTimeZone(startsAt, timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const start = formatInTimeZone(startsAt, timeZone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const end = formatInTimeZone(endsAt, timeZone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `${date} · ${start} - ${end}`;
}

export function formatBatchSchedule(batch: Batch, timeZone = batch.timeZone || DEFAULT_TIME_ZONE) {
  const slots = sortedClassSlots(batch);
  if (slots.length > 0) {
    return slots
      .map((slot) => {
        const firstDate = getFirstSlotDate(batch.startDate, slot.dayOfWeek);
        const previewSession: CourseSession = {
          id: `schedule-preview-${slot.id}`,
          moduleId: batch.moduleId,
          title: batch.name,
          sessionNumber: 1,
          globalNumber: 1,
          focus: "",
          toolsCovered: [],
          studentOutput: "",
          description: "",
          date: firstDate,
        };
        const previewBatch = {
          ...batch,
          startDate: firstDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          meetLink: slot.meetLink,
          classSlots: [],
        };
        const { startsAt, endsAt } = getSessionDateTimes(previewSession, previewBatch);
        const day = formatInTimeZone(startsAt, timeZone, { weekday: "short" });
        const start = formatInTimeZone(startsAt, timeZone, {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });
        const end = formatInTimeZone(endsAt, timeZone, {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });
        return `${day} ${start} - ${end}`;
      })
      .join(" / ");
  }

  const referenceSession: CourseSession = {
    id: "schedule-preview",
    moduleId: batch.moduleId,
    title: batch.name,
    sessionNumber: 1,
    globalNumber: 1,
    focus: "",
    toolsCovered: [],
    studentOutput: "",
    description: "",
    date: "2026-06-15",
  };

  return `${batch.days} · ${formatSessionTime(referenceSession, batch, timeZone).split(" · ")[1]}`;
}

function getFirstSlotDate(startDate: string, dayOfWeek: number) {
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = addDays(startDate, dayOffset);
    if (dayOfWeekForDateKey(date) === dayOfWeek) return date;
  }

  return startDate;
}

export function daysUntilSession(session: CourseSession, batch: Batch, now = new Date()) {
  const { startsAt } = getSessionDateTimes(session, batch);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const target = new Date(startsAt);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

export function getNextSession(sessions: Array<CourseSession & { status?: string }>) {
  return (
    sessions.find((session) => session.status === "current") ??
    sessions.find((session) => session.status !== "completed") ??
    sessions.at(-1)
  );
}

export function getActiveOrNextJoinSession(
  sessions: Array<CourseSession & { status?: string }>,
  batch: Batch,
  now = new Date(),
) {
  const activeSession = sessions.find((session) => {
    return isSessionJoinWindowOpen(session, batch, now);
  });

  return activeSession ?? getNextSession(sessions);
}
