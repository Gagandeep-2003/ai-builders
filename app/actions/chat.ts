"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireStudentAccess } from "@/lib/auth";
import { sendPushToUserIds } from "@/lib/push-notifications";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type ChatActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const MAX_TEXT_LENGTH = 2000;
const MAX_VOICE_DATA_LENGTH = 950_000;

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeText(text: string) {
  return text.replace(/\s+\n/g, "\n").trim().slice(0, MAX_TEXT_LENGTH);
}

function notificationBody(body: string, hasVoice: boolean) {
  // Homework context markers ([[hw:id|title]]) are a UI concept; show a clean
  // preview in push notifications instead of the raw marker.
  const contextMatch = body.match(/^\[\[hw:[^|\]]+\|([^\]]*)\]\]\s*/);
  const cleanBody = contextMatch ? body.slice(contextMatch[0].length) : body;
  const prefix = contextMatch ? `About "${contextMatch[1]}": ` : "";
  const text = `${prefix}${cleanBody}`.trim();
  if (text) return text.length > 120 ? `${text.slice(0, 117)}...` : text;
  return hasVoice ? "Sent you a voice note." : "Sent you a new message.";
}

type VoicePayload =
  | { error: string }
  | {
      voiceData?: string;
      voiceMime?: string;
      voiceDurationSeconds?: number;
    };

function voicePayload(formData: FormData): VoicePayload {
  const voiceData = value(formData, "voiceData");
  const voiceMime = value(formData, "voiceMime") || "audio/webm";
  const duration = Math.max(0, Math.round(Number(formData.get("voiceDurationSeconds") ?? 0)));

  if (!voiceData) return {};
  if (!voiceData.startsWith("data:audio/") || voiceData.length > MAX_VOICE_DATA_LENGTH) {
    return { error: "Voice note is too large. Please keep it short and try again." };
  }

  return {
    voiceData,
    voiceMime,
    voiceDurationSeconds: duration || undefined,
  };
}

async function getStudentIdForCurrentUser(profileId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return "";

  const { data } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", profileId)
    .maybeSingle();

  return data?.id ?? "";
}

function revalidateChat(studentId?: string) {
  revalidatePath("/chat");
  revalidatePath("/dashboard");
  revalidatePath("/admin/chat");
  revalidatePath("/admin");
  if (studentId) revalidatePath(`/admin/chat?student=${studentId}`);
}

export async function sendStudentChatMessageAction(
  _previousState: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const profile = await requireStudentAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Chat is not connected yet." };

  const studentId = await getStudentIdForCurrentUser(profile.id);
  if (!studentId) return { status: "error", message: "Student chat profile could not be found." };

  const body = normalizeText(value(formData, "body"));
  const voice = voicePayload(formData);
  if ("error" in voice) return { status: "error", message: voice.error };
  if (!body && !voice.voiceData) {
    return { status: "error", message: "Write a message or record a short voice note first." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("chat_messages").insert({
    student_id: studentId,
    sender_role: "student",
    sender_user_id: profile.id,
    kind: voice.voiceData ? "voice" : "text",
    body,
    voice_data: voice.voiceData,
    voice_mime: voice.voiceMime,
    voice_duration_seconds: voice.voiceDurationSeconds,
    read_by_student_at: now,
  });

  if (error) return { status: "error", message: "Message could not be sent. Please try again." };
  const service = createServiceRoleSupabaseClient();
  if (service) {
    const { data: admins } = await service.from("profiles").select("id").eq("role", "admin");
    await sendPushToUserIds(
      (admins ?? []).map((admin) => admin.id),
      {
        title: `New message from ${profile.fullName}`,
        body: notificationBody(body, Boolean(voice.voiceData)),
        url: `/admin/chat?student=${studentId}`,
        tag: `chat-${studentId}`,
      },
    );
  }
  revalidateChat(studentId);
  return { status: "success", message: "Message sent." };
}

export async function sendAdminChatMessageAction(
  _previousState: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const profile = await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Chat is not connected yet." };

  const studentId = value(formData, "studentId");
  const body = normalizeText(value(formData, "body"));
  const voice = voicePayload(formData);
  if ("error" in voice) return { status: "error", message: voice.error };
  if (!studentId) return { status: "error", message: "Choose a student first." };
  if (!body && !voice.voiceData) {
    return { status: "error", message: "Write a message or record a short voice note first." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("chat_messages").insert({
    student_id: studentId,
    sender_role: "admin",
    sender_user_id: profile.id,
    kind: voice.voiceData ? "voice" : "text",
    body,
    voice_data: voice.voiceData,
    voice_mime: voice.voiceMime,
    voice_duration_seconds: voice.voiceDurationSeconds,
    read_by_admin_at: now,
  });

  if (error) return { status: "error", message: "Message could not be sent. Please try again." };
  const service = createServiceRoleSupabaseClient();
  if (service) {
    const { data: student } = await service
      .from("students")
      .select("user_id")
      .eq("id", studentId)
      .maybeSingle();
    if (student?.user_id) {
      await sendPushToUserIds([student.user_id], {
        title: "New message from your AI Builders mentor",
        body: notificationBody(body, Boolean(voice.voiceData)),
        url: "/chat",
        tag: `chat-${studentId}`,
      });
    }
  }
  revalidateChat(studentId);
  return { status: "success", message: "Message sent." };
}

export async function markStudentChatReadAction() {
  const profile = await requireStudentAccess();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;

  const studentId = await getStudentIdForCurrentUser(profile.id);
  if (!studentId) return;

  await supabase
    .from("chat_messages")
    .update({ read_by_student_at: new Date().toISOString() })
    .eq("student_id", studentId)
    .eq("sender_role", "admin")
    .is("read_by_student_at", null);

  revalidateChat(studentId);
}

export async function markAdminChatReadAction(studentId: string) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  if (!supabase || !studentId) return;

  await supabase
    .from("chat_messages")
    .update({ read_by_admin_at: new Date().toISOString() })
    .eq("student_id", studentId)
    .eq("sender_role", "student")
    .is("read_by_admin_at", null);

  revalidateChat(studentId);
}
