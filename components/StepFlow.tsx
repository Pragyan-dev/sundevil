import Link from "next/link";

import type { Resource } from "@/lib/types";

interface StepFlowProps {
  resource: Resource;
}

export function StepFlow({ resource }: StepFlowProps) {
  return (
    <section className="page-shell pb-20">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="maroon-panel relative overflow-hidden">
          <p className="eyebrow text-[var(--asu-gold)]">How to sign up</p>
          <h1 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--warm-white)] sm:text-5xl">
            {resource.name}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
            {resource.signUpSummary}
          </p>

          <div className="mt-8 grid gap-4 text-sm text-[rgba(255,251,245,0.82)]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--asu-gold)]">Location</p>
              <p className="mt-2 leading-6">{resource.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--asu-gold)]">Hours</p>
              <p className="mt-2 leading-6">{resource.hours}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button-gold"
            >
              Open official ASU page
            </a>
            <Link href={resource.previewPath} className="button-ghost-light">
              Preview what it&apos;s like
            </Link>
          </div>
        </aside>

        <div className="paper-card">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-[rgba(140,29,64,0.1)] pb-6">
            <div>
              <p className="eyebrow">Step flow</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                What the process looks like
              </h2>
            </div>
            <span className="pill">{resource.flowSteps.length} steps</span>
          </div>

          <ol className="space-y-6">
            {resource.flowSteps.map((step, index) => (
              <li key={step.title} className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,198,39,0.5)] bg-[rgba(255,198,39,0.18)] font-semibold text-[var(--asu-maroon)]">
                  {index + 1}
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-5">
                  <h3 className="font-semibold text-[var(--asu-maroon)]">{step.title}</h3>
                  <p className="mt-2 leading-7 text-[var(--ink)]/85">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
