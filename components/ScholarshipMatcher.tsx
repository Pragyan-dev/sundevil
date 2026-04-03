"use client";

import { useState } from "react";

import { ResourceCard } from "@/components/ResourceCard";
import { scholarshipFormOptions, scholarships } from "@/lib/data";
import type {
  AidStatus,
  FirstGenStatus,
  GpaRange,
  MajorCategory,
  ResidencyStatus,
  Scholarship,
  StudentYear,
} from "@/lib/types";

type ScholarshipFormState = {
  year: StudentYear | "";
  major: Exclude<MajorCategory, "any"> | "";
  gpaRange: GpaRange | "";
  firstGen: FirstGenStatus | "";
  residency: ResidencyStatus | "";
  aidStatus: AidStatus | "";
};

interface ScholarshipMatcherProps {
  variant?: "page" | "overlay";
}

const initialFormState: ScholarshipFormState = {
  year: "",
  major: "",
  gpaRange: "",
  firstGen: "",
  residency: "",
  aidStatus: "",
};

function matchesScholarship(scholarship: Scholarship, form: ScholarshipFormState) {
  if (form.year && !scholarship.eligibility.years.includes(form.year)) return false;
  if (
    form.major &&
    !(
      scholarship.eligibility.majors.includes("any") ||
      scholarship.eligibility.majors.includes(form.major)
    )
  ) {
    return false;
  }
  if (
    form.gpaRange &&
    !scholarship.eligibility.gpaRanges.includes(form.gpaRange as Exclude<GpaRange, "under-2.5">)
  ) {
    return false;
  }
  if (form.firstGen && !scholarship.eligibility.firstGen.includes(form.firstGen)) return false;
  if (form.residency && !scholarship.eligibility.residency.includes(form.residency)) return false;
  if (form.aidStatus && !scholarship.eligibility.aidStatus.includes(form.aidStatus)) return false;
  return true;
}

export function ScholarshipMatcher({ variant = "page" }: ScholarshipMatcherProps) {
  const [form, setForm] = useState<ScholarshipFormState>(initialFormState);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const results = scholarships.filter((scholarship) => matchesScholarship(scholarship, form));
  const isOverlay = variant === "overlay";

  function updateField<K extends keyof ScholarshipFormState>(key: K, value: ScholarshipFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className={isOverlay ? "space-y-5" : "space-y-8"}>
      <form
        className={`grid gap-4 ${isOverlay ? "md:grid-cols-2" : "sm:grid-cols-2"}`}
        onSubmit={(event) => {
          event.preventDefault();
          setHasSubmitted(true);
        }}
      >
        <label className="grid gap-2">
          <span className="eyebrow">Year</span>
          <select
            className="field-shell"
            value={form.year}
            onChange={(event) => updateField("year", event.target.value as StudentYear | "")}
          >
            <option value="">Select year</option>
            {scholarshipFormOptions.years.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="eyebrow">Major</span>
          <select
            className="field-shell"
            value={form.major}
            onChange={(event) =>
              updateField("major", event.target.value as Exclude<MajorCategory, "any"> | "")
            }
          >
            <option value="">Select major area</option>
            {scholarshipFormOptions.majors.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="eyebrow">GPA range</span>
          <select
            className="field-shell"
            value={form.gpaRange}
            onChange={(event) => updateField("gpaRange", event.target.value as GpaRange | "")}
          >
            <option value="">Select GPA range</option>
            {scholarshipFormOptions.gpaRanges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="eyebrow">First-gen status</span>
          <select
            className="field-shell"
            value={form.firstGen}
            onChange={(event) => updateField("firstGen", event.target.value as FirstGenStatus | "")}
          >
            <option value="">Select status</option>
            {scholarshipFormOptions.firstGen.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="eyebrow">Residency</span>
          <select
            className="field-shell"
            value={form.residency}
            onChange={(event) => updateField("residency", event.target.value as ResidencyStatus | "")}
          >
            <option value="">Select residency</option>
            {scholarshipFormOptions.residency.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="eyebrow">Financial aid status</span>
          <select
            className="field-shell"
            value={form.aidStatus}
            onChange={(event) => updateField("aidStatus", event.target.value as AidStatus | "")}
          >
            <option value="">Select aid status</option>
            {scholarshipFormOptions.aidStatus.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button type="submit" className="button-primary">
            Find matches
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setForm(initialFormState);
              setHasSubmitted(false);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {!hasSubmitted ? (
        <div
          className={
            isOverlay
              ? "rounded-[1.5rem] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] p-5 text-[rgba(255,251,245,0.85)]"
              : "paper-card"
          }
        >
          <p className="eyebrow">Ready when you are</p>
          <h2
            className={`mt-3 font-[family-name:var(--font-display)] ${
              isOverlay ? "text-2xl text-[var(--warm-white)]" : "text-3xl text-[var(--asu-maroon)]"
            }`}
          >
            Submit the form to see filtered scholarship cards.
          </h2>
        </div>
      ) : results.length ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Filtered matches</p>
              <h2
                className={`mt-3 font-[family-name:var(--font-display)] ${
                  isOverlay ? "text-2xl text-[var(--warm-white)]" : "text-4xl text-[var(--asu-maroon)]"
                }`}
              >
                Scholarships that fit this profile
              </h2>
            </div>
            <span className="pill">{results.length} matches</span>
          </div>

          <div className={`grid gap-4 ${isOverlay ? "lg:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
            {results.map((scholarship) =>
              isOverlay ? (
                <article
                  key={scholarship.id}
                  className="rounded-[1.4rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] p-5 text-[rgba(255,251,245,0.9)]"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--asu-gold)]">
                    {scholarship.amount}
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--warm-white)]">
                    {scholarship.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[rgba(255,251,245,0.82)]">
                    {scholarship.description}
                  </p>
                  <p className="mt-4 text-sm text-[rgba(255,251,245,0.72)]">
                    Deadline: {scholarship.deadlineLabel}
                  </p>
                  <a
                    href={scholarship.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-gold mt-5"
                  >
                    Open application link
                  </a>
                </article>
              ) : (
                <ResourceCard
                  key={scholarship.id}
                  eyebrow={scholarship.amount}
                  title={scholarship.name}
                  description={scholarship.description}
                  detail={scholarship.deadlineLabel}
                  meta={["Deadline: " + scholarship.deadlineLabel]}
                  links={[
                    {
                      href: scholarship.applicationUrl,
                      label: "Open application link",
                      external: true,
                    },
                  ]}
                />
              ),
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            isOverlay
              ? "rounded-[1.5rem] border border-[rgba(255,198,39,0.25)] bg-[rgba(255,198,39,0.12)] p-5 text-[var(--warm-white)]"
              : "paper-card paper-card-featured"
          }
        >
          <p className="eyebrow">No exact matches</p>
          <h2
            className={`mt-3 font-[family-name:var(--font-display)] ${
              isOverlay ? "text-2xl text-[var(--warm-white)]" : "text-3xl text-[var(--asu-maroon)]"
            }`}
          >
            This filter set came back empty.
          </h2>
          <p
            className={`mt-4 max-w-2xl text-lg leading-8 ${
              isOverlay ? "text-[rgba(255,251,245,0.84)]" : "text-[var(--ink)]/82"
            }`}
          >
            Try widening the GPA or residency filters, then compare against ASU&apos;s broader
            scholarship pages for more options.
          </p>
          <div className="mt-6">
            <a
              href="https://students.asu.edu/scholarships"
              target="_blank"
              rel="noopener noreferrer"
              className={isOverlay ? "button-gold" : "button-primary"}
            >
              Open broader ASU scholarship search
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
