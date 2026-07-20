"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LoaderCircle } from "lucide-react";
import { FaceUnlockCamera } from "@/components/auth/face-unlock-camera";
import { listFaceUnlockEnrollments } from "@/lib/face-unlock/client-store";
import { FACE_MATCH_THRESHOLD, faceDescriptorDistance } from "@/lib/face-unlock/recognition";
import type { FaceUnlockEnrollment } from "@/lib/face-unlock/types";
import { createClient } from "@/lib/supabase/client";

type FaceUnlockResponse = {
  ok?: boolean;
  tokenHash?: string;
  error?: string;
};

export function FaceUnlockSignIn() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<FaceUnlockEnrollment[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listFaceUnlockEnrollments()
      .then((savedEnrollments) => {
        if (!active) return;
        setEnrollments(savedEnrollments);
        setSelectedDeviceId(savedEnrollments[0]?.deviceId ?? "");
      })
      .catch(() => {
        if (active) setEnrollments([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedEnrollment = useMemo(
    () => enrollments.find((entry) => entry.deviceId === selectedDeviceId) ?? enrollments[0] ?? null,
    [enrollments, selectedDeviceId],
  );

  const verifyFace = useCallback(
    async ({ descriptor }: { descriptor: number[] }) => {
      if (!selectedEnrollment) {
        return { ok: false, message: "Camera Face Unlock is not set up on this browser." };
      }

      setPending(true);
      setError(null);

      try {
        const distance = faceDescriptorDistance(selectedEnrollment.descriptor, descriptor);
        if (!Number.isFinite(distance) || distance > FACE_MATCH_THRESHOLD) {
          return {
            ok: false,
            message: "Your face did not match this browser's enrollment. Try again or use your password.",
          };
        }

        const response = await fetch("/api/auth/face-unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            email: selectedEnrollment.email,
            deviceId: selectedEnrollment.deviceId,
            deviceSecret: selectedEnrollment.deviceSecret,
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as FaceUnlockResponse;
        if (!response.ok || !payload.tokenHash) {
          throw new Error(payload.error || "Camera Face Unlock is temporarily unavailable.");
        }

        const supabase = createClient();
        const { data, error: verificationError } = await supabase.auth.verifyOtp({
          type: "magiclink",
          token_hash: payload.tokenHash,
        });
        if (verificationError || !data.user) {
          throw verificationError ?? new Error("Face Unlock could not create a portal session.");
        }
        if (data.user.id !== selectedEnrollment.userId) {
          await supabase.auth.signOut();
          throw new Error("The local Face Unlock account did not match the signed-in account.");
        }

        window.setTimeout(() => {
          setCameraOpen(false);
          router.replace("/dashboard");
          router.refresh();
        }, 650);
        return { ok: true };
      } catch (verificationFailure) {
        const message =
          verificationFailure instanceof Error
            ? verificationFailure.message
            : "Camera Face Unlock could not sign you in.";
        setError(message);
        return { ok: false, message };
      } finally {
        setPending(false);
      }
    },
    [router, selectedEnrollment],
  );

  if (!enrollments.length) return null;

  return (
    <>
      <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-3">
        {enrollments.length > 1 ? (
          <label className="mb-3 block">
            <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
              Camera Face Unlock account
            </span>
            <select
              value={selectedEnrollment?.deviceId ?? ""}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              className="min-h-10 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-text-primary outline-none focus:border-cyan-400/45"
            >
              {enrollments.map((entry) => (
                <option key={entry.deviceId} value={entry.deviceId}>
                  {entry.studentName} · {entry.email}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setCameraOpen(true);
          }}
          disabled={pending}
          className="button-motion flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-5 py-3 font-bold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {pending ? "Verifying face..." : "Unlock with camera"}
          <span className="rounded-md border border-cyan-400/25 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">
            Beta
          </span>
        </button>
        <p className="mt-2 text-center text-xs leading-5 text-text-muted">
          Same browser only · live blink required · password remains available
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>

      <FaceUnlockCamera
        open={cameraOpen}
        mode="verify"
        accountName={selectedEnrollment?.studentName}
        onCancel={() => setCameraOpen(false)}
        onComplete={verifyFace}
      />
    </>
  );
}
