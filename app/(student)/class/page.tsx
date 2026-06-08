import { CheckCircle2, CircleDot } from "lucide-react";
import { ClassLiveCard } from "@/components/portal/class-live-card";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStudentDashboardData } from "@/lib/data";
import { formatBatchSchedule, formatSessionTime, getActiveOrNextJoinSession } from "@/lib/time";

export default async function ClassPage({
  searchParams,
}: {
  searchParams: Promise<{ join?: string }>;
}) {
  const { join } = await searchParams;
  const data = await getStudentDashboardData();
  const nextSession = getActiveOrNextJoinSession(data.sessions, data.batch) ?? data.sessions[0];

  return (
    <AnimatedPage>
      <PageHeader
        title="My Class"
        subtitle="Your batch schedule, live class link, and upcoming session timeline."
      />
      {join === "attendance-error" ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-rose-200">
          We could not sync your attendance. Please try joining again or message your tutor.
        </div>
      ) : null}
      {join === "not-open" ? (
        <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/10 p-4 text-sm text-amber-100">
          The class link opens 15 minutes before the scheduled start time.
        </div>
      ) : null}
      <ClassLiveCard batch={data.batch} nextSession={nextSession} viewerTimeZone={data.student.timeZone} />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Your local time</p>
          <p className="mt-2 font-heading text-xl font-bold">
            {formatBatchSchedule(data.batch, data.student.timeZone)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{data.student.timeZone}</p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Bootcamp time</p>
          <p className="mt-2 font-heading text-xl font-bold">
            {formatBatchSchedule(data.batch, data.batch.timeZone)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{data.batch.timeZone}</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold">Session schedule</h2>
        <div className="mt-5 space-y-3">
          {data.sessions.map((session) => (
            <article
              key={session.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                {session.status === "completed" ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
                ) : (
                  <CircleDot className="mt-1 h-5 w-5 text-text-muted" />
                )}
                <div>
                  <p className="font-heading font-bold">{session.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Session {session.globalNumber} · {formatSessionTime(session, data.batch, data.student.timeZone)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    Admin time: {formatSessionTime(session, data.batch, data.batch.timeZone)}
                  </p>
                </div>
              </div>
              <StatusBadge status={session.status} />
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
