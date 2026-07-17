"use client";

import Link from "next/link";
import {
  useActionState,
  useCallback,
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
  ArrowUpRight,
  BookOpenCheck,
  Check,
  CheckCheck,
  Clock3,
  Mic,
  Paperclip,
  Send,
  Smile,
  Square,
  Star,
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

export type ChatContextItem = {
  id: string;
  title: string;
  kind: string;
  sessionName: string;
  status: string;
};

const initialState: ChatActionState = { status: "idle", message: "" };
const MAX_TEXT_LENGTH = 2000;
const MAX_RECORDING_SECONDS = 90;
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const LIVE_REFRESH_MS = 7000;
const MAX_PINS = 20;

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

const CONTEXT_MARKER_PATTERN = /^\[\[hw:([^|\]]+)\|([^\]]*)\]\]\s*/;

function buildContextMarker(item: ChatContextItem) {
  const safeTitle = item.title.replace(/[[\]|]/g, " ").slice(0, 80);
  return `[[hw:${item.id}|${safeTitle}]]`;
}

function parseContext(body: string) {
  const match = body.match(CONTEXT_MARKER_PATTERN);
  if (!match) return { text: body };
  return {
    contextId: match[1],
    contextTitle: match[2],
    text: body.slice(match[0].length),
  };
}

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

