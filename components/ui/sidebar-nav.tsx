"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CalendarClock,
  ChartNoAxesCombined,
  Clock3,
  ClipboardCheck,
  Compass,
  Files,
  FolderOpen,
  Home,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

const navIcons = {
  book: BookOpen,
  calendar: CalendarClock,
  chart: ChartNoAxesCombined,
  check: ClipboardCheck,
  files: Files,
  folder: FolderOpen,
  home: Home,
  dashboard: LayoutDashboard,
  megaphone: Megaphone,
  message: MessageSquareText,
  profile: UserRound,
  students: UsersRound,
  attendance: CalendarCheck,
  homework: BookOpenCheck,
  journey: Compass,
  slots: Clock3,
};

export type NavIconName = keyof typeof navIcons;

export type NavLink = {
  href: string;
  label: string;
  icon: NavIconName;
  priority?: boolean;
};

export type NavBadge = {
  count: number;
  tone?: "accent" | "info" | "warm" | "danger";
  label?: string;
};

const badgeTones = {
  accent: "border-accent/35 bg-accent/12 text-accent",
  info: "border-info/35 bg-info/12 text-[color:var(--info)]",
  warm: "border-accent-warm/35 bg-accent-warm/12 text-[color:var(--accent-warm)]",
  danger: "border-danger/35 bg-danger/12 text-[color:var(--danger)]",
};

export function SidebarNav({
  links,
  footer,
  badges = {},
}: {
  links: NavLink[];
  footer?: React.ReactNode;
  badges?: Partial<Record<string, NavBadge>>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState("");
  const navigationPending = Boolean(
    navigatingTo &&
      pathname !== navigatingTo &&
      !pathname.startsWith(`${navigatingTo}/`),
  );

  useEffect(() => {
    if (typeof performance === "undefined") return;
    const startMark = "portal-navigation-start";
    if (!performance.getEntriesByName(startMark).length) return;
    performance.mark("portal-navigation-content");
    const measure = performance.measure("portal-navigation", startMark, "portal-navigation-content");
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      console.info(`[portal-navigation] ${pathname} ${Math.round(measure.duration)}ms`);
    }
    performance.clearMarks(startMark);
    performance.clearMarks("portal-navigation-content");
  }, [pathname]);

  const nav = (
    <aside className="flex h-full w-72 flex-col border-r border-border/70 bg-bg-base/90 px-4 py-5 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-bold">AI Builders</p>
          <p className="font-mono text-[11px] uppercase text-text-muted">Summer Bootcamp</p>
        </div>
        <AnimatedThemeToggler compact variant="circle" />
      </div>

      <nav className="mt-8 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
          const Icon = navIcons[link.icon];
          const badge = badges[link.href];

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={link.priority ? true : null}
              onMouseEnter={() => router.prefetch(link.href)}
              onFocus={() => router.prefetch(link.href)}
              onClick={() => {
                if (typeof performance !== "undefined") {
                  performance.clearMarks("portal-navigation-start");
                  performance.mark("portal-navigation-start");
                }
                setNavigatingTo(link.href);
                setOpen(false);
              }}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition",
                "hover:bg-white/[0.04] hover:text-text-primary",
                active &&
                  "bg-accent/10 text-accent shadow-[inset_3px_0_0_rgba(110,231,183,0.85)]",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{link.label}</span>
              {navigationPending && navigatingTo === link.href ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" />
              ) : null}
              {badge && badge.count > 0 ? (
                <span
                  className={cn(
                    "ml-auto inline-flex min-w-6 items-center justify-center rounded-full border px-1.5 py-0.5 font-mono text-[0.65rem] font-bold leading-none",
                    badgeTones[badge.tone ?? "accent"],
                  )}
                  aria-label={badge.label ?? `${badge.count} notifications`}
                >
                  {badge.count > 9 ? "9+" : badge.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {footer}
        <form action={logoutAction}>
          <SubmitButton
            pendingLabel="Signing out..."
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg-card px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </SubmitButton>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      {navigationPending ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-accent/10">
          <div className="h-full w-1/3 animate-[navigation-progress_0.9s_ease-in-out_infinite] bg-accent shadow-[0_0_18px_rgba(110,231,183,0.75)]" />
        </div>
      ) : null}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{nav}</div>
      <div className="no-print fixed left-4 top-4 z-40 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="button-motion rounded-xl border border-border bg-bg-card p-3 text-text-primary shadow-xl"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-bg-base/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <div className="absolute inset-y-0 left-0">
            {nav}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-xl border border-border bg-bg-card p-2 text-text-secondary"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
