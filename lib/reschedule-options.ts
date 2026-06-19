import type { ClassRescheduleRequest } from "@/lib/course-data";
import {
  availabilityBucket,
  getAvailabilitySlots,
  type BookedSlot,
} from "@/lib/slot-availability";
import { ADMIN_TIME_ZONE, zonedDateTimeToUtc } from "@/lib/time";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addOneHour(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const endHour = (hour + 1) % 24;
  return `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatLocalRange(startUtc: Date, endUtc: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const endFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(startUtc)} - ${endFormatter.format(endUtc)}`;
}

function overlaps(firstStart: Date, firstEnd: Date, secondStart: Date, secondEnd: Date) {
  return firstStart < secondEnd && secondStart < firstEnd;
}

export function getStudentRescheduleOptions(
  studentTimeZone: string,
  {
    bookedSlots = [],
    requests = [],
    daysAhead = 21,
    now = new Date(),
  }: {
    bookedSlots?: BookedSlot[];
    requests?: ClassRescheduleRequest[];
    daysAhead?: number;
    now?: Date;
  } = {},
) {
  const today = new Date(`${dateKeyInTimeZone(now, ADMIN_TIME_ZONE)}T00:00:00.000Z`);
  const availableWeeklySlots = new Set(
    getAvailabilitySlots(bookedSlots)
      .flatMap((day) => day.slots)
      .filter((slot) => slot.status === "available")
      .map((slot) => `${slot.dayIndex}-${slot.startMinutes}`),
  );
  const reservedRequests = requests
    .filter((request) => request.status === "pending" || request.status === "approved")
    .map((request) => ({
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
    }));
  const options: Array<{
    value: string;
    label: string;
    adminLabel: string;
  }> = [];

  for (let offset = 1; offset <= daysAhead; offset += 1) {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    const dayIndex = date.getUTCDay();
    const bucket = availabilityBucket.find((day) => day.dayIndex === dayIndex);
    if (!bucket) continue;

    for (const startTime of bucket.slots) {
      const endTime = addOneHour(startTime);
      const startUtc = zonedDateTimeToUtc(dateKey, startTime, ADMIN_TIME_ZONE);
      const endUtc = zonedDateTimeToUtc(dateKey, endTime, ADMIN_TIME_ZONE);
      const [hour, minute] = startTime.split(":").map(Number);
      if (!availableWeeklySlots.has(`${dayIndex}-${hour * 60 + minute}`)) continue;
      if (
        reservedRequests.some((request) =>
          overlaps(startUtc, endUtc, request.startsAt, request.endsAt),
        )
      ) continue;
      const adminLabel = `${dayFormatter.format(date)} · ${startTime} - ${endTime} IST`;
      const label = `${formatLocalRange(startUtc, endUtc, studentTimeZone)} · Your time · Admin: ${adminLabel}`;
      options.push({
        value: [dateKey, startTime, endTime, ADMIN_TIME_ZONE].join("|"),
        label,
        adminLabel,
      });
    }
  }

  return options.slice(0, 40);
}
