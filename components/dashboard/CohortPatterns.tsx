"use client";

import Link from "next/link";

import type { CohortPattern } from "@/lib/types";

interface CohortPatternsProps {
  patterns: CohortPattern[];
  activePatternId: string | null;
  onSelectPattern: (patternId: string | null) => void;
}

const severityClasses: Record<CohortPattern["severity"], string> = {
  high: "border-[#C62828]/18 bg-[#C62828]/8",
  medium: "border-[#F57F17]/18 bg-[#F57F17]/8",
  low: "border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)]",
};

export function CohortPatterns({
  patterns,
  activePatternId,
  onSelectPattern,
}: CohortPatternsProps) {
  return (
    <section className="paper-card">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Class patterns</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
            Where the cohort is telling the same story
          </h2>
        </div>
        {activePatternId ? (
          <button type="button" className="button-secondary" onClick={() => onSelectPattern(null)}>
            Clear pattern filter
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {patterns.map((pattern) => {
          const active = activePatternId === pattern.id;

          return (
            <article
              key={pattern.id}
              className={`rounded-[1.7rem] border p-5 transition ${
                severityClasses[pattern.severity]
              } ${active ? "shadow-[0_18px_36px_rgba(140,29,64,0.12)]" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {pattern.icon}
                  </span>
                  <p className="max-w-xl text-base leading-7 text-[var(--ink)]/84">{pattern.text}</p>
                </div>
                <span className="pill">{pattern.studentIds.length}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={active ? "button-primary" : "button-secondary"}
                  onClick={() => onSelectPattern(active ? null : pattern.id)}
                >
                  {active ? "Showing this group" : "Filter these students"}
                </button>
                <Link href={`/dashboard/batch?pattern=${pattern.id}`} className="button-secondary">
                  Batch outreach
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
