export const siteName = "AI Builders Academy";

export const siteDescription =
  "Live AI courses for students covering AI literacy, app building, and automation across 3 modules and 24 project-based sessions.";

const productionSiteUrl = "https://ai-builders-six.vercel.app";

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return normalizeSiteUrl(configuredUrl);
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : productionSiteUrl;
}
