"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const EvilEye = dynamic(
  () => import("@/components/ui/evil-eye").then((module) => module.EvilEye),
  { ssr: false },
);

const INTRO_DURATION = 1200;
const INTRO_KEY = "ai-builders-league-intro-start";

export function LeagueEntryTransition() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const storedStart = Number(sessionStorage.getItem(INTRO_KEY));
    const now = Date.now();
    const start = storedStart > 0 && now - storedStart < INTRO_DURATION
      ? storedStart
      : now;
    sessionStorage.setItem(INTRO_KEY, String(start));
    const timeLeft = Math.max(0, INTRO_DURATION - (now - start));
    const timer = window.setTimeout(() => setVisible(false), timeLeft);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="league-eye-transition" role="status" aria-label="Opening AI Builders League">
      <div className="league-eye-stage">
        <EvilEye
          eyeColor="#FF6F37"
          intensity={1.5}
          pupilSize={0.6}
          irisWidth={0.25}
          glowIntensity={0.35}
          scale={0.8}
          noiseScale={1}
          pupilFollow={1}
          flameSpeed={1}
          backgroundColor="#120F17"
        />
      </div>
      <div className="league-eye-copy">
        <span>League signal acquired</span>
        <strong>AI Builders League</strong>
      </div>
    </div>
  );
}
