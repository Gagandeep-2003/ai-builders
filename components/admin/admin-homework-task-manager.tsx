"use client";

import type { FormEvent } from "react";
import { ChevronDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteHomeworkAction, updateHomeworkAction } from "@/app/actions/admin";
import type { Batch, CourseSession, HomeworkItem, StudentProfile } from "@/lib/course-data";
import { formatHomeworkKind } from "@/lib/homework-utils";
import { formatDate } from "@/lib/utils";

function homeworkTargetType(homework: HomeworkItem) {
  return homework.assignedStudentId ? "student" : "batch";
}

function homeworkTargetValue(homework: HomeworkItem) {
  if (!homework.batchId && !homework.assignedStudentId) return "all:";
  return `${homeworkTargetType(homework)}:${homework.assignedStudentId ?? homework.batchId}`;
}

function targetLabel(homework: HomeworkItem, batches: Batch[], students: StudentProfile[]) {
  if (!homework.batchId && !homework.assignedStudentId) return "All students";

  if (homework.assignedStudentId) {
    const student = students.find((item) => item.id === homework.assignedStudentId);
    return student ? `Student: ${student.fullName}` : "Individual student";
  }

  const batch = batches.find((item) => item.id === homework.batchId);
  return batch ? `Batch: ${batch.name}` : "Batch";
}

function confirmDelete(event: FormEvent<HTMLFormElement>) {
  const confirmed = window.confirm("Delete this task? Student submissions for this task will also be removed.");
  if (!confirmed) event.preventDefault();
}

