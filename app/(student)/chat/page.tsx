import { BellRing, MessageSquareText, Mic, ShieldCheck } from "lucide-react";
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

      <section className="space-y-4">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {[
            { icon: MessageSquareText, title: "Direct mentor line", detail: "Homework, classes, and quick questions" },
            { icon: BellRing, title: "Background alerts", detail: "Messages can reach you outside the portal" },
            { icon: Mic, title: "Voice notes", detail: "Send a short update when typing is awkward" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 bg-bg-card px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                <item.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="truncate text-xs text-text-muted">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <ChatPanel
          action={sendStudentChatMessageAction}
          messages={data.messages}
          currentRole="student"
          peerName="AI Builders Mentor"
        />
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Private between you and the AI Builders mentor/admin account.
        </div>
      </section>
    </AnimatedPage>
  );
}
