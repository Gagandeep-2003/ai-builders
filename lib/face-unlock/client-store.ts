"use client";

import {
  FACE_UNLOCK_VERSION,
  type FaceUnlockEnrollment,
} from "@/lib/face-unlock/types";

const DATABASE_NAME = "ai-builders-face-unlock";
const DATABASE_VERSION = 1;
const STORE_NAME = "enrollments";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not support local Face Unlock storage."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Could not open Face Unlock storage."));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "deviceId" });
        store.createIndex("email", "email", { unique: false });
        store.createIndex("userId", "userId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function runRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = operation(transaction.objectStore(STORE_NAME));

        request.onerror = () => reject(request.error ?? new Error("Face Unlock storage failed."));
        request.onsuccess = () => resolve(request.result);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
          database.close();
          reject(transaction.error ?? new Error("Face Unlock storage failed."));
        };
      }),
  );
}

function isEnrollment(value: unknown): value is FaceUnlockEnrollment {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<FaceUnlockEnrollment>;
  return (
    record.version === FACE_UNLOCK_VERSION &&
    typeof record.userId === "string" &&
    typeof record.email === "string" &&
    typeof record.studentName === "string" &&
    typeof record.deviceId === "string" &&
    typeof record.deviceSecret === "string" &&
    Array.isArray(record.descriptor) &&
    record.descriptor.length === 128
  );
}

export async function listFaceUnlockEnrollments() {
  const records = await runRequest<FaceUnlockEnrollment[]>("readonly", (store) => store.getAll());
  return records.filter(isEnrollment).sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export async function getFaceUnlockEnrollmentForUser(userId: string) {
  const enrollments = await listFaceUnlockEnrollments();
  return enrollments.find((enrollment) => enrollment.userId === userId) ?? null;
}

export async function saveFaceUnlockEnrollment(enrollment: FaceUnlockEnrollment) {
  await runRequest<IDBValidKey>("readwrite", (store) => store.put(enrollment));
}

export async function deleteFaceUnlockEnrollment(deviceId: string) {
  await runRequest<undefined>("readwrite", (store) => store.delete(deviceId));
}

export function createFaceUnlockDeviceCredentials() {
  const deviceId = crypto.randomUUID();
  const secretBytes = crypto.getRandomValues(new Uint8Array(32));
  const deviceSecret = Array.from(secretBytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return { deviceId, deviceSecret };
}

export function getFaceUnlockDeviceName() {
  if (typeof navigator === "undefined") return "This browser";
  const browserNavigator = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = browserNavigator.userAgentData?.platform || navigator.platform || "Device";
  const browser = navigator.userAgent.includes("Edg/")
    ? "Edge"
    : navigator.userAgent.includes("Chrome/")
      ? "Chrome"
      : navigator.userAgent.includes("Safari/")
        ? "Safari"
        : navigator.userAgent.includes("Firefox/")
          ? "Firefox"
          : "Browser";
  return `${browser} on ${platform}`.slice(0, 120);
}