function presenceLabel(lastSeenAt: string | undefined, now: number) {
  if (!lastSeenAt) return "";
  const seen = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(seen)) return "";
  const diff = now - seen;
  if (diff < 2 * 60_000) return "Active now";
  if (diff < 60 * 60_000) return `Active ${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `Active ${Math.floor(diff / 3_600_000)}h ago`;
  return `Last seen ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(seen)}`;
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
  peerLastSeenAt,
  contextItems = [],
  className,
}: {
  action: ChatAction;
  messages: ChatMessage[];
  currentRole: ChatSenderRole;
  peerName: string;
  studentId?: string;
  peerLastSeenAt?: string;
  contextItems?: ChatContextItem[];
  className?: string;
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
  const lastDraft = useRef<{
    body: string;
    voiceData: string;
    voiceMime: string;
    voiceDurationSeconds: number;
    context: ChatContextItem | null;
  } | null>(null);
  const atBottomRef = useRef(true);

  const [body, setBody] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recorderError, setRecorderError] = useState("");
  const [voiceData, setVoiceData] = useState("");
  const [voiceMime, setVoiceMime] = useState("");
  const [voiceDurationSeconds, setVoiceDurationSeconds] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ChatContextItem | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [pinsOpen, setPinsOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [missedWhileAway, setMissedWhileAway] = useState(0);
  const [presenceNow, setPresenceNow] = useState(() => Date.now());

  const pinsStorageKey = `ai-builders-chat-pins:${currentRole}:${studentId || "self"}`;

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

  const pinnedMessages = useMemo(
    () => optimisticMessages.filter((message) => pinnedIds.includes(message.id)),
    [optimisticMessages, pinnedIds],
  );

  const messageCount = optimisticMessages.length;
  const presence = presenceLabel(peerLastSeenAt, presenceNow);
  const presenceActive = presence === "Active now";

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
    if (!peerLastSeenAt) return;
    const interval = window.setInterval(() => setPresenceNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, [peerLastSeenAt]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(pinsStorageKey) ?? "[]");
        if (Array.isArray(stored)) {
          setPinnedIds(stored.filter((entry): entry is string => typeof entry === "string"));
        }
      } catch {
        // Ignore malformed pin storage.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pinsStorageKey]);

  const togglePin = useCallback((messageId: string) => {
    setPinnedIds((current) => {
      const next = current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : [...current, messageId].slice(-MAX_PINS);
      window.localStorage.setItem(pinsStorageKey, JSON.stringify(next));
      return next;
    });
  }, [pinsStorageKey]);

  function jumpToMessage(messageId: string) {
    const target = scrollRef.current?.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (!target) return;
    setPinsOpen(false);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("chat-highlight");
    window.requestAnimationFrame(() => target.classList.add("chat-highlight"));
    window.setTimeout(() => target.classList.remove("chat-highlight"), 1700);
  }

  useEffect(() => {
    if (state.status === "error" && lastDraft.current) {
      setBody(lastDraft.current.body);
      setVoiceData(lastDraft.current.voiceData);
      setVoiceMime(lastDraft.current.voiceMime);
      setVoiceDurationSeconds(lastDraft.current.voiceDurationSeconds);
      setSelectedContext(lastDraft.current.context);
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

  const composedBody = selectedContext
    ? `${buildContextMarker(selectedContext)} ${body}`.trimEnd()
    : body;

  function handleFormAction(formData: FormData) {
    const trimmedBody = body.trim();
    if (!trimmedBody && !voiceData && !selectedContext) return;

    lastDraft.current = { body, voiceData, voiceMime, voiceDurationSeconds, context: selectedContext };
    pendingCounter.current += 1;
    addOptimisticMessage({
      id: `pending-${pendingCounter.current}`,
      studentId: studentId ?? "",
      senderRole: currentRole,
      kind: voiceData ? "voice" : "text",
      body: composedBody.trim(),
      voiceData: voiceData || undefined,
      voiceMime: voiceMime || undefined,
      voiceDurationSeconds: voiceDurationSeconds || undefined,
      createdAt: new Date().toISOString(),
      pending: true,
    });

    setBody("");
    clearVoice();
    setSelectedContext(null);
    setEmojiOpen(false);
    setAttachOpen(false);
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
    setBody((value) => (value + emoji).slice(0, effectiveMaxLength));
    textareaRef.current?.focus();
  }

  function attachContext(item: ChatContextItem) {
    // Reserve room for the context marker so the composed message never
    // exceeds the server's 2000-character limit.
    const reserved = MAX_TEXT_LENGTH - (buildContextMarker(item).length + 1);
    setBody((value) => value.slice(0, reserved));
    setSelectedContext(item);
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
  const showQuickReplies = !body.trim() && !voiceData && !recording && !selectedContext;
  const effectiveMaxLength = selectedContext
    ? MAX_TEXT_LENGTH - (buildContextMarker(selectedContext).length + 1)
    : MAX_TEXT_LENGTH;
  const nearLimit = body.length > effectiveMaxLength - 200;
  const canSend = Boolean(body.trim() || voiceData || selectedContext) && !isPending && !recording;
  const contextHref = (id: string) =>
    currentRole === "student"
      ? `/homework/${id}`
      : `/admin/homework${studentId ? `?student=${studentId}` : ""}`;

  return (
    <section
      className={cn(
        "chat-glass relative flex h-[min(76vh,54rem)] min-h-[36rem] flex-col overflow-hidden rounded-3xl shadow-2xl shadow-black/25",
        className,
      )}
    >
      <div className="chat-console-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="relative">
          <div className="chat-avatar-ring flex h-11 w-11 items-center justify-center rounded-full font-heading text-sm font-bold text-text-primary">
            {initials(peerName)}
          </div>
          {presenceActive ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-bg-card bg-accent" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent">
            Channel // Private
          </p>
          <p className="truncate font-heading text-lg font-semibold text-text-primary">{peerName}</p>
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            {presence ? (
              <>
                <span className={cn("h-1.5 w-1.5 rounded-full", presenceActive ? "bg-accent shadow-[0_0_8px_var(--accent)]" : "bg-text-muted")} />
                {presence}
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                Encrypted-in-portal · updates live
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPinsOpen((value) => !value)}
          className={cn(
            "button-motion flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition",
            pinsOpen
              ? "border-accent/45 bg-accent/15 text-accent"
              : "border-white/12 bg-white/[0.04] text-text-secondary hover:text-accent",
          )}
          aria-expanded={pinsOpen}
          aria-label="Show pinned messages"
        >
          <Star className={cn("h-4 w-4", pinnedIds.length && "fill-current text-accent-warm")} />
          <span className="hidden sm:inline">Pins</span>
          {pinnedIds.length ? <span className="font-mono">{pinnedIds.length}</span> : null}
        </button>
      </div>

      <AnimatePresence>
        {pinsOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 overflow-hidden border-b border-white/10 bg-black/20"
          >
            <div className="max-h-48 overflow-y-auto p-3">
              {pinnedMessages.length ? (
                pinnedMessages.map((message) => {
                  const parsed = parseContext(message.body);
                  return (
                    <div key={message.id} className="mb-2 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 last:mb-0">
                      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-current text-accent-warm" />
                      <button
                        type="button"
                        onClick={() => jumpToMessage(message.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="line-clamp-2 text-xs leading-5 text-text-primary">
                          {message.kind === "voice" && !parsed.text ? "Voice note 🎙️" : parsed.text || parsed.contextTitle}
                        </span>
                        <span className="mt-1 block font-mono text-[0.6rem] uppercase text-text-muted">
                          {message.senderRole === currentRole ? "You" : peerName} · {dayLabel(message.createdAt)} {shortTime(message.createdAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePin(message.id)}
                        className="rounded-lg p-1 text-text-muted transition hover:text-danger"
                        aria-label="Unpin message"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="p-3 text-center text-xs text-text-muted">
                  Hover any message and tap the star to pin important instructions here.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {timeline.length ? (
          timeline.map(({ message, newDay, groupWithPrevious, groupWithNext }) => {
            const own = message.senderRole === currentRole;
            const seenByPeer = own
              ? Boolean(currentRole === "student" ? message.readByAdminAt : message.readByStudentAt)
              : false;
            const parsed = parseContext(message.body);
            const pinned = pinnedIds.includes(message.id);
            return (
              <div key={message.id} data-message-id={message.id}>
                {newDay ? (
                  <div className="my-5 flex items-center gap-3 first:mt-0">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-muted backdrop-blur">
                      {dayLabel(message.createdAt)}
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
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
                  className={cn(
                    "group flex items-end gap-2",
                    own ? "justify-end" : "justify-start",
                    groupWithPrevious ? "mt-1" : "mt-4",
                    "first:mt-0",
                  )}
                >
                  {!own ? (
                    groupWithPrevious ? (
                      <span className="w-7 shrink-0" />
                    ) : (
                      <span className="chat-avatar-ring grid h-7 w-7 shrink-0 place-items-center rounded-full font-heading text-[0.6rem] font-bold text-text-primary">
                        {initials(peerName)}
                      </span>
                    )
                  ) : null}

                  {own && !message.pending ? (
                    <button
                      type="button"
                      onClick={() => togglePin(message.id)}
                      className={cn(
                        "mb-2 shrink-0 rounded-full p-1.5 transition",
                        pinned
                          ? "text-accent-warm"
                          : "text-text-muted opacity-0 hover:text-accent-warm group-hover:opacity-100",
                      )}
                      aria-label={pinned ? "Unpin message" : "Pin message"}
                    >
                      <Star className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
                    </button>
                  ) : null}

                  <div
                    className={cn(
                      "max-w-[min(35rem,85%)] px-4 py-3 text-sm",
                      own
                        ? "chat-bubble-own text-black"
                        : "chat-bubble-peer text-text-primary",
                      "rounded-3xl",
                      !groupWithNext && (own ? "rounded-br-md" : "rounded-bl-md"),
                      message.pending && "opacity-75",
                    )}
                  >
                    {parsed.contextId ? (
                      <Link
                        href={contextHref(parsed.contextId)}
                        className={cn(
                          "mb-2 flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition",
                          own
                            ? "border-black/20 bg-black/10 hover:bg-black/20"
                            : "border-accent/25 bg-accent/[0.08] hover:bg-accent/15",
                        )}
                      >
                        <BookOpenCheck className={cn("h-4 w-4 shrink-0", own ? "text-black/70" : "text-accent")} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block font-mono text-[0.58rem] uppercase tracking-[0.16em]", own ? "text-black/55" : "text-accent")}>
                            Homework context
                          </span>
                          <span className="block truncate text-xs font-semibold">{parsed.contextTitle}</span>
                        </span>
                        <ArrowUpRight className={cn("h-3.5 w-3.5 shrink-0", own ? "text-black/55" : "text-text-muted")} />
                      </Link>
                    ) : null}
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
                        {parsed.text ? <p className="leading-6">{parsed.text}</p> : null}
                      </div>
                    ) : parsed.text ? (
                      <p className="whitespace-pre-wrap leading-6">{parsed.text}</p>
                    ) : null}
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

                  {!own && !message.pending ? (
                    <button
                      type="button"
                      onClick={() => togglePin(message.id)}
                      className={cn(
                        "mb-2 shrink-0 rounded-full p-1.5 transition",
                        pinned
                          ? "text-accent-warm"
                          : "text-text-muted opacity-0 hover:text-accent-warm group-hover:opacity-100",
                      )}
                      aria-label={pinned ? "Unpin message" : "Pin message"}
                    >
                      <Star className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
                    </button>
                  ) : null}
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
            className="button-motion absolute bottom-32 right-5 z-20 flex items-center gap-2 rounded-full border border-white/12 bg-bg-elevated/95 px-3 py-2 text-xs font-semibold text-text-primary shadow-xl backdrop-blur"
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

      <form ref={formRef} action={handleFormAction} className="relative z-10 border-t border-white/10 bg-black/20 p-4 backdrop-blur">
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <input type="hidden" name="body" value={composedBody} />
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
                className="shrink-0 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-text-secondary transition hover:border-accent/35 hover:text-accent"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}

        {selectedContext ? (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-3">
            <BookOpenCheck className="h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">Asking about</p>
              <p className="truncate text-xs font-semibold text-text-primary">{selectedContext.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedContext(null)}
              className="rounded-xl border border-white/12 p-2 text-text-muted transition hover:text-danger"
              aria-label="Remove homework context"
            >
              <X className="h-4 w-4" />
            </button>
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
              className="rounded-xl border border-white/12 p-2 text-text-muted transition hover:text-danger"
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
              className="rounded-xl border border-white/12 p-2 text-text-muted transition hover:text-danger"
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
              onClick={() => {
                setEmojiOpen((value) => !value);
                setAttachOpen(false);
              }}
              className={cn(
                "button-motion flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition",
                emojiOpen
                  ? "border-accent/45 bg-accent/15 text-accent"
                  : "border-white/12 bg-white/[0.04] text-text-secondary hover:text-accent",
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
                  className="absolute bottom-14 left-0 z-20 grid w-56 grid-cols-8 gap-1 rounded-2xl border border-white/12 bg-bg-elevated/95 p-2 shadow-2xl backdrop-blur"
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

          {contextItems.length ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAttachOpen((value) => !value);
                  setEmojiOpen(false);
                }}
                className={cn(
                  "button-motion flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition",
                  attachOpen || selectedContext
                    ? "border-accent/45 bg-accent/15 text-accent"
                    : "border-white/12 bg-white/[0.04] text-text-secondary hover:text-accent",
                )}
                aria-label="Attach a homework task"
                aria-expanded={attachOpen}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {attachOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute bottom-14 left-0 z-20 w-72 rounded-2xl border border-white/12 bg-bg-elevated/95 p-2 shadow-2xl backdrop-blur"
                  >
                    <p className="px-2 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-text-muted">
                      Ask about a task
                    </p>
                    <div className="max-h-56 overflow-y-auto">
                      {contextItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            attachContext(item);
                            setAttachOpen(false);
                            textareaRef.current?.focus();
                          }}
                          className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.06]"
                        >
                          <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-text-primary">{item.title}</span>
                            <span className="block truncate text-[0.66rem] text-text-muted">
                              {item.sessionName} · {item.kind === "class_challenge" ? "Class Challenge" : "Home Task"}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}

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
              rows={1}
              value={body}
              maxLength={effectiveMaxLength}
              onChange={(event) => {
                setBody(event.target.value);
                autoGrow();
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                selectedContext
                  ? "Ask your question about this task..."
                  : voiceData
                    ? "Add a caption (optional)..."
                    : "Message... (Enter to send)"
              }
              className="min-h-12 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-text-primary outline-none backdrop-blur transition focus:border-accent/60 focus:shadow-[0_0_24px_rgba(110,231,183,0.12)]"
            />
            {nearLimit ? (
              <span className="pointer-events-none absolute -top-5 right-2 font-mono text-[0.62rem] tabular-nums text-text-muted">
                {body.length}/{effectiveMaxLength}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="button-motion flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(110,231,183,0.22)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
