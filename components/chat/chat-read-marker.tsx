"use client";

import { useEffect, useRef } from "react";

export function ChatReadMarker({ markReadAction }: { markReadAction: () => Promise<void> }) {
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void markReadAction();
  }, [markReadAction]);

  return null;
}
