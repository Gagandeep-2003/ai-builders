"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useChatUnread } from "@/components/chat/chat-unread-state";

export function ChatDashboardBanner() {
  const unread = useChatUnread();

  if (!unread.initialized || unread.count < 1) return null;

  return (
    <Link
      href={unread.href || "/chat"}
      className="chat-dashboard-banner group relative block overflow-hidden rounded-xl border border-accent/30 bg-bg-card px-4 py-3.5 shadow-[0_14px_42px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:border-accent/55"
      aria-label={`Open ${unread.count} unread mentor ${unread.count === 1 ? "message" : "messages"}`}
    >
      <div className="relative flex items-center gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-mono text-[0.62rem] font-bold text-black shadow-[0_0_16px_rgba(110,231,183,0.4)]">
            {unread.count > 9 ? "9+" : unread.count}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-accent">
            {unread.count === 1 ? "Mentor message waiting" : `${unread.count} mentor messages waiting`}
          </span>
          <span className="mt-1 block truncate text-sm text-text-secondary">
            {unread.latest || "Your mentor sent you a private course update."}
          </span>
        </span>
        <span className="hidden items-center gap-2 font-heading text-xs font-semibold text-text-primary sm:flex">
          Open chat
          <ArrowRight className="h-4 w-4 text-accent transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
