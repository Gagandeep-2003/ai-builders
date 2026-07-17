import { MessageSquareText } from "lucide-react";
import { markAdminChatReadAction, sendAdminChatMessageAction } from "@/app/actions/chat";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatReadMarker } from "@/components/chat/chat-read-marker";
import { ChatThreadList } from "@/components/chat/chat-thread-list";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminChatData } from "@/lib/data";

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
          <ChatThreadList threads={data.threads} selectedId={selectedId} />
        </aside>

        {data.selectedStudent ? (
          <ChatPanel
            key={data.selectedStudent.id}
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
