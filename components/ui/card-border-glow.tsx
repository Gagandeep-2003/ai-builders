"use client";

import { useEffect } from "react";

function getCenterOfElement(el: HTMLElement) {
  const { width, height } = el.getBoundingClientRect();
  return [width / 2, height / 2] as const;
}

function getEdgeProximity(el: HTMLElement, x: number, y: number) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  let kx = Infinity;
  let ky = Infinity;

  if (dx !== 0) kx = cx / Math.abs(dx);
  if (dy !== 0) ky = cy / Math.abs(dy);

  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(el: HTMLElement, x: number, y: number) {
  const [cx, cy] = getCenterOfElement(el);
  const dx = x - cx;
  const dy = y - cy;
  if (dx === 0 && dy === 0) return 0;

  const radians = Math.atan2(dy, dx);
  let degrees = radians * (180 / Math.PI) + 90;
  if (degrees < 0) degrees += 360;
  return degrees;
}

function ensureEdgeLight(card: HTMLElement) {
  if (card.querySelector(":scope > .premium-card-edge-light")) return;

  const edgeLight = document.createElement("span");
  edgeLight.className = "premium-card-edge-light";
  edgeLight.setAttribute("aria-hidden", "true");
  card.prepend(edgeLight);
}

export function CardBorderGlow() {
  useEffect(() => {
    const getCard = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>(".premium-card") : null;

    const handlePointerEnter = (event: PointerEvent) => {
      const card = getCard(event.target);
      if (!card) return;
      ensureEdgeLight(card);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const card = getCard(event.target);
      if (!card) return;

      ensureEdgeLight(card);
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      const card = getCard(event.target);
      if (!card || card.contains(event.relatedTarget as Node | null)) return;
      card.style.setProperty("--edge-proximity", "0");
    };

    document.querySelectorAll<HTMLElement>(".premium-card").forEach(ensureEdgeLight);
    document.addEventListener("pointerenter", handlePointerEnter, true);
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, true);

    return () => {
      document.removeEventListener("pointerenter", handlePointerEnter, true);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave, true);
    };
  }, []);

  return null;
}
