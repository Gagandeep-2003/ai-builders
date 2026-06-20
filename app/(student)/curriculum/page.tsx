import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { CurriculumTabs } from "@/components/portal/curriculum-tabs";
import { getStudentContextData } from "@/lib/data";

export default async function CurriculumPage() {
  const { modules, sessions } = await getStudentContextData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Full Curriculum"
        subtitle="Explore all 24 sessions, from AI literacy to app building and workflow automation."
      />
      <CurriculumTabs modules={modules} sessions={sessions} />
    </AnimatedPage>
  );
}
