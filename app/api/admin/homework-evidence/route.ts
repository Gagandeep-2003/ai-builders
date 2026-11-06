import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

function evidence(row: Record<string, unknown> | null) {
  if (!row) return null;
  const value = (key: string) => typeof row[key] === "string" ? row[key] : undefined;
  const numberValue = (key: string) => typeof row[key] === "number" ? row[key] : undefined;
  return {
    screenImage: value("screen_image"),
    cameraImage: value("camera_image"),
    proofText: value("proof_text"),
    attachmentName: value("attachment_name"),
    attachmentMime: value("attachment_mime"),
    attachmentData: value("attachment_data"),
    proofCapturedAt: value("captured_at"),
    proofExpiresAt: value("expires_at"),
    browserName: value("browser_name"),
    browserVersion: value("browser_version"),
    osName: value("os_name"),
    deviceType: value("device_type"),
    userAgent: value("user_agent"),
    viewportWidth: numberValue("viewport_width"),
    viewportHeight: numberValue("viewport_height"),
    language: value("language"),
  };
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin authentication required." }, { status: 403, headers });
  }

  const homeworkId = request.nextUrl.searchParams.get("homeworkId")?.trim();
  const studentId = request.nextUrl.searchParams.get("studentId")?.trim();
  const courseLevel = request.nextUrl.searchParams.get("courseLevel") === "2" ? 2 : 1;
  if (!homeworkId || !studentId) {
    return NextResponse.json({ error: "Missing homework or student." }, { status: 400, headers });
  }

  const supabase = createServiceRoleSupabaseClient() ?? await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Submission proof is unavailable." }, { status: 503, headers });
  }

  const table = courseLevel === 2 ? "course_activity_submissions" : "submission_evidence";
  const homeworkColumn = courseLevel === 2 ? "activity_id" : "homework_id";
  let result = await supabase
    .from(table)
    .select("screen_image, camera_image, proof_text, attachment_name, attachment_mime, attachment_data, captured_at, expires_at, browser_name, browser_version, os_name, device_type, user_agent, viewport_width, viewport_height, language")
    .eq(homeworkColumn, homeworkId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (result.error) {
    result = await supabase
      .from(table)
      .select("screen_image, camera_image, proof_text, attachment_name, attachment_mime, attachment_data, captured_at")
      .eq(homeworkColumn, homeworkId)
      .eq("student_id", studentId)
      .maybeSingle();
  }
  if (result.error) {
    result = await supabase
      .from(table)
      .select("screen_image, camera_image, captured_at")
      .eq(homeworkColumn, homeworkId)
      .eq("student_id", studentId)
      .maybeSingle();
  }
  if (result.error) {
    return NextResponse.json({ error: "Could not load submission proof." }, { status: 500, headers });
  }
  return NextResponse.json({ evidence: evidence(result.data) }, { headers });
}
