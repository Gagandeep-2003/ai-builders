"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarRange, ChevronDown, PauseCircle, PencilLine, PlayCircle, Plus, Search, Trash2, UserRound } from "lucide-react";
import {
  createBatchPauseAction,
  endBatchPauseAction,
  createStudentAction,
  removeStudentAction,
  updateStudentAction,
  type AdminActionState,
} from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Batch, CourseModule, StudentProfile } from "@/lib/course-data";
import { commonTimeZones } from "@/lib/time";
import { cn } from "@/lib/utils";

const weekdays = [
  ["0", "Sunday"],
  ["1", "Monday"],
  ["2", "Tuesday"],
  ["3", "Wednesday"],
  ["4", "Thursday"],
  ["5", "Friday"],
  ["6", "Saturday"],
];

const inputClass =
  "min-h-11 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none transition focus:border-accent/55";

const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
};

function ActionNotice({
  state,
}: {
  state: AdminActionState;
}) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        state.status === "success"
          ? "border-success/30 bg-success/10 text-[color:var(--success)]"
          : "border-danger/30 bg-danger/10 text-[color:var(--danger)]",
      )}
      role="status"
    >
      {state.message}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function ScheduleFields({
  batch,
}: {
  batch?: Batch;
}) {
  const firstSlot = batch?.classSlots[0];
  const secondSlot = batch?.classSlots[1];
  const [classCount, setClassCount] = useState<1 | 2>(
    batch ? (secondSlot ? 2 : 1) : 2,
  );

  const scheduleCards = [
    { index: 1, slot: firstSlot, fallbackDay: 1 },
    { index: 2, slot: secondSlot, fallbackDay: 3 },
  ].slice(0, classCount);

  return (
    <div className="rounded-xl border border-border/70 bg-white/[0.02] p-4 md:col-span-2">
      <div className="grid gap-4 md:grid-cols-[1fr_15rem] md:items-end">
        <div>
          <p className="font-heading text-sm font-bold">Weekly classes</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Choose the student&apos;s timezone above, then enter the day and time as the student sees them.
            The portal converts the schedule to IST automatically.
          </p>
        </div>
        <Field label="Classes per week">
          <select
            name="classCount"
            value={classCount}
            onChange={(event) => setClassCount(Number(event.target.value) === 1 ? 1 : 2)}
            className={inputClass}
          >
            <option value="1">1 class per week</option>
            <option value="2">2 classes per week</option>
          </select>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {scheduleCards.map(({ index, slot, fallbackDay }) => (
          <div key={index} className="rounded-xl border border-border/70 bg-bg-card p-4">
            <p className="font-mono text-xs uppercase text-accent">Class {index} · student local time</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Student's day">
                <select
                  name={`slot${index}Day`}
                  defaultValue={String(slot?.dayOfWeek ?? fallbackDay)}
                  className={inputClass}
                >
                  {weekdays.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Student's start time">
                <input
                  name={`slot${index}StartTime`}
                  type="time"
                  required
                  defaultValue={(slot?.startTime ?? "17:00").slice(0, 5)}
                  className={inputClass}
                />
              </Field>
              <Field label="Student's end time">
                <input
                  name={`slot${index}EndTime`}
                  type="time"
                  required
                  defaultValue={(slot?.endTime ?? "18:00").slice(0, 5)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Google Meet link for this class">
              <input
                name={`slot${index}MeetLink`}
                type="url"
                required
                defaultValue={slot?.meetLink ?? ""}
                placeholder="https://meet.google.com/..."
                className={`${inputClass} mt-3`}
              />
            </Field>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-info/20 bg-info/5 px-3 py-2 text-xs leading-5 text-text-secondary">
        Calgary uses <strong className="text-text-primary">America/Edmonton</strong>. For a Wednesday
        7:30 AM IST class during daylight saving time, enter Tuesday 8:00 PM to 9:00 PM in the
        student&apos;s Calgary timezone.
      </p>
    </div>
  );
}

function StudentFields({
  modules,
  student,
  batch,
  includePassword = true,
}: {
  modules: CourseModule[];
  student?: StudentProfile;
  batch?: Batch;
  includePassword?: boolean;
}) {
  return (
    <>
      <Field label="Student name">
        <input
          name="fullName"
          required
          defaultValue={student?.fullName ?? ""}
          placeholder="Student full name"
          className={inputClass}
        />
      </Field>
      <Field label="Student email">
        <input
          name="email"
          type="email"
          required
          defaultValue={student?.email ?? ""}
          placeholder="student@student.com"
          className={inputClass}
        />
      </Field>
      {includePassword ? (
        <Field label={student ? "New password (optional)" : "Login password"}>
          <input
            name="password"
            type="password"
            required={!student}
            minLength={8}
            placeholder={student ? "Leave blank to keep current password" : "At least 8 characters"}
            className={inputClass}
          />
        </Field>
      ) : null}
      <Field label="Parent name">
        <input
          name="parentName"
          defaultValue={student?.parentName ?? ""}
          placeholder="Parent or guardian"
          className={inputClass}
        />
      </Field>
      <Field label="Parent email">
        <input
          name="parentEmail"
          type="email"
          defaultValue={student?.parentEmail ?? ""}
          placeholder="parent@example.com"
          className={inputClass}
        />
      </Field>
      <Field label="Country">
        <input
          name="country"
          defaultValue={student?.country ?? ""}
          placeholder="United States"
          className={inputClass}
        />
      </Field>
      <Field label="Student timezone">
        <select
          name="timeZone"
          defaultValue={student?.timeZone ?? batch?.timeZone ?? "Asia/Kolkata"}
          className={inputClass}
        >
          {commonTimeZones.map((timeZone) => (
            <option key={timeZone} value={timeZone}>{timeZone}</option>
          ))}
        </select>
      </Field>
      <Field label="Starting module">
        <select name="moduleId" defaultValue={batch?.moduleId ?? modules[0]?.id} className={inputClass}>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>{module.title}</option>
          ))}
        </select>
      </Field>
      <Field label="Course start date">
        <input
          name="startDate"
          type="date"
          required
          defaultValue={batch?.startDate ?? new Date().toISOString().slice(0, 10)}
          className={inputClass}
        />
      </Field>
      <Field label="Schedule name">
        <input
          name="batchName"
          defaultValue={batch?.name ?? ""}
          placeholder={`${student?.fullName ?? "Student"} AI Course`}
          className={inputClass}
        />
      </Field>
      <ScheduleFields batch={batch} />
    </>
  );
}

function StudentEditor({
  student,
  batch,
  modules,
}: {
  student: StudentProfile;
  batch?: Batch;
  modules: CourseModule[];
}) {
  const [state, action] = useActionState(updateStudentAction, initialAdminActionState);

  return (
    <details className="group rounded-xl border border-border/70 bg-bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
          <UserRound className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading font-bold">{student.fullName}</span>
          <span className="mt-1 block truncate text-xs text-text-secondary">
            {student.email} · {batch?.days ?? "No schedule"} · {student.timeZone}
          </span>
        </span>
        <PencilLine className="h-4 w-4 text-text-muted" />
        <ChevronDown className="h-4 w-4 text-text-muted transition group-open:rotate-180" />
      </summary>
      <form action={action} className="grid gap-4 border-t border-border/70 p-4 md:grid-cols-2">
        <input type="hidden" name="studentId" value={student.id} />
        <input type="hidden" name="userId" value={student.userId} />
        <input type="hidden" name="batchId" value={student.batchId} />
        <StudentFields modules={modules} student={student} batch={batch} />
        <div className="md:col-span-2">
          <ActionNotice state={state} />
        </div>
        <SubmitButton
          pendingLabel="Updating student..."
          className="rounded-lg bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2"
        >
          Save all student changes
        </SubmitButton>
      </form>
      {batch ? <BatchPauseManager batch={batch} /> : null}
      <form action={removeStudentAction} className="border-t border-border/70 p-4">
        <input type="hidden" name="studentId" value={student.id} />
        <SubmitButton
          pendingLabel="Removing..."
          className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-bold text-[color:var(--danger)]"
        >
          <Trash2 className="h-4 w-4" />
          Remove student record
        </SubmitButton>
      </form>
    </details>
  );
}

function formatPauseDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function BatchPauseManager({ batch }: { batch: Batch }) {
  const [state, action] = useActionState(createBatchPauseAction, initialAdminActionState);
  const today = new Date().toISOString().slice(0, 10);
  const relevantPauses = batch.pauses
    .filter((pause) => pause.resumesOn > today)
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn));

  return (
    <section className="border-t border-border/70 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent-warm/25 bg-accent-warm/10 text-accent-warm">
          <PauseCircle className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-heading font-bold">Pause this schedule</h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Use this for vacations or longer breaks. No classes, joins, attendance penalties, or reminders occur during the pause; remaining sessions move forward automatically.
          </p>
        </div>
      </div>

      {batch.studentsCount > 1 ? (
        <p className="mt-3 rounded-lg border border-accent-warm/25 bg-accent-warm/10 p-3 text-xs text-text-secondary">
          This is a shared schedule. Pausing it affects all {batch.studentsCount} students assigned to it.
        </p>
      ) : null}

      {relevantPauses.length ? (
        <div className="mt-4 grid gap-2">
          {relevantPauses.map((pause) => {
            const active = pause.startsOn <= today && today < pause.resumesOn;
            return (
              <div key={pause.id} className="flex flex-col gap-3 rounded-lg border border-accent-warm/20 bg-bg-elevated p-3 sm:flex-row sm:items-center">
                <CalendarRange className="h-4 w-4 shrink-0 text-accent-warm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    {active ? "Paused now" : "Upcoming pause"} · {formatPauseDate(pause.startsOn)} to {formatPauseDate(pause.resumesOn)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Classes resume on {formatPauseDate(pause.resumesOn)} · {pause.reason || "Student vacation"}
                  </p>
                </div>
                <form action={endBatchPauseAction}>
                  <input type="hidden" name="pauseId" value={pause.id} />
                  <SubmitButton
                    pendingLabel={active ? "Resuming..." : "Cancelling..."}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-secondary hover:border-accent/40 hover:text-text-primary"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {active ? "Resume now" : "Cancel pause"}
                  </SubmitButton>
                </form>
              </div>
            );
          })}
        </div>
      ) : null}

      <form action={action} className="mt-4 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="batchId" value={batch.id} />
        <Field label={`Pause starts · ${batch.timeZone}`}>
          <input name="startsOn" type="date" min={today} required className={inputClass} />
        </Field>
        <Field label={`Classes resume · ${batch.timeZone}`}>
          <input name="resumesOn" type="date" min={today} required className={inputClass} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Reason shown to the student">
            <input name="reason" placeholder="Family vacation" className={inputClass} />
          </Field>
        </div>
        <p className="text-xs leading-5 text-text-muted md:col-span-2">
          The resume date is the first date classes are active again. Any weekly class dates inside this range are skipped and appended to the end of the course.
        </p>
        <div className="md:col-span-2"><ActionNotice state={state} /></div>
        <SubmitButton
          pendingLabel="Pausing schedule..."
          className="rounded-lg border border-accent-warm/30 bg-accent-warm/10 px-4 py-2.5 text-sm font-bold text-accent-warm md:col-span-2"
        >
          <PauseCircle className="h-4 w-4" />
          Schedule pause
        </SubmitButton>
      </form>
    </section>
  );
}

