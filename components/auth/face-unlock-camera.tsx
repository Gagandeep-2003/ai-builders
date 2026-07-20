"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, LoaderCircle, ScanFace, ShieldCheck, X } from "lucide-react";
import {
  averageFaceDescriptors,
  getEyeAspectRatio,
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

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function FaceUnlockCamera({
  open,
  mode,
  accountName,
  onCancel,
  onComplete,
}: FaceUnlockCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Preparing secure camera...");
  const [detail, setDetail] = useState("Your photo is not saved.");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let videoElement: HTMLVideoElement | null = null;

    async function startCapture() {
      setError(null);
      setReady(false);
      setComplete(false);
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
        setMessage("Center your face in the frame");
        setDetail("Keep one face visible and look toward the camera.");

        let sawOpenEyes = false;
        let sawClosedEyes = false;
        let openFrames = 0;
        const descriptors: Float32Array[] = [];
        const options = tinyFaceDetectorOptions(faceapi);

        while (!cancelled && descriptors.length < 3) {
          const detections = await faceapi
            .detectAllFaces(video, options)
            .withFaceLandmarks(true)
            .withFaceDescriptors();

          if (cancelled) return;

          if (detections.length !== 1) {
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
            setMessage("Adjust your position");
            setDetail("Keep your full face centered, neither too close nor too far away.");
            await wait(160);
            continue;
          }

          const eyeRatio = getEyeAspectRatio(
            detection.landmarks.getLeftEye(),
            detection.landmarks.getRightEye(),
          );

          if (!sawOpenEyes) {
            if (eyeRatio > 0.215) openFrames += 1;
            else openFrames = 0;

            if (openFrames >= 2) {
              sawOpenEyes = true;
              setMessage("Blink once");
              setDetail("This quick live check helps reject a still photo.");
            }
            await wait(130);
            continue;
          }

          if (!sawClosedEyes) {
            if (eyeRatio < 0.19) {
              sawClosedEyes = true;
              setMessage("Great. Open your eyes");
              setDetail("Hold still while three clear samples are checked.");
            }
            await wait(130);
            continue;
          }

          if (eyeRatio < 0.205) {
            await wait(110);
            continue;
          }

          descriptors.push(detection.descriptor);
          setMessage(`Capturing secure sample ${descriptors.length} of 3`);
          setDetail("Keep looking toward the camera.");
          await wait(180);
        }

        if (cancelled) return;
        setMessage(mode === "enroll" ? "Creating this browser's Face Unlock" : "Checking your face");
        setDetail("Finishing the live verification...");

        const result = await onComplete({
          descriptor: averageFaceDescriptors(descriptors),
        });
        if (cancelled) return;

        if (!result.ok) {
          setError(result.message ?? "Face verification did not match. Please try again.");
          setMessage("Face Unlock was not completed");
          setDetail("You can retry or use your password or device passkey.");
          return;
        }

        setComplete(true);
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

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="face-unlock-title"
      className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
    >
      <div className="premium-card my-auto w-full max-w-xl overflow-hidden rounded-xl border border-accent/25 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <ScanFace className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Camera Face Unlock · Beta
              </p>
              <h2 id="face-unlock-title" className="mt-1 font-heading text-xl font-bold">
                {mode === "enroll" ? "Set up your face" : `Welcome${accountName ? `, ${accountName}` : " back"}`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close Face Unlock"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-text-muted transition hover:border-accent/35 hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-black">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`h-full w-full -scale-x-100 object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-25"}`}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className={`h-[74%] w-[58%] rounded-[48%] border-2 ${complete ? "border-accent" : "border-white/70"} shadow-[0_0_0_999px_rgba(0,0,0,0.28)]`} />
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

          <div className="mt-5 flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/8 text-accent">
              {complete ? <ShieldCheck className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-heading font-bold text-text-primary">{message}</p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">{detail}</p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="max-w-sm text-xs leading-5 text-text-muted">
              No camera photo is retained. Face matching happens only in this browser, and password sign-in always remains available.
            </p>
            {error ? (
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="button-motion rounded-lg border border-accent/35 bg-accent/8 px-4 py-2 text-sm font-bold text-accent"
              >
                Retry camera
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
