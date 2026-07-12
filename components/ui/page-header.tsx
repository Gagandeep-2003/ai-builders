import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs uppercase text-accent">AI Builders Academy</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-text-secondary">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
