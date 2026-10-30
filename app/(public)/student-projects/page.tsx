import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Code2, MonitorPlay, Presentation, Workflow } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "AI Project Ideas and Outcomes for Students",
  description:
    "See representative projects from the AI Builders student curriculum, including study systems, creative AI, app prototypes, agents, and automation workflows.",
  alternates: { canonical: "/student-projects" },
};

const projects = [
  {
    Icon: MonitorPlay,
    module: "Module 1",
    title: "AI study system",
    description:
      "A subject-specific learning workspace with explanations, source summaries, practice questions, revision checkpoints, and a reflection on what the AI got right or wrong.",
    skills: ["Prompt design", "Source checking", "Learning strategy"],
  },
  {
    Icon: Presentation,
    module: "Module 1",
    title: "AI-powered presentation showcase",
    description:
      "A clear story, visual system, speaker notes, and live presentation that explains both the result and the responsible choices behind it.",
    skills: ["Visual communication", "Attribution", "Presenting"],
  },
  {
    Icon: Code2,
    module: "Module 2",
    title: "Useful app prototype",
    description:
      "A working interface built around a real audience and problem, with structured requirements, AI-assisted coding, testing, and an improvement roadmap.",
    skills: ["Product thinking", "UI building", "Testing"],
  },
  {
    Icon: Bot,
    module: "Module 3",
    title: "Goal-driven AI agent",
    description:
      "An agent that combines a goal, clear instructions, selected tools, memory boundaries, and review steps for a multi-part task.",
    skills: ["Agent design", "Tool selection", "Reliability"],
  },
  {
    Icon: Workflow,
    module: "Module 3",
    title: "Automation workflow",
    description:
      "A trigger-to-output workflow that moves information through AI and non-AI steps, handles exceptions, and measures whether the result is useful.",
    skills: ["Workflow mapping", "Automation", "Quality control"],
  },
];

export default function StudentProjectsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Representative curriculum outcomes"
        title="Students do not just explore tools. They make work they can explain."
        description="These examples show the kinds of outcomes built into the curriculum. Individual projects vary with the student's interests, experience, and chosen problem."
        cta={{ label: "See how projects develop", href: "/course-curriculum" }}
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map(({ Icon, module, title, description, skills }, index) => (
            <article
              key={title}
              className={`rounded-lg border border-border bg-bg-card p-6 ${index === projects.length - 1 ? "lg:col-span-2" : ""}`}
            >
              <div className="flex items-start justify-between gap-5">
                <span className="grid h-11 w-11 place-items-center rounded-md border border-accent/25 bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs uppercase text-text-muted">{module}</span>
              </div>
              <h2 className="mt-7 font-heading text-2xl font-bold">{title}</h2>
              <p className="mt-3 max-w-3xl leading-7 text-text-secondary">{description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-border bg-bg-base/60 px-3 py-1.5 text-xs font-semibold text-text-secondary">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 border-l-2 border-accent pl-5">
          <p className="font-heading text-lg font-bold">A note about examples</p>
          <p className="mt-2 max-w-3xl leading-7 text-text-secondary">
            These are representative curriculum projects, not claims about a specific student&apos;s work. Verified student showcases and testimonials will be added here only with permission.
          </p>
        </div>
      </section>
      <section className="border-t border-border bg-[#0b1712] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-7 md:flex-row md:items-center lg:px-10">
          <div>
            <h2 className="font-heading text-2xl font-extrabold">Which project would motivate your student?</h2>
            <p className="mt-2 text-white/64">Discuss interests and possible project directions in a free demo.</p>
          </div>
          <Link href="/book-a-free-demo" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-bold text-[#07110d]">
            Book a free demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
