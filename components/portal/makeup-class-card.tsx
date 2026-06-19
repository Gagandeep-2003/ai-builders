"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Lock, Video } from "lucide-react";
import { normalizeMeetLink } from "@/lib/meet-links";
import { formatInTimeZone } from "@/lib/time";

export function MakeupClassCard({
  label = "Make-up",
  title,
  detail,
  startsAtIso,
  endsAtIso,
  meetLink,
  viewerTimeZone,
}: {
  label?: string;
  title: string;
  detail: string;
  startsAtIso: string;
  endsAtIso: string;
  meetLink: string;
  viewerTimeZone: string;
}) {
  const [canJoin, setCanJoin] = useState(false);
  const startsAt = useMemo(() => new Date(startsAtIso), [startsAtIso]);
  const endsAt = useMemo(() => new Date(endsAtIso), [endsAtIso]);
  const opensAt = useMemo(() => new Date(startsAt.getTime() - 15 * 60_000), [startsAt]);
  const normalizedMeetLink = useMemo(() => normalizeMeetLink(meetLink), [meetLink]);
  const classTime = `${formatInTimeZone(startsAt, viewerTimeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })} · ${formatInTimeZone(startsAt, viewerTimeZone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })} - ${formatInTimeZone(endsAt, viewerTimeZone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })}`;
  const disabledMessage = `Join activates 15 minutes before class, at ${formatInTimeZone(opensAt, viewerTimeZone, {
    dateStyle: "medium",
    timeStyle: "short",
  })}.`;

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      setCanJoin(now >= opensAt.getTime() && now <= endsAt.getTime());
    };

    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, [endsAt, opensAt]);

  return (
    <section className="premium-card rounded-xl border-info/30 bg-info/5 p-6 shadow-[0_0_38px_rgba(96,165,250,0.08)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-info/25 bg-info/10 text-blue-200">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase text-blue-200">{label} class</p>
              <h2 className="font-heading text-2xl font-bold">{title}</h2>
            </div>
          </div>
          <p className="mt-5 text-text-secondary">{classTime}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
            <CalendarClock className="h-4 w-4 text-blue-200" />
            {detail}
          </p>
        </div>
        <a
          href={canJoin && normalizedMeetLink ? normalizedMeetLink : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!canJoin}
          title={canJoin ? `Join your ${label.toLowerCase()} class` : disabledMessage}
          className="button-motion inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base shadow-[0_18px_44px_rgba(110,231,183,0.18)] aria-disabled:pointer-events-none aria-disabled:border aria-disabled:border-border aria-disabled:bg-bg-elevated aria-disabled:text-text-muted aria-disabled:shadow-none"
        >
          <span className="relative flex h-2.5 w-2.5">
            {canJoin ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bg-base opacity-75" />
            ) : null}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bg-base" />
          </span>
          {canJoin ? `Join ${label} Class` : "Join unlocks soon"}
          {canJoin ? <ExternalLink className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </a>
      </div>
      {!canJoin ? <p className="mt-3 text-xs text-text-muted">{disabledMessage}</p> : null}
    </section>
  );
}
