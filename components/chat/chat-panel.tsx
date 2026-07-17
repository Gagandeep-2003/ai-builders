"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  Check,
  CheckCheck,
  Clock3,
  Mic,
  Send,
  Smile,
  Square,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import type { ChatActionState } from "@/app/actions/chat";
import type { ChatMessage, ChatSenderRole } from "@/lib/course-data";
import { AudioBubble } from "@/components/chat/audio-bubble";
import { cn } from "@/lib/utils";

type ChatAction = (
  previousState: ChatActionState,
  formData: FormData,
) => Promise<ChatActionState>;

const initialState: ChatActionState = { status: "idle", message: "" };
const MAX_TEXT_LENGTH = 2000;
const MAX_RECORDING_SECONDS = 90;
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const LIVE_REFRESH_MS = 7000;

const EMOJI_SET = ["👍", "🙏", "🎉", "😊", "😄", "🤔", "❓", "✅", "💡", "🔥", "🚀", "⭐", "📚", "⏰", "🙋", "❤️"];

const QUICK_REPLIES: Record<ChatSenderRole, string[]> = {
  student: [
    "I finished my homework ✅",
    "I need help with my homework 🙋",
    "I might be late to class ⏰",
    "Can we schedule a make-up class?",
  ],
  admin: [
    "Great work! 🎉",
    "Reminder: class starts soon ⏰",
    "Please finish your pending homework 📚",
    "How is the task going?",
  ],
};

type PanelMessage = ChatMessage & { pending?: boolean };

function shortTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
}

function dayLabel(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const now = new Date();
  const startOfDay = (input: Date) => new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  }).format(date);
}

