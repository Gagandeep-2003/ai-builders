"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, PauseCircle, Send, Trash2, Volume2 } from "lucide-react";
import type { ChatActionState } from "@/app/actions/chat";
import type { ChatMessage, ChatSenderRole } from "@/lib/course-data";
import { cn } from "@/lib/utils";

type ChatAction = (
  previousState: ChatActionState,
  formData: FormData,
) => Promise<ChatActionState>;

const initialState: ChatActionState = { status: "idle", message: "" };
const MAX_TEXT_LENGTH = 2000;

function shortTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function secondsLabel(value?: number) {
  if (!value) return "voice note";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AI";
}

export function ChatPanel({
  action,
  messages,
  currentRole,
  peerName,
  studentId,
}: {
  action: ChatAction;
  messages: ChatMessage[];
  currentRole: ChatSenderRole;
  peerName: string;
  studentId?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recordingStartedAt = useRef(0);
  const [recording, setRecording] = useState(false);
  const [recorderError, setRecorderError] = useState("");
  const [voiceData, setVoiceData] = useState("");
  const [voiceMime, setVoiceMime] = useState("");
  const [voiceDurationSeconds, setVoiceDurationSeconds] = useState(0);

  const groupedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [groupedMessages.length]);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    const timer = window.setTimeout(() => {
      setVoiceData("");
      setVoiceMime("");
      setVoiceDurationSeconds(0);
      router.refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router, state.status]);

  async function startRecording() {
    setRecorderError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecorderError("Voice recording is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceData(String(reader.result ?? ""));
          setVoiceMime(mime);
          setVoiceDurationSeconds(Math.max(1, Math.round((Date.now() - recordingStartedAt.current) / 1000)));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.current = recorder;
      recordingStartedAt.current = Date.now();
      recorder.start();
      setRecording(true);
    } catch {
      setRecorderError("Microphone permission was not granted.");
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    mediaRecorder.current = null;
    setRecording(false);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-bg-card/80 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-3 border-b border-border/70 bg-white/[0.03] px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-info font-heading text-sm font-bold text-black">
          {initials(peerName)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold text-text-primary">{peerName}</p>
          <p className="text-xs text-text-muted">Private course chat</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[62vh] min-h-[28rem] space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {groupedMessages.length ? (
          groupedMessages.map((message) => {
            const own = message.senderRole === currentRole;
            return (
              <div key={message.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[min(35rem,85%)] rounded-3xl px-4 py-3 text-sm shadow-lg",
                    own
                      ? "rounded-br-md bg-accent text-black shadow-accent/10"
                      : "rounded-bl-md border border-border bg-bg-elevated text-text-primary",
                  )}
                >
                  {message.kind === "voice" && message.voiceData ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Volume2 className="h-4 w-4" />
                        {secondsLabel(message.voiceDurationSeconds)}
                      </div>
                      <audio controls src={message.voiceData} className="h-9 w-full max-w-72" />
                      {message.body ? <p className="leading-6">{message.body}</p> : null}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                  )}
                  <p className={cn("mt-2 text-[0.68rem]", own ? "text-black/55" : "text-text-muted")}>
                    {shortTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex min-h-[20rem] items-center justify-center text-center">
            <div>
              <p className="font-heading text-2xl font-semibold text-text-primary">Start the conversation</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Send a quick text or a short voice note. Messages stay private between mentor and student.
              </p>
            </div>
          </div>
        )}
      </div>

      <form ref={formRef} action={formAction} className="border-t border-border/70 bg-bg-base/80 p-4">
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <input type="hidden" name="voiceData" value={voiceData} />
        <input type="hidden" name="voiceMime" value={voiceMime} />
        <input type="hidden" name="voiceDurationSeconds" value={voiceDurationSeconds} />

        {voiceData ? (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-3">
            <Volume2 className="h-4 w-4 text-accent" />
            <audio controls src={voiceData} className="h-8 flex-1" />
            <button
              type="button"
              onClick={() => {
                setVoiceData("");
                setVoiceMime("");
                setVoiceDurationSeconds(0);
              }}
              className="rounded-xl border border-border p-2 text-text-muted transition hover:text-danger"
              aria-label="Remove voice note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={cn(
              "button-motion flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition",
              recording
                ? "border-danger/50 bg-danger/10 text-danger"
                : "border-accent/25 bg-accent/10 text-accent hover:bg-accent/15",
            )}
            aria-label={recording ? "Stop recording" : "Record voice note"}
          >
            {recording ? <PauseCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <textarea
            name="body"
            rows={1}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Message..."
            className="min-h-12 flex-1 resize-none rounded-2xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={isPending || recording}
            className="button-motion flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isPending ? "Sending" : "Send"}
          </button>
        </div>
        {recorderError ? <p className="mt-2 text-xs text-danger">{recorderError}</p> : null}
        {state.status === "error" ? <p className="mt-2 text-xs text-danger">{state.message}</p> : null}
        {state.status === "success" ? <p className="mt-2 text-xs text-accent">{state.message}</p> : null}
      </form>
    </section>
  );
}
