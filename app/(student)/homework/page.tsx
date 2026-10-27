import { Orbit, Sparkles } from "lucide-react";
import { HomeworkTracker } from "@/components/portal/homework-tracker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { CourseLevelSwitcher } from "@/components/portal/course-level-switcher";
import { getStudentHomeworkData } from "@/lib/data";
import { courseLevelSwitcherItems, selectCourseCurriculum } from "@/lib/level-two";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; level?: string }>;
}) {
  const { session, level } = await searchParams;
  const data = await getStudentHomeworkData();
  const curriculum = selectCourseCurriculum(data.curricula, level, data.activeCourseLevel);
  const homework = data.homework.filter((item) => (item.courseLevel ?? 1) === curriculum.level);

  return (
    <AnimatedPage className={curriculum.level === 2 ? "level-two-homework-theme" : undefined}>
      <PageHeader
        title="Session Workbook"
        subtitle={`Level ${curriculum.level} class challenges and home tasks, with your placement history preserved.`}
      />
      {curriculum.level === 2 ? (
        <section className="level-two-homework-hero" aria-labelledby="level-two-homework-title">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="level-two-homework-orbit" aria-hidden="true">
                <Orbit className="h-6 w-6" />
              </span>
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  Level 2 · Advanced Track
                </p>
                <h2 id="level-two-homework-title" className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
                  Advanced Agentic AI
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                  Build orchestrated workflows, reason across connected systems, and evaluate AI with greater depth.
                </p>
              </div>
            </div>
            <span className="level-two-homework-badge">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Advanced
            </span>
          </div>
        </section>
      ) : null}
      <CourseLevelSwitcher
        selectedLevel={curriculum.level}
        items={courseLevelSwitcherItems(data.curricula)}
        className="mb-6"
      />
      <HomeworkTracker
        key={curriculum.level}
        homework={homework}
        sessions={curriculum.sessions}
        initialSessionId={session}
      />
    </AnimatedPage>
  );
}
