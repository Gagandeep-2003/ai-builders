import dynamic from "next/dynamic";
import { BellRing, Mic, ShieldCheck } from "lucide-react";
import { sendStudentChatMessageAction, markStudentChatReadAction } from "@/app/actions/chat";
import { ChatPanel, type ChatContextItem } from "@/components/chat/chat-panel";
import { ChatReadMarker } from "@/components/chat/chat-read-marker";
import { AnimatedPage } from "@/components/ui/animated";
import { getStudentChatData, getStudentDashboardData } from "@/lib/data";

const Aurora = dynamic(
  () => import("@/components/ui/aurora").then((module) => module.Aurora),
);

export default async function StudentChatPage() {
  const [data, dashboard] = await Promise.all([
    getStudentChatData(),
    getStudentDashboardData(),
  ]);

  const contextItems: ChatContextItem[] = dashboard.homework
    .filter((item) => item.status === "pending" || item.status === "revision_requested")
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      title: item.title,
      kind: item.kind,
      sessionName: item.sessionName,
      status: item.status,
    }));

  return (
    <AnimatedPage>
      <ChatReadMarker markReadAction={markStudentChatReadAction} />

      <section className="chat-console-shell p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-70">
          <Aurora
            colorStops={["#6ee7b7", "#38bdf8", "#a78bfa"]}
            amplitude={0.9}
            blend={0.55}
            speed={0.7}
          />
        </div>
        <div className="chat-console-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />

        <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent">
              Comms console
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">Mentor Chat</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
              A private line to your mentor for questions, reminders, feedback, and voice notes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, label: "Private channel" },
              { icon: BellRing, label: "Background alerts" },
              { icon: Mic, label: "Voice notes" },
            ].map((item) => (
              <span
                key={item.label}
                className="chat-glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-text-secondary"
              >
                <item.icon className="h-3.5 w-3.5 text-accent" />
                {item.label}
              </span>
            ))}
          </div>
        </header>

        <ChatPanel
          action={sendStudentChatMessageAction}
          messages={data.messages}
          currentRole="student"
          peerName="AI Builders Mentor"
          studentId={data.student.id}
          contextItems={contextItems}
          className="h-[min(72vh,52rem)]"
        />

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Private between you and the AI Builders mentor/admin account.
        </p>
      </section>
    </AnimatedPage>
  );
}
