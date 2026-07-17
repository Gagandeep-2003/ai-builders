export const siteName = "AI Builders Academy";

export const siteDescription =
  "A premium AI learning program and private student portal: AI literacy, app building, and automation thinking across 3 modules and 24 live sessions.";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
