import { StudentManager } from "@/components/admin/student-manager";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminStudentsData } from "@/lib/data";

export default async function AdminStudentsPage() {
  const data = await getAdminStudentsData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Student Setup"
        subtitle="Create and manage each student's login, profile, timezone, course schedule, and Meet links in one place."
      />
      <StudentManager
        students={data.students}
        batches={data.batches}
        modules={data.modules}
      />
    </AnimatedPage>
  );
}
