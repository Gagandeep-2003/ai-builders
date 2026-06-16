import { BookOpenCheck, CalendarClock, CheckCircle2, Clock3, UserRound } from "lucide-react";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { filterUnlockedHomework, getSessionAccessBoundary } from "@/lib/content-access";
import type { HomeworkItem, StudentProfile } from "@/lib/course-data";
import { getAdminData } from "@/lib/data";
import { applySessionStatuses, formatSessionTime, getNextSession } from "@/lib/time";

function isHomeworkAssignedToStudent(homework: HomeworkItem, student: StudentProfile) {
  return (
    homework.assignedStudentId === student.id ||
    (!homework.assignedStudentId && homework.batchId === student.batchId) ||
    (!homework.assignedStudentId && !homework.batchId)
  );
}

function getStudentSubmission(homework: HomeworkItem, studentId: string) {
  return homework.submissions?.find((submission) => submission.studentId === studentId);
}

export default async function AdminProgressPage() {
  const data = await getAdminData();
  const summaries = data.students
    .map((student) => {
      const batch = data.batches.find((item) => item.id === student.batchId);
      const sessions = batch ? applySessionStatuses(data.sessions, batch) : [];
      const access = getSessionAccessBoundary(sessions);
      const currentSession = access.currentSession;
      const unlockedSessions = sessions.filter((session) => session.globalNumber <= access.maxUnlockedGlobalNumber);
      const assignedHomework = filterUnlockedHomework(
        data.homework.filter((item) => isHomeworkAssignedToStudent(item, student)),
        sessions,
        access,
      );
      const submitted = assignedHomework.filter((item) => {
        const status = getStudentSubmission(item, student.id)?.status;
        return status === "submitted" || status === "reviewed";
      }).length;
      const reviewed = assignedHomework.filter((item) => getStudentSubmission(item, student.id)?.status === "reviewed").length;
      const pending = Math.max(assignedHomework.length - submitted, 0);
      const attendance = data.attendance.filter((item) => item.studentId === student.id);
      const present = attendance.filter((item) => item.status === "present").length;
      const absent = attendance.filter((item) => item.status === "absent").length;
      const rescheduled = attendance.filter((item) => item.status === "rescheduled").length;
      const nextSession = batch ? getNextSession(sessions) : undefined;
      const completedSessions = Math.max(
        unlockedSessions.filter((session) => session.status === "completed").length,
        present,
      );

      return {
        student,
        batch,
        currentSession,
        nextSession,
        completedSessions,
        unlockedCount: unlockedSessions.length,
        assignedHomework: assignedHomework.length,
        submitted,
        reviewed,
        pending,
        present,
        absent,
        rescheduled,
      };
    })
    .sort((a, b) => b.pending - a.pending || a.student.fullName.localeCompare(b.student.fullName));

  const totalPending = summaries.reduce((sum, item) => sum + item.pending, 0);
  const totalSubmitted = summaries.reduce((sum, item) => sum + item.submitted, 0);
  const activeStudents = summaries.filter((item) => item.batch).length;

  return (
    <AnimatedPage>
      <PageHeader
        title="Student Progress"
        subtitle="Track every student by unlocked session, homework completion, attendance, and next class."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Active students</p>
          <p className="mt-2 font-heading text-3xl font-bold">{activeStudents}</p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Pending unlocked work</p>
          <p className="mt-2 font-heading text-3xl font-bold">{totalPending}</p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Submitted work</p>
          <p className="mt-2 font-heading text-3xl font-bold">{totalSubmitted}</p>
        </div>
      </section>

      <section className="grid gap-4">
        {summaries.map((summary) => {
          const moduleNumber = summary.currentSession ? Math.ceil(summary.currentSession.globalNumber / 8) : 1;
          return (
            <article key={summary.student.id} className="premium-card rounded-xl p-5">
              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-heading text-xl font-bold">{summary.student.fullName}</h2>
                        <p className="mt-1 text-sm text-text-secondary">{summary.student.email}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {summary.batch?.name ?? "No batch assigned"} · {summary.student.country || "No country"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={summary.pending > 0 ? "pending" : "reviewed"}
                      label={summary.pending > 0 ? `${summary.pending} pending` : "Caught up"}
                    />
                  </div>

                  <div className="mt-5 rounded-xl border border-border/70 bg-white/[0.025] p-4">
                    <p className="font-mono text-xs uppercase text-accent">Current learning point</p>
                    <h3 className="mt-2 font-heading text-lg font-bold">
                      {summary.currentSession
                        ? `Module ${moduleNumber} · Session ${summary.currentSession.sessionNumber}`
                        : "No session schedule"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {summary.currentSession?.title ?? "Assign a batch to calculate progress."}
                    </p>
                    <ProgressBar
                      className="mt-4"
                      value={Math.min(summary.completedSessions, Math.max(summary.unlockedCount, 1))}
                      max={Math.max(summary.unlockedCount, 1)}
                      label="Unlocked session completion"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                    <BookOpenCheck className="h-5 w-5 text-accent" />
                    <p className="mt-3 font-mono text-xs uppercase text-text-muted">Homework</p>
                    <p className="mt-1 font-heading text-xl font-bold">
                      {summary.submitted}/{summary.assignedHomework}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {summary.pending} pending · {summary.reviewed} reviewed
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <p className="mt-3 font-mono text-xs uppercase text-text-muted">Attendance</p>
                    <p className="mt-1 font-heading text-xl font-bold">{summary.present} present</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {summary.absent} absent · {summary.rescheduled} rescheduled
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4 sm:col-span-2">
                    <CalendarClock className="h-5 w-5 text-accent" />
                    <p className="mt-3 font-mono text-xs uppercase text-text-muted">Next class</p>
                    <p className="mt-1 font-heading text-lg font-bold">
                      {summary.nextSession?.title ?? "No upcoming session"}
                    </p>
                    {summary.batch && summary.nextSession ? (
                      <p className="mt-1 text-sm text-text-secondary">
                        {formatSessionTime(summary.nextSession, summary.batch, summary.student.timeZone)}
                      </p>
                    ) : null}
                    <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-text-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                      {summary.student.timeZone}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </AnimatedPage>
  );
}
