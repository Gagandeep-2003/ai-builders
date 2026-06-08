"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Lock, Video } from "lucide-react";
import { joinClassAction } from "@/app/actions/class";
import type { Batch, CourseSession } from "@/lib/course-data";
import { formatSessionTime, getSessionJoinWindow } from "@/lib/time";

export function ClassLiveCard({
  batch,
  nextSession,
  viewerTimeZone,
}: {
  batch: Batch;
  nextSession: CourseSession;
  viewerTimeZone: string;
}) {
  const [nearClass, setNearClass] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const { opensAt } = getSessionJoinWindow(nextSession, batch);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const { opensAt, closesAt } = getSessionJoinWindow(nextSession, batch);
      const isOpen = now.getTime() >= opensAt.getTime() && now.getTime() <= closesAt.getTime();
      setNearClass(isOpen);
      setCanJoin(isOpen);
    };

    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, [batch, nextSession]);

  return (
    <section className="premium-card rounded-xl p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase text-text-muted">Batch</p>
              <h2 className="font-heading text-2xl font-bold">{batch.name}</h2>
            </div>
          </div>
          <p className="mt-5 text-text-secondary">
            {formatSessionTime(nextSession, batch, viewerTimeZone)}
          </p>
          <p className="mt-2 font-mono text-xs text-text-muted">
            Batch timezone: {batch.timeZone}
          </p>
        </div>
        <form action={joinClassAction}>
          <input type="hidden" name="sessionId" value={nextSession.id} />
          <button
            disabled={!canJoin}
            className="button-motion inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base shadow-[0_18px_44px_rgba(110,231,183,0.18)] disabled:cursor-not-allowed disabled:border disabled:border-border disabled:bg-bg-elevated disabled:text-text-muted disabled:shadow-none"
          >
            <span className="relative flex h-2.5 w-2.5">
              {nearClass ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bg-base opacity-75" />
              ) : null}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bg-base" />
            </span>
            {canJoin ? "Join Live Class" : "Available on class day"}
            {canJoin ? <ExternalLink className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>
          {!canJoin ? (
            <p className="mt-2 max-w-xs text-xs text-text-muted">
              Opens 15 minutes before class on {opensAt.toLocaleDateString()} and closes when class ends.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
