import { Megaphone } from "lucide-react";
import type { Announcement } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <article className="rounded-xl border border-border/80 bg-white/[0.025] p-4">
      <div className="flex gap-3">
        <span className="mt-0.5 text-accent">
          <Megaphone className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm leading-6 text-text-primary">{announcement.message}</p>
          <p className="mt-2 font-mono text-xs text-text-muted">
            {formatDate(announcement.createdAt, { year: undefined })}
          </p>
        </div>
      </div>
    </article>
  );
}
