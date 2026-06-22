"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function PendingLinkContent({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useLinkStatus();
  return pending ? (
    <>
      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
      <span>{pendingLabel}</span>
    </>
  ) : children;
}

export function PendingLink({
  href,
  children,
  pendingLabel = "Opening...",
  className,
}: {
  href: string;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn("button-motion inline-flex items-center justify-center gap-2", className)}
    >
      <PendingLinkContent pendingLabel={pendingLabel}>{children}</PendingLinkContent>
    </Link>
  );
}
