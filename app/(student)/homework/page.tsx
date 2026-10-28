import { Orbit, Sparkles } from "lucide-react";
import { HomeworkTracker } from "@/components/portal/homework-tracker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { CourseLevelSwitcher } from "@/components/portal/course-level-switcher";
import ParticleText from "@/components/ParticleText";
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
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  <ParticleText
                    text="Level 2 · Advanced Track"
                    color="currentColor"
                    highlightColor="#38bdf8"
                    intro="scan"
                    gatherDuration={1100}
                    stagger={180}
                    scatter={70}
                    clickBurst
                    burstStrength={0.55}
                    pointerRepel={0}
                    idleDrift={0}
                    particleSize={1.25}
                    density={4}
                    fontSize="0.6875rem"
                    fontWeight={700}
                    fontFamily="inherit"
                    glow
                    style={{ height: "1.35rem", minHeight: "1.35rem", maxWidth: "18rem" }}
                  />
                </p>
                <h2 id="level-two-homework-title" className="mt-1 font-heading font-bold text-text-primary">
                  <ParticleText
                    text="Advanced Agentic AI"
                    color="currentColor"
                    highlightColor="#a78bfa"
                    intro="gather"
                    gatherDuration={1500}
                    stagger={360}
                    scatter={150}
                    clickBurst
                    burstStrength={0.8}
                    pointerRepel={20}
                    repelRadius={90}
                    idleDrift={0}
                    particleSize={1.9}
                    density={4}
                    fontSize="clamp(1.5rem, 3vw, 1.875rem)"
                    fontWeight={700}
                    fontFamily="inherit"
                    glow
                    style={{ height: "3.6rem", minHeight: "3.6rem", maxWidth: "33rem" }}
                  />
                </h2>
                <p className="mt-1 hidden max-w-2xl text-sm text-text-secondary sm:block">
                  <ParticleText
                    text="Build orchestrated workflows, reason across connected systems, and evaluate AI with greater depth."
                    color="currentColor"
                    highlightColor="#38bdf8"
                    intro="gather"
                    gatherDuration={1300}
                    stagger={240}
                    scatter={85}
                    clickBurst
                    burstStrength={0.45}
                    pointerRepel={0}
                    idleDrift={0}
                    particleSize={1.15}
                    density={5}
                    fontSize="0.875rem"
                    fontWeight={400}
                    fontFamily="inherit"
                    glow
                    style={{ height: "2rem", minHeight: "2rem" }}
                  />
                </p>
                <div className="mt-1 space-y-0.5 text-xs text-text-secondary sm:hidden">
                  {["Build orchestrated workflows,", "reason across connected systems,", "and evaluate AI with greater depth."].map((line, index) => (
                    <p key={line}>
                      <ParticleText
                        text={line}
                        color="currentColor"
                        highlightColor="#38bdf8"
                        intro="gather"
                        gatherDuration={1150}
                        stagger={180 + index * 70}
                        scatter={65}
                        clickBurst
                        burstStrength={0.4}
                        pointerRepel={0}
                        idleDrift={0}
                        particleSize={1.05}
                        density={5}
                        fontSize="0.75rem"
                        fontWeight={400}
                        fontFamily="inherit"
                        glow
                        style={{ height: "1.15rem", minHeight: "1.15rem" }}
                      />
                    </p>
                  ))}
                </div>
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
