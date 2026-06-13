import { availabilityBucket } from "@/lib/slot-availability";
import { ADMIN_TIME_ZONE, zonedDateTimeToUtc } from "@/lib/time";

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
    timeZoneName: "short",
  });
  const endFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `${formatter.format(startUtc)} - ${endFormatter.format(endUtc)}`;
}

export function getStudentRescheduleOptions(studentTimeZone: string, daysAhead = 21) {
  const today = new Date();
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
      const adminLabel = `${dayFormatter.format(date)} · ${startTime} - ${endTime} IST`;
      const label = `${formatLocalRange(startUtc, endUtc, studentTimeZone)} · Admin: ${adminLabel}`;
      options.push({
        value: [dateKey, startTime, endTime, ADMIN_TIME_ZONE].join("|"),
        label,
        adminLabel,
      });
    }
  }

  return options.slice(0, 40);
}
