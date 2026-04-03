"use client";

import Link from "next/link";
import { useState } from "react";

import type { SimulationScenario } from "@/lib/types";

interface SimulationStepProps {
  scenario: SimulationScenario;
}

export function SimulationStep({ scenario }: SimulationStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = scenario.steps[currentIndex];
  const progress = ((currentIndex + 1) / scenario.steps.length) * 100;

  return (
    <div className="page-shell pb-20">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="paper-card">
          <p className="eyebrow">Simulation</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--asu-maroon)]">
            {scenario.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--ink)]/82">{scenario.summary}</p>

          <div className="mt-8 space-y-3">
            {scenario.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`flex w-full items-start gap-3 rounded-[1.4rem] border px-4 py-4 text-left transition ${
                  currentIndex === index
                    ? "border-[rgba(140,29,64,0.28)] bg-[rgba(140,29,64,0.08)]"
                    : "border-[rgba(140,29,64,0.08)] bg-white/60 hover:border-[rgba(140,29,64,0.18)]"
                }`}
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--asu-gold)]/25 text-sm text-[var(--asu-maroon)]">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-semibold text-[var(--asu-maroon)]">{step.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--muted-ink)]">
                    {step.description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulate" className="button-secondary">
              Back to hub
            </Link>
            <Link href="/finder" className="button-secondary">
              Find matching support
            </Link>
          </div>
        </aside>

        <section className="maroon-panel overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--asu-gold)]">
              Step {currentIndex + 1} of {scenario.steps.length}
            </p>
            <span className="rounded-full border border-[rgba(255,198,39,0.35)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--warm-white)]/80">
              linear walkthrough
            </span>
          </div>

          <div className="progress-shell mt-4">
            <span className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-8 rounded-[2rem] border border-[rgba(255,198,39,0.2)] bg-[rgba(255,255,255,0.06)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="text-7xl">{currentStep.icon}</div>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--warm-white)]">
              {currentStep.title}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
              {currentStep.description}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              className="button-ghost-light disabled:cursor-not-allowed disabled:opacity-45"
            >
              Previous
            </button>
            {currentIndex === scenario.steps.length - 1 ? (
              <button type="button" onClick={() => setCurrentIndex(0)} className="button-gold">
                Start over
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((index) => Math.min(scenario.steps.length - 1, index + 1))
                }
                className="button-gold"
              >
                Next
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
