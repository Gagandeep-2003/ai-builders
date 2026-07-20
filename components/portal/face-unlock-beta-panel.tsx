"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Laptop,
  LoaderCircle,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  registerFaceUnlockDeviceAction,
  removeFaceUnlockDeviceAction,
} from "@/app/actions/face-unlock";
import { FaceUnlockCamera } from "@/components/auth/face-unlock-camera";
import {
  createFaceUnlockDeviceCredentials,
  deleteFaceUnlockEnrollment,
  getFaceUnlockDeviceName,
  getFaceUnlockEnrollmentForUser,
  saveFaceUnlockEnrollment,
} from "@/lib/face-unlock/client-store";
import { FACE_UNLOCK_VERSION, type FaceUnlockEnrollment } from "@/lib/face-unlock/types";

type FaceUnlockBetaPanelProps = {
  userId: string;
  email: string;
  studentName: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function FaceUnlockBetaPanel({
  userId,
  email,
  studentName,
}: FaceUnlockBetaPanelProps) {
  const [enrollment, setEnrollment] = useState<FaceUnlockEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getFaceUnlockEnrollmentForUser(userId)
      .then((savedEnrollment) => {
        if (active) setEnrollment(savedEnrollment);
      })
      .catch((storageError) => {
        if (active) {
          setError(
            storageError instanceof Error
              ? storageError.message
              : "This browser could not read Face Unlock storage.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const finishEnrollment = useCallback(
    async ({ descriptor }: { descriptor: number[] }) => {
      setWorking(true);
      setError(null);
      setMessage(null);

      const credentials = enrollment ?? createFaceUnlockDeviceCredentials();
      const deviceName = enrollment?.deviceName ?? getFaceUnlockDeviceName();
      const deviceId = credentials.deviceId;
      const deviceSecret = credentials.deviceSecret;

      try {
        const registration = await registerFaceUnlockDeviceAction({
          deviceId,
          deviceSecret,
          deviceName,
        });
        if (!registration.ok) return { ok: false, message: registration.message };

        const nextEnrollment: FaceUnlockEnrollment = {
          version: FACE_UNLOCK_VERSION,
          userId,
          email: email.trim().toLowerCase(),
          studentName,
          deviceId,
          deviceSecret,
          deviceName,
          descriptor,
          enrolledAt: new Date().toISOString(),
        };

        try {
          await saveFaceUnlockEnrollment(nextEnrollment);
        } catch (storageError) {
          if (!enrollment) await removeFaceUnlockDeviceAction(deviceId);
          throw storageError;
        }

        setEnrollment(nextEnrollment);
        setMessage("Camera Face Unlock is ready on this browser.");
        window.setTimeout(() => setCameraOpen(false), 850);
        return { ok: true };
      } catch (enrollmentError) {
        const text =
          enrollmentError instanceof Error
            ? enrollmentError.message
            : "Camera Face Unlock could not be saved on this browser.";
        setError(text);
        return { ok: false, message: text };
      } finally {
        setWorking(false);
      }
    },
    [email, enrollment, studentName, userId],
  );

  async function removeEnrollment() {
    if (!enrollment || working) return;
    const confirmed = window.confirm(
      "Remove camera Face Unlock from this browser? Password and native device sign-in will still work.",
    );
    if (!confirmed) return;

    setWorking(true);
    setError(null);
    setMessage(null);

    try {
      const removal = await removeFaceUnlockDeviceAction(enrollment.deviceId);
      if (!removal.ok) throw new Error(removal.message);
      await deleteFaceUnlockEnrollment(enrollment.deviceId);
      setEnrollment(null);
      setMessage("Camera Face Unlock was removed from this browser.");
    } catch (removalError) {
      setError(
        removalError instanceof Error
          ? removalError.message
          : "Camera Face Unlock could not be removed.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <section className="premium-card mt-5 overflow-hidden rounded-xl">
        <div className="grid gap-6 border-b border-border p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-bold">Camera Face Unlock</h2>
                <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-300">
                  Convenience beta
                </span>
                <span className="rounded-md border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                  This browser only
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Enroll your face after signing in, then use this browser&apos;s camera on the login page. Capture starts automatically when your face is centered, and no camera photo is retained.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMessage(null);
              setCameraOpen(true);
            }}
            disabled={loading || working}
            className="button-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-4 py-2.5 font-bold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {working || loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : enrollment ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <ScanFace className="h-4 w-4" />
            )}
            {loading ? "Checking browser..." : enrollment ? "Re-enroll face" : "Set up camera unlock"}
          </button>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-300">
              Browser enrollment
            </p>
            {loading ? (
              <div className="mt-3 flex min-h-24 items-center justify-center rounded-lg border border-border bg-bg-elevated/65 text-text-muted">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking local enrollment
              </div>
            ) : enrollment ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.06] p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-400/25 text-cyan-300">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-primary">{enrollment.deviceName}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Enrolled {formatDate(enrollment.enrolledAt)} · automatic capture enabled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeEnrollment}
                  disabled={working}
                  title="Remove camera Face Unlock"
                  aria-label="Remove camera Face Unlock"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-danger/25 text-rose-300 transition hover:bg-danger/10 disabled:opacity-45"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-border p-4 text-sm leading-6 text-text-secondary">
                This browser has not been enrolled. Center your face once and three clear samples are captured automatically.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-bg-elevated/65 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
              <div>
                <p className="font-heading font-bold">What is stored</p>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  A mathematical face template stays in this browser. Supabase stores only a random device-secret hash, never your photo or face template.
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-lg border border-border bg-bg-card p-3 text-xs leading-5 text-text-muted">
              This is a convenience beta, not a replacement for a secure native passkey. Password and native device sign-in always remain available.
            </p>
            {enrollment ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-cyan-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready on this browser
              </p>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="mx-6 mb-6 rounded-lg border border-accent/25 bg-accent/8 px-3 py-2 text-sm text-accent">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mx-6 mb-6 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </section>

      <FaceUnlockCamera
        open={cameraOpen}
        mode="enroll"
        accountName={studentName}
        onCancel={() => setCameraOpen(false)}
        onComplete={finishEnrollment}
      />
    </>
  );
}
