import { createResourceAction, deleteResourceAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminResourcesPage() {
  const data = await getAdminData();

  return (
    <AnimatedPage>
      <PageHeader title="Resource Manager" subtitle="Add, organize, and remove learning resources." />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Publish a resource</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Attach it to a session. It becomes visible automatically when that session is unlocked for the student.
        </p>
        <form action={createResourceAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="title" required placeholder="Resource title" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <select name="type" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            <option value="link">Link</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="note">Note</option>
          </select>
          <input name="url" type="url" required placeholder="https://..." className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2" />
          <select name="sessionId" required className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2">
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                Module {Math.ceil(session.globalNumber / 8)} · Session {session.sessionNumber} · {session.title}
              </option>
            ))}
          </select>
          <SubmitButton
            pendingLabel="Publishing resource..."
            className="rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2"
          >
            Publish resource
          </SubmitButton>
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
                  <td className="py-4 pr-4 font-medium">
                    <a href={resource.url} target="_blank" rel="noreferrer" className="hover:text-accent">
                      {resource.title}
                    </a>
                  </td>
                  <td className="py-4 pr-4 text-text-secondary uppercase">{resource.type}</td>
                  <td className="py-4 pr-4 text-text-secondary">{resource.sessionName}</td>
                  <td className="py-4 pr-4 text-text-secondary">{formatDate(resource.createdAt)}</td>
                  <td className="py-4 pr-4">
                    <form action={deleteResourceAction}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <SubmitButton
                        pendingLabel="Deleting..."
                        className="text-[color:var(--danger)]"
                      >
                        Delete
                      </SubmitButton>
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