function sameDay(a: string, b: string) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AI";
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recordingStartedAt = useRef(0);
  const discardRecording = useRef(false);
  const pendingCounter = useRef(0);
  const lastDraft = useRef<{ body: string; voiceData: string; voiceMime: string; voiceDurationSeconds: number } | null>(null);
  const atBottomRef = useRef(true);

  const [body, setBody] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recorderError, setRecorderError] = useState("");
  const [voiceData, setVoiceData] = useState("");
  const [voiceMime, setVoiceMime] = useState("");
  const [voiceDurationSeconds, setVoiceDurationSeconds] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [missedWhileAway, setMissedWhileAway] = useState(0);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages as PanelMessage[],
    (current, next: PanelMessage) => [...current, next],
  );

  // Freeze the "New messages" divider position on first render so it does not
  // vanish the instant the read marker fires.
  const [firstUnreadId] = useState(() => {
    const unread = messages.find((message) =>
      message.senderRole !== currentRole &&
      !(currentRole === "student" ? message.readByStudentAt : message.readByAdminAt),
    );
    return unread?.id ?? "";
  });

  const timeline = useMemo(() => {
    return optimisticMessages.map((message, index) => {
      const previous = optimisticMessages[index - 1];
      const next = optimisticMessages[index + 1];
      const newDay = !previous || !sameDay(previous.createdAt, message.createdAt);
      const groupWithPrevious =
        !newDay &&
        previous?.senderRole === message.senderRole &&
        new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() < GROUP_WINDOW_MS;
      const groupWithNext =
        Boolean(next) &&
        sameDay(message.createdAt, next.createdAt) &&
        next.senderRole === message.senderRole &&
        new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() < GROUP_WINDOW_MS;
      return { message, newDay, groupWithPrevious, groupWithNext };
    });
  }, [optimisticMessages]);

  const messageCount = optimisticMessages.length;

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  }

  useEffect(() => {
    if (atBottomRef.current) {
      scrollToBottom(messageCount > 30 ? "auto" : "smooth");
      setMissedWhileAway(0);
    } else {
      setMissedWhileAway((count) => count + 1);
    }
     
  }, [messageCount]);

  // Near-live updates: refresh server data while the tab is visible.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible" || isPending || recording) return;
      router.refresh();
    }, LIVE_REFRESH_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isPending, recording, router]);

  useEffect(() => {
    if (state.status === "error" && lastDraft.current) {
      setBody(lastDraft.current.body);
      setVoiceData(lastDraft.current.voiceData);
      setVoiceMime(lastDraft.current.voiceMime);
      setVoiceDurationSeconds(lastDraft.current.voiceDurationSeconds);
      lastDraft.current = null;
    }
    if (state.status === "success") {
      lastDraft.current = null;
    }
  }, [state]);

  useEffect(() => {
    if (!recording) return;
    const interval = window.setInterval(() => {
      setRecordingSeconds((seconds) => {
        if (seconds + 1 >= MAX_RECORDING_SECONDS) {
          window.setTimeout(() => stopRecording(), 0);
          return MAX_RECORDING_SECONDS;
        }
        return seconds + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
     
  }, [recording]);

  function autoGrow() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }

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
      discardRecording.current = false;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (discardRecording.current) return;
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceData(String(reader.result ?? ""));
          setVoiceMime(mime);
          setVoiceDurationSeconds(Math.max(1, Math.round((Date.now() - recordingStartedAt.current) / 1000)));
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.current = recorder;
      recordingStartedAt.current = Date.now();
      recorder.start();
      setRecordingSeconds(0);
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

  function cancelRecording() {
    discardRecording.current = true;
    stopRecording();
    setRecordingSeconds(0);
  }

  function clearVoice() {
    setVoiceData("");
    setVoiceMime("");
    setVoiceDurationSeconds(0);
  }

  function handleFormAction(formData: FormData) {
    const trimmedBody = body.trim();
    if (!trimmedBody && !voiceData) return;

    lastDraft.current = { body, voiceData, voiceMime, voiceDurationSeconds };
    pendingCounter.current += 1;
    addOptimisticMessage({
      id: `pending-${pendingCounter.current}`,
      studentId: studentId ?? "",
      senderRole: currentRole,
      kind: voiceData ? "voice" : "text",
      body: trimmedBody,
      voiceData: voiceData || undefined,
      voiceMime: voiceMime || undefined,
      voiceDurationSeconds: voiceDurationSeconds || undefined,
      createdAt: new Date().toISOString(),
      pending: true,
    });

    setBody("");
    clearVoice();
    setEmojiOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    formAction(formData);
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function insertEmoji(emoji: string) {
    setBody((value) => (value + emoji).slice(0, MAX_TEXT_LENGTH));
    textareaRef.current?.focus();
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distance < 120;
    atBottomRef.current = nearBottom;
    setAtBottom(nearBottom);
    if (nearBottom) setMissedWhileAway(0);
  }

  const quickReplies = QUICK_REPLIES[currentRole];
  const showQuickReplies = !body.trim() && !voiceData && !recording;
  const nearLimit = body.length > MAX_TEXT_LENGTH - 200;
  const canSend = Boolean(body.trim() || voiceData) && !isPending && !recording;

  return (
    <section className="relative flex h-[min(76vh,54rem)] min-h-[36rem] flex-col overflow-hidden rounded-3xl border border-border bg-bg-card/80 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-3 border-b border-border/70 bg-white/[0.03] px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-info font-heading text-sm font-bold text-black">
          {initials(peerName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-lg font-semibold text-text-primary">{peerName}</p>
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
            Private course chat · updates live
          </p>
        </div>
        {messageCount ? (
          <span className="hidden rounded-full border border-border bg-bg-elevated px-2.5 py-1 font-mono text-[0.65rem] uppercase text-text-muted sm:inline-flex">
            {messageCount} message{messageCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(106,255,193,0.05),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(89,160,255,0.05),transparent_30%)] px-4 py-5 sm:px-6"
      >
        {timeline.length ? (
          timeline.map(({ message, newDay, groupWithPrevious, groupWithNext }) => {
            const own = message.senderRole === currentRole;
            const seenByPeer = own
              ? Boolean(currentRole === "student" ? message.readByAdminAt : message.readByStudentAt)
              : false;
            return (
              <div key={message.id}>
                {newDay ? (
                  <div className="my-5 flex items-center gap-3 first:mt-0">
                    <span className="h-px flex-1 bg-border/70" />
                    <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-muted">
                      {dayLabel(message.createdAt)}
                    </span>
                    <span className="h-px flex-1 bg-border/70" />
                  </div>
                ) : null}
                {firstUnreadId && message.id === firstUnreadId ? (
                  <div className="my-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-accent/40" />
                    <span className="rounded-full border border-accent/35 bg-accent/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-accent">
                      New messages
                    </span>
                    <span className="h-px flex-1 bg-accent/40" />
                  </div>
                ) : null}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className={cn("flex", own ? "justify-end" : "justify-start", groupWithPrevious ? "mt-1" : "mt-4", "first:mt-0")}
                >
                  <div
                    className={cn(
                      "max-w-[min(35rem,85%)] px-4 py-3 text-sm shadow-lg",
                      own
                        ? "bg-accent text-black shadow-accent/10"
                        : "border border-border bg-bg-elevated text-text-primary",
                      own
                        ? cn("rounded-3xl", !groupWithNext && "rounded-br-md")
                        : cn("rounded-3xl", !groupWithNext && "rounded-bl-md"),
                      message.pending && "opacity-75",
                    )}
                  >
                    {message.kind === "voice" && message.voiceData ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Volume2 className="h-4 w-4" />
                          Voice note
                        </div>
                        <AudioBubble
                          src={message.voiceData}
                          durationSeconds={message.voiceDurationSeconds}
                          tone={own ? "own" : "peer"}
                        />
                        {message.body ? <p className="leading-6">{message.body}</p> : null}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                    )}
                    {!groupWithNext || message.pending ? (
                      <p
                        className={cn(
                          "mt-1.5 flex items-center justify-end gap-1 text-[0.68rem]",
                          own ? "text-black/55" : "text-text-muted",
                        )}
                      >
                        {shortTime(message.createdAt)}
                        {own ? (
                          message.pending ? (
                            <Clock3 className="h-3 w-3" aria-label="Sending" />
                          ) : seenByPeer ? (
                            <CheckCheck className="h-3.5 w-3.5" aria-label="Seen" />
                          ) : (
                            <Check className="h-3.5 w-3.5" aria-label="Sent" />
                          )
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
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
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => {
                      setBody(reply);
                      textareaRef.current?.focus();
                    }}
                    className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs text-accent transition hover:bg-accent/20"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {!atBottom ? (
          <motion.button
            type="button"
            onClick={() => {
              scrollToBottom();
              setMissedWhileAway(0);
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="button-motion absolute bottom-32 right-5 z-10 flex items-center gap-2 rounded-full border border-border bg-bg-elevated/95 px-3 py-2 text-xs font-semibold text-text-primary shadow-xl backdrop-blur"
            aria-label="Scroll to latest messages"
          >
            {missedWhileAway > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-mono text-[0.65rem] font-bold text-black">
                {missedWhileAway > 9 ? "9+" : missedWhileAway}
              </span>
            ) : null}
            Latest
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <form ref={formRef} action={handleFormAction} className="border-t border-border/70 bg-bg-base/90 p-4">
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <input type="hidden" name="voiceData" value={voiceData} />
        <input type="hidden" name="voiceMime" value={voiceMime} />
        <input type="hidden" name="voiceDurationSeconds" value={voiceDurationSeconds} />

        {showQuickReplies ? (
          <div className="scrollbar-soft mb-3 flex gap-2 overflow-x-auto pb-1">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => {
                  setBody(reply);
                  textareaRef.current?.focus();
                }}
                className="shrink-0 rounded-full border border-border bg-bg-elevated/70 px-3 py-1.5 text-xs text-text-secondary transition hover:border-accent/35 hover:text-accent"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}

        {recording ? (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-danger" />
            </span>
            <div className="flex h-6 items-end gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="chat-recording-bar w-1 rounded-full bg-danger/80"
                  style={{ height: "100%", animationDelay: `${bar * 0.12}s` }}
                />
              ))}
            </div>
            <p className="flex-1 font-mono text-sm tabular-nums text-text-primary">
              {formatElapsed(recordingSeconds)}
              <span className="ml-2 text-xs text-text-muted">
                {recordingSeconds >= MAX_RECORDING_SECONDS - 15
                  ? `Auto-stops at ${formatElapsed(MAX_RECORDING_SECONDS)}`
                  : "Recording..."}
              </span>
            </p>
            <button
              type="button"
              onClick={cancelRecording}
              className="rounded-xl border border-border p-2 text-text-muted transition hover:text-danger"
              aria-label="Discard recording"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {voiceData && !recording ? (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-3">
            <Volume2 className="h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <AudioBubble src={voiceData} durationSeconds={voiceDurationSeconds} tone="peer" />
            </div>
            <button
              type="button"
              onClick={clearVoice}
              className="rounded-xl border border-border p-2 text-text-muted transition hover:text-danger"
              aria-label="Remove voice note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiOpen((value) => !value)}
              className={cn(
                "button-motion flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition",
                emojiOpen
                  ? "border-accent/45 bg-accent/15 text-accent"
                  : "border-border bg-bg-elevated text-text-secondary hover:text-accent",
              )}
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
            >
              <Smile className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {emojiOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="absolute bottom-14 left-0 z-20 grid w-56 grid-cols-8 gap-1 rounded-2xl border border-border bg-bg-elevated/95 p-2 shadow-2xl backdrop-blur"
                >
                  {EMOJI_SET.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="grid h-6 w-6 place-items-center rounded-lg text-base transition hover:bg-white/[0.08]"
                      aria-label={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

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
            {recording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
          </button>

          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              name="body"
              rows={1}
              value={body}
              maxLength={MAX_TEXT_LENGTH}
              onChange={(event) => {
                setBody(event.target.value);
                autoGrow();
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder={voiceData ? "Add a caption (optional)..." : "Message... (Enter to send)"}
              className="min-h-12 w-full resize-none rounded-2xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
            />
            {nearLimit ? (
              <span className="pointer-events-none absolute -top-5 right-2 font-mono text-[0.62rem] tabular-nums text-text-muted">
                {body.length}/{MAX_TEXT_LENGTH}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="button-motion flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{isPending ? "Sending" : "Send"}</span>
          </button>
        </div>
        {recorderError ? <p className="mt-2 text-xs text-danger">{recorderError}</p> : null}
        {state.status === "error" ? <p className="mt-2 text-xs text-danger">{state.message}</p> : null}
      </form>
    </section>
  );
}
