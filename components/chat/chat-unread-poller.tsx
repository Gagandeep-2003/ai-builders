"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import {
  CHAT_UNREAD_REFRESH_EVENT,
  publishChatUnread,
  useChatUnread,
} from "@/components/chat/chat-unread-state";

type UnreadResponse = {
  count?: number;
  latest?: string;
  latestId?: string;
  href?: string;
  title?: string;
  tag?: string;
};

type MessagePreview = {
  id: string;
  title: string;
  body: string;
  href: string;
  count: number;
  tag: string;
};

function cleanPreview(value: string) {
  return value
    .replace(/^\[\[hw:[^|\]]+\|([^\]]*)\]\]\s*/, "About $1: ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
}

async function showBackgroundNotification(preview: MessagePreview) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const options: NotificationOptions = {
    body: preview.body,
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    tag: preview.tag,
    data: { url: preview.href },
  };

  try {
    const registration = "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : undefined;
    if (registration) {
      await registration.showNotification(preview.title, options);
      return;
    }
    new Notification(preview.title, options);
  } catch {
    // The persistent in-portal indicator still remains available.
  }
}

export function ChatUnreadPoller({
  initialUnreadCount = 0,
  defaultHref = "/chat",
  defaultTitle = "New private message",
}: {
  initialUnreadCount?: number;
  defaultHref?: string;
  defaultTitle?: string;
}) {
  const pathname = usePathname();
  const unread = useChatUnread({
    count: initialUnreadCount,
    href: defaultHref,
    title: defaultTitle,
  });
  const previousCount = useRef(initialUnreadCount);
  const previousLatestId = useRef("");
  const [preview, setPreview] = useState<MessagePreview | null>(null);
  const previewTimer = useRef<number | undefined>(undefined);
  const onChatRoute = pathname === "/chat" || pathname === "/admin/chat";

  useEffect(() => {
    publishChatUnread({
      count: initialUnreadCount,
      href: defaultHref,
      title: defaultTitle,
      initialized: true,
    });
    previousCount.current = initialUnreadCount;
  }, [defaultHref, defaultTitle, initialUnreadCount]);

  useEffect(() => {
    let canceled = false;

    function showPreview(next: MessagePreview) {
      if (document.visibilityState !== "visible" || onChatRoute) {
        if (document.visibilityState !== "visible") void showBackgroundNotification(next);
        return;
      }

      setPreview(next);
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
      previewTimer.current = window.setTimeout(() => setPreview(null), 9_000);
    }

    async function checkUnread(announceChanges = true) {
      try {
        const response = await fetch("/api/chat/unread", { cache: "no-store" });
        if (!response.ok || canceled) return;
        const payload = (await response.json()) as UnreadResponse;
        const nextCount = Math.max(0, Number(payload.count ?? 0));
        const latestId = String(payload.latestId ?? "");
        const href = payload.href || defaultHref;
        const title = payload.title || defaultTitle;
        const tag = payload.tag || "ai-builders-chat";
        const body = cleanPreview(payload.latest || "You have a new private message.");
        const isNewMessage =
          nextCount > previousCount.current ||
          Boolean(previousLatestId.current && latestId && latestId !== previousLatestId.current);

        publishChatUnread({
          count: nextCount,
          latest: body,
          latestId,
          href,
          title,
          initialized: true,
        });

        if (announceChanges && nextCount > 0 && isNewMessage) {
          showPreview({ id: latestId || String(Date.now()), title, body, href, count: nextCount, tag });
        }

        previousCount.current = nextCount;
        previousLatestId.current = latestId;
      } catch {
        // Polling is best-effort; the next interval will try again.
      }
    }

    const firstCheck = window.setTimeout(() => void checkUnread(true), 1_500);
    const interval = window.setInterval(() => void checkUnread(true), 15_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void checkUnread(true);
    };
    const onRefresh = () => void checkUnread(false);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(CHAT_UNREAD_REFRESH_EVENT, onRefresh);

    return () => {
      canceled = true;
      window.clearTimeout(firstCheck);
      window.clearInterval(interval);
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(CHAT_UNREAD_REFRESH_EVENT, onRefresh);
    };
  }, [defaultHref, defaultTitle, onChatRoute]);

  useEffect(() => {
    const cleanTitle = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unread.count > 0 ? `(${unread.count}) ${cleanTitle}` : cleanTitle;
  }, [pathname, unread.count]);

  return (
    <>
      {preview ? (
        <aside
          key={preview.id}
          role="status"
          aria-live="polite"
          className="chat-message-preview fixed inset-x-4 top-4 z-[90] mx-auto w-auto max-w-md overflow-hidden rounded-2xl border border-accent/30 bg-bg-card/95 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[24rem]"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-heading text-sm font-bold text-text-primary">{preview.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{preview.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg p-1 text-text-muted transition hover:bg-white/[0.05] hover:text-text-primary"
                  aria-label="Dismiss message preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Link
                href={preview.href}
                onClick={() => setPreview(null)}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-accent transition hover:text-accent/80"
              >
                View conversation
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      ) : null}

      {unread.initialized && unread.count > 0 && !onChatRoute ? (
        <Link
          href={unread.href || defaultHref}
          className="chat-unread-dock fixed bottom-4 left-1/2 z-[45] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 overflow-hidden rounded-full border border-accent/30 bg-bg-card/95 px-4 py-2.5 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-accent/50 sm:bottom-5"
          aria-label={`Open ${unread.count} unread chat ${unread.count === 1 ? "message" : "messages"}`}
        >
          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
            <MessageCircle className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-accent px-1 font-mono text-[0.58rem] font-bold text-black">
              {unread.count > 9 ? "9+" : unread.count}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap font-heading text-xs font-bold text-text-primary">
              {unread.count === 1 ? "Message waiting" : `${unread.count} messages waiting`}
            </span>
            <span className="hidden max-w-64 truncate text-[0.68rem] text-text-muted sm:block">
              {unread.latest || "Open your private course chat"}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-accent" />
        </Link>
      ) : null}
    </>
  );
}
