"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ai-builders-chat-notifications-v2";

export function ChatNotificationPrompt({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied";
    return Notification.permission;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (window.localStorage.getItem(STORAGE_KEY) !== "done" && Notification.permission === "default") {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visible || permission !== "default") return null;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-accent/25 bg-bg-card/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, "done");
          setVisible(false);
        }}
        className="absolute right-3 top-3 rounded-full border border-border/70 p-1 text-text-muted transition hover:text-text-primary"
        aria-label="Dismiss notification prompt"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex gap-3 pr-7">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <BellRing className="h-5 w-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-semibold text-text-primary">Turn on chat alerts</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Get notified when a new mentor or student message arrives while the portal is open.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={async () => {
          const result = await Notification.requestPermission();
          setPermission(result);
          window.localStorage.setItem(STORAGE_KEY, "done");
          setVisible(false);
        }}
        className="button-motion mt-4 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black"
      >
        Enable chat alerts
      </button>
    </div>
  );
}
