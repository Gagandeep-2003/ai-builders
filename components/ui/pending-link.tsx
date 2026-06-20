"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      onClick={() => setPending(true)}
      aria-busy={pending}
      className={cn(
        "button-motion inline-flex items-center justify-center gap-2",
        pending && "pointer-events-none opacity-70",
        className,
      )}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : children}
    </Link>
  );
}
