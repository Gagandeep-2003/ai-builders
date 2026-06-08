import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HomeworkDocumentViewer } from "@/components/portal/homework-document-viewer";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStudentDashboardData } from "@/lib/data";
import { formatDuration, formatHomeworkKind, getGoogleDocEmbedUrl, isTrustedTaskDuration } from "@/lib/homework-utils";
import { formatDate } from "@/lib/utils";

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
