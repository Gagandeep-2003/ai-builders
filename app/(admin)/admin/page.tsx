import Link from "next/link";
import {
  CalendarClock,
  ClipboardCheck,
  FilePlus2,
  Link2,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { reviewPasswordRequestAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminData } from "@/lib/data";
import { ADMIN_TIME_ZONE, formatInTimeZone, formatSessionTime, getSessionDateTimes } from "@/lib/time";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminData();
  const pendingReviews = data.homework.filter((item) => item.status === "submitted").length;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const adminToday = formatInTimeZone(now, ADMIN_TIME_ZONE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const homeworkToday = data.homework.filter((item) => item.createdAt?.startsWith(today)).length;
  const classRows = data.students
    .flatMap((student) => {
      const batch = data.batches.find((item) => item.id === student.batchId);
      if (!batch) return [];

      return data.sessions.map((session) => {
        const schedule = getSessionDateTimes(session, batch);
        const attendance = data.attendance.find(
          (item) => item.studentId === student.id && item.sessionId === session.id,
        );

        return {
          student,
          batch,
          session,
          moduleNumber: Math.ceil(session.globalNumber / 8),
          startsAt: schedule.startsAt,
          meetLink: schedule.meetLink,
          attendanceStatus: attendance?.status ?? "current",
        };
      });
    });
  const upcomingClasses = classRows
    .filter((item) => item.startsAt.getTime() >= now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 6);
  const todayClasses = classRows
    .filter((item) => {
      const key = formatInTimeZone(item.startsAt, ADMIN_TIME_ZONE, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return key === adminToday;
    })
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const pendingPasswordRequests = data.passwordRequests.filter((request) => request.status === "pending");

  return (
    <AnimatedPage>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage students, batches, assignments, resources, attendance, feedback, and announcements."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="users" label="Total Students" value={data.students.length} />
        <StatCard icon="book" label="Active Batches" value={data.batches.length} />
        <StatCard icon="review" label="Homework Assigned Today" value={homeworkToday} />
        <StatCard icon="megaphone" label="Pending Reviews" value={pendingReviews} />
      </div>

      <section>
        <h2 className="font-heading text-2xl font-bold">Shortcuts</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["Add Student", "/admin/students", PlusCircle],
            ["Assign Homework", "/admin/homework", ClipboardCheck],
            ["Update Meet Link", "/admin/batches", Link2],
            ["Add Resource", "/admin/resources", FilePlus2],
          ].map(([label, href, Icon]) => (
            <Link key={String(label)} href={String(href)} className="premium-card premium-card-hover rounded-xl p-5">
              <Icon className="h-6 w-6 text-accent" />
              <p className="mt-5 font-heading font-bold">{String(label)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Today in IST</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Today&apos;s classes</h2>
          </div>
          <p className="font-mono text-xs text-text-muted">{ADMIN_TIME_ZONE}</p>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {todayClasses.length > 0 ? todayClasses.map(({ student, batch, session, moduleNumber, meetLink, attendanceStatus }) => (
            <article key={`today-${student.id}-${batch.id}-${session.id}`} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-accent" />
                    <p className="font-heading font-bold">{student.fullName}</p>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    Module {moduleNumber} · Session {session.sessionNumber} · {session.title}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{batch.name}</p>
                  <p className="mt-3 font-mono text-xs text-accent">
                    {formatSessionTime(session, batch, ADMIN_TIME_ZONE)}
                  </p>
                  <p className="mt-2 text-xs text-text-muted">
                    Batch timezone: {formatSessionTime(session, batch, batch.timeZone)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge
                    status={attendanceStatus}
                    label={attendanceStatus === "current" ? `M${moduleNumber} S${session.sessionNumber}` : attendanceStatus}
                  />
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="button-motion rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg-base"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4 text-sm text-text-secondary">
              No classes scheduled today in IST.
            </div>
          )}
        </div>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Admin timezone</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Upcoming classes</h2>
          </div>
          <p className="font-mono text-xs text-text-muted">{ADMIN_TIME_ZONE}</p>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {upcomingClasses.map(({ student, batch, session, moduleNumber, meetLink, attendanceStatus }) => (
            <article
              key={`${student.id}-${batch.id}-${session.id}`}
              className="rounded-xl border border-border/70 bg-white/[0.025] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-accent" />
                    <p className="font-heading font-bold">{student.fullName}</p>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    Module {moduleNumber} · Session {session.sessionNumber} · {session.title}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{batch.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge
                    status={attendanceStatus}
                    label={attendanceStatus === "current" ? `M${moduleNumber} S${session.sessionNumber}` : attendanceStatus}
                  />
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="button-motion inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Link
                  </a>
                </div>
              </div>
              <p className="mt-4 font-mono text-xs text-accent">
                {formatSessionTime(session, batch, ADMIN_TIME_ZONE)}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Batch timezone: {formatSessionTime(session, batch, batch.timeZone)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Password requests</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {pendingPasswordRequests.length > 0 ? pendingPasswordRequests.map((request) => (
            <article key={request.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading font-bold">{request.studentName}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {request.reason || "No reason provided."}
                  </p>
                  <p className="mt-2 font-mono text-xs text-text-muted">
                    Requested {formatDate(request.requestedAt)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["approved", "rejected"].map((status) => (
                  <form key={status} action={reviewPasswordRequestAction}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="status" value={status} />
                    <button className="button-motion rounded-xl border border-border bg-bg-card px-3 py-2 text-sm capitalize text-text-secondary hover:text-text-primary">
                      {status}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          )) : (
            <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4 text-sm text-text-secondary">
              No pending password requests.
            </div>
          )}
        </div>
      </section>

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Recent class joins</h2>
        <div className="mt-5 space-y-3">
          {data.classJoinEvents.length > 0 ? data.classJoinEvents.slice(0, 6).map((event) => (
            <article key={event.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading font-bold">{event.studentName}</p>
                  <p className="mt-1 text-sm text-text-secondary">{event.sessionName}</p>
                </div>
                <p className="font-mono text-xs text-text-muted">{formatDate(event.joinedAt)}</p>
              </div>
            </article>
          )) : (
            <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4 text-sm text-text-secondary">
              No class joins recorded yet.
            </div>
          )}
        </div>
      </section>

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Recent activity</h2>
        <div className="mt-5 overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="font-mono text-xs uppercase text-text-muted">
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4">Homework</th>
                <th className="py-3 pr-4">Session</th>
                <th className="py-3 pr-4">Due</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.homework.slice(0, 10).map((item) => (
                <tr key={item.id} className="border-b border-border/40">
                  <td className="py-4 pr-4 font-medium">{item.title}</td>
                  <td className="py-4 pr-4 text-text-secondary">{item.sessionName}</td>
                  <td className="py-4 pr-4 text-text-secondary">{formatDate(item.dueDate)}</td>
                  <td className="py-4 pr-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AnimatedPage>
  );
}
