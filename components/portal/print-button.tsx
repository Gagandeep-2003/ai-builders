"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="button-motion no-print inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm font-bold text-text-primary"
    >
      <Printer className="h-4 w-4" />
      Print
    </button>
  );
}
