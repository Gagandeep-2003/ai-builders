import Link from "next/link";
import {
  Activity,
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
import { formatClassEventTime, getAdminClassEvents } from "@/lib/class-events";
import { getAdminData } from "@/lib/data";
import { ADMIN_TIME_ZONE, formatInTimeZone } from "@/lib/time";
import { formatDate } from "@/lib/utils";

function getPresenceState(lastSeenAt: string | undefined, now: Date) {
  if (!lastSeenAt) {
    return {
      label: "No activity yet",
      tone: "border-border bg-white/[0.025] text-text-muted",
      dot: "bg-text-muted",
      rank: 3,
    };
  }

  const seenAt = new Date(lastSeenAt);
  const ageMs = now.getTime() - seenAt.getTime();

  if (!Number.isFinite(ageMs)) {
    return {
      label: "No activity yet",
      tone: "border-border bg-white/[0.025] text-text-muted",
      dot: "bg-text-muted",
      rank: 3,
    };
  }

  if (ageMs <= 2 * 60_000) {
    return {
      label: "Online now",
      tone: "border-accent/30 bg-accent/10 text-accent",
      dot: "bg-accent shadow-[0_0_14px_rgba(110,231,183,0.75)]",
      rank: 0,
    };
  }

  if (ageMs <= 15 * 60_000) {
    return {
      label: "Active recently",
      tone: "border-amber-300/30 bg-amber-300/10 text-amber-100",
      dot: "bg-amber-200",
      rank: 1,
    };
  }

  return {
    label: "Away",
    tone: "border-border bg-white/[0.025] text-text-secondary",
    dot: "bg-text-secondary",
    rank: 2,
  };
}

function formatLastSeen(lastSeenAt: string | undefined, now: Date) {
  if (!lastSeenAt) return "No portal activity recorded yet";

  const seenAt = new Date(lastSeenAt);
  const ageMs = now.getTime() - seenAt.getTime();
  if (!Number.isFinite(ageMs)) return "No portal activity recorded yet";

  const minutes = Math.max(0, Math.round(ageMs / 60_000));
  if (minutes < 1) return "Seen just now";
  if (minutes === 1) return "Seen 1 minute ago";
  if (minutes < 60) return `Seen ${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  if (hours === 1) return "Seen 1 hour ago";
  if (hours < 24) return `Seen ${hours} hours ago`;

  return `Seen ${formatDate(lastSeenAt)}`;
}

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
  const classEvents = getAdminClassEvents({
    students: data.students,
    batches: data.batches,
    sessions: data.sessions,
    requests: data.rescheduleRequests,
    attendance: data.attendance,
    now,
  });
  const upcomingClasses = classEvents
    .filter((item) => item.startsAt.getTime() >= now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 6);
  const todayClasses = classEvents
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
  const studentActivity = data.students
    .map((student) => ({
      student,
      presence: getPresenceState(student.lastSeenAt, now),
      lastSeen: formatLastSeen(student.lastSeenAt, now),
      lastSeenMs: student.lastSeenAt ? new Date(student.lastSeenAt).getTime() : 0,
    }))
    .sort((a, b) => a.presence.rank - b.presence.rank || b.lastSeenMs - a.lastSeenMs);
  const onlineStudents = studentActivity.filter((item) => item.presence.label === "Online now").length;
  const recentStudents = studentActivity.filter((item) => item.presence.label === "Active recently").length;

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

      <section className="premium-card rounded-xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Live portal signal</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Student activity</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent">
              {onlineStudents} online
            </span>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 font-mono text-xs text-amber-100">
              {recentStudents} recent
            </span>
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {studentActivity.slice(0, 8).map(({ student, presence, lastSeen }) => {
            const batch = data.batches.find((item) => item.id === student.batchId);
            return (
              <article
                key={`activity-${student.id}`}
                className={`rounded-xl border p-4 ${presence.tone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${presence.dot}`} />
                      <p className="truncate font-heading font-bold text-text-primary">{student.fullName}</p>
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">{student.email}</p>
                    <p className="mt-1 text-xs text-text-muted">{batch?.name ?? "Unassigned batch"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 font-mono text-[0.65rem] uppercase">
                      <Activity className="h-3 w-3" />
                      {presence.label}
                    </span>
                    <p className="mt-2 text-xs text-text-muted">{lastSeen}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

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
          {todayClasses.length > 0 ? todayClasses.map((event) => {
            const moduleNumber = event.session ? Math.ceil(event.session.globalNumber / 8) : undefined;
            return (
            <article key={`today-${event.id}`} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-accent" />
                    <p className="font-heading font-bold">{event.student?.fullName}</p>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    {event.kind === "makeup"
                      ? event.detail
                      : `Module ${moduleNumber} · Session ${event.session?.sessionNumber} · ${event.title}`}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{event.batch.name}</p>
                  <p className="mt-3 font-mono text-xs text-accent">
                    {formatClassEventTime(event, ADMIN_TIME_ZONE)}
                  </p>
                  <p className="mt-2 text-xs text-text-muted">
                    Student time: {formatClassEventTime(event, event.student?.timeZone ?? event.batch.timeZone)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge
                    status={event.kind === "makeup" ? "rescheduled" : event.status}
                    label={event.kind === "makeup" ? "Make-up" : event.status === "current" ? `M${moduleNumber} S${event.session?.sessionNumber}` : event.status}
                  />
                  <a
                    href={event.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="button-motion rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg-base"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            </article>
          )}) : (
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
          {upcomingClasses.map((event) => {
            const moduleNumber = event.session ? Math.ceil(event.session.globalNumber / 8) : undefined;
            return (
            <article
              key={event.id}
              className="rounded-xl border border-border/70 bg-white/[0.025] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-accent" />
                    <p className="font-heading font-bold">{event.student?.fullName}</p>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    {event.kind === "makeup"
                      ? event.detail
                      : `Module ${moduleNumber} · Session ${event.session?.sessionNumber} · ${event.title}`}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{event.batch.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge
                    status={event.kind === "makeup" ? "rescheduled" : event.status}
                    label={event.kind === "makeup" ? "Make-up" : event.status === "current" ? `M${moduleNumber} S${event.session?.sessionNumber}` : event.status}
                  />
                  <a
                    href={event.meetLink}
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
                {formatClassEventTime(event, ADMIN_TIME_ZONE)}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Student time: {formatClassEventTime(event, event.student?.timeZone ?? event.batch.timeZone)}
              </p>
            </article>
          )})}
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
