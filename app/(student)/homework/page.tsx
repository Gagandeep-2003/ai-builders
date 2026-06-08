import { HomeworkTracker } from "@/components/portal/homework-tracker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentDashboardData } from "@/lib/data";

export default async function HomeworkPage() {
  const data = await getStudentDashboardData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Session Workbook"
        subtitle="Open each session to complete class challenges and home tasks inside the portal."
      />
      <HomeworkTracker homework={data.homework} sessions={data.sessions} />
    </AnimatedPage>
  );
}
