import { ResourceLibrary } from "@/components/portal/resource-library";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { CourseLevelSwitcher } from "@/components/portal/course-level-switcher";
import { getStudentResourcesData } from "@/lib/data";
import { courseLevelSwitcherItems, selectCourseCurriculum } from "@/lib/level-two";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const data = await getStudentResourcesData();
  const curriculum = selectCourseCurriculum(data.curricula, level, data.activeCourseLevel);
  const sessionIds = new Set(curriculum.sessions.map((session) => session.id));
  const resources = curriculum.level === 1
    ? data.resources.filter((resource) => sessionIds.has(resource.sessionId))
    : [];

  return (
    <AnimatedPage>
      <PageHeader
        title="Resource Library"
        subtitle={curriculum.level === 1
          ? "Open session decks inside the portal, expand them when needed, and keep upcoming module resources organized."
          : "Level 2 activity documents are available in Homework. Dedicated Level 2 presentation resources will appear here when added."}
      />
      <CourseLevelSwitcher
        selectedLevel={curriculum.level}
        items={courseLevelSwitcherItems(data.curricula)}
        className="mb-6"
      />
      <ResourceLibrary
        key={curriculum.level}
        resources={resources}
        modules={curriculum.modules}
        sessions={curriculum.level === 1 ? curriculum.sessions : []}
      />
    </AnimatedPage>
  );
}
