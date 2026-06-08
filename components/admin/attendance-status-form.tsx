"use client";

import type { FormEvent } from "react";
import { saveAttendanceAction } from "@/app/actions/admin";

export function AttendanceStatusForm({
  sessionId,
  studentId,
  status,
  date,
}: {
  sessionId: string;
  studentId: string;
  status: string;
  date: string;
}) {
  function confirmReschedule(event: FormEvent<HTMLFormElement>) {
    if (status !== "rescheduled") return true;
    const confirmed = window.confirm("Mark this session as rescheduled? You can message the student separately with the new class details.");
    if (!confirmed) event.preventDefault();
  }

  return (
    <form action={saveAttendanceAction} onSubmit={confirmReschedule}>
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="date" value={date} />
      <button className="button-motion rounded-xl border border-border bg-bg-card px-3 py-2 text-sm capitalize text-text-secondary">
        {status}
      </button>
    </form>
  );
}
