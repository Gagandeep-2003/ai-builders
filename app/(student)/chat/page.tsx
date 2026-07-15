import { MessageSquareText, ShieldCheck } from "lucide-react";
import { sendStudentChatMessageAction, markStudentChatReadAction } from "@/app/actions/chat";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatReadMarker } from "@/components/chat/chat-read-marker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentChatData } from "@/lib/data";

export default async function StudentChatPage() {
  const data = await getStudentChatData();

  return (
    <AnimatedPage>
      <ChatReadMarker markReadAction={markStudentChatReadAction} />
      <PageHeader
        title="Mentor Chat"
        subtitle="A private space for questions, reminders, feedback, and quick voice notes with your mentor."
      />

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <div className="premium-card rounded-2xl p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold">Talk to your mentor</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Use this for homework doubts, class timing questions, missed-class updates, and short voice notes.
            </p>
          </div>
          <div className="rounded-2xl border border-info/25 bg-info/10 p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-info/25 bg-info/10 text-[color:var(--info)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-text-primary">Private course support</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Messages are visible only to you and the AI Builders mentor/admin account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ChatPanel
          action={sendStudentChatMessageAction}
          messages={data.messages}
          currentRole="student"
          peerName="AI Builders Mentor"
        />
      </section>
    </AnimatedPage>
  );
}
