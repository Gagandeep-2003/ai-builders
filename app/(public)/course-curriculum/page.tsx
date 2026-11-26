import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { modules, sessions } from "@/lib/course-data";
import { getSiteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Course Curriculum for Students",
  description:
    "Explore the full 24-session AI course curriculum for students: AI literacy, prompt engineering, app building, agents, automation, and responsible AI.",
  alternates: { canonical: "/course-curriculum" },
};

export default function CourseCurriculumPage() {
  const siteUrl = getSiteUrl();

  return (
    <MarketingShell>
      <JsonLd
        value={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: modules.map((module, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${siteUrl}/course-curriculum#module-${module.orderIndex}`,
              item: {
                "@type": "Course",
                url: `${siteUrl}/course-curriculum#module-${module.orderIndex}`,
                name: module.title,
                description: [
                  "Learn responsible AI use and prompt engineering.",
                  "Plan, build, test, and present AI-assisted apps.",
                  "Design reliable AI agents and automation workflows.",
                ][index],
                provider: {
                  "@type": "EducationalOrganization",
                  name: siteName,
                  sameAs: siteUrl,
                },
              },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
              {
                "@type": "ListItem",
                position: 2,
                name: "Course curriculum",
                item: `${siteUrl}/course-curriculum`,
              },
            ],
          },
        ]}
      />
      <PageHero
        eyebrow="Complete 24-session curriculum"
        title="A clear learning path from AI literacy to working automations"
        description="Students first learn to use AI thoughtfully, then build interfaces and apps, and finally design agents and multi-step workflows. Every session produces something concrete."
        cta={{ label: "Book a free curriculum walkthrough", href: "/book-a-free-demo" }}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Module 1", "Use AI well", "Prompting, study systems, creative AI, local tools, and a presentation showcase."],
            ["Module 2", "Build with AI", "Product thinking, interfaces, AI-assisted coding, testing, and app delivery."],
            ["Module 3", "Automate with AI", "Agents, tools, memory, workflow logic, reliability, and an automation showcase."],
          ].map(([label, title, copy]) => (
            <article key={label} className="rounded-lg border border-border bg-bg-card p-5">
              <p className="font-mono text-xs uppercase text-accent">{label}</p>
              <h2 className="mt-2 font-heading text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 space-y-16">
          {modules.map((module) => {
            const moduleSessions = sessions.filter((session) => session.moduleId === module.id);
            return (
              <section key={module.id} id={`module-${module.orderIndex}`} className="scroll-mt-28">
                <div className="grid gap-6 border-b border-border pb-7 lg:grid-cols-[0.72fr_1.28fr]">
                  <div>
                    <p className="font-mono text-xs uppercase text-accent">
                      Module {module.orderIndex} · 8 live sessions
                    </p>
                    <h2 className="mt-3 font-heading text-3xl font-extrabold">{module.title}</h2>
                  </div>
                  <p className="text-lg leading-8 text-text-secondary">{module.description}</p>
                </div>
                <div className="mt-6 grid gap-3 lg:grid-cols-2">
                  {moduleSessions.map((session) => (
                    <article key={session.id} className="rounded-lg border border-border bg-bg-card/70 p-5">
                      <div className="flex items-start gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-accent/25 bg-accent/10 font-mono text-sm font-bold text-accent">
                          {session.sessionNumber}
                        </span>
                        <div>
                          <h3 className="font-heading text-lg font-bold">{session.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-text-secondary">{session.description}</p>
                          <p className="mt-4 inline-flex items-start gap-2 text-sm font-semibold text-text-primary">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            Student output: {session.studentOutput}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-[#0b1712] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-7 md:flex-row md:items-center lg:px-10">
          <div>
            <h2 className="font-heading text-2xl font-extrabold">Want to match this path to a student&apos;s goals?</h2>
            <p className="mt-2 text-white/64">Use a free demo to discuss experience, interests, schedule, and the best starting point.</p>
          </div>
          <Link href="/book-a-free-demo" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-bold text-[#07110d]">
            Book a free demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
