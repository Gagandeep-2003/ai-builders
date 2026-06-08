const ADMIN_TIME_ZONE = "Asia/Kolkata";

const sessionTitles = [
  "Welcome to the AI Era",
  "AI for School: Study Smarter",
  "AI for Creative Writing",
  "AI Image & Video Creation",
  "AI Audio Generation",
  "AI for Task Organisation: The Data Analyst",
];

const batches = [
  {
    name: "US Weekday Batch - Tue/Wed CDT",
    timeZone: "America/Chicago",
    studentTimeZone: "America/Chicago",
    startDate: "2026-06-08",
    slots: [
      { label: "Tuesday class", dayOfWeek: 2, startTime: "11:00", endTime: "12:00" },
      { label: "Wednesday class", dayOfWeek: 3, startTime: "14:00", endTime: "15:00" },
    ],
  },
  {
    name: "Australia Weekend Batch - Sat/Sun",
    timeZone: "Australia/Sydney",
    studentTimeZone: "Australia/Sydney",
    startDate: "2026-06-08",
    slots: [
      { label: "Saturday class", dayOfWeek: 6, startTime: "12:00", endTime: "13:00" },
      { label: "Sunday class", dayOfWeek: 0, startTime: "12:00", endTime: "13:00" },
    ],
  },
  {
    name: "US Weekday Batch - Wed/Thu EDT",
    timeZone: "America/New_York",
    studentTimeZone: "America/New_York",
    startDate: "2026-06-08",
    slots: [
      { label: "Wednesday class", dayOfWeek: 3, startTime: "16:00", endTime: "17:00" },
      { label: "Thursday class", dayOfWeek: 4, startTime: "15:00", endTime: "16:00" },
    ],
  },
];

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function parseTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const { year, month, day } = parseDate(date);
  return toDateKey(new Date(Date.UTC(year, month - 1, day + days)));
}

function dayOfWeek(date) {
  const { year, month, day } = parseDate(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function getZonedParts(date, timeZone) {
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

function zonedDateTimeToUtc(date, time, timeZone) {
  const { year, month, day } = parseDate(date);
  const { hour, minute } = parseTime(time);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let utcMs = desiredAsUtc;

  for (let index = 0; index < 4; index += 1) {
    const parts = getZonedParts(new Date(utcMs), timeZone);
    const currentAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    const diff = desiredAsUtc - currentAsUtc;
    if (diff === 0) break;
    utcMs += diff;
  }

  return new Date(utcMs);
}

function formatRange(startsAt, endsAt, timeZone) {
  const date = new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startsAt);
  const start = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(startsAt);
  const end = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(endsAt);

  return `${date} · ${start} - ${end}`;
}

function sessionSchedule(batch, count) {
  const rows = [];
  let matched = 0;

  for (let offset = 0; rows.length < count && offset < 240; offset += 1) {
    const date = addDays(batch.startDate, offset);
    const slots = batch.slots
      .filter((slot) => slot.dayOfWeek === dayOfWeek(date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const slot of slots) {
      matched += 1;
      const startsAt = zonedDateTimeToUtc(date, slot.startTime, batch.timeZone);
      const endsAt = zonedDateTimeToUtc(date, slot.endTime, batch.timeZone);
      rows.push({ sessionNumber: matched, title: sessionTitles[matched - 1], slot, startsAt, endsAt });
      if (rows.length === count) break;
    }
  }

  return rows;
}

for (const batch of batches) {
  console.log(`\n${batch.name}`);
  console.log("-".repeat(batch.name.length));
  for (const row of sessionSchedule(batch, 6)) {
    console.log(`S${row.sessionNumber}: ${row.title}`);
    console.log(`  Student: ${formatRange(row.startsAt, row.endsAt, batch.studentTimeZone)} (${row.slot.label})`);
    console.log(`  Admin:   ${formatRange(row.startsAt, row.endsAt, ADMIN_TIME_ZONE)}`);
  }
}
