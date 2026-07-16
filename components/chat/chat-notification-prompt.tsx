"use client";

import { useEffect, useState } from "react";
import { BellRing, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatNotificationPrompt({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied";
    return Notification.permission;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visible || permission === "granted") return null;

  const blocked = permission === "denied";

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-accent/30 bg-bg-card/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          {blocked ? <Settings className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
        </span>
        <div>
          <p className="font-heading text-sm font-semibold text-text-primary">
            {blocked ? "Notifications are blocked" : "Turn on chat alerts"}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {blocked
              ? "Open your browser site settings and allow notifications for AI Builders to receive chat alerts."
              : "Get notified when a new mentor or student message arrives while the portal is open in any tab."}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="button-motion rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          Later
        </button>
        {!blocked ? (
          <button
            type="button"
            onClick={async () => {
              const result = await Notification.requestPermission();
              setPermission(result);
              setVisible(result !== "granted");
            }}
            className="button-motion flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black"
          >
            Enable chat alerts
          </button>
        ) : null}
      </div>
    </div>
  );
}
