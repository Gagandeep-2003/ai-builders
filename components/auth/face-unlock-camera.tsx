"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, CheckCircle2, LoaderCircle, ScanFace, ShieldCheck, X } from "lucide-react";
import {
  averageFaceDescriptors,
  isFaceWellFramed,
  loadFaceUnlockModels,
  tinyFaceDetectorOptions,
} from "@/lib/face-unlock/recognition";
import type { FaceCaptureMode, FaceCaptureResult } from "@/lib/face-unlock/types";

type VerificationResult = {
  ok: boolean;
  message?: string;
};

type FaceUnlockCameraProps = {
  open: boolean;
  mode: FaceCaptureMode;
  accountName?: string;
  onCancel: () => void;
  onComplete: (result: FaceCaptureResult) => Promise<VerificationResult>;
};

type CapturePhase = "preparing" | "align" | "steady" | "capture" | "complete" | "error";

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function FaceUnlockCamera({
  open,
  mode,
  accountName,
  onCancel,
  onComplete,
}: FaceUnlockCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [message, setMessage] = useState("Preparing secure camera...");
  const [detail, setDetail] = useState("Your photo is not saved.");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<CapturePhase>("preparing");
  const reduceMotion = useReducedMotion();
  const portalRoot = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusCloseButton = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusCloseButton);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previousFocusRef.current?.focus();
    };
  }, [onCancel, open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let videoElement: HTMLVideoElement | null = null;

    async function startCapture() {
      setError(null);
      setReady(false);
      setComplete(false);
      setPhase("preparing");
      setMessage("Preparing secure camera...");
      setDetail("Face processing stays in this browser.");

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "This browser does not support camera Face Unlock. Use your password or native device passkey.",
          );
        }

        const faceapi = await loadFaceUnlockModels();
        if (cancelled) return;

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        const video = videoRef.current;
        if (!video || cancelled) return;
        videoElement = video;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;

        setReady(true);
        setPhase("align");
        setMessage("Center your face in the frame");
        setDetail("No button is needed. Keep one face visible and look toward the camera.");

        let stableFrames = 0;
        const descriptors: Float32Array[] = [];
        const options = tinyFaceDetectorOptions(faceapi);

        while (!cancelled && descriptors.length < 3) {
          const detections = await faceapi
            .detectAllFaces(video, options)
            .withFaceLandmarks(true)
            .withFaceDescriptors();

          if (cancelled) return;

          if (detections.length !== 1) {
            stableFrames = 0;
            setPhase("align");
            setMessage(detections.length > 1 ? "Only one person should be visible" : "Center your face in the frame");
            setDetail(detections.length > 1 ? "Move other faces out of view." : "Move a little closer and keep the area well lit.");
            await wait(160);
            continue;
          }

          const detection = detections[0];
          const framed = isFaceWellFramed(
            detection.detection.box,
            video.videoWidth,
            video.videoHeight,
          );
          if (!framed) {
            stableFrames = 0;
            setPhase("align");
            setMessage("Adjust your position");
            setDetail("Keep your full face centered, neither too close nor too far away.");
            await wait(160);
            continue;
          }

          stableFrames += 1;
          if (stableFrames < 5) {
            setPhase("steady");
            setMessage("Face found. Hold still");
            setDetail(`Automatic capture is preparing ${stableFrames} of 5. Keep looking at the camera.`);
            await wait(140);
            continue;
          }

          setPhase("capture");
          descriptors.push(detection.descriptor);
          setMessage(`Capturing secure sample ${descriptors.length} of 3`);
          setDetail("No button needed. Hold still and keep looking toward the camera.");
          await wait(260);
        }

        if (cancelled) return;
        setMessage(mode === "enroll" ? "Creating this browser's Face Unlock" : "Checking your face");
        setDetail("Finishing the live verification...");

        const result = await onComplete({
          descriptor: averageFaceDescriptors(descriptors),
        });
        if (cancelled) return;

        if (!result.ok) {
          setPhase("error");
          setError(result.message ?? "Face verification did not match. Please try again.");
          setMessage("Face Unlock was not completed");
          setDetail("You can retry or use your password or device passkey.");
          return;
        }

        setComplete(true);
        setPhase("complete");
        setMessage(mode === "enroll" ? "Face Unlock is ready" : "Face verified");
        setDetail(mode === "enroll" ? "This browser can now offer camera Face Unlock." : "Opening your portal...");
      } catch (captureError) {
        if (cancelled) return;
        const text = captureError instanceof Error ? captureError.message : "Camera Face Unlock could not start.";
        const permissionBlocked =
          captureError instanceof DOMException &&
          ["NotAllowedError", "PermissionDeniedError"].includes(captureError.name);
        setError(
          permissionBlocked
            ? "Camera access was blocked. Allow camera access for this site, then retry."
            : text,
        );
        setPhase("error");
        setMessage("Camera is unavailable");
        setDetail("Password and native device passkey sign-in are still available.");
      }
    }

    void startCapture();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoElement) videoElement.srcObject = null;
    };
  }, [attempt, mode, onComplete, open]);

  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="face-unlock-overlay"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[150] grid h-dvh place-items-center overflow-hidden bg-slate-950/75 p-3 backdrop-blur-[6px] sm:p-4"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="face-unlock-title"
            aria-describedby="face-unlock-privacy"
            aria-busy={!complete && !error}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.975, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 6 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border border-accent/25 bg-bg-card shadow-[0_32px_110px_rgba(0,0,0,0.62)] sm:max-h-[calc(100dvh-2rem)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(110,231,183,0.1),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.07),transparent_38%)]" />

            <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex min-w-0 gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                  <ScanFace className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    Camera Face Unlock · Beta
                  </p>
                  <h2
                    id="face-unlock-title"
                    className="mt-1 truncate font-heading text-xl font-bold text-text-primary sm:text-2xl"
                  >
                    {mode === "enroll"
                      ? "Set up your face"
                      : `Welcome${accountName ? `, ${accountName}` : " back"}`}
                  </h2>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onCancel}
                aria-label="Close Face Unlock"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-bg-elevated/70 text-text-muted transition hover:border-accent/35 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-5 md:grid-cols-[minmax(0,1.38fr)_minmax(280px,0.82fr)] md:overflow-hidden">
              <div className="min-w-0 self-start md:self-center">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black shadow-[inset_0_0_50px_rgba(0,0,0,0.38)]">
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className={`h-full w-full -scale-x-100 object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-25"}`}
                  />
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div
                      className={`h-[74%] w-[58%] rounded-[48%] border-2 ${
                        complete ? "border-accent" : "border-white/75"
                      } shadow-[0_0_0_999px_rgba(0,0,0,0.28)]`}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-[11px] text-white/80 backdrop-blur-md">
                    <span>Keep one face inside the guide</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                  </div>
                  {!ready ? (
                    <div className="absolute inset-0 grid place-items-center">
                      <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  ) : null}
                  {complete ? (
                    <div className="absolute inset-0 grid place-items-center bg-accent/10">
                      <CheckCircle2 className="h-14 w-14 text-accent drop-shadow-[0_0_24px_rgba(110,231,183,0.8)]" />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex min-w-0 flex-col md:overflow-y-auto md:pr-1">
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface/45 p-3.5"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    {complete ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text-primary">{message}</p>
                    <p className="mt-1 text-sm leading-5 text-text-secondary">{detail}</p>
                  </div>
                </div>

                {!complete && !error ? (
                  <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-1" aria-label="Face capture progress">
                    {[
                      {
                        label: "Face ready",
                        active: phase === "align",
                        done: ["steady", "capture"].includes(phase),
                      },
                      {
                        label: "Hold still",
                        active: phase === "steady",
                        done: phase === "capture",
                      },
                      { label: "Auto capture", active: phase === "capture", done: false },
                    ].map((step, index) => (
                      <div
                        key={step.label}
                        className={`rounded-lg border px-2.5 py-2 text-center text-xs transition md:flex md:items-center md:justify-between md:px-3 md:text-left ${
                          step.active
                            ? "border-accent/45 bg-accent/12 text-accent"
                            : step.done
                              ? "border-accent/20 bg-accent/5 text-text-primary"
                              : "border-border bg-surface/45 text-text-muted"
                        }`}
                      >
                        <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.16em] md:mb-0">
                          {step.done ? "Done" : `Step ${index + 1}`}
                        </span>
                        {step.label}
                      </div>
                    ))}
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                <div className="mt-auto pt-4">
                  <div
                    id="face-unlock-privacy"
                    className="rounded-lg border border-border/80 bg-bg-elevated/55 p-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                      Private by design
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-text-muted">
                      No camera photo is retained. Face matching happens only in this browser.
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end md:flex-col-reverse">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="button-motion rounded-lg border border-border bg-bg-elevated/65 px-4 py-2.5 text-sm font-bold text-text-secondary hover:border-accent/30 hover:text-text-primary"
                    >
                      {mode === "enroll" ? "Cancel setup" : "Use password instead"}
                    </button>
                    {error ? (
                      <button
                        type="button"
                        onClick={() => setAttempt((value) => value + 1)}
                        className="button-motion rounded-lg border border-accent/35 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent"
                      >
                        Retry camera
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalRoot,
  );
}
