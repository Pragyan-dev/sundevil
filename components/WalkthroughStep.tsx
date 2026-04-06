import Link from "next/link";

import type { WalkthroughStep as WalkthroughStepData } from "@/lib/types";

interface WalkthroughStepProps {
  step: WalkthroughStepData;
  index: number;
  showReassurance: boolean;
}

export function WalkthroughStep({ step, index, showReassurance }: WalkthroughStepProps) {
  const action = step.ctaLabel ? (
    step.ctaExternal ? (
      <a
        href={step.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="button-secondary"
      >
        {step.ctaLabel}
      </a>
    ) : (
      <Link href={step.ctaHref ?? "#"} className="button-secondary">
        {step.ctaLabel}
      </Link>
    )
  ) : null;

  return (
    <article className="paper-card grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
      <div className="rounded-[1.7rem] border border-[rgba(140,29,64,0.08)] bg-[linear-gradient(180deg,rgba(255,198,39,0.12),rgba(255,255,255,0.92))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{step.visual?.eyebrow ?? `Step ${index + 1}`}</p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--asu-maroon)]">
              {step.visual?.title ?? step.title}
            </h3>
          </div>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-[rgba(140,29,64,0.14)] bg-white/72 text-3xl">
            {step.visual?.icon ?? "✨"}
          </span>
        </div>
        {step.visual?.caption ? (
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted-ink)]">
            {step.visual.caption}
          </p>
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,198,39,0.5)] bg-[rgba(255,198,39,0.18)] font-semibold text-[var(--asu-maroon)]">
            {index + 1}
          </span>
          <div>
            <p className="eyebrow">Step {index + 1}</p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--asu-maroon)]">{step.title}</h3>
          </div>
        </div>

        <p className="text-base leading-8 text-[var(--ink)]/86">{step.description}</p>

        <ul className="space-y-3">
          {step.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 rounded-[1.2rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.72)] p-4"
            >
              <span className="mt-[0.12rem] text-[var(--asu-maroon)]">•</span>
              <span className="leading-7 text-[var(--ink)]/84">{bullet}</span>
            </li>
          ))}
        </ul>

        {showReassurance && step.reassurance ? (
          <div className="rounded-[1.35rem] border border-[rgba(255,198,39,0.35)] bg-[rgba(255,198,39,0.12)] p-4">
            <p className="eyebrow text-[var(--asu-maroon)]">If this is your first time</p>
            <p className="mt-2 leading-7 text-[var(--ink)]/84">{step.reassurance}</p>
          </div>
        ) : null}

        {action}
      </div>
    </article>
  );
}
