"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { ChevronDown, FileText, MonitorSmartphone, Paperclip, UserRound } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { HomeworkReviewForm } from "@/components/admin/homework-review-form";
import type { Batch, CourseSession, HomeworkItem, StudentProfile } from "@/lib/course-data";
import { formatDuration, formatHomeworkKind } from "@/lib/homework-utils";
import { cn, formatDate } from "@/lib/utils";

function getStudentSubmission(homework: HomeworkItem, studentId: string) {
  return homework.submissions?.find((submission) => submission.studentId === studentId);
}

function isHomeworkAssignedToStudent(homework: HomeworkItem, student: StudentProfile) {
  return (!homework.batchId && !homework.assignedStudentId) || homework.batchId === student.batchId || homework.assignedStudentId === student.id;
}

function getDeviceFields(submission: NonNullable<HomeworkItem["submissions"]>[number]) {
  return [
    ["Browser", [submission.browserName, submission.browserVersion].filter(Boolean).join(" ")],
    ["Device", submission.deviceType],
    ["OS", submission.osName],
    [
      "Viewport",
      submission.viewportWidth && submission.viewportHeight
        ? `${submission.viewportWidth} × ${submission.viewportHeight}`
        : "",
    ],
    ["Language", submission.language],
  ].filter((item): item is [string, string] => Boolean(item[1]));
}

