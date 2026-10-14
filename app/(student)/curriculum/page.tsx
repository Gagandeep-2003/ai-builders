import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { CurriculumTabs } from "@/components/portal/curriculum-tabs";
import { getStudentContextData } from "@/lib/data";

export default async function CurriculumPage() {
  const { student, modules, sessions } = await getStudentContextData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Full Curriculum"
        subtitle={`Level ${student.courseLevel} · Explore all 24 sessions across Modules 1, 2, and 3.`}
      />
      <CurriculumTabs modules={modules} sessions={sessions} />
    </AnimatedPage>
  );
}
