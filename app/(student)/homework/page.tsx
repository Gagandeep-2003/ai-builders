import { HomeworkTracker } from "@/components/portal/homework-tracker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentHomeworkData } from "@/lib/data";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;
  const data = await getStudentHomeworkData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Session Workbook"
        subtitle="Open each session to complete class challenges and home tasks inside the portal."
      />
      <HomeworkTracker
        homework={data.homework}
        sessions={data.sessions}
        initialSessionId={session}
      />
    </AnimatedPage>
  );
}
