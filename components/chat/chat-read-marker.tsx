"use client";

import { useEffect, useRef } from "react";
import { CHAT_UNREAD_REFRESH_EVENT } from "@/components/chat/chat-unread-state";

export function ChatReadMarker({ markReadAction }: { markReadAction: () => Promise<void> }) {
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void markReadAction()
      .then(() => window.dispatchEvent(new Event(CHAT_UNREAD_REFRESH_EVENT)))
      .catch(() => {
        // The next poll will retry the unread count without interrupting chat.
      });
  }, [markReadAction]);

  return null;
}