export function AdminHomeworkWorkbook({
  students,
  batches,
  sessions,
  homework,
}: {
  students: StudentProfile[];
  batches: Batch[];
  sessions: CourseSession[];
  homework: HomeworkItem[];
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const selectedBatch = batches.find((batch) => batch.id === selectedStudent?.batchId);

  const studentRows = useMemo(
    () =>
      students.map((student) => {
        const assigned = homework.filter((item) => isHomeworkAssignedToStudent(item, student));
        const completed = assigned.filter((item) => {
          const submission = getStudentSubmission(item, student.id);
          return submission?.status === "submitted" || submission?.status === "reviewed";
        }).length;

        return {
          student,
          assigned: assigned.length,
          completed,
        };
      }),
    [homework, students],
  );

  const groupedSessions = useMemo(
    () =>
      sessions.map((session) => {
        const items = homework.filter(
          (item) => selectedStudent && isHomeworkAssignedToStudent(item, selectedStudent) && item.sessionId === session.id,
        );
        const completed = items.filter((item) => {
          const submission = selectedStudent ? getStudentSubmission(item, selectedStudent.id) : null;
          return submission?.status === "submitted" || submission?.status === "reviewed";
        }).length;

        return {
          session,
          items,
          completed,
          total: items.length,
        };
      }),
    [homework, selectedStudent, sessions],
  );
  const moduleGroups = useMemo(
    () =>
      [1, 2, 3].map((moduleNumber) => ({
        moduleNumber,
        sessions: groupedSessions.filter((item) => Math.ceil(item.session.globalNumber / 8) === moduleNumber),
      })),
    [groupedSessions],
  );

  if (!selectedStudent) {
    return (
      <section className="premium-card rounded-xl p-8 text-center text-text-secondary">
        No students available yet.
      </section>
    );
  }

  const selectedSummary = studentRows.find((row) => row.student.id === selectedStudent.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.35fr]">
      <section className="premium-card rounded-xl p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold">Students</h2>
            <p className="mt-1 text-sm text-text-secondary">Select a student to review session work.</p>
          </div>
        </div>

        <div className="mt-5 max-h-[72vh] space-y-2 overflow-y-auto pr-1 scrollbar-soft">
          {studentRows.map(({ student, assigned, completed }) => {
            const active = student.id === selectedStudent.id;
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition",
                  active
                    ? "border-accent/50 bg-accent/10 shadow-[0_0_24px_rgba(110,231,183,0.12)]"
                    : "border-border bg-bg-card hover:border-accent/25 hover:bg-white/[0.035]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-bold">{student.fullName}</h3>
                    <p className="mt-1 text-xs text-text-muted">{student.email}</p>
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-secondary">
                    {completed}/{assigned}
                  </span>
                </div>
                <ProgressBar className="mt-4" value={completed} max={Math.max(assigned, 1)} label="Completion" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="premium-card rounded-xl p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Student workbook</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">{selectedStudent.fullName}</h2>
              <p className="mt-2 text-sm text-text-secondary">
                {selectedBatch?.name ?? "No batch assigned"} · {selectedStudent.timeZone}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated px-4 py-3 font-mono text-sm text-accent">
              {selectedSummary?.completed ?? 0}/{selectedSummary?.assigned ?? 0} complete
            </div>
          </div>
        </div>

        {moduleGroups.map((module) => (
          <details key={module.moduleNumber} className="premium-card group rounded-xl p-0" open={module.moduleNumber === 1}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <p className="font-mono text-xs uppercase text-accent">Module {module.moduleNumber}</p>
              <ChevronDown className="h-4 w-4 text-text-muted transition group-open:rotate-180" />
            </summary>
            <div className="space-y-3 border-t border-border/60 p-5">
              {module.sessions.map(({ session, items, completed, total }) => (
                <details
                  key={session.id}
                  className="rounded-xl border border-border/70 bg-white/[0.02]"
                  open={items.length > 0 && completed < total}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-mono text-xs uppercase text-text-muted">Session {session.sessionNumber}</p>
                      <h3 className="mt-1 font-heading text-lg font-bold">{session.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-secondary">
                        {total === 0 ? "No work" : `${completed}/${total}`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    </div>
                  </summary>

                  <div className="border-t border-border/60 p-4">
                    {items.length ? (
                      <div className="space-y-3">
                        {items.map((item) => {
                          const submission = getStudentSubmission(item, selectedStudent.id);
                          const status = submission?.status ?? "pending";
                          const deviceFields = submission ? getDeviceFields(submission) : [];
                          return (
                            <article key={item.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="font-mono text-xs uppercase text-accent">{formatHomeworkKind(item.kind)}</p>
                                  <h4 className="mt-2 font-heading font-bold">{item.title}</h4>
                                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.description}</p>
                                  <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs text-text-muted">
                                    <span>Due {formatDate(item.dueDate)}</span>
                                    <span>Started {submission?.startedAt ? formatDate(submission.startedAt) : "not started"}</span>
                                    <span>Completed {submission?.submittedAt ? formatDate(submission.submittedAt) : "not yet"}</span>
                                    <span>Time {formatDuration(submission?.timeSpentSeconds)}</span>
                                  </div>
                                  {submission && ["submitted", "revision_requested", "reviewed"].includes(submission.status) ? (
                                    <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2">
                                          <MonitorSmartphone className="h-4 w-4 text-accent" />
                                          <p className="font-mono text-xs uppercase text-accent">Submission proof</p>
                                        </div>
                                        <p className="font-mono text-[11px] text-text-muted">
                                          {submission.proofCapturedAt ? `Captured ${formatDate(submission.proofCapturedAt)}` : "No evidence row saved"}
                                          {submission.proofExpiresAt ? ` · Deletes ${formatDate(submission.proofExpiresAt)}` : ""}
                                        </p>
                                      </div>
                                      {submission.screenImage || submission.cameraImage ? (
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                          {submission.screenImage ? (
                                            <a href={submission.screenImage} target="_blank" rel="noreferrer" className="group block">
                                              <p className="mb-2 font-mono text-[11px] uppercase text-text-muted">Screen</p>
                                              <img
                                                src={submission.screenImage}
                                                alt="Student screen submission proof"
                                                className="aspect-video w-full rounded-lg border border-border object-cover transition group-hover:border-accent/50"
                                              />
                                            </a>
                                          ) : null}
                                          {submission.cameraImage ? (
                                            <a href={submission.cameraImage} target="_blank" rel="noreferrer" className="group block">
                                              <p className="mb-2 font-mono text-[11px] uppercase text-text-muted">Camera</p>
                                              <img
                                                src={submission.cameraImage}
                                                alt="Student camera submission proof"
                                                className="aspect-video w-full rounded-lg border border-border object-cover transition group-hover:border-accent/50"
                                              />
                                            </a>
                                          ) : null}
                                        </div>
                                      ) : (
                                        <div className="mt-3 rounded-lg border border-border/70 bg-bg-card/60 p-3 text-sm text-text-secondary">
                                          {submission.proofCapturedAt
                                            ? "No proof image was attached. The student may have submitted after capture was blocked or skipped."
                                            : "No evidence row was found for this submitted task. Ask the student to submit again after the evidence migration is applied."}
                                        </div>
                                      )}
                                      {submission.proofText ? (
                                        <div className="mt-3 rounded-lg border border-border/70 bg-bg-base/40 p-3">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-accent" />
                                            <p className="font-mono text-[10px] uppercase text-text-muted">Text evidence</p>
                                          </div>
                                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                                            {submission.proofText}
                                          </p>
                                        </div>
                                      ) : null}
                                      {submission.attachmentData ? (
                                        <a
                                          href={submission.attachmentData}
                                          download={submission.attachmentName || "student-attachment"}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-accent transition hover:border-accent/45"
                                        >
                                          <span className="flex min-w-0 items-center gap-2">
                                            <Paperclip className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{submission.attachmentName || "Student attachment"}</span>
                                          </span>
                                          <span className="shrink-0 font-mono text-[10px] uppercase text-text-muted">
                                            {submission.attachmentMime || "file"}
                                          </span>
                                        </a>
                                      ) : null}
                                      {deviceFields.length || submission.userAgent ? (
                                        <div className="mt-3 grid gap-2 rounded-lg border border-border/70 bg-bg-base/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                          {deviceFields.map(([label, value]) => (
                                            <div key={label}>
                                              <p className="font-mono text-[10px] uppercase text-text-muted">{label}</p>
                                              <p className="mt-1 truncate text-xs font-semibold text-text-primary">{value}</p>
                                            </div>
                                          ))}
                                          {submission.userAgent ? (
                                            <div className="sm:col-span-2 lg:col-span-3">
                                              <p className="font-mono text-[10px] uppercase text-text-muted">User agent</p>
                                              <p className="mt-1 line-clamp-2 break-all text-[11px] leading-5 text-text-secondary">
                                                {submission.userAgent}
                                              </p>
                                            </div>
                                          ) : null}
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  {submission?.mentorFeedback ? (
                                    <div className="mt-3 rounded-xl border border-info/25 bg-info/5 p-3">
                                      <p className="font-mono text-[10px] uppercase text-info">Current mentor feedback</p>
                                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{submission.mentorFeedback}</p>
                                    </div>
                                  ) : null}
                                  {submission && ["submitted", "revision_requested", "reviewed"].includes(submission.status) ? (
                                    <HomeworkReviewForm
                                      homeworkId={item.id}
                                      studentId={selectedStudent.id}
                                      initialFeedback={submission.mentorFeedback}
                                      reviewed={submission.status === "reviewed"}
                                    />
                                  ) : null}
                                </div>
                                <StatusBadge status={status} />
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4 text-sm text-text-secondary">
                        No class challenge or home task is attached to this session yet.
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
