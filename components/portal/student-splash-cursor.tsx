"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SplashCursor = dynamic(() => import("@/components/ui/splash-cursor"), {
  ssr: false,
});

const CURSOR_PREFERENCE_KEY = "ai-builders-splash-cursor-enabled";

export function StudentSplashCursor() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialStateTimer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(CURSOR_PREFERENCE_KEY);
      setEnabled(stored !== "false");
      setReady(true);
    }, 0);

    const handlePreference = (event: Event) => {
      const nextEnabled = (event as CustomEvent<{ enabled: boolean }>).detail?.enabled;
      if (typeof nextEnabled !== "boolean") return;
      window.localStorage.setItem(CURSOR_PREFERENCE_KEY, String(nextEnabled));
      setEnabled(nextEnabled);
      window.dispatchEvent(
        new CustomEvent("portal:splash-cursor-state", { detail: { enabled: nextEnabled } }),
      );
    };

    window.addEventListener("portal:set-splash-cursor", handlePreference);
    return () => {
      window.clearTimeout(initialStateTimer);
      window.removeEventListener("portal:set-splash-cursor", handlePreference);
    };
  }, []);

  if (!ready || !enabled || pathname === "/league" || pathname.startsWith("/league/")) return null;

  return (
    <div className="student-splash-cursor" aria-hidden="true">
      <SplashCursor
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
        SHADING
        RAINBOW_MODE
        COLOR="#A855F7"
      />
    </div>
  );
}