export function AdminHomeworkTaskManager({
  batches,
  students,
  sessions,
  homework,
}: {
  batches: Batch[];
  students: StudentProfile[];
  sessions: CourseSession[];
  homework: HomeworkItem[];
}) {
  const moduleNumbers = [1, 2, 3];

  return (
    <section className="premium-card rounded-xl p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
          <Pencil className="h-5 w-5" />
        </span>
        <div>
          <p className="font-mono text-xs uppercase text-accent">Task library</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Edit existing class challenges and home tasks</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Use this to change titles, Google Doc links, due dates, task type, or the target batch/student for work that already exists.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {moduleNumbers.map((moduleNumber) => {
          const moduleSessions = sessions.filter((session) => Math.ceil(session.globalNumber / 8) === moduleNumber);
          const moduleHomeworkCount = moduleSessions.reduce(
            (count, session) => count + homework.filter((item) => item.sessionId === session.id).length,
            0,
          );

          return (
            <details key={moduleNumber} className="rounded-xl border border-border/70 bg-white/[0.02]" open={moduleNumber === 1}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-mono text-xs uppercase text-accent">Module {moduleNumber}</p>
                  <h3 className="mt-1 font-heading text-lg font-bold">{moduleHomeworkCount} task items</h3>
                </div>
                <ChevronDown className="h-4 w-4 text-text-muted" />
              </summary>

              <div className="space-y-3 border-t border-border/60 p-4">
                {moduleSessions.map((session) => {
                  const sessionHomework = homework.filter((item) => item.sessionId === session.id);

                  return (
                    <details key={session.id} className="rounded-xl border border-border/70 bg-bg-card">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                        <div>
                          <p className="font-mono text-xs uppercase text-text-muted">Session {session.sessionNumber}</p>
                          <h4 className="mt-1 font-heading font-bold">{session.title}</h4>
                        </div>
                        <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-secondary">
                          {sessionHomework.length || "No"} tasks
                        </span>
                      </summary>

                      <div className="space-y-3 border-t border-border/60 p-4">
                        {sessionHomework.length ? (
                          sessionHomework.map((item) => (
                            <details key={item.id} className="rounded-xl border border-border/70 bg-white/[0.025]">
                              <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-mono text-xs uppercase text-accent">{formatHomeworkKind(item.kind)}</p>
                                  <h5 className="mt-1 font-heading font-bold">{item.title}</h5>
                                  <p className="mt-1 text-xs text-text-muted">
                                    {targetLabel(item, batches, students)} · Due {formatDate(item.dueDate)}
                                  </p>
                                </div>
                                <span className="font-mono text-xs text-text-secondary">Edit</span>
                              </summary>

                              <div className="border-t border-border/60 p-4">
                                <form action={updateHomeworkAction} className="grid gap-4 md:grid-cols-2">
                                  <input type="hidden" name="homeworkId" value={item.id} />

                                  <label className="space-y-2 text-sm text-text-secondary md:col-span-2">
                                    <span className="font-mono text-xs uppercase text-text-muted">Target</span>
                                    <select
                                      name="target"
                                      defaultValue={homeworkTargetValue(item)}
                                      className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    >
                                      <option value="all:">All students</option>
                                      {batches.map((batch) => (
                                        <option key={batch.id} value={`batch:${batch.id}`}>
                                          Batch: {batch.name}
                                        </option>
                                      ))}
                                      {students.map((student) => (
                                        <option key={student.id} value={`student:${student.id}`}>
                                          Student: {student.fullName}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="space-y-2 text-sm text-text-secondary md:col-span-2">
                                    <span className="font-mono text-xs uppercase text-text-muted">Module session</span>
                                    <select
                                      name="sessionId"
                                      defaultValue={item.sessionId}
                                      className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    >
                                      {moduleNumbers.map((number) => (
                                        <optgroup key={number} label={`Module ${number}`}>
                                          {sessions
                                            .filter((sessionOption) => Math.ceil(sessionOption.globalNumber / 8) === number)
                                            .map((sessionOption) => (
                                              <option key={sessionOption.id} value={sessionOption.id}>
                                                Module {number} · Session {sessionOption.sessionNumber}: {sessionOption.title}
                                              </option>
                                            ))}
                                        </optgroup>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="space-y-2 text-sm text-text-secondary">
                                    <span className="font-mono text-xs uppercase text-text-muted">Title</span>
                                    <input
                                      name="title"
                                      defaultValue={item.title}
                                      className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    />
                                  </label>

                                  <label className="space-y-2 text-sm text-text-secondary">
                                    <span className="font-mono text-xs uppercase text-text-muted">Due date</span>
                                    <input
                                      name="dueDate"
                                      type="date"
                                      defaultValue={item.dueDate}
                                      className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    />
                                  </label>

                                  <label className="space-y-2 text-sm text-text-secondary">
                                    <span className="font-mono text-xs uppercase text-text-muted">Task type</span>
                                    <select
                                      name="kind"
                                      defaultValue={item.kind}
                                      className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    >
                                      <option value="class_challenge">Class Challenge</option>
                                      <option value="home_task">Home Task</option>
                                    </select>
                                  </label>

                                  <label className="space-y-2 text-sm text-text-secondary">
                                    <span className="font-mono text-xs uppercase text-text-muted">Google Doc URL</span>
                                    <input
                                      name="contentUrl"
                                      defaultValue={item.contentUrl}
                                      placeholder="https://docs.google.com/document/d/..."
                                      className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    />
                                  </label>

                                  <label className="space-y-2 text-sm text-text-secondary md:col-span-2">
                                    <span className="font-mono text-xs uppercase text-text-muted">Description</span>
                                    <textarea
                                      name="description"
                                      defaultValue={item.description}
                                      className="min-h-28 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary"
                                    />
                                  </label>

                                  <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
                                    {item.contentUrl ? (
                                      <a
                                        href={item.contentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-accent underline-offset-4 hover:underline"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Open current Google Doc
                                      </a>
                                    ) : (
                                      <span className="text-sm text-text-muted">No Google Doc attached.</span>
                                    )}

                                    <div className="flex gap-3">
                                      <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                </form>

                                <form action={deleteHomeworkAction} onSubmit={confirmDelete} className="mt-3 flex justify-end">
                                  <input type="hidden" name="homeworkId" value={item.id} />
                                  <button className="button-motion inline-flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-bold text-red-200">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Task
                                  </button>
                                </form>
                              </div>
                            </details>
                          ))
                        ) : (
                          <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4 text-sm text-text-secondary">
                            No class challenge or home task is attached to this session yet. Use the add form below to create one.
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
