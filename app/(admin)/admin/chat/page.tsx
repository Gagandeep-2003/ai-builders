import Link from "next/link";
import { MessageSquareText, Search, UserRound } from "lucide-react";
import { markAdminChatReadAction, sendAdminChatMessageAction } from "@/app/actions/chat";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatReadMarker } from "@/components/chat/chat-read-marker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminChatData } from "@/lib/data";
import { cn } from "@/lib/utils";

function messagePreview(body?: string) {
  const text = body?.trim();
  if (!text) return "Voice note";
  return text.length > 58 ? `${text.slice(0, 58)}...` : text;
}

function relativeTime(value?: string) {
  if (!value) return "No messages yet";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "No messages yet";
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string | string[] }>;
}) {
  const params = await searchParams;
  const studentId = Array.isArray(params.student) ? params.student[0] : params.student;
  const data = await getAdminChatData(studentId);
  const selectedId = data.selectedStudent?.id;

  return (
    <AnimatedPage>
      {selectedId ? (
        <ChatReadMarker markReadAction={markAdminChatReadAction.bind(null, selectedId)} />
      ) : null}
      <PageHeader
        title="Student Chat"
        subtitle="Private mentor messages, quick follow-ups, and voice notes for every student."
      />

      <section className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="premium-card overflow-hidden rounded-3xl">
          <div className="border-b border-border/70 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-text-primary">Inbox</h2>
                <p className="text-xs text-text-muted">{data.threads.length} student threads</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-3 py-2 text-text-muted">
              <Search className="h-4 w-4" />
              <span className="text-xs">Sorted by unread and latest message</span>
            </div>
          </div>

          <div className="max-h-[72vh] overflow-y-auto p-3">
            {data.threads.length ? (
              data.threads.map((thread) => {
                const active = thread.student.id === selectedId;
                return (
                  <Link
                    key={thread.student.id}
                    href={{ pathname: "/admin/chat", query: { student: thread.student.id } }}
                    className={cn(
                      "button-motion mb-2 flex gap-3 rounded-2xl border p-3 transition",
                      active
                        ? "border-accent/45 bg-accent/12 shadow-lg shadow-accent/10"
                        : "border-border bg-bg-card/70 hover:border-accent/25 hover:bg-accent/5",
                    )}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-info font-heading text-sm font-bold text-black">
                      {initials(thread.student.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-heading text-sm font-semibold text-text-primary">
                          {thread.student.fullName}
                        </span>
                        <span className="shrink-0 text-[0.68rem] text-text-muted">
                          {relativeTime(thread.lastMessage?.createdAt)}
                        </span>
                      </span>
                      <span className="mt-1 line-clamp-1 text-xs text-text-secondary">
                        {messagePreview(thread.lastMessage?.body)}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-2">
                        <span className="line-clamp-1 text-[0.68rem] text-text-muted">
                          {thread.student.country || thread.student.timeZone || "Student"}
                        </span>
                        {thread.unreadCount ? (
                          <span className="rounded-full border border-accent/35 bg-accent/15 px-2 py-0.5 text-[0.68rem] font-semibold text-accent">
                            {thread.unreadCount}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl border border-border bg-bg-elevated p-5 text-center">
                <UserRound className="mx-auto h-8 w-8 text-text-muted" />
                <p className="mt-3 font-heading text-sm font-semibold text-text-primary">No students found</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Add students first, then this inbox will become your private message hub.
                </p>
              </div>
            )}
          </div>
        </aside>

        {data.selectedStudent ? (
          <ChatPanel
            action={sendAdminChatMessageAction}
            messages={data.messages}
            currentRole="admin"
            peerName={data.selectedStudent.fullName}
            studentId={data.selectedStudent.id}
          />
        ) : (
          <div className="premium-card grid min-h-[32rem] place-items-center rounded-3xl p-8 text-center">
            <div>
              <MessageSquareText className="mx-auto h-10 w-10 text-text-muted" />
              <h2 className="mt-4 font-heading text-2xl font-bold text-text-primary">Choose a student</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Select a thread to send reminders, answer doubts, or record a quick voice note.
              </p>
            </div>
          </div>
        )}
      </section>
    </AnimatedPage>
  );
}
