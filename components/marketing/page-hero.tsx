import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#080b0f] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(110,231,183,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,183,0.045)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(110,231,183,0.16),transparent_25rem),radial-gradient(circle_at_90%_100%,rgba(96,165,250,0.10),transparent_24rem)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-7 sm:py-20 lg:px-10 lg:py-24">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-heading text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">{description}</p>
        {cta ? (
          <Link
            href={cta.href}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3.5 font-bold text-[#07110d] transition hover:brightness-105"
          >
            {cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
