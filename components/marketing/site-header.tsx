"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/utils";

const links = [
  { href: "/course-curriculum", label: "Curriculum" },
  { href: "/for-parents", label: "For Parents" },
  { href: "/student-projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090a0f]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-5 px-5 sm:px-7 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="AI Builders Academy home">
          <BrandMark className="h-10 w-10 shrink-0" />
          <span className="min-w-0">
            <span className="block font-heading text-sm font-bold">AI Builders Academy</span>
            <span className="hidden font-mono text-[0.62rem] uppercase text-white/50 sm:block">
              Build with AI. Think beyond it.
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white",
                pathname === link.href && "bg-white/[0.07] text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <AnimatedThemeToggler compact variant="circle" />
          <Link
            href="/login"
            className="hidden rounded-md border border-white/15 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 sm:inline-flex"
          >
            Student login
          </Link>
          <Link
            href="/book-a-free-demo"
            className="hidden rounded-md bg-accent px-4 py-2 text-sm font-bold text-[#07110d] transition hover:brightness-105 sm:inline-flex"
          >
            Book a free demo
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-marketing-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-marketing-navigation"
          className="border-t border-white/10 bg-[#090a0f] px-5 py-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-3 text-sm text-white/75 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
              <Link
                href="/login"
                className="rounded-md border border-white/15 px-3 py-2.5 text-center text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                Student login
              </Link>
              <Link
                href="/book-a-free-demo"
                className="rounded-md bg-accent px-3 py-2.5 text-center text-sm font-bold text-[#07110d]"
                onClick={() => setOpen(false)}
              >
                Free demo
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
