import { createResourceAction, deleteResourceAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminResourcesPage() {
  const data = await getAdminData();

  return (
    <AnimatedPage>
      <PageHeader title="Resource Manager" subtitle="Add, organize, and remove learning resources." />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Add resource</h2>
        <form action={createResourceAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="title" placeholder="Resource title" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <select name="type" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            <option value="link">Link</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="note">Note</option>
          </select>
          <input name="url" placeholder="URL" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2" />
          <select name="moduleId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {data.modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          <select name="sessionId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            <option value="">No specific session</option>
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.title}</option>
            ))}
          </select>
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
            Add Resource
          </button>
        </form>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="font-mono text-xs uppercase text-text-muted">
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Session</th>
                <th className="py-3 pr-4">Created</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.resources.map((resource) => (
                <tr key={resource.id} className="border-b border-border/40">
                  <td className="py-4 pr-4 font-medium">{resource.title}</td>
                  <td className="py-4 pr-4 text-text-secondary uppercase">{resource.type}</td>
                  <td className="py-4 pr-4 text-text-secondary">{resource.sessionName}</td>
                  <td className="py-4 pr-4 text-text-secondary">{formatDate(resource.createdAt)}</td>
                  <td className="py-4 pr-4">
                    <form action={deleteResourceAction}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <button className="text-danger">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AnimatedPage>
  );
}
