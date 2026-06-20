"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { touchPresenceAction } from "@/app/actions/presence";

export type ClassAlert = {
  id: string;
  title: string;
  body: string;
  startsAt: string;
};

export function PortalAutoSync({
  alerts = [],
  refreshMs = 0,
}: {
  alerts?: ClassAlert[];
  refreshMs?: number;
}) {
  const router = useRouter();
  const [promptReady, setPromptReady] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationPermission | "unsupported">("unsupported");

  const upcomingAlerts = useMemo(
    () =>
      alerts
        .map((alert) => ({ ...alert, startsAtMs: new Date(alert.startsAt).getTime() }))
        .filter((alert) => Number.isFinite(alert.startsAtMs)),
    [alerts],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNotificationState("Notification" in window ? Notification.permission : "unsupported");
      setPromptReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (refreshMs <= 0) return;

    let lastRefresh = Date.now();
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefresh < 45_000) return;
      lastRefresh = now;
      router.refresh();
    };

    const timer = window.setInterval(refresh, refreshMs);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshMs, router]);

  useEffect(() => {
    let stopped = false;

    const touchPresence = () => {
      if (document.visibilityState !== "visible") return;
      void touchPresenceAction().catch(() => {
        if (!stopped) {
          console.warn("Unable to update portal presence");
        }
      });
    };

    touchPresence();
    const timer = window.setInterval(touchPresence, 60_000);
    const onVisibility = () => touchPresence();

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const notified = new Set(
      JSON.parse(window.localStorage.getItem("portal:notified-classes") || "[]") as string[],
    );

    const timer = window.setInterval(() => {
      const now = Date.now();
      const nextNotified = new Set(notified);

      for (const alert of upcomingAlerts) {
        const minutesUntil = (alert.startsAtMs - now) / 60_000;
        if (minutesUntil >= 0 && minutesUntil <= 30 && !nextNotified.has(alert.id)) {
          new Notification(alert.title, { body: alert.body });
          nextNotified.add(alert.id);
        }
      }

      window.localStorage.setItem("portal:notified-classes", JSON.stringify([...nextNotified]));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [upcomingAlerts]);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setNotificationState("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  }

  if (!promptReady || notificationState === "granted" || notificationState === "unsupported" || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs rounded-xl border border-border bg-bg-card/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <Bell className="h-4 w-4" />
        </span>
        <div>
          <p className="font-heading text-sm font-bold">Class alerts</p>
          <p className="mt-1 text-xs text-text-secondary">
            Enable browser notifications for classes starting within 30 minutes.
          </p>
          <button
            onClick={enableNotifications}
            className="button-motion mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-bg-base"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Enable alerts
          </button>
        </div>
      </div>
    </div>
  );
}
