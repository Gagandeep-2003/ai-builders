"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type UnreadResponse = {
  count?: number;
  latest?: string;
};

export function ChatUnreadPoller({ initialUnreadCount = 0 }: { initialUnreadCount?: number }) {
  const router = useRouter();
  const previousCount = useRef(initialUnreadCount);

  useEffect(() => {
    let canceled = false;

    async function checkUnread() {
      try {
        const response = await fetch("/api/chat/unread", { cache: "no-store" });
        if (!response.ok || canceled) return;
        const payload = (await response.json()) as UnreadResponse;
        const nextCount = Math.max(0, Number(payload.count ?? 0));

        if (nextCount !== previousCount.current) {
          if (
            nextCount > previousCount.current &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const body = payload.latest?.trim() || "You have a new private message.";
            new Notification("AI Builders Chat", {
              body,
              tag: "ai-builders-chat",
            });
          }
          previousCount.current = nextCount;
          router.refresh();
        }
      } catch {
        // Polling is best-effort; the next interval will try again.
      }
    }

    const interval = window.setInterval(checkUnread, 45_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void checkUnread();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      canceled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}
