import { BookOpenCheck, ChevronDown, ExternalLink } from "lucide-react";
import { levelTwoCatalog } from "@/lib/level-two";

function activityLabel(kind: "class_challenge" | "home_task", number: number) {
  return kind === "class_challenge"
    ? `Class Activity ${number}`
    : `Home Task ${number}`;
}

export function AdminLevelTwoCatalog() {
  const sessionCount = levelTwoCatalog.modules.reduce(
    (total, module) => total + module.sessions.length,
    0,
  );
  const activityCount = levelTwoCatalog.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal + module.sessions.reduce(
        (sessionTotal, session) => sessionTotal + session.activities.length,
        0,
      ),
    0,
  );

  return (
    <section className="premium-card rounded-xl p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <BookOpenCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-xs uppercase text-accent">Level 2 course catalog</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">All Level 2 exercises</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Review the complete read-only catalog here. Students receive these same activities in
              their Level 2 workbook according to their assigned starting module and session.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [levelTwoCatalog.modules.length, "Modules"],
            [sessionCount, "Sessions"],
            [activityCount, "Exercises"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-border bg-bg-elevated px-3 py-2">
              <p className="font-heading text-lg font-bold text-accent">{value}</p>
              <p className="font-mono text-[9px] uppercase text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {levelTwoCatalog.modules.map((module) => (
          <details
            key={module.id}
            className="group rounded-xl border border-border/70 bg-white/[0.02]"
            open={module.number === 1}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
              <div>
                <p className="font-mono text-xs uppercase text-accent">
                  Level 2 · Module {module.number}
                </p>
                <h3 className="mt-1 font-heading text-lg font-bold">{module.title}</h3>
                <p className="mt-1 text-xs text-text-muted">8 sessions · 32 exercises</p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition group-open:rotate-180" />
            </summary>

            <div className="space-y-3 border-t border-border/60 p-4">
              {module.sessions.map((session) => (
                <details
                  key={session.id}
                  className="group/session rounded-xl border border-border/70 bg-bg-card"
                  open={module.number === 1 && session.number === 1}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-mono text-xs uppercase text-text-muted">
                        Module {module.number} · Session {session.number}
                      </p>
                      <h4 className="mt-1 font-heading font-bold">{session.title}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase text-accent">
                        4 exercises
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition group-open/session:rotate-180" />
                    </div>
                  </summary>

                  <div className="grid gap-3 border-t border-border/60 p-4 md:grid-cols-2">
                    {session.activities.map((activity) => (
                      <article
                        key={activity.id}
                        className="rounded-xl border border-border/70 bg-white/[0.025] p-4"
                      >
                        <p className="font-mono text-[10px] uppercase text-accent">
                          {activityLabel(activity.kind, activity.number)}
                        </p>
                        <h5 className="mt-2 font-heading font-bold">{activity.title}</h5>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                          {activity.overview}
                        </p>
                        <a
                          href={activity.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Google Doc
                        </a>
                      </article>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
