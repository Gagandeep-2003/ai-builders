import { ResourceLibrary } from "@/components/portal/resource-library";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentDashboardData } from "@/lib/data";

export default async function ResourcesPage() {
  const data = await getStudentDashboardData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Resource Library"
        subtitle="Open session decks inside the portal, expand them when needed, and keep upcoming module resources organized."
      />
      <ResourceLibrary resources={data.resources} modules={data.modules} />
    </AnimatedPage>
  );
}
