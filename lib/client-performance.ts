export type PerformanceMetricName =
  | "CLS"
  | "FCP"
  | "FID"
  | "INP"
  | "LCP"
  | "TTFB"
  | "signin_to_shell"
  | "navigation";

type PerformancePayload = {
  name: PerformanceMetricName;
  value: number;
  path?: string;
  id?: string;
  rating?: string;
  navigationType?: string;
  context?: string;
};

const SAMPLE_KEY = "ai-builders:performance-sample-v1";
const AUTH_START_KEY = "ai-builders:signin-start-v1";
const NAVIGATION_KEY = "ai-builders:navigation-start-v1";
const SAMPLE_RATE = 0.2;

function sampledSession() {
  try {
    const existing = window.sessionStorage.getItem(SAMPLE_KEY);
    if (existing === "1") return true;
    if (existing === "0") return false;
    const sampled = Math.random() < SAMPLE_RATE;
    window.sessionStorage.setItem(SAMPLE_KEY, sampled ? "1" : "0");
    return sampled;
  } catch {
    return Math.random() < SAMPLE_RATE;
  }
}

function currentPath() {
  return window.location.pathname.slice(0, 160);
}

export function reportClientPerformance(payload: PerformancePayload) {
  if (typeof window === "undefined" || !sampledSession()) return;
  const body = JSON.stringify({
    ...payload,
    path: payload.path ?? currentPath(),
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/performance", blob)) return;
  }

  void fetch("/api/performance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
    keepalive: true,
    credentials: "omit",
  }).catch(() => undefined);
}

export function markSignInStart(method: "password" | "passkey" | "face") {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      AUTH_START_KEY,
      JSON.stringify({ method, startedAt: performance.now(), wallTime: Date.now() }),
    );
  } catch {
    // Performance reporting must never block authentication.
  }
}

export function clearSignInStart() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(AUTH_START_KEY);
  } catch {
    // Performance reporting must never interfere with sign-in errors.
  }
}

export function reportSignInToShell(role: "student" | "admin") {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(AUTH_START_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(AUTH_START_KEY);
    const marker = JSON.parse(raw) as { method?: string; startedAt?: number; wallTime?: number };
    const value = performance.now() - Number(marker.startedAt ?? Number.NaN);
    const age = Date.now() - Number(marker.wallTime ?? Number.NaN);
    if (!Number.isFinite(value) || value < 0 || !Number.isFinite(age) || age > 120_000) return;
    reportClientPerformance({
      name: "signin_to_shell",
      value,
      context: `${marker.method ?? "unknown"}:${role}`,
    });
  } catch {
    // Invalid or unavailable session storage is ignored.
  }
}

export function beginPortalNavigation(target: string) {
  if (typeof window === "undefined") return;
  try {
    const visitedKey = `ai-builders:visited:${target}`;
    const context = window.sessionStorage.getItem(visitedKey) === "1" ? "warm" : "cold";
    window.sessionStorage.setItem(
      NAVIGATION_KEY,
      JSON.stringify({ target, startedAt: performance.now(), context }),
    );
  } catch {
    // Navigation remains functional when storage is unavailable.
  }
}

export function completePortalNavigation(pathname: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(NAVIGATION_KEY);
    if (!raw) return;
    const marker = JSON.parse(raw) as { target?: string; startedAt?: number; context?: string };
    if (!marker.target || (pathname !== marker.target && !pathname.startsWith(`${marker.target}/`))) return;
    window.sessionStorage.removeItem(NAVIGATION_KEY);
    window.sessionStorage.setItem(`ai-builders:visited:${marker.target}`, "1");
    const value = performance.now() - Number(marker.startedAt ?? Number.NaN);
    if (!Number.isFinite(value) || value < 0 || value > 300_000) return;
    reportClientPerformance({
      name: "navigation",
      value,
      path: pathname.slice(0, 160),
      context: marker.context === "warm" ? "warm" : "cold",
    });
  } catch {
    // Reporting is best-effort.
  }
}
