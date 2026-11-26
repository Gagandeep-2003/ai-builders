import type { Metadata } from "next";
import { Check, Clock3, MessagesSquare, ShieldCheck } from "lucide-react";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Free AI Course Demo",
  description:
    "Request a free conversation and course demonstration for a student interested in AI literacy, app building, agents, and automation.",
  alternates: { canonical: "/book-a-free-demo" },
};

export default function BookDemoPage() {
  const siteUrl = getSiteUrl();

  return (
    <MarketingShell>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Book a free demo",
              item: `${siteUrl}/book-a-free-demo`,
            },
          ],
        }}
      />
      <PageHero
        eyebrow="Free course conversation"
        title="See how the AI Builders course would work for your student."
        description="Tell us about the learner, their goals, and a few suitable times. We will arrange a personal conversation and walk through the curriculum, projects, portal, and class format."
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-7 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-24">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent">
            What to expect
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold">
            A useful fit check, not a sales script.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            The demonstration is a chance to understand the student&apos;s interests and show exactly how the 24-session learning path turns those interests into practical work.
          </p>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {[
              [MessagesSquare, "Discuss the student", "Interests, confidence, prior experience, and the kind of support that would help."],
              [Clock3, "Review class fit", "Time zone, suitable class schedule, live format, and expected weekly commitment."],
              [ShieldCheck, "Understand responsible use", "How privacy, ethics, attribution, and appropriate school use are handled."],
              [Check, "See the learning path", "Modules, session outcomes, practical tasks, projects, and the private student portal."],
            ].map(([Icon, title, copy]) => {
              const ItemIcon = Icon as typeof Check;
              return (
                <div key={String(title)} className="flex gap-4 py-5">
                  <ItemIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <h3 className="font-heading font-bold">{String(title)}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-text-secondary">{String(copy)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg-card p-5 shadow-2xl shadow-black/10 sm:p-7">
          <div className="mb-6 border-b border-border pb-5">
            <p className="font-mono text-xs uppercase text-accent">Demo request</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Tell us a little about the learner</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Required fields help us make the first conversation relevant.
            </p>
          </div>
          <DemoRequestForm />
        </div>
      </section>
    </MarketingShell>
  );
}
