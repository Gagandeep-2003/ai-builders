import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  Code2,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { modules, sessions } from "@/lib/course-data";
import { getSiteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Live Online AI Courses for Students",
  description:
    "A mentor-led online AI course for students covering prompt engineering, AI app building, responsible AI, agents, and automation across 24 live sessions.",
  alternates: { canonical: "/" },
};

const moduleIcons = [BrainCircuit, Code2, Workflow];
const facts = [
  ["3", "focused modules"],
  ["24", "live sessions"],
  ["1", "portfolio journey"],
] as const;

export default function HomePage() {
  const siteUrl = getSiteUrl();

  return (
    <MarketingShell>
      <JsonLd
        value={[
          {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/apple-touch-icon.png`,
            description:
              "Mentor-led online AI courses for students covering AI literacy, app building, agents, and automation.",
          },
          {
            "@context": "https://schema.org",
            "@type": "Course",
            name: "AI Builders: AI Literacy, Apps and Automation for Students",
            description:
              "A 24-session live online AI course where students learn responsible AI use, build AI-powered apps, and create automation workflows.",
            provider: {
              "@type": "EducationalOrganization",
              name: siteName,
              sameAs: siteUrl,
            },
            educationalLevel: "School students",
            timeRequired: "P24H",
            teaches: [
              "AI literacy",
              "Prompt engineering",
              "AI-assisted app building",
              "Responsible AI",
              "AI agents",
              "Workflow automation",
            ],
          },
        ]}
      />

      <section className="relative isolate min-h-[calc(88dvh-4.5rem)] overflow-hidden bg-[#07090d] text-white">
        <Image
          src="/marketing/ai-students-live-workshop.png"
          alt="Illustration of students collaborating on an AI project in a live workshop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,11,0.9)_0%,rgba(5,8,11,0.74)_34%,rgba(5,8,11,0.24)_62%,rgba(5,8,11,0.04)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,8,11,0.58)_0%,transparent_50%)]" />
        <div className="relative mx-auto flex min-h-[calc(88dvh-4.5rem)] max-w-7xl items-center px-5 py-16 sm:px-7 lg:px-10">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Live online AI learning for students
            </p>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-extrabold leading-[1.04] sm:text-6xl lg:text-7xl">
              Live Online AI Courses for Students
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Learn how AI works, build useful apps, and automate real workflows in a mentor-led 24-session program designed around making, presenting, and responsible use.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/book-a-free-demo"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3.5 font-bold text-[#07110d] transition hover:brightness-105"
              >
                Book a free demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/course-curriculum"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/20 px-5 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.08]"
              >
                Explore the curriculum
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/67">
              {["Live mentor guidance", "Project-based learning", "Private student portal"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-bg-card/80">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border/70 px-5 sm:px-7 lg:px-10">
          {facts.map(([value, label]) => (
            <div key={label} className="py-7 text-center">
              <p className="font-heading text-3xl font-extrabold text-accent sm:text-4xl">{value}</p>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-7 lg:px-10 lg:py-28">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase text-accent">The learning path</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">
            From using AI well to building with it
          </h2>
          <p className="mt-5 text-lg leading-8 text-text-secondary">
            Students move through three connected modules. Each one ends with something they can demonstrate, explain, and improve.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {modules.map((module, index) => {
            const Icon = moduleIcons[index];
            return (
              <article key={module.id} className="premium-card rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md border border-accent/25 bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-text-muted">MODULE {module.orderIndex} / 8 SESSIONS</span>
                </div>
                <h3 className="mt-7 font-heading text-xl font-bold">{module.title}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{module.description}</p>
                <p className="mt-6 border-t border-border/70 pt-5 text-sm font-semibold text-accent">
                  Final outcome: {sessions.filter((session) => session.moduleId === module.id).at(-1)?.studentOutput}
                </p>
              </article>
            );
          })}
        </div>
        <Link href="/course-curriculum" className="mt-8 inline-flex items-center gap-2 font-bold text-accent">
          See all 24 sessions <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="border-y border-border/70 bg-bg-card/60">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-7 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24">
          <div>
            <p className="font-mono text-xs uppercase text-accent">What students actually do</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">
              Less passive watching. More building, testing, and explaining.
            </h2>
            <p className="mt-5 text-lg leading-8 text-text-secondary">
              Every session connects a concept to a practical output. The goal is not just to know a tool, but to make thoughtful choices with it.
            </p>
            <Link href="/student-projects" className="mt-7 inline-flex items-center gap-2 font-bold text-accent">
              View representative projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [MonitorPlay, "Study systems", "Build guides, practice questions, summaries, and learning workflows for real school subjects."],
              [Sparkles, "Creative media", "Create visual, audio, writing, and presentation work while discussing ethics and attribution."],
              [Bot, "AI-powered apps", "Turn an idea into an interface, prototype, or useful GPT-powered experience."],
              [Workflow, "Automations", "Connect triggers, AI steps, and outputs into workflows that solve a clear problem."],
            ].map(([Icon, title, copy]) => {
              const ItemIcon = Icon as typeof MonitorPlay;
              return (
                <article key={String(title)} className="rounded-lg border border-border bg-bg-base/60 p-5">
                  <ItemIcon className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 font-heading font-bold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{String(copy)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-7 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-28">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Designed with parents in mind</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-5xl">
            A structured course, not unplanned screen time
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            Families can understand what is being taught, what is being built, and what comes next. Students learn responsible use alongside practical skills.
          </p>
          <Link href="/for-parents" className="mt-7 inline-flex items-center gap-2 font-bold text-accent">
            Read the parent guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="border-l border-border pl-0 lg:pl-10">
          {[
            [ShieldCheck, "Responsible AI", "Privacy, bias, misinformation, attribution, and appropriate school use are part of the curriculum."],
            [MonitorPlay, "Visible progress", "The private portal keeps class schedules, work, resources, progress, and mentor feedback in one place."],
            [BrainCircuit, "Thinking before tooling", "Students learn to define the problem, choose a workflow, and explain why their solution works."],
          ].map(([Icon, title, copy]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return (
              <div key={String(title)} className="flex gap-4 border-b border-border py-5 first:pt-0 last:border-0">
                <ItemIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-heading font-bold">{String(title)}</h3>
                  <p className="mt-1.5 leading-6 text-text-secondary">{String(copy)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#0b1712] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 py-16 sm:px-7 md:flex-row md:items-center lg:px-10">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Start with a conversation</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold">See whether the course is the right fit.</h2>
            <p className="mt-3 max-w-2xl text-white/65">
              Book a free demo to discuss the student&apos;s interests, current experience, schedule, and learning goals.
            </p>
          </div>
          <Link href="/book-a-free-demo" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-5 py-3.5 font-bold text-[#07110d]">
            Book a free demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
