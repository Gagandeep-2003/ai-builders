"use client";

import { useEffect, useRef } from "react";

const SHIELD_ATTRIBUTE = "data-screenshot-shield";

function isScreenshotShortcut(event: KeyboardEvent) {
  if (event.key === "PrintScreen") return true;

  const key = event.key.toLowerCase();
  const macShortcut = event.metaKey && event.shiftKey && ["3", "4", "5"].includes(key);
  const windowsSnippingShortcut = event.metaKey && event.shiftKey && key === "s";
  return macShortcut || windowsSnippingShortcut;
}

export function ScreenshotPrivacyShield() {
  const timerRef = useRef<number | null>(null);
  const shortcutActiveRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const showShield = () => {
      clearTimer();
      root.setAttribute(SHIELD_ATTRIBUTE, "active");
    };

    const hideShield = (delay = 120) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (!shortcutActiveRef.current && document.visibilityState === "visible" && document.hasFocus()) {
          root.removeAttribute(SHIELD_ATTRIBUTE);
        }
      }, delay);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isScreenshotShortcut(event)) return;
      shortcutActiveRef.current = true;
      showShield();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!shortcutActiveRef.current && !isScreenshotShortcut(event)) return;
      shortcutActiveRef.current = false;
      hideShield(900);
    };

    const onBlur = () => showShield();
    const onFocus = () => hideShield(180);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") showShield();
      else hideShield(180);
    };
    const onBeforePrint = () => showShield();
    const onAfterPrint = () => hideShield(180);

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimer();
      root.removeAttribute(SHIELD_ATTRIBUTE);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <div className="screenshot-privacy-shield" aria-hidden="true" />;
}
