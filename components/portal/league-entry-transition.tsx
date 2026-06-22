"use client";

import { useEffect, useMemo, useState } from "react";

const GRID_SIZE = 9;
const PIXELS = GRID_SIZE * GRID_SIZE;

function seededDelay(index: number) {
  return ((index * 37) % PIXELS) * 4;
}

export function LeagueEntryTransition() {
  const [visible, setVisible] = useState(true);
  const pixels = useMemo(() => Array.from({ length: PIXELS }, (_, index) => index), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="league-pixel-transition" role="status" aria-label="Opening AI Builders League">
      <div className="league-pixel-title">
        <span className="league-pixel-mark" />
        <span>AI Builders League</span>
      </div>
      <div
        className="league-pixel-grid"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {pixels.map((pixel) => (
          <span
            key={pixel}
            className="league-pixel"
            style={{ animationDelay: `${80 + seededDelay(pixel)}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