export function StudentManager({
  students,
  batches,
  modules,
}: {
  students: StudentProfile[];
  batches: Batch[];
  modules: CourseModule[];
}) {
  const [createState, createAction] = useActionState(
    createStudentAction,
    initialAdminActionState,
  );
  const [showCreate, setShowCreate] = useState(students.length === 0);
  const [query, setQuery] = useState("");
  const [batchId, setBatchId] = useState("all");
  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesBatch = batchId === "all" || student.batchId === batchId;
      const matchesQuery = !normalized || [
        student.fullName,
        student.email,
        student.country,
        student.timeZone,
      ].some((value) => value.toLowerCase().includes(normalized));
      return matchesBatch && matchesQuery;
    });
  }, [batchId, query, students]);

  return (
    <div className="space-y-6">
      <section className="premium-card rounded-xl p-5">
        <button
          type="button"
          onClick={() => setShowCreate((value) => !value)}
          className="flex w-full items-center gap-4 text-left"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Plus className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-xl font-bold">Add a new student</span>
            <span className="mt-1 block text-sm text-text-secondary">
              Create the login, course schedule, timezone, and Meet links together.
            </span>
          </span>
          <ChevronDown className={cn("h-5 w-5 text-text-muted transition", showCreate && "rotate-180")} />
        </button>

        {showCreate ? (
          <form action={createAction} className="mt-5 grid gap-4 border-t border-border/70 pt-5 md:grid-cols-2">
            <StudentFields modules={modules} />
            <div className="md:col-span-2">
              <ActionNotice state={createState} />
            </div>
            <SubmitButton
              pendingLabel="Creating student..."
              className="rounded-lg bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2"
            >
              Create student and schedule
            </SubmitButton>
          </form>
        ) : null}
      </section>

      <section className="premium-card rounded-xl p-5">
        <div className="sticky top-0 z-20 -mx-2 border-b border-border/70 bg-bg-card/95 px-2 pb-5 backdrop-blur">
          <p className="font-mono text-xs uppercase text-accent">Student directory</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Edit existing students</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Open a student to change profile details, timezone, module, weekly classes, Meet links, or password.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_16rem_auto] md:items-center">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <span className="sr-only">Search students</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, country, or timezone"
                className={`${inputClass} pl-10`}
              />
            </label>
            <label>
              <span className="sr-only">Filter by schedule</span>
              <select
                value={batchId}
                onChange={(event) => setBatchId(event.target.value)}
                className={inputClass}
              >
                <option value="all">All schedules</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
            </label>
            <p className="font-mono text-xs uppercase text-text-muted md:text-right">
              {filteredStudents.length} of {students.length}
            </p>
          </div>
        </div>
        <div className="scrollbar-soft mt-5 max-h-[65vh] overflow-y-auto overscroll-contain pr-2">
          <div className="grid gap-3">
            {filteredStudents.map((student) => (
              <StudentEditor
                key={student.id}
                student={student}
                batch={batches.find((batch) => batch.id === student.batchId)}
                modules={modules}
              />
            ))}
          </div>
          {filteredStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <UserRound className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 font-heading font-bold">No students match this view</p>
              <p className="mt-1 text-sm text-text-secondary">Try another name, country, or schedule.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
