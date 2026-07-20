"use client";

const MODEL_PATH = "/models/face-api";
export const FACE_MATCH_THRESHOLD = 0.48;

type FaceApi = typeof import("@vladmandic/face-api");

let modelPromise: Promise<FaceApi> | null = null;

export function loadFaceUnlockModels() {
  if (!modelPromise) {
    modelPromise = import("@vladmandic/face-api").then(async (faceapi) => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
      ]);
      return faceapi;
    });
  }
  return modelPromise;
}

export function averageFaceDescriptors(descriptors: Float32Array[]) {
  if (!descriptors.length) throw new Error("No face samples were captured.");
  const average = new Float32Array(128);

  for (const descriptor of descriptors) {
    for (let index = 0; index < average.length; index += 1) {
      average[index] += descriptor[index] / descriptors.length;
    }
  }

  const magnitude = Math.hypot(...average);
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error("The face sample was not clear enough. Please try again.");
  }

  return Array.from(average, (value) => value / magnitude);
}

export function faceDescriptorDistance(first: number[], second: number[]) {
  if (first.length !== 128 || second.length !== 128) return Number.POSITIVE_INFINITY;
  let squaredDistance = 0;
  for (let index = 0; index < first.length; index += 1) {
    squaredDistance += (first[index] - second[index]) ** 2;
  }
  return Math.sqrt(squaredDistance);
}

type Point = { x: number; y: number };

function distance(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function eyeAspectRatio(points: Point[]) {
  if (points.length < 6) return 1;
  const horizontal = 2 * distance(points[0], points[3]);
  if (!horizontal) return 1;
  return (distance(points[1], points[5]) + distance(points[2], points[4])) / horizontal;
}

export function getEyeAspectRatio(leftEye: Point[], rightEye: Point[]) {
  return (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2;
}

export function isFaceWellFramed(
  box: { x: number; y: number; width: number; height: number },
  videoWidth: number,
  videoHeight: number,
) {
  if (!videoWidth || !videoHeight) return false;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const horizontalOffset = Math.abs(centerX / videoWidth - 0.5);
  const verticalOffset = Math.abs(centerY / videoHeight - 0.47);
  const faceRatio = box.width / videoWidth;
  return horizontalOffset < 0.2 && verticalOffset < 0.22 && faceRatio > 0.19 && faceRatio < 0.62;
}

export function tinyFaceDetectorOptions(faceapi: FaceApi) {
  return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.58 });
}
