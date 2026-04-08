"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { scholarshipFormOptions } from "@/lib/data";
import {
  ASU_SCHOLARSHIP_PORTAL_URL,
  createScholarshipCoachRecords,
  filterScholarshipCoachRecords,
  getDeadlineWarning,
  getScholarshipDashboard,
  initialScholarshipCoachFilterState,
  rankScholarshipCoachRecords,
  type AwardAmountFilter,
  type DeadlineWindowFilter,
  type EssayRequiredFilter,
  type ScholarshipApplicationStatus,
  type ScholarshipCoachFilterState,
  type ScholarshipTrackerEntry,
} from "@/lib/scholarship-coach-core";
import { defaultScholarshipSnippets, scholarshipCoachMetadata } from "@/lib/scholarship-coach-data";
import type {
  AidStatus,
  FirstGenStatus,
  GpaRange,
  MajorCategory,
  Scholarship,
  ResidencyStatus,
  StudentYear,
} from "@/lib/types";

const FILTER_STORAGE_KEY = "scholarship-coach-filters-v1";
const TRACKER_STORAGE_KEY = "scholarship-coach-tracker-v1";
const DRAFT_STORAGE_KEY = "scholarship-coach-drafts-v1";
const SNIPPET_STORAGE_KEY = "scholarship-coach-snippets-v1";

const deadlineFilterOptions: Array<{ label: string; value: DeadlineWindowFilter }> = [
  { label: "Any deadline", value: "" },
  { label: "Next 14 days", value: "next-14-days" },
  { label: "Next 30 days", value: "next-30-days" },
  { label: "Next 60 days", value: "next-60-days" },
];

const awardAmountOptions: Array<{ label: string; value: AwardAmountFilter }> = [
  { label: "Any award", value: "" },
  { label: "Under $2,000", value: "under-2000" },
  { label: "$2,000 - $4,999", value: "2000-4999" },
  { label: "$5,000+", value: "5000-plus" },
];

const essayRequirementOptions: Array<{ label: string; value: EssayRequiredFilter }> = [
  { label: "Essay or short answer: any", value: "" },
  { label: "Essay required", value: "yes" },
  { label: "No essay required", value: "no" },
];

const statusOptions: Array<{ label: string; value: ScholarshipApplicationStatus }> = [
  { label: "Not started", value: "not-started" },
  { label: "In progress", value: "in-progress" },
  { label: "Submitted", value: "submitted" },
  { label: "Won", value: "won" },
  { label: "Rejected", value: "rejected" },
];

type ScholarshipDraftMap = Record<
  string,
  {
    prompt: string;
    body: string;
    updatedAt: string;
  }
>;

type ScholarshipSnippet = {
  id: string;
  title: string;
  body: string;
};

