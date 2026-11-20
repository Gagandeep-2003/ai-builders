import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, MessageSquareText, ShieldCheck, Target, UsersRound } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Course Guide for Parents",
  description:
    "A parent guide to AI Builders Academy: live mentor guidance, responsible AI education, project-based learning, progress visibility, and a free demo.",
  alternates: { canonical: "/for-parents" },
};

const faqs = [
  {
    question: "Is this a live course or a collection of recorded videos?",
    answer:
      "The core program is taught through scheduled live online sessions. Students also use a private portal for class links, tasks, resources, progress, and mentor feedback.",
  },
  {
    question: "Does the course teach responsible AI use?",
    answer:
      "Yes. Privacy, misinformation, bias, attribution, copyright awareness, and appropriate use for schoolwork are addressed alongside practical building skills.",
  },
  {
    question: "What does a student create?",
    answer:
      "Outputs include study systems, creative media, presentations, AI-assisted app prototypes, agents, and automation workflows. The exact projects develop with the student's interests and level.",
  },
  {
    question: "How can a parent decide whether the course is a good fit?",
    answer:
      "Book a free demo. It is used to understand the student's interests, current experience, schedule, and learning goals before discussing the right path.",
  },
];

export default function ForParentsPage() {
  const siteUrl = getSiteUrl();

  return (
    <MarketingShell>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
          url: `${siteUrl}/for-parents`,
        }}
      />
      <PageHero
        eyebrow="A guide for families"
        title="Practical AI learning with structure, visibility, and responsible use"
        description="AI Builders Academy is designed to help students become thoughtful creators, not passive tool users. Families can see what is being learned, built, submitted, and improved."
        cta={{ label: "Book a free parent demo", href: "/book-a-free-demo" }}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            [UsersRound, "Live mentor guidance", "Students can ask questions, receive feedback, and work through difficult parts with a mentor."],
            [ShieldCheck, "Responsible practice", "Privacy, attribution, bias, misinformation, and appropriate school use are discussed directly."],
            [Eye, "Visible progress", "The portal organizes sessions, work, resources, feedback, attendance, and achievements."],
            [Target, "Concrete outcomes", "Each session connects learning to an output the student can demonstrate and explain."],
          ].map(([Icon, title, copy]) => {
            const ItemIcon = Icon as typeof UsersRound;
            return (
              <article key={String(title)} className="rounded-lg border border-border bg-bg-card p-5">
                <ItemIcon className="h-5 w-5 text-accent" />
                <h2 className="mt-4 font-heading text-lg font-bold">{String(title)}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{String(copy)}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <p className="font-mono text-xs uppercase text-accent">What the course is for</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold">Learning to think with AI, not hand thinking over to it</h2>
            <p className="mt-5 text-lg leading-8 text-text-secondary">
              The curriculum starts with clear problem definition, prompt design, verification, and reflection. Building comes after students can explain the goal and judge the result.
            </p>
            <Link href="/course-curriculum" className="mt-7 inline-flex items-center gap-2 font-bold text-accent">
              Review the full curriculum <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              ["Before building", "Define the audience, problem, constraints, and evidence of a useful result."],
              ["While building", "Test outputs, verify information, protect private data, and improve the workflow."],
              ["After building", "Present the work, explain decisions, reflect on limitations, and plan the next version."],
            ].map(([title, copy], index) => (
              <div key={title} className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr]">
                <span className="font-mono text-xl font-bold text-accent">0{index + 1}</span>
                <div>
                  <h3 className="font-heading text-lg font-bold">{title}</h3>
                  <p className="mt-1.5 leading-7 text-text-secondary">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-card/60">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
          <p className="font-mono text-xs uppercase text-accent">Parent questions</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-heading font-bold">
                  {faq.question}
                  <span className="text-accent transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-3xl leading-7 text-text-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="rounded-lg border border-accent/25 bg-accent/[0.08] p-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="flex gap-4">
            <MessageSquareText className="mt-1 h-6 w-6 shrink-0 text-accent" />
            <div>
              <h2 className="font-heading text-2xl font-bold">Start with a practical conversation</h2>
              <p className="mt-2 max-w-2xl text-text-secondary">
                A free demo is the right place to ask about fit, timing, interests, expectations, and how the learning portal works.
              </p>
            </div>
          </div>
          <Link href="/book-a-free-demo" className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-5 py-3 font-bold text-[#07110d] sm:mt-0">
            Book a free demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
