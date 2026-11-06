"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { FileText, MonitorSmartphone, Paperclip } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Evidence = {
  screenImage?: string;
  cameraImage?: string;
  proofText?: string;
  attachmentName?: string;
  attachmentMime?: string;
  attachmentData?: string;
  proofCapturedAt?: string;
  proofExpiresAt?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  deviceType?: string;
  userAgent?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
};

function deviceFields(evidence: Evidence) {
  return [
    ["Browser", [evidence.browserName, evidence.browserVersion].filter(Boolean).join(" ")],
    ["Device", evidence.deviceType],
    ["OS", evidence.osName],
    ["Viewport", evidence.viewportWidth && evidence.viewportHeight ? `${evidence.viewportWidth} × ${evidence.viewportHeight}` : ""],
    ["Language", evidence.language],
  ].filter((item): item is [string, string] => Boolean(item[1]));
}

export function AdminSubmissionEvidence({
  homeworkId,
  studentId,
  courseLevel,
}: {
  homeworkId: string;
  studentId: string;
  courseLevel: 1 | 2;
}) {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [evidence, setEvidence] = useState<Evidence | null>(null);

  const load = async () => {
    if (state === "loading" || state === "loaded") return;
    setState("loading");
    try {
      const params = new URLSearchParams({ homeworkId, studentId, courseLevel: String(courseLevel) });
      const response = await fetch(`/api/admin/homework-evidence?${params}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("evidence request failed");
      const payload = await response.json() as { evidence?: Evidence | null };
      setEvidence(payload.evidence ?? null);
      setState("loaded");
    } catch {
      setState("error");
    }
  };

  if (state === "idle" || state === "loading" || state === "error") {
    return (
      <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="h-4 w-4 text-accent" />
            <div>
              <p className="font-mono text-xs uppercase text-accent">Submission proof</p>
              <p className="mt-1 text-xs text-text-muted">Images and files load only when you request them.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={state === "loading"}
            className="button-motion rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent disabled:opacity-60"
          >
            {state === "loading" ? "Loading proof…" : state === "error" ? "Try again" : "View proof"}
          </button>
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="mt-4 rounded-xl border border-border/70 bg-white/[0.025] p-3 text-sm text-text-secondary">
        No evidence row was found for this submitted task.
      </div>
    );
  }

  const fields = deviceFields(evidence);
  return (
    <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-accent" />
          <p className="font-mono text-xs uppercase text-accent">Submission proof</p>
        </div>
        <p className="font-mono text-[11px] text-text-muted">
          {evidence.proofCapturedAt ? `Captured ${formatDate(evidence.proofCapturedAt)}` : "No capture time"}
          {evidence.proofExpiresAt ? ` · Deletes ${formatDate(evidence.proofExpiresAt)}` : ""}
        </p>
      </div>
      {evidence.screenImage || evidence.cameraImage ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {evidence.screenImage ? (
            <a href={evidence.screenImage} target="_blank" rel="noreferrer" className="group block">
              <p className="mb-2 font-mono text-[11px] uppercase text-text-muted">Screen</p>
              <img src={evidence.screenImage} alt="Student screen submission proof" className="aspect-video w-full rounded-lg border border-border object-cover transition group-hover:border-accent/50" />
            </a>
          ) : null}
          {evidence.cameraImage ? (
            <a href={evidence.cameraImage} target="_blank" rel="noreferrer" className="group block">
              <p className="mb-2 font-mono text-[11px] uppercase text-text-muted">Camera</p>
              <img src={evidence.cameraImage} alt="Student camera submission proof" className="aspect-video w-full rounded-lg border border-border object-cover transition group-hover:border-accent/50" />
            </a>
          ) : null}
        </div>
      ) : null}
      {evidence.proofText ? (
        <div className="mt-3 rounded-lg border border-border/70 bg-bg-base/40 p-3">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-accent" /><p className="font-mono text-[10px] uppercase text-text-muted">Text evidence</p></div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{evidence.proofText}</p>
        </div>
      ) : null}
      {evidence.attachmentData ? (
        <a href={evidence.attachmentData} download={evidence.attachmentName || "student-attachment"} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-accent transition hover:border-accent/45">
          <span className="flex min-w-0 items-center gap-2"><Paperclip className="h-4 w-4 shrink-0" /><span className="truncate">{evidence.attachmentName || "Student attachment"}</span></span>
          <span className="shrink-0 font-mono text-[10px] uppercase text-text-muted">{evidence.attachmentMime || "file"}</span>
        </a>
      ) : null}
      {fields.length || evidence.userAgent ? (
        <div className="mt-3 grid gap-2 rounded-lg border border-border/70 bg-bg-base/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([label, value]) => <div key={label}><p className="font-mono text-[10px] uppercase text-text-muted">{label}</p><p className="mt-1 truncate text-xs font-semibold text-text-primary">{value}</p></div>)}
          {evidence.userAgent ? <div className="sm:col-span-2 lg:col-span-3"><p className="font-mono text-[10px] uppercase text-text-muted">User agent</p><p className="mt-1 line-clamp-2 break-all text-[11px] leading-5 text-text-secondary">{evidence.userAgent}</p></div> : null}
        </div>
      ) : null}
    </div>
  );
}
