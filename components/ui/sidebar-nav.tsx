"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardCheck,
  Files,
  FolderOpen,
  Home,
  LayoutDashboard,
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
};

export type NavIconName = keyof typeof navIcons;

export type NavLink = {
  href: string;
  label: string;
  icon: NavIconName;
};

export function SidebarNav({
  links,
  footer,
}: {
  links: NavLink[];
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <aside className="flex h-full w-72 flex-col border-r border-border/70 bg-bg-base/90 px-4 py-5 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-bold">AI Builders</p>
          <p className="font-mono text-[11px] uppercase text-text-muted">Summer Bootcamp</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
          const Icon = navIcons[link.icon];

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition",
                "hover:bg-white/[0.04] hover:text-text-primary",
                active &&
                  "bg-accent/10 text-accent shadow-[inset_3px_0_0_rgba(110,231,183,0.85)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {footer}
        <form action={logoutAction}>
          <button className="button-motion flex w-full items-center gap-3 rounded-xl border border-border bg-bg-card px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
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
