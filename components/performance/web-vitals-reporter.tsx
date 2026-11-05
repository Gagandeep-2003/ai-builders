"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportClientPerformance, type PerformanceMetricName } from "@/lib/client-performance";

const allowedMetrics = new Set<PerformanceMetricName>([
  "CLS",
  "FCP",
  "FID",
  "INP",
  "LCP",
  "TTFB",
]);

const reportWebVital: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  if (!allowedMetrics.has(metric.name as PerformanceMetricName)) return;
  reportClientPerformance({
    name: metric.name as PerformanceMetricName,
    value: metric.value,
    id: metric.id,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });
};

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVital);
  return null;
}
