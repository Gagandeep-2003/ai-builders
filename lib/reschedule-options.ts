import type { BatchPause, ClassRescheduleRequest } from "@/lib/course-data";
import {
  availabilityBucket,
  type BookedSlot,
} from "@/lib/slot-availability";
import {
  ADMIN_TIME_ZONE,
  dateKeyInTimeZone,
  isDateWithinBatchPauses,
  zonedDateTimeToUtc,
} from "@/lib/time";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
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
    excludedPauses = [],
    excludedPauseTimeZone = ADMIN_TIME_ZONE,
  }: {
    bookedSlots?: BookedSlot[];
    requests?: ClassRescheduleRequest[];
    daysAhead?: number;
    now?: Date;
    excludedPauses?: BatchPause[];
    excludedPauseTimeZone?: string;
  } = {},
) {
  const today = new Date(`${dateKeyInTimeZone(now, ADMIN_TIME_ZONE)}T00:00:00.000Z`);
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
      if (
        isDateWithinBatchPauses(
          { pauses: excludedPauses },
          dateKeyInTimeZone(startUtc, excludedPauseTimeZone),
        )
      ) continue;
      const [hour, minute] = startTime.split(":").map(Number);
      const startMinutes = hour * 60 + minute;
      const endMinutes = startMinutes + 60;
      const recurringConflict = bookedSlots.some(
        (booking) =>
          booking.istDayIndex === dayIndex &&
          startMinutes < booking.endMinutes &&
          booking.startMinutes < endMinutes &&
          !isDateWithinBatchPauses(
            booking,
            dateKeyInTimeZone(startUtc, booking.sourceTimeZone),
          ),
      );
      if (recurringConflict) continue;
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
