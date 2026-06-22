"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/ui/brand-mark";

export function LeagueEntryTransition() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 760);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="league-aperture" role="status" aria-label="Opening AI Builders League">
      <div className="league-aperture-panel league-aperture-panel-tl" aria-hidden="true" />
      <div className="league-aperture-panel league-aperture-panel-tr" aria-hidden="true" />
      <div className="league-aperture-panel league-aperture-panel-bl" aria-hidden="true" />
      <div className="league-aperture-panel league-aperture-panel-br" aria-hidden="true" />
      <div className="league-aperture-scan" aria-hidden="true" />
      <div className="league-aperture-core">
        <span className="league-aperture-ring league-aperture-ring-outer" aria-hidden="true" />
        <span className="league-aperture-ring league-aperture-ring-inner" aria-hidden="true" />
        <BrandMark className="league-aperture-logo h-16 w-16" />
        <div className="league-aperture-copy">
          <span className="league-aperture-live"><i /> Live field synchronized</span>
          <strong>AI Builders League</strong>
        </div>
      </div>
    </div>
  );
}
