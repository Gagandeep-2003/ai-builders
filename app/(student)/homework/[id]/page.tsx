import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList, Flag, Sparkles } from "lucide-react";
import { HomeworkDocumentViewer } from "@/components/portal/homework-document-viewer";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStudentDashboardData } from "@/lib/data";
import { formatDuration, formatHomeworkKind, getGoogleDocEmbedUrl, isTrustedTaskDuration } from "@/lib/homework-utils";
import { formatDate } from "@/lib/utils";

function DetailList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
      <p className="font-mono text-xs uppercase text-accent">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InstructionSteps({ items }: { items?: string[] }) {
  if (!items?.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item} className="group flex gap-3 rounded-xl border border-border/70 bg-white/[0.025] p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/10 font-mono text-xs text-accent">
            {index + 1}
          </span>
          <p className="pt-1 text-sm leading-6 text-text-secondary transition group-hover:text-text-primary">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function HomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStudentDashboardData();
  const homework = data.homework.find((item) => item.id === id);

  if (!homework) notFound();

  const embedUrl = getGoogleDocEmbedUrl(homework.contentUrl);
  const moduleNumber = Math.ceil(
    (data.sessions.find((session) => session.id === homework.sessionId)?.globalNumber ?? 1) / 8,
  );
  const sessionNumber = data.sessions.find((session) => session.id === homework.sessionId)?.sessionNumber ?? 1;
  const isCompleted = homework.status !== "pending";
  const hasStaleTiming =
    isCompleted && typeof homework.timeSpentSeconds === "number" && !isTrustedTaskDuration(homework.timeSpentSeconds);
  const displayTimeSpent = hasStaleTiming ? "Needs restart" : formatDuration(homework.timeSpentSeconds);

  return (
    <AnimatedPage>
      <Link href="/homework" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent">
        <ArrowLeft className="h-4 w-4" />
        Back to homework
      </Link>

      <PageHeader
        title={homework.title}
        subtitle={`Module ${moduleNumber} · Session ${sessionNumber} · ${homework.sessionName} · ${formatHomeworkKind(homework.kind)}`}
        action={<StatusBadge status={homework.status} />}
      />

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Due</p>
          <p className="mt-2 font-heading text-lg font-bold">{formatDate(homework.dueDate)}</p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Started</p>
          <p className="mt-2 font-heading text-lg font-bold">
            {hasStaleTiming ? "Reset required" : homework.startedAt ? formatDate(homework.startedAt) : "Not started"}
          </p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Completed</p>
          <p className="mt-2 font-heading text-lg font-bold">
            {hasStaleTiming ? "Reset required" : homework.submittedAt ? formatDate(homework.submittedAt) : "Not yet"}
          </p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Time spent</p>
          <p className="mt-2 font-heading text-lg font-bold">{displayTimeSpent}</p>
        </div>
      </section>

      <section className="premium-card rounded-xl p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm leading-6 text-text-secondary">{homework.description}</p>
            {homework.details ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {homework.details.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase text-accent"
                  >
                    {tool}
                  </span>
                ))}
                <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] uppercase text-text-secondary">
                  {homework.details.aiType}
                </span>
              </div>
            ) : null}
            {homework.contentUrl ? (
              <a
                href={homework.contentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-accent underline-offset-4 hover:underline"
              >
                Open document in new tab
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {homework.details ? (
        <section className="premium-card overflow-hidden rounded-xl p-0">
          <div className="border-b border-border/70 bg-white/[0.025] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-accent">Task roadmap</p>
                <h2 className="mt-2 font-heading text-2xl font-bold">Follow this path</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                  Start with the mission, complete the steps in order, then use the checklist before submitting.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {homework.details.aiType}
              </span>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="space-y-4 border-b border-border/70 p-5 xl:border-b-0 xl:border-r">
              {homework.details.mission ? (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-accent" />
                    <p className="font-mono text-xs uppercase text-accent">Mission</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{homework.details.mission}</p>
                </div>
              ) : null}
              {homework.details.scenario ? (
                <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-accent" />
                    <p className="font-mono text-xs uppercase text-accent">Scenario</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{homework.details.scenario}</p>
                </div>
              ) : null}
              {homework.details.prompt ? (
                <details className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <summary className="cursor-pointer list-none font-mono text-xs uppercase text-accent">
                    Suggested prompt
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-bg-elevated p-4 font-mono text-xs leading-6 text-text-secondary scrollbar-soft">
                    {homework.details.prompt}
                  </pre>
                </details>
              ) : null}
            </div>

            <div className="space-y-5 p-5">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <p className="font-mono text-xs uppercase text-accent">Instructions</p>
                </div>
                <InstructionSteps items={homework.details.instructions} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <DetailList title="Deliverables" items={homework.details.deliverables} />
                <DetailList title="Checklist" items={homework.details.checklist} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <HomeworkDocumentViewer
        homeworkId={homework.id}
        src={homework.contentUrl ? embedUrl : ""}
        title={homework.title}
        initialStartedAt={homework.startedAt}
        initialTimeSpentSeconds={homework.timeSpentSeconds}
        completed={isCompleted}
      />
    </AnimatedPage>
  );
}
