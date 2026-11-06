import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const allowedNames = new Set([
  "CLS",
  "FCP",
  "FID",
  "INP",
  "LCP",
  "TTFB",
  "signin_to_shell",
  "navigation",
]);
const allowedRatings = new Set(["good", "needs-improvement", "poor", ""]);
const allowedContexts = new Set([
  "cold",
  "warm",
  "password:student",
  "password:admin",
  "passkey:student",
  "passkey:admin",
  "face:student",
  "face:admin",
  "unknown:student",
  "unknown:admin",
  "",
]);

type IncomingMetric = {
  name?: unknown;
  value?: unknown;
  path?: unknown;
  id?: unknown;
  rating?: unknown;
  navigationType?: unknown;
  context?: unknown;
};

function safeText(value: unknown, limit: number) {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestProtocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "");
  let sameOrigin = false;
  try {
    const originUrl = new URL(origin ?? "");
    sameOrigin =
      Boolean(requestHost) &&
      originUrl.host === requestHost &&
      originUrl.protocol === `${requestProtocol}:` &&
      (originUrl.protocol === "https:" || originUrl.protocol === "http:");
  } catch {
    sameOrigin = false;
  }

  if (!sameOrigin || (fetchSite && fetchSite !== "same-origin")) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 2_048) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const raw = await request.text();
  if (!raw || raw.length > 2_048) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  let input: IncomingMetric;
  try {
    input = JSON.parse(raw) as IncomingMetric;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = safeText(input.name, 32);
  const value = Number(input.value);
  const path = safeText(input.path, 160);
  const rating = safeText(input.rating, 32);
  const context = safeText(input.context, 32);
  if (
    !allowedNames.has(name) ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 300_000 ||
    !path.startsWith("/") ||
    path.includes("?") ||
    !allowedRatings.has(rating) ||
    !allowedContexts.has(context)
  ) {
    return NextResponse.json({ error: "Metric not allowed." }, { status: 400 });
  }

  console.info(JSON.stringify({
    type: "client-performance",
    name,
    value: Math.round(value * 1000) / 1000,
    path,
    id: safeText(input.id, 96),
    rating,
    navigationType: safeText(input.navigationType, 32),
    context,
    recordedAt: new Date().toISOString(),
  }));

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
