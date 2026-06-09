"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle2, MonitorUp, Play, ShieldCheck, Timer, X } from "lucide-react";
import { markHomeworkStarted, markHomeworkSubmittedWithEvidence, resetHomeworkProgress } from "@/app/actions/homework";
import { formatDuration, isTrustedTaskDuration } from "@/lib/homework-utils";

type CelebrationState = "started" | "completed" | null;

function getBrowserInfo(userAgent: string) {
  const browserPatterns = [
    { name: "Microsoft Edge", regex: /Edg\/([\d.]+)/ },
    { name: "Chrome", regex: /Chrome\/([\d.]+)/ },
    { name: "Safari", regex: /Version\/([\d.]+).*Safari/ },
    { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
  ];
  const match = browserPatterns
    .map((item) => ({ name: item.name, version: userAgent.match(item.regex)?.[1] }))
    .find((item) => item.version);

  return {
    browserName: match?.name ?? "Unknown browser",
    browserVersion: match?.version ?? "",
  };
}

function getOsName(userAgent: string) {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Mac OS X/i.test(userAgent) && !/Mobile/i.test(userAgent)) return "macOS";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown OS";
}

function getDeviceType(userAgent: string) {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return "Tablet";
  if (/Mobi|iPhone|Android/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function getClientInfo() {
  const userAgent = navigator.userAgent;
  const browser = getBrowserInfo(userAgent);
  return {
    userAgent,
    ...browser,
    osName: getOsName(userAgent),
    deviceType: getDeviceType(userAgent),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    language: navigator.language,
  };
}

async function captureStreamFrame(stream: MediaStream) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  await new Promise((resolve) => window.setTimeout(resolve, 350));

  const sourceWidth = video.videoWidth || 1280;
  const sourceHeight = video.videoHeight || 720;
  const targetWidth = 640;
  const targetHeight = Math.round((sourceHeight / sourceWidth) * targetWidth);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare capture.");
  context.drawImage(video, 0, 0, targetWidth, targetHeight);
  stream.getTracks().forEach((track) => track.stop());
  return canvas.toDataURL("image/jpeg", 0.48);
}

function TaskCelebration({
  state,
  onClose,
}: {
  state: CelebrationState;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {state ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-bg-base/82 px-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-accent/25 bg-bg-card p-8 text-center shadow-[0_28px_90px_rgba(110,231,183,0.18)]"
            initial={{ y: 18, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-70">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <motion.span
                  key={item}
                  className="absolute h-1.5 w-1.5 rounded-full bg-accent"
                  style={{
                    left: `${18 + item * 12}%`,
                    top: `${24 + (item % 3) * 16}%`,
                  }}
                  initial={{ y: 18, opacity: 0, scale: 0.3 }}
                  animate={{ y: [-4, -24, -16], opacity: [0, 0.8, 0], scale: [0.3, 1, 0.7] }}
                  transition={{ duration: 1.8, delay: item * 0.08, repeat: state === "completed" ? 1 : 0 }}
                />
              ))}
            </div>

            <div className="relative mx-auto grid h-28 w-28 place-items-center">
              {[0, 1].map((ring) => (
                <motion.span
                  key={ring}
                  className="absolute inset-0 rounded-full border border-accent/30"
                  initial={{ scale: 0.68, opacity: 0 }}
                  animate={{ scale: [0.72, 1.18, 1.42], opacity: [0, 0.55, 0] }}
                  transition={{ duration: 1.7, delay: ring * 0.24, repeat: state === "completed" ? Infinity : 0 }}
                />
              ))}
              <motion.span
                className="relative grid h-20 w-20 place-items-center rounded-full border border-accent/30 bg-accent text-bg-base shadow-[0_0_42px_rgba(110,231,183,0.35)]"
                initial={{ scale: 0.35, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
              >
                {state === "started" ? <Timer className="h-9 w-9" /> : <CheckCircle2 className="h-10 w-10" />}
              </motion.span>
            </div>

            <motion.p
              className="mt-5 font-mono text-xs uppercase text-accent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              {state === "started" ? "Timer started" : "Submitted"}
            </motion.p>
            <motion.h2
              className="mt-2 font-heading text-3xl font-bold"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              {state === "started" ? "You are in focus mode" : "Task completed"}
            </motion.h2>
            <motion.p
              className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-secondary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              {state === "started"
                ? "The timer is running. Settle in and build at your own pace."
                : "Beautiful work. Your progress is saved and visible to your tutor."}
            </motion.p>

            {state === "completed" ? (
              <button
                onClick={onClose}
                className="button-motion mt-7 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base"
              >
                Done
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function HomeworkDocumentViewer({
  homeworkId,
  src,
  title,
  initialStartedAt,
  initialTimeSpentSeconds,
  completed,
}: {
  homeworkId: string;
  src: string;
  title: string;
  initialStartedAt?: string;
  initialTimeSpentSeconds?: number;
  completed: boolean;
}) {
  const [startedAt, setStartedAt] = useState(initialStartedAt ?? "");
  const [isCompleted, setIsCompleted] = useState(completed);
  const [completedSeconds, setCompletedSeconds] = useState(initialTimeSpentSeconds);
  const [needsRestart, setNeedsRestart] = useState(
    completed && typeof initialTimeSpentSeconds === "number" && !isTrustedTaskDuration(initialTimeSpentSeconds),
  );
  const [celebration, setCelebration] = useState<CelebrationState>(null);
  const [proofOpen, setProofOpen] = useState(false);
  const [screenImage, setScreenImage] = useState("");
  const [cameraImage, setCameraImage] = useState("");
  const [captureError, setCaptureError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const hasStarted = Boolean(startedAt) && !needsRestart;
  const elapsedSeconds = useMemo(() => {
    if (!startedAt) return 0;
    return Math.max(0, Math.round((now - new Date(startedAt).getTime()) / 1000));
  }, [now, startedAt]);
  const displayedSeconds = isCompleted ? completedSeconds : elapsedSeconds;

  useEffect(() => {
    if (!hasStarted || isCompleted) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isCompleted, hasStarted]);

  useEffect(() => {
    if (celebration !== "started") return;
    const timer = window.setTimeout(() => setCelebration(null), 1400);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  function startTask() {
    const started = new Date().toISOString();
    setStartedAt(started);
    setIsCompleted(false);
    setNeedsRestart(false);
    setCelebration("started");
    startTransition(async () => {
      if (needsRestart) {
        await resetHomeworkProgress(homeworkId);
      }
      await markHomeworkStarted(homeworkId);
    });
  }

  function requestCompletion() {
    setCaptureError("");
    setSaveNotice("");
    setProofOpen(true);
  }

  async function captureScreen() {
    setCaptureError("");
    setSaveNotice("");
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen capture is not available in this browser.");
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setScreenImage(await captureStreamFrame(stream));
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : "Screen capture was cancelled.");
    }
  }

  async function captureCamera() {
    setCaptureError("");
    setSaveNotice("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera capture is not available in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 } },
        audio: false,
      });
      setCameraImage(await captureStreamFrame(stream));
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : "Camera capture was cancelled.");
    }
  }

  function completeTask() {
    setCaptureError("");
    setSaveNotice("");
    const clientInfo = getClientInfo();
    startTransition(async () => {
      const result = await markHomeworkSubmittedWithEvidence(homeworkId, screenImage, cameraImage, clientInfo);
      if (!result.submitted) {
        setProofOpen(true);
        setCaptureError(result.error ?? "Submission proof could not be saved. Please try again.");
        return;
      }

      setIsCompleted(true);
      setCompletedSeconds(elapsedSeconds);
      setCelebration("completed");
      setProofOpen(false);

      if (result.evidenceSaved && result.evidenceImagesSaved) {
        setSaveNotice(
          result.evidenceMetadataSaved
            ? "Submission proof and device details were saved for admin review."
            : "Submission proof was saved. Device details need the metadata migration to appear.",
        );
      } else if (!screenImage && !cameraImage) {
        setSaveNotice("Activity submitted without proof images. Admin will see that capture was skipped.");
      }
    });
  }

  if (!hasStarted) {
    return (
      <>
        <TaskCelebration state={celebration} onClose={() => setCelebration(null)} />
        <section className="premium-card rounded-xl p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Timer className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold">Ready to begin?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            {needsRestart
              ? "This task had old demo progress attached to it. Start again to reset the stale timer and track this attempt cleanly."
              : "Press Start Task when you are ready. The task workspace will open inside the portal and your timer will begin."}
          </p>
          <button
            onClick={startTask}
            disabled={isPending}
            className="button-motion mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            Start Task
          </button>
        </section>
      </>
    );
  }

  return (
    <section className="space-y-4">
      <TaskCelebration state={celebration} onClose={() => setCelebration(null)} />
      <AnimatePresence>
        {proofOpen ? (
          <motion.div
            className="fixed inset-0 z-40 grid place-items-center bg-bg-base/78 px-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-4xl rounded-2xl border border-border bg-bg-card p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)]"
              initial={{ y: 18, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 14, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase text-accent">Submission proof</p>
                    <h2 className="mt-1 font-heading text-2xl font-bold">Capture your final proof</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                      Your browser will ask permission before capturing. You can review the screen and camera previews before submitting.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProofOpen(false)}
                  className="button-motion rounded-xl border border-border bg-bg-elevated p-2 text-text-secondary hover:text-text-primary"
                  aria-label="Close proof capture"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {captureError ? (
                <div className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-rose-200">
                  {captureError}
                </div>
              ) : null}
              {saveNotice ? (
                <div className="mt-5 rounded-xl border border-accent/25 bg-accent/10 p-3 text-sm text-accent">
                  {saveNotice}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase text-text-muted">Screen</p>
                      <p className="mt-1 text-sm text-text-secondary">Capture the final task/workspace view.</p>
                    </div>
                    <button
                      onClick={captureScreen}
                      disabled={isPending}
                      className="button-motion inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent"
                    >
                      <MonitorUp className="h-4 w-4" />
                      Capture
                    </button>
                  </div>
                  <div className="mt-4 grid aspect-video place-items-center overflow-hidden rounded-xl border border-border bg-bg-elevated">
                    {screenImage ? (
                      <img src={screenImage} alt="Screen proof preview" className="h-full w-full object-cover" />
                    ) : (
                      <p className="px-4 text-center text-sm text-text-muted">No screen proof captured yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase text-text-muted">Camera</p>
                      <p className="mt-1 text-sm text-text-secondary">Capture a quick student confirmation frame.</p>
                    </div>
                    <button
                      onClick={captureCamera}
                      disabled={isPending}
                      className="button-motion inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent"
                    >
                      <Camera className="h-4 w-4" />
                      Capture
                    </button>
                  </div>
                  <div className="mt-4 grid aspect-video place-items-center overflow-hidden rounded-xl border border-border bg-bg-elevated">
                    {cameraImage ? (
                      <img src={cameraImage} alt="Camera proof preview" className="h-full w-full object-cover" />
                    ) : (
                      <p className="px-4 text-center text-sm text-text-muted">No camera proof captured yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-text-muted">
                  If your browser blocks capture, you can still submit. Admin will see that no proof was attached.
                </p>
                <button
                  onClick={completeTask}
                  disabled={isPending}
                  className="button-motion inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isPending ? "Saving proof..." : "Submit Activity"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="premium-card rounded-xl p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-text-muted">Task timer</p>
            <p className="mt-2 font-heading text-3xl font-bold text-accent">{formatDuration(displayedSeconds)}</p>
          </div>
          {!isCompleted ? (
            <button
              onClick={requestCompletion}
              disabled={isPending}
              className="button-motion inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Complete
            </button>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 font-mono text-sm text-emerald-200">
                Completed
              </div>
              {saveNotice ? (
                <p className="max-w-md text-xs leading-5 text-text-secondary">{saveNotice}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {src ? (
        <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
          <iframe
            src={src}
            title={title}
            className="h-[72vh] min-h-[640px] w-full bg-white"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="premium-card rounded-xl p-8 text-center text-text-secondary">
          No embedded Google Doc has been attached yet. You can still complete this task after working from the class instructions.
        </div>
      )}
    </section>
  );
}
