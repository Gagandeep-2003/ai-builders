import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList, FileCheck2, Lightbulb, Sparkles } from "lucide-react";
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

function PhaseCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{label}</p>
      <h3 className="mt-2 font-heading text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
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
  const taskDetails = homework.details ?? {
    tools: [] as string[],
    aiType: "Coursework",
    mission: homework.description,
    scenario: "Use the task brief and attached document to complete the activity, then submit proof from inside the portal.",
    instructions: [
      "Read the task brief and open the attached document if one is available.",
      "Complete the work using the recommended AI tool or your class instructions.",
      "Review your output against the deliverables and checklist.",
      "Submit the activity with screen proof, camera proof, text evidence, or a small attachment.",
    ],
    prompt: "",
    deliverables: ["Completed activity", "Submission proof or note", "Any required link, screenshot, or file"],
    checklist: ["The work matches the task brief.", "Evidence is attached before submission.", "The final output is clear enough for admin review."],
  };

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
            <p className="font-mono text-xs uppercase text-accent">Task brief</p>
            <p className="text-sm leading-6 text-text-secondary">{homework.description}</p>
            {taskDetails.tools.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {taskDetails.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase text-accent"
                  >
                    {tool}
                  </span>
                ))}
                <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] uppercase text-text-secondary">
                  {taskDetails.aiType}
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

      <section className="premium-card overflow-hidden rounded-xl p-0">
        <div className="relative overflow-hidden border-b border-border/70 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(110,231,183,0.13),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(96,165,250,0.10),transparent_26%)]" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Task Studio</p>
                <h2 className="mt-2 font-heading text-3xl font-bold">Build it in four clear moves</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
                  Use this guided flow instead of hunting through scattered sections. Read the brief, run the prompt, produce the proof, then submit.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                {taskDetails.aiType}
              </span>
            </div>
            <div className="relative mt-6 grid gap-3 md:grid-cols-4">
              <PhaseCard label="01" title="Understand" description={taskDetails.mission || "Know the goal before opening the tool."} />
              <PhaseCard label="02" title="Create" description="Follow the action steps and generate the required output." />
              <PhaseCard label="03" title="Check" description="Compare your work with the deliverables and checklist." />
              <PhaseCard label="04" title="Submit" description="Attach proof, notes, or files when you mark the task complete." />
            </div>
        </div>

          <div className="grid gap-0 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="space-y-5 border-b border-border/70 p-5 xl:border-b-0 xl:border-r">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  <p className="font-mono text-xs uppercase text-accent">Action steps</p>
                </div>
                <InstructionSteps items={taskDetails.instructions} />
              </div>
              {taskDetails.prompt ? (
                <details className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <summary className="cursor-pointer list-none font-mono text-xs uppercase text-accent">
                    Open suggested AI prompt
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-bg-elevated p-4 font-mono text-xs leading-6 text-text-secondary scrollbar-soft">
                    {taskDetails.prompt}
                  </pre>
                </details>
              ) : null}
            </div>

            <div className="space-y-4 p-5">
              {taskDetails.scenario ? (
                <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    <p className="font-mono text-xs uppercase text-accent">Why this matters</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{taskDetails.scenario}</p>
                </div>
              ) : null}
              <div className="grid gap-4">
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-accent" />
                    <p className="font-mono text-xs uppercase text-accent">What to submit</p>
                  </div>
                  <DetailList title="Deliverables" items={taskDetails.deliverables} />
                </div>
                <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <p className="font-mono text-xs uppercase text-accent">Final quality check</p>
                  </div>
                  <DetailList title="Checklist" items={taskDetails.checklist} />
                </div>
              </div>
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
