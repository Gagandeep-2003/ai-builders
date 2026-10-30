import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, MessageCircleMore, Repeat2, Wrench } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About AI Builders Academy",
  description:
    "Learn about AI Builders Academy's mentor-led approach to practical AI literacy, app building, automation, reflection, and responsible technology use.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="About AI Builders Academy"
        title="A place for students to build with AI and think beyond the first answer"
        description="AI Builders Academy combines live mentoring, a structured 24-session curriculum, hands-on projects, and a private learning portal."
        cta={{ label: "Meet the course in a free demo", href: "/book-a-free-demo" }}
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-7 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-24">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Why it exists</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold">AI education should produce judgment, not just faster output</h2>
        </div>
        <div className="space-y-5 text-lg leading-8 text-text-secondary">
          <p>
            Students are surrounded by AI tools, but access alone does not teach them how to define a problem, check a source, protect private information, or explain why a solution works.
          </p>
          <p>
            The academy uses making as the learning method. Students move from prompts and study systems to app prototypes, agents, and automations while reflecting on quality, responsibility, and limitations.
          </p>
        </div>
      </section>
      <section className="border-y border-border bg-bg-card/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
          <p className="font-mono text-xs uppercase text-accent">The teaching loop</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold">A repeatable way to learn unfamiliar technology</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Compass, "Frame", "Understand the audience, goal, constraints, and evidence of success."],
              [Wrench, "Build", "Choose tools deliberately and create a working first version."],
              [Repeat2, "Test", "Check facts, inspect failures, compare outputs, and improve the workflow."],
              [MessageCircleMore, "Explain", "Present the result, decisions, limits, and a practical next step."],
            ].map(([Icon, title, copy], index) => {
              const ItemIcon = Icon as typeof Compass;
              return (
                <article key={String(title)} className="rounded-lg border border-border bg-bg-base/65 p-5">
                  <div className="flex items-center justify-between">
                    <ItemIcon className="h-5 w-5 text-accent" />
                    <span className="font-mono text-xs text-text-muted">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{String(copy)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-extrabold">A growing academy, with evidence added responsibly</h2>
            <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
              Public student counts, testimonials, videos, and project showcases will be published only when they can be verified and shared with permission. The current site focuses on the curriculum, learning method, and working student experience.
            </p>
          </div>
          <Link href="/course-curriculum" className="inline-flex items-center gap-2 font-bold text-accent">
            Explore the curriculum <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