interface ScholarshipCoachProps {
  scholarships: Scholarship[];
  variant?: "page" | "lab";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getSavedDraftCount(drafts: ScholarshipDraftMap) {
  return Object.values(drafts).filter((draft) => draft.body.trim().length > 0).length;
}

function getFilterLabel(options: ReadonlyArray<{ label: string; value: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function ScholarshipCoach({ scholarships, variant = "page" }: ScholarshipCoachProps) {
  const isLab = variant === "lab";
  const [filters, setFilters] = useState<ScholarshipCoachFilterState>({
    ...initialScholarshipCoachFilterState,
    year: "first-year",
    residency: "in-state",
    aidStatus: "fafsa-filed",
  });
  const [tracker, setTracker] = useState<Record<string, ScholarshipTrackerEntry>>({});
  const [drafts, setDrafts] = useState<ScholarshipDraftMap>({});
  const [snippets, setSnippets] = useState<ScholarshipSnippet[]>([...defaultScholarshipSnippets]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetBody, setSnippetBody] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const records = useMemo(
    () => createScholarshipCoachRecords(scholarships, scholarshipCoachMetadata),
    [scholarships],
  );
  const deferredFilters = useDeferredValue(filters);
  const filtered = useMemo(
    () => filterScholarshipCoachRecords(records, deferredFilters, new Date()),
    [deferredFilters, records],
  );
  const ranked = useMemo(
    () => rankScholarshipCoachRecords(filtered, deferredFilters, new Date()),
    [deferredFilters, filtered],
  );
  const dashboard = useMemo(() => getScholarshipDashboard(ranked, tracker, new Date()), [ranked, tracker]);
  const upcomingDeadlines = ranked.filter((item) => item.deadlineDays <= 30).slice(0, 4);
  const activeFilterLabels = [
    filters.year ? getFilterLabel(scholarshipFormOptions.years, filters.year) : null,
    filters.major ? getFilterLabel(scholarshipFormOptions.majors, filters.major) : null,
    filters.gpaRange ? getFilterLabel(scholarshipFormOptions.gpaRanges, filters.gpaRange) : null,
    filters.firstGen ? getFilterLabel(scholarshipFormOptions.firstGen, filters.firstGen) : null,
    filters.residency ? getFilterLabel(scholarshipFormOptions.residency, filters.residency) : null,
    filters.aidStatus ? getFilterLabel(scholarshipFormOptions.aidStatus, filters.aidStatus) : null,
    filters.deadlineWindow ? getFilterLabel(deadlineFilterOptions, filters.deadlineWindow) : null,
    filters.awardAmount ? getFilterLabel(awardAmountOptions, filters.awardAmount) : null,
    filters.essayRequired ? getFilterLabel(essayRequirementOptions, filters.essayRequired) : null,
  ].filter(Boolean) as string[];
  const recentDrafts = Object.entries(drafts)
    .filter(([, draft]) => draft.body.trim().length > 0)
    .sort((left, right) => new Date(right[1].updatedAt).getTime() - new Date(left[1].updatedAt).getTime())
    .slice(0, 3);

  useEffect(() => {
    setFilters(readStorage(FILTER_STORAGE_KEY, filters));
    setTracker(readStorage(TRACKER_STORAGE_KEY, {}));
    setDrafts(readStorage(DRAFT_STORAGE_KEY, {}));
    setSnippets(readStorage(SNIPPET_STORAGE_KEY, [...defaultScholarshipSnippets]));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(FILTER_STORAGE_KEY, filters);
  }, [filters, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(TRACKER_STORAGE_KEY, tracker);
  }, [hydrated, tracker]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(DRAFT_STORAGE_KEY, drafts);
  }, [drafts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(SNIPPET_STORAGE_KEY, snippets);
  }, [hydrated, snippets]);

  function updateFilter<K extends keyof ScholarshipCoachFilterState>(
    key: K,
    value: ScholarshipCoachFilterState[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function updateStatus(id: string, status: ScholarshipApplicationStatus) {
    setTracker((current) => ({
      ...current,
      [id]: {
        saved: current[id]?.saved ?? false,
        status,
        lastTouchedAt: new Date().toISOString(),
      },
    }));
  }

  function toggleSaved(id: string) {
    setTracker((current) => ({
      ...current,
      [id]: {
        status: current[id]?.status ?? "not-started",
        saved: !(current[id]?.saved ?? false),
        lastTouchedAt: new Date().toISOString(),
      },
    }));
  }

  function addSnippet() {
    if (!snippetTitle.trim() || !snippetBody.trim()) {
      return;
    }

    setSnippets((current) => [
      {
        id: `custom-${Date.now()}`,
        title: snippetTitle.trim(),
        body: snippetBody.trim(),
      },
      ...current,
    ]);
    setSnippetTitle("");
    setSnippetBody("");
  }

  if (!records.length) {
    return (
      <div className={isLab ? "grid gap-6" : "page-shell pb-24"}>
        <section className={`${isLab ? "" : "mx-auto max-w-5xl "}rounded-[2rem] border border-[rgba(140,29,64,0.15)] bg-[#fff8ef] p-8 shadow-[0_24px_70px_rgba(44,17,22,0.08)]`}>
          <p className="eyebrow">Error state</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
            The scholarship coach could not load ASU scholarship data.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink)]/80">
            The route is ready, but the curated ASU scholarship records were missing. Reload or check the local scholarship dataset.
          </p>
        </section>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className={isLab ? "grid gap-6" : "page-shell pb-24"}>
        <div className={isLab ? "grid gap-6" : "mx-auto grid max-w-7xl gap-6"}>
          <section className={isLab ? "paper-card paper-card-featured" : "maroon-panel"}>
            <p className="eyebrow text-[var(--asu-gold)]">Scholarship coach</p>
            <h1 className={`mt-4 font-[family-name:var(--font-display)] leading-tight ${isLab ? "text-4xl text-[var(--asu-maroon)]" : "text-5xl text-[var(--warm-white)]"}`}>
              Loading your scholarship workspace...
            </h1>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={isLab ? "grid gap-6" : "page-shell pb-24"}>
      <div className={isLab ? "grid gap-6" : "mx-auto grid max-w-7xl gap-6"}>
        <section className={isLab ? "paper-card paper-card-featured" : "maroon-panel"}>
          <p className={`eyebrow ${isLab ? "" : "text-[var(--asu-gold)]"}`}>Scholarship coach</p>
          <h1 className={`mt-4 max-w-5xl font-[family-name:var(--font-display)] leading-tight ${isLab ? "text-4xl text-[var(--asu-maroon)]" : "text-5xl text-[var(--warm-white)]"}`}>
            Find the ASU scholarships worth your time, rank them, and keep your application work in one place.
          </h1>
          <p className={`mt-5 max-w-3xl text-lg leading-8 ${isLab ? "text-[var(--ink)]/82" : "text-[rgba(255,251,245,0.82)]"}`}>
            This MVP keeps the experience simple: filter your fit, see priority scores, track status, and jump into reusable draft work without leaving the page.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="paper-card">
            <p className="eyebrow">Matched</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {dashboard.matchedCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              ASU scholarships fit the current filter profile.
            </p>
          </article>
          <article className="paper-card">
            <p className="eyebrow">Upcoming deadlines</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {dashboard.upcomingDeadlines}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              Due within the next 30 days.
            </p>
          </article>
          <article className="paper-card">
            <p className="eyebrow">Applications moving</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {dashboard.inProgressCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              Currently marked in progress or submitted.
            </p>
          </article>
          <article className="paper-card paper-card-featured">
            <p className="eyebrow">Possible award total</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {formatCurrency(dashboard.possibleAwardTotal)}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              Estimated from the filtered ASU scholarship set.
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <aside className="grid gap-6">
            <section className="paper-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Filters</p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                    Tighten your match profile
                  </h2>
                </div>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setFilters(initialScholarshipCoachFilterState)}
                >
                  Reset
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <label className="grid gap-2">
                  <span className="eyebrow">School year</span>
                  <select
                    className="field-shell"
                    value={filters.year}
                    onChange={(event) => updateFilter("year", event.target.value as StudentYear | "")}
                  >
                    <option value="">Any year</option>
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
                    value={filters.major}
                    onChange={(event) =>
                      updateFilter("major", event.target.value as Exclude<MajorCategory, "any"> | "")
                    }
                  >
                    <option value="">Any major area</option>
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
                    value={filters.gpaRange}
                    onChange={(event) => updateFilter("gpaRange", event.target.value as GpaRange | "")}
                  >
                    <option value="">Any GPA</option>
                    {scholarshipFormOptions.gpaRanges.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="eyebrow">First-gen</span>
                  <select
                    className="field-shell"
                    value={filters.firstGen}
                    onChange={(event) => updateFilter("firstGen", event.target.value as FirstGenStatus | "")}
                  >
                    <option value="">Any status</option>
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
                    value={filters.residency}
                    onChange={(event) => updateFilter("residency", event.target.value as ResidencyStatus | "")}
                  >
                    <option value="">Any residency</option>
                    {scholarshipFormOptions.residency.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="eyebrow">Financial aid</span>
                  <select
                    className="field-shell"
                    value={filters.aidStatus}
                    onChange={(event) => updateFilter("aidStatus", event.target.value as AidStatus | "")}
                  >
                    <option value="">Any aid status</option>
                    {scholarshipFormOptions.aidStatus.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="eyebrow">Deadline</span>
                  <select
                    className="field-shell"
                    value={filters.deadlineWindow}
                    onChange={(event) => updateFilter("deadlineWindow", event.target.value as DeadlineWindowFilter)}
                  >
                    {deadlineFilterOptions.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="eyebrow">Award amount</span>
                  <select
                    className="field-shell"
                    value={filters.awardAmount}
                    onChange={(event) => updateFilter("awardAmount", event.target.value as AwardAmountFilter)}
                  >
                    {awardAmountOptions.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="eyebrow">Essay required</span>
                  <select
                    className="field-shell"
                    value={filters.essayRequired}
                    onChange={(event) => updateFilter("essayRequired", event.target.value as EssayRequiredFilter)}
                  >
                    {essayRequirementOptions.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {activeFilterLabels.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeFilterLabels.map((label) => (
                    <span key={label} className="pill">
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="paper-card">
              <p className="eyebrow">Deadline radar</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                What needs attention first
              </h2>
              {upcomingDeadlines.length ? (
                <div className="mt-5 space-y-3">
                  {upcomingDeadlines.map(({ scholarship, deadlineDays }) => (
                    <div key={scholarship.id} className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--asu-maroon)]">{scholarship.name}</p>
                          <p className="mt-1 text-sm text-[var(--ink)]/76">
                            Due {formatDate(scholarship.meta.deadlineIso)}
                          </p>
                        </div>
                        <span className="pill">{deadlineDays}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-base leading-7 text-[var(--ink)]/80">
                  No deadlines inside the current window. Widen the deadline filter if you want a broader list.
                </p>
              )}
            </section>

            <section className="paper-card">
              <p className="eyebrow">Reusable snippets</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                Save lines you want to reuse
              </h2>
              <div className="mt-5 space-y-3">
                {snippets.map((snippet) => (
                  <div key={snippet.id} className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                    <p className="font-semibold text-[var(--asu-maroon)]">{snippet.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink)]/80">{snippet.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                <input
                  className="field-shell"
                  value={snippetTitle}
                  onChange={(event) => setSnippetTitle(event.target.value)}
                  placeholder="Snippet title"
                />
                <textarea
                  className="field-shell min-h-28"
                  value={snippetBody}
                  onChange={(event) => setSnippetBody(event.target.value)}
                  placeholder="Snippet text you want to reuse later"
                />
                <button type="button" className="button-primary" onClick={addSnippet}>
                  Save reusable snippet
                </button>
              </div>
            </section>
          </aside>

          <section className="grid gap-6">
            <article className="paper-card">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Ranked list</p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                    Scholarships ranked by usefulness
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={ASU_SCHOLARSHIP_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="button-secondary">
                    Open ASU scholarship portal
                  </a>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--ink)]/80">
                Priority score blends fit, value, and deadline urgency. Chance and effort help students decide what is realistic this week.
              </p>
            </article>

            {ranked.length ? (
              ranked.map((item, index) => {
                const trackerEntry = tracker[item.scholarship.id];

                return (
                  <article
                    key={item.scholarship.id}
                    className={`paper-card ${index === 0 ? "paper-card-featured" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">Priority #{index + 1}</p>
                        <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                          {item.scholarship.name}
                        </h3>
                        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--ink)]/82">
                          {item.scholarship.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="pill">Priority {item.priorityScore}</span>
                        <span className="pill">Chance {item.estimatedChance}%</span>
                        <span className="pill">Effort {item.effortLabel}</span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                          <p className="eyebrow">Award</p>
                          <p className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--asu-maroon)]">
                            {item.scholarship.amount}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                          <p className="eyebrow">Deadline</p>
                          <p className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--asu-maroon)]">
                            {formatDate(item.scholarship.meta.deadlineIso)}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                          <p className="eyebrow">Reminder</p>
                          <p className="mt-3 text-sm leading-6 text-[var(--ink)]/82">
                            {getDeadlineWarning(item.deadlineDays)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                        <p className="eyebrow">Why this matches</p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink)]/82">
                          {item.whyMatches.map((reason) => (
                            <div key={reason}>• {reason}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <select
                        aria-label={`Application status for ${item.scholarship.name}`}
                        className="field-shell min-w-44"
                        value={trackerEntry?.status ?? "not-started"}
                        onChange={(event) =>
                          updateStatus(item.scholarship.id, event.target.value as ScholarshipApplicationStatus)
                        }
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className={trackerEntry?.saved ? "button-primary" : "button-secondary"}
                        onClick={() => toggleSaved(item.scholarship.id)}
                      >
                        {trackerEntry?.saved ? "Saved to tracker" : "Save to tracker"}
                      </button>

                      <Link href={`/scholarships/${item.scholarship.id}`} className="button-primary">
                        Open detail workspace
                      </Link>

                      <a
                        href={item.scholarship.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-secondary"
                      >
                        Open ASU posting
                      </a>
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="paper-card paper-card-featured">
                <p className="eyebrow">Empty state</p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                  No scholarships matched this filter set.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--ink)]/80">
                  Try widening the deadline or award filter first. Those tend to over-prune the list fastest.
                </p>
              </article>
            )}

            <article className="paper-card">
              <p className="eyebrow">Saved writing work</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                Drafts you can jump back into
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--ink)]/80">
                {getSavedDraftCount(drafts)} saved draft{getSavedDraftCount(drafts) === 1 ? "" : "s"} across your scholarship detail workspaces.
              </p>

              {recentDrafts.length ? (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {recentDrafts.map(([scholarshipId, draft]) => (
                    <Link
                      key={scholarshipId}
                      href={`/scholarships/${scholarshipId}`}
                      className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4 transition hover:-translate-y-0.5"
                    >
                      <p className="font-semibold text-[var(--asu-maroon)]">
                        {ranked.find((item) => item.scholarship.id === scholarshipId)?.scholarship.name ?? "Scholarship draft"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink)]/80">
                        {draft.body.slice(0, 150)}
                        {draft.body.length > 150 ? "..." : ""}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                        Updated {formatDate(draft.updatedAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-base leading-7 text-[var(--ink)]/80">
                  No saved drafts yet. Open any detail workspace and start writing to build your application notes.
                </p>
              )}
            </article>
          </section>
        </section>
      </div>
    </div>
  );
}
