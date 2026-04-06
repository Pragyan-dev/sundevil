"use client";

import { useState } from "react";

import { ResourceCard } from "@/components/ResourceCard";
import { finderLogic, getFinderMatches } from "@/lib/data";
import type { FinderConcern, ResourceExperience, StudentYear } from "@/lib/types";

export default function FinderPage() {
  const [concern, setConcern] = useState<FinderConcern | null>(null);
  const [year, setYear] = useState<StudentYear | null>(null);
  const [experience, setExperience] = useState<ResourceExperience | null>(null);

  const matches =
    concern && year && experience ? getFinderMatches(concern, year, experience) : [];
  const walkthroughQuery =
    concern && year && experience
      ? new URLSearchParams({ concern, year, experience }).toString()
      : "";

  return (
    <div className="page-shell pb-24">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="maroon-panel">
            <p className="eyebrow text-[var(--asu-gold)]">One-tap resource finder</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
              Start with what feels hard.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
              Pick the closest answer in each row. The site maps your combination to a short list
              of campus resources and the next click to make.
            </p>
          </div>

          <div className="paper-card grid gap-8">
            <div>
              <p className="eyebrow">Q1</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--asu-maroon)]">
                What are you dealing with?
              </h2>
              <div className="choice-grid mt-4 sm:grid-cols-2">
                {finderLogic.questions.concerns.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-active={concern === option.value}
                    onClick={() => setConcern(option.value)}
                    className="choice-pill"
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="choice-meta">Choose the closest fit.</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow">Q2</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--asu-maroon)]">What year are you?</h2>
              <div className="choice-grid mt-4 sm:grid-cols-2">
                {finderLogic.questions.years.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-active={year === option.value}
                    onClick={() => setYear(option.value)}
                    className="choice-pill"
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="choice-meta">This helps narrow the first best stop.</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow">Q3</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--asu-maroon)]">
                Have you used campus resources before?
              </h2>
              <div className="choice-grid mt-4 sm:grid-cols-3">
                {finderLogic.questions.experience.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-active={experience === option.value}
                    onClick={() => setExperience(option.value)}
                    className="choice-pill"
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="choice-meta">No wrong answer here.</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {matches.length ? (
            <div>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Recommended next stops</p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                    3-4 places that fit what you picked
                  </h2>
                </div>
                <span className="pill">{matches.length} matches</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {matches.map((resource) => (
                  <ResourceCard
                    key={resource.slug}
                    eyebrow={resource.category}
                    title={resource.name}
                    description={resource.description}
                    detail={resource.signUpSummary}
                    meta={[resource.location, resource.hours]}
                    links={[
                      {
                        href: `/finder/walkthrough/${resource.slug}?${walkthroughQuery}`,
                        label: "Walk me through it",
                      },
                      {
                        href: resource.previewPath,
                        label:
                          resource.previewPath === "/scholarships"
                            ? "Preview scholarship matches"
                            : "Preview what it's like",
                      },
                      { href: resource.url, label: "Official ASU page", external: true },
                    ]}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="paper-card mt-8">
              <p className="eyebrow">Waiting on selections</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                Pick all three and the shortlist appears here.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--ink)]/82">
                The finder never sends anything to a server. It is just a local lookup against the
                campus resources in this project.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
