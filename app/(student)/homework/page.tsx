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
    <AnimatedPage>
      <PageHeader
        title="Session Workbook"
        subtitle={`Level ${curriculum.level} class challenges and home tasks, with your placement history preserved.`}
      />
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
