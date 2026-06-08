export function getGoogleDocEmbedUrl(url: string) {
  const match = url.match(/\/document\/d\/([^/]+)/);
  if (!match?.[1]) return url;
  return `https://docs.google.com/document/d/${match[1]}/preview`;
}

export function formatHomeworkKind(kind: string) {
  return kind === "class_challenge" ? "Class Challenge" : "Home Task";
}

export const maxTrustedTaskSeconds = 12 * 60 * 60;

export function isTrustedTaskDuration(seconds?: number) {
  return typeof seconds === "number" && seconds >= 0 && seconds <= maxTrustedTaskSeconds;
}

export function formatDuration(seconds?: number) {
  if (!seconds) return "Not tracked yet";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${Math.max(minutes, 1)}m`;
}
