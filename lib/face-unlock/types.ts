export const FACE_UNLOCK_VERSION = 1 as const;

export type FaceUnlockEnrollment = {
  version: typeof FACE_UNLOCK_VERSION;
  userId: string;
  email: string;
  studentName: string;
  deviceId: string;
  deviceSecret: string;
  deviceName: string;
  descriptor: number[];
  enrolledAt: string;
};

export type FaceCaptureResult = {
  descriptor: number[];
};

export type FaceCaptureMode = "enroll" | "verify";
