export async function measureServer<T>(label: string, work: () => Promise<T>): Promise<T> {
  const startedAt = performance.now();
  try {
    return await work();
  } finally {
    const sampledProductionRequest = process.env.NODE_ENV === "production" && Math.random() < 0.05;
    if (
      process.env.PERFORMANCE_LOGS === "1" ||
      process.env.NODE_ENV === "development" ||
      sampledProductionRequest
    ) {
      console.info(JSON.stringify({
        type: "server-timing",
        label,
        durationMs: Math.round((performance.now() - startedAt) * 10) / 10,
      }));
    }
  }
}
