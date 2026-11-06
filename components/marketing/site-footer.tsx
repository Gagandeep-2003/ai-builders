import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

const groups = [
  {
    title: "Explore",
    links: [
      ["Course curriculum", "/course-curriculum"],
      ["Student projects", "/student-projects"],
      ["For parents", "/for-parents"],
    ],
  },
  {
    title: "Academy",
    links: [
      ["About", "/about"],
      ["Book a free demo", "/book-a-free-demo"],
      ["Student login", "/login"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-bg-card/65">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-7 md:grid-cols-[1fr_auto_auto] lg:px-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="font-heading font-bold">AI Builders Academy</p>
              <p className="font-mono text-[0.65rem] uppercase text-text-muted">Live AI learning for students</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            A mentor-led online AI course where students learn responsible AI use, build real apps, and create useful automations.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title} className="min-w-40">
            <p className="font-mono text-xs uppercase text-text-muted">{group.title}</p>
            <div className="mt-3 grid gap-2">
              {group.links.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm text-text-secondary transition hover:text-accent">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-5 py-5 text-center text-xs text-text-muted">
        AI Builders Academy. Practical AI literacy, creation, and automation for students.
      </div>
    </footer>
  );
}
