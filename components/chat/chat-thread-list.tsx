"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserRound, X } from "lucide-react";
import type { ChatThreadSummary } from "@/lib/course-data";
import { cn } from "@/lib/utils";

function messagePreview(thread: ChatThreadSummary) {
  const message = thread.lastMessage;
  if (!message) return "No messages yet";
  const prefix = message.senderRole === "admin" ? "You: " : "";
  const text = message.body?.trim();
  if (!text) return `${prefix}Voice note 🎙️`;
  return `${prefix}${text.length > 58 ? `${text.slice(0, 58)}...` : text}`;
}

function relativeTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}

export function ChatThreadList({
  threads,
  selectedId,
}: {
  threads: ChatThreadSummary[];
  selectedId?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return threads;
    return threads.filter((thread) => {
      const haystack = [
        thread.student.fullName,
        thread.student.email,
        thread.student.country,
        thread.student.timeZone,
        thread.lastMessage?.body ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, threads]);

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  return (
    <>
      <div className="border-b border-border/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-text-primary">Inbox</h2>
            <p className="text-xs text-text-muted">
              {threads.length} student thread{threads.length === 1 ? "" : "s"}
              {totalUnread ? ` · ${totalUnread} unread` : ""}
            </p>
          </div>
          {totalUnread ? (
            <span className="rounded-full border border-accent/35 bg-accent/15 px-2.5 py-1 font-mono text-xs font-bold text-accent">
              {totalUnread}
            </span>
          ) : null}
        </div>
        <label className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-3 py-2 transition focus-within:border-accent/50">
          <Search className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students or messages..."
            aria-label="Search chat threads"
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-text-muted transition hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>
      </div>

      <div className="max-h-[72vh] overflow-y-auto p-3">
        {filtered.length ? (
          filtered.map((thread) => {
            const active = thread.student.id === selectedId;
            return (
              <Link
                key={thread.student.id}
                href={{ pathname: "/admin/chat", query: { student: thread.student.id } }}
                className={cn(
                  "button-motion mb-2 flex gap-3 rounded-2xl border p-3 transition",
                  active
                    ? "border-accent/45 bg-accent/12 shadow-lg shadow-accent/10"
                    : "border-border bg-bg-card/70 hover:border-accent/25 hover:bg-accent/5",
                )}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-info font-heading text-sm font-bold text-black">
                  {initials(thread.student.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate font-heading text-sm text-text-primary",
                        thread.unreadCount ? "font-bold" : "font-semibold",
                      )}
                    >
                      {thread.student.fullName}
                    </span>
                    <span className="shrink-0 text-[0.68rem] text-text-muted">
                      {relativeTime(thread.lastMessage?.createdAt) || "New"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-1 line-clamp-1 text-xs",
                      thread.unreadCount ? "font-semibold text-text-primary" : "text-text-secondary",
                    )}
                  >
                    {messagePreview(thread)}
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-[0.68rem] text-text-muted">
                      {thread.student.country || thread.student.timeZone || "Student"}
                    </span>
                    {thread.unreadCount ? (
                      <span className="rounded-full border border-accent/35 bg-accent/15 px-2 py-0.5 text-[0.68rem] font-semibold text-accent">
                        {thread.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-border bg-bg-elevated p-5 text-center">
            <UserRound className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-3 font-heading text-sm font-semibold text-text-primary">
              {query ? "No matching threads" : "No students found"}
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {query
                ? "Try a different name, country, or message keyword."
                : "Add students first, then this inbox will become your private message hub."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
