import { deleteAnnouncementAction, postAnnouncementAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminAnnouncementsPage() {
  const data = await getAdminData();

  return (
    <AnimatedPage>
      <PageHeader title="Announcements" subtitle="Post batch updates or global announcements." />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Post announcement</h2>
        <form action={postAnnouncementAction} className="mt-5 grid gap-4">
          <select name="batchId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            <option value="all">All batches</option>
            {data.batches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
          <textarea name="message" placeholder="Announcement message" className="min-h-28 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
            Post Announcement
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {data.announcements.map((announcement) => (
          <article key={announcement.id} className="premium-card rounded-xl p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="leading-7 text-text-secondary">{announcement.message}</p>
                <p className="mt-3 font-mono text-xs text-text-muted">{formatDate(announcement.createdAt)}</p>
              </div>
              <form action={deleteAnnouncementAction}>
                <input type="hidden" name="announcementId" value={announcement.id} />
                <button className="text-danger">Delete</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </AnimatedPage>
  );
}
