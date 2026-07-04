"use client";

import { useMemo, useState } from "react";
import { createAdminRescheduleAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";

type SchedulerStudent = {
  id: string;
  fullName: string;
  timeZone: string;
};

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-text-muted">{hint}</span> : null}
    </label>
  );
}

function istDateTime(date: string, time: string) {
  if (!date || !time) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
}

function formatStudentTime(date: string, start: string, end: string, timeZone: string) {
  const startDate = istDateTime(date, start);
  const endDate = istDateTime(date, end);
  if (!startDate || !endDate || !timeZone) return "Select the student, date, and times to preview their local class time.";

  try {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateFormatter.format(startDate)} · ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
  } catch {
    return "The selected student timezone could not be previewed.";
  }
}

export function OneOffClassForm({ students }: { students: SchedulerStudent[] }) {
  const [studentId, setStudentId] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const student = students.find((item) => item.id === studentId);
  const studentPreview = useMemo(
    () => formatStudentTime(requestedDate, startTime, endTime, student?.timeZone ?? ""),
    [endTime, requestedDate, startTime, student?.timeZone],
  );

  return (
    <form action={createAdminRescheduleAction} className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-accent/25 bg-accent/[0.07] p-4 md:col-span-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Your timezone</p>
        <p className="mt-1 font-heading font-bold text-text-primary">Enter all new class dates and times in Asia/Kolkata (IST)</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">The portal automatically converts the class for the selected student.</p>
      </div>
      <input type="hidden" name="requestedTimeZone" value="Asia/Kolkata" />
      <Field label="Class action">
        <select
          name="requestType"
          defaultValue="makeup"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        >
          <option value="makeup">Additional make-up class</option>
          <option value="reschedule">Replace one regular class</option>
        </select>
      </Field>
      <Field label="Student">
        <select
          name="studentId"
          required
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        >
          <option value="">Select student</option>
          {students.map((item) => (
            <option key={item.id} value={item.id}>{item.fullName}</option>
          ))}
        </select>
      </Field>
      <Field label="Student timezone" hint="Filled automatically from the selected student's profile.">
        <input
          value={student?.timeZone ?? "Select a student first"}
          readOnly
          aria-label="Selected student timezone"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-secondary"
        />
      </Field>
      <Field label="New class date · in your timezone" hint="Date of the make-up or replacement class in IST.">
        <input
          name="requestedDate"
          type="date"
          required
          value={requestedDate}
          onChange={(event) => setRequestedDate(event.target.value)}
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <Field
        label="Original class date · replacements only"
        hint="Leave blank for an additional make-up. Fill only when replacing one regular class."
      >
        <input
          name="originalDate"
          type="date"
          title="Required only when replacing one regular class"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <Field label="New class start · in your timezone">
        <input
          name="requestedStartTime"
          type="time"
          required
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <Field label="New class end · in your timezone">
        <input
          name="requestedEndTime"
          type="time"
          required
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <div className="rounded-xl border border-info/25 bg-info/[0.07] p-4 md:col-span-2" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-info">Student local preview</p>
        <p className="mt-1 font-heading font-bold text-text-primary">{studentPreview}</p>
        {student ? <p className="mt-1 text-xs text-text-muted">Shown in {student.timeZone}</p> : null}
      </div>
      <Field
        label="Google Meet link · optional"
        hint="Leave blank to reuse the student's regular batch Meet link."
        className="md:col-span-2"
      >
        <input
          name="meetLink"
          type="url"
          placeholder="https://meet.google.com/..."
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <Field label="Reason" className="md:col-span-2">
        <input
          name="reason"
          placeholder="For example: make-up class for missed Thursday"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <Field
        label="Student-visible note · optional"
        hint="This message appears in the student's portal."
        className="md:col-span-2"
      >
        <textarea
          name="adminNote"
          placeholder="Add any instruction the student should see"
          className="min-h-20 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
        />
      </Field>
      <SubmitButton
        pendingLabel="Adding class..."
        className="rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2"
      >
        Add one-off class
      </SubmitButton>
    </form>
  );
}
