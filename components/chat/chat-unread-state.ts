"use client";

import { useEffect, useSyncExternalStore } from "react";

export const CHAT_UNREAD_REFRESH_EVENT = "chat:unread-refresh";

export type ChatUnreadSnapshot = {
  count: number;
  latest: string;
  latestId: string;
  href: string;
  title: string;
  initialized: boolean;
};

const emptySnapshot: ChatUnreadSnapshot = Object.freeze({
  count: 0,
  latest: "",
  latestId: "",
  href: "/chat",
  title: "New private message",
  initialized: false,
});

let snapshot: ChatUnreadSnapshot = emptySnapshot;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function emit(next: ChatUnreadSnapshot) {
  if (
    next.count === snapshot.count &&
    next.latest === snapshot.latest &&
    next.latestId === snapshot.latestId &&
    next.href === snapshot.href &&
    next.title === snapshot.title &&
    next.initialized === snapshot.initialized
  ) {
    return;
  }

  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function publishChatUnread(next: Partial<ChatUnreadSnapshot>) {
  emit({
    ...snapshot,
    ...next,
    count: Math.max(0, Number(next.count ?? snapshot.count) || 0),
    initialized: next.initialized ?? true,
  });
}

export function useChatUnread(initial?: { count: number; href: string; title?: string }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
  const initialCount = initial?.count;
  const initialHref = initial?.href;
  const initialTitle = initial?.title;

  useEffect(() => {
    if (initialCount == null || !initialHref || snapshot.initialized) return;
    publishChatUnread({
      count: initialCount,
      href: initialHref,
      title: initialTitle,
      initialized: true,
    });
  }, [initialCount, initialHref, initialTitle]);

  return current;
}
