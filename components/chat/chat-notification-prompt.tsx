"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, LoaderCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertState = "checking" | "ready" | "needs-permission" | "needs-subscription" | "blocked" | "unsupported" | "unconfigured";

function applicationServerKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

async function getRegistration() {
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  return registration;
}

export function ChatNotificationPrompt({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<AlertState>("checking");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function inspect() {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (active) setStatus("unsupported");
        return;
      }
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        if (active) setStatus("unconfigured");
        return;
      }
      if (Notification.permission === "denied") {
        if (active) setStatus("blocked");
        return;
      }
      if (Notification.permission !== "granted") {
        if (active) setStatus("needs-permission");
        return;
      }
      const registration = await getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (active) setStatus(subscription ? "ready" : "needs-subscription");
    }

    inspect().catch(() => active && setStatus("needs-subscription"));
    const timer = window.setTimeout(() => active && setVisible(true), 900);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible || status === "checking" || status === "ready") return null;

  const blocked = status === "blocked";
  const unavailable = status === "unsupported" || status === "unconfigured";

  async function enableAlerts() {
    setWorking(true);
    setMessage("");
    try {
      const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "needs-permission");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus("unconfigured");
        return;
      }

      const registration = await getRegistration();
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey(publicKey),
      });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error("Subscription could not be saved.");

      setStatus("ready");
      setMessage("Background chat alerts are on.");
      window.setTimeout(() => setVisible(false), 900);
    } catch {
      setStatus("needs-subscription");
      setMessage("Alerts could not be connected. Please try once more.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-accent/30 bg-bg-card/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          {blocked ? <Settings className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
        </span>
        <div>
          <p className="font-heading text-sm font-semibold text-text-primary">
            {blocked ? "Notifications are blocked" : unavailable ? "Background alerts unavailable" : "Turn on background chat alerts"}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {blocked
              ? "Open this site's browser settings, allow notifications, then reload the portal."
              : status === "unconfigured"
                ? "The portal needs its notification key configured before background alerts can be connected."
                : status === "unsupported"
                  ? "This browser does not support website push alerts. Keep the portal open to receive live badges."
                  : "Receive mentor messages even when this portal is in the background or closed."}
          </p>
          {message ? <p className="mt-2 text-xs font-medium text-accent">{message}</p> : null}
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
        {!blocked && !unavailable ? (
          <button
            type="button"
            disabled={working}
            onClick={enableAlerts}
            className="button-motion flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
          >
            {working ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {working ? "Connecting" : status === "needs-subscription" ? "Finish setup" : "Enable alerts"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
