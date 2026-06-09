import type { Batch, StudentProfile } from "@/lib/course-data";
import { ADMIN_TIME_ZONE, formatInTimeZone, zonedDateTimeToUtc } from "@/lib/time";

export type AvailabilityDay = {
  dayIndex: number;
  label: string;
  slots: string[];
};

export type BookedSlot = {
  id: string;
  batchId: string;
  batchName: string;
  studentNames: string[];
  sourceTimeZone: string;
  sourceLabel: string;
  istDayIndex: number;
  istDayLabel: string;
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
};

export type SlotStatus = "available" | "booked" | "blocked";

export type AvailabilitySlot = {
  id: string;
  dayIndex: number;
  dayLabel: string;
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
  status: SlotStatus;
  conflicts: BookedSlot[];
};

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// This is the admin's fixed IST bucket. Only half-hour-start slots are tracked.
export const availabilityBucket: AvailabilityDay[] = [
  {
    dayIndex: 0,
    label: "Sunday",
    slots: ["00:30", "03:30", "07:30"],
  },
  {
    dayIndex: 2,
    label: "Tuesday",
    slots: ["18:30", "19:30", "21:30", "22:30"],
  },
  {
    dayIndex: 3,
    label: "Wednesday",
    slots: ["01:30", "07:30", "17:30", "19:30"],
  },
  {
    dayIndex: 4,
    label: "Thursday",
    slots: ["00:30", "01:30", "02:30", "07:30", "21:30", "22:30"],
  },
  {
    dayIndex: 5,
    label: "Friday",
    slots: ["00:30", "07:30", "17:30", "19:30", "20:30", "21:30"],
  },
  {
    dayIndex: 6,
    label: "Saturday",
    slots: ["00:30", "07:30"],
  },
  {
    dayIndex: 1,
    label: "Monday",
    slots: ["04:30", "07:30", "21:30"],
  },
];

function parseMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function formatMinutes(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatRange(startMinutes: number, endMinutes: number) {
  return `${formatMinutes(startMinutes)} - ${formatMinutes(endMinutes)}`;
}

function getUtcDateKey(date: string, dayOffset: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + dayOffset)).toISOString().slice(0, 10);
}

function getUtcDayOfWeek(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function getFirstSlotDate(startDate: string, dayOfWeek: number) {
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = getUtcDateKey(startDate, dayOffset);
    if (getUtcDayOfWeek(date) === dayOfWeek) return date;
  }

  return startDate;
}

function getZonedDayIndex(date: Date, timeZone: string) {
  const value = formatInTimeZone(date, timeZone, { weekday: "short" });
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value);
}

function getZonedMinutes(date: Date, timeZone: string) {
  const value = formatInTimeZone(date, timeZone, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return parseMinutes(value);
}

function overlaps(firstStart: number, firstEnd: number, secondStart: number, secondEnd: number) {
  return firstStart < secondEnd && secondStart < firstEnd;
}

export function getBookedSlots(batches: Batch[], students: StudentProfile[]) {
  const studentsByBatch = new Map<string, string[]>();

  for (const student of students) {
    const current = studentsByBatch.get(student.batchId) ?? [];
    current.push(student.fullName);
    studentsByBatch.set(student.batchId, current);
  }

  return batches.flatMap((batch) => {
    const slots = batch.classSlots.length > 0
      ? batch.classSlots
      : [
          {
            id: `${batch.id}-fallback`,
            batchId: batch.id,
            label: batch.days,
            dayOfWeek: getUtcDayOfWeek(batch.startDate),
            startTime: batch.startTime,
            endTime: batch.endTime,
            meetLink: batch.meetLink,
            sortOrder: 1,
          },
        ];

    return slots.map((slot) => {
      const slotDate = getFirstSlotDate(batch.startDate, slot.dayOfWeek);
      const startsAt = zonedDateTimeToUtc(slotDate, slot.startTime, batch.timeZone);
      const endsAt = zonedDateTimeToUtc(slotDate, slot.endTime, batch.timeZone);
      const istDayIndex = getZonedDayIndex(startsAt, ADMIN_TIME_ZONE);
      const startMinutes = getZonedMinutes(startsAt, ADMIN_TIME_ZONE);
      let endMinutes = getZonedMinutes(endsAt, ADMIN_TIME_ZONE);
      if (endMinutes <= startMinutes) endMinutes += 1440;

      return {
        id: slot.id,
        batchId: batch.id,
        batchName: batch.name,
        studentNames: studentsByBatch.get(batch.id) ?? [],
        sourceTimeZone: batch.timeZone,
        sourceLabel: slot.label,
        istDayIndex,
        istDayLabel: dayLabels[istDayIndex] ?? "Unknown",
        startMinutes,
        endMinutes,
        timeLabel: formatRange(startMinutes, endMinutes),
      };
    }).filter((slot) => slot.startMinutes % 60 === 30);
  });
}

export function getAvailabilitySlots(bookedSlots: BookedSlot[]) {
  return availabilityBucket.map((day) => {
    const slots: AvailabilitySlot[] = day.slots.map((time) => {
      const startMinutes = parseMinutes(time);
      const endMinutes = startMinutes + 60;
      const conflicts = bookedSlots.filter(
        (booking) =>
          booking.istDayIndex === day.dayIndex &&
          overlaps(startMinutes, endMinutes, booking.startMinutes, booking.endMinutes),
      );
      const exactBooking = conflicts.some(
        (booking) => booking.startMinutes === startMinutes && booking.endMinutes === endMinutes,
      );

      return {
        id: `${day.dayIndex}-${time}`,
        dayIndex: day.dayIndex,
        dayLabel: day.label,
        startMinutes,
        endMinutes,
        timeLabel: formatRange(startMinutes, endMinutes),
        status: exactBooking ? "booked" : conflicts.length > 0 ? "blocked" : "available",
        conflicts,
      };
    });

    return {
      ...day,
      slots,
    };
  });
}

export function summarizeAvailability(slotsByDay: ReturnType<typeof getAvailabilitySlots>) {
  const slots = slotsByDay.flatMap((day) => day.slots);
  const available = slots.filter((slot) => slot.status === "available").length;
  const booked = slots.filter((slot) => slot.status === "booked").length;
  const blocked = slots.filter((slot) => slot.status === "blocked").length;

  return {
    total: slots.length,
    available,
    booked,
    blocked,
  };
}
