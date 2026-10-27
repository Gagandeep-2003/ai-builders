import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { CurriculumTabs } from "@/components/portal/curriculum-tabs";
import { CourseLevelSwitcher } from "@/components/portal/course-level-switcher";
import { getStudentContextData } from "@/lib/data";
import { courseLevelSwitcherItems, selectCourseCurriculum } from "@/lib/level-two";

export default async function CurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const data = await getStudentContextData();
  const curriculum = selectCourseCurriculum(data.curricula, level, data.activeCourseLevel);

  return (
    <AnimatedPage>
      <PageHeader
        title="Full Curriculum"
        subtitle={`Explore Level ${curriculum.level}'s 24 sessions. Completed, skipped, and not-enrolled history stays explicit.`}
      />
      <CourseLevelSwitcher
        selectedLevel={curriculum.level}
        items={courseLevelSwitcherItems(data.curricula)}
        className="mb-6"
      />
      <CurriculumTabs key={curriculum.level} modules={curriculum.modules} sessions={curriculum.sessions} />
    </AnimatedPage>
  );
}
