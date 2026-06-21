"use client";

import { useEffect, useRef, useState } from "react";

const LENS_SIZE = 228;
const SIDEBAR_WIDTH = 288;
const DAMPING = 0.15;

export default function LeagueFluidCursor() {
  const lensRef = useRef<HTMLDivElement>(null);
  const current = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.innerWidth >= 1024
    );
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const zone = document.querySelector(".league-fluid-cursor-zone");
    zone?.classList.add("fluid-cursor-ready");

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * DAMPING;
      current.current.y += (target.current.y - current.current.y) * DAMPING;
      if (lensRef.current) {
        lensRef.current.style.transform =
          `translate3d(${current.current.x - LENS_SIZE / 2}px, ${current.current.y - LENS_SIZE / 2}px, 0)`;
      }
      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const insideContent = event.clientX >= SIDEBAR_WIDTH;
      setVisible(insideContent);
      if (!insideContent) return;

      target.current = {
        x: event.clientX - SIDEBAR_WIDTH,
        y: event.clientY,
      };
      if (current.current.x === 0 && current.current.y === 0) {
        current.current = target.current;
      }
    };
    const handlePointerLeave = () => setVisible(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      zone?.classList.remove("fluid-cursor-ready");
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-72 right-0 z-[65] overflow-hidden"
      aria-hidden="true"
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id="league-fluid-wobble" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </svg>
      <div
        ref={lensRef}
        className={`league-fluid-lens ${visible ? "is-visible" : ""}`}
      >
        <span className="league-fluid-lens__rim" />
        <span className="league-fluid-lens__shine" />
      </div>
    </div>
  );
}
