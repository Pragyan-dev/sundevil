"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { scholarshipFormOptions } from "@/lib/data";
import {
  ASU_SCHOLARSHIP_PORTAL_URL,
  createScholarshipCoachRecords,
  getDeadlineWarning,
  initialScholarshipCoachFilterState,
  rankScholarshipCoachRecords,
  type ScholarshipApplicationStatus,
  type ScholarshipTrackerEntry,
} from "@/lib/scholarship-coach-core";
import { defaultScholarshipSnippets, scholarshipCoachMetadata } from "@/lib/scholarship-coach-data";
import type { Scholarship } from "@/lib/types";

const FILTER_STORAGE_KEY = "scholarship-coach-filters-v1";
const TRACKER_STORAGE_KEY = "scholarship-coach-tracker-v1";
const DRAFT_STORAGE_KEY = "scholarship-coach-drafts-v1";
const SNIPPET_STORAGE_KEY = "scholarship-coach-snippets-v1";

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

interface ScholarshipDetailClientProps {
  scholarshipId: string;
  scholarships: Scholarship[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getLabel(options: ReadonlyArray<{ label: string; value: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
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

export function ScholarshipDetailClient({
  scholarshipId,
  scholarships,
}: ScholarshipDetailClientProps) {
  const records = useMemo(
    () => createScholarshipCoachRecords(scholarships, scholarshipCoachMetadata),
    [scholarships],
  );
  const [filters] = useState(() => readStorage(FILTER_STORAGE_KEY, initialScholarshipCoachFilterState));
  const [tracker, setTracker] = useState<Record<string, ScholarshipTrackerEntry>>(() =>
    readStorage(TRACKER_STORAGE_KEY, {}),
  );
  const [drafts, setDrafts] = useState<ScholarshipDraftMap>(() => readStorage(DRAFT_STORAGE_KEY, {}));
  const [snippets] = useState<ScholarshipSnippet[]>(() =>
    readStorage(SNIPPET_STORAGE_KEY, [...defaultScholarshipSnippets]),
  );
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const ranked = useMemo(() => rankScholarshipCoachRecords(records, filters, new Date()), [filters, records]);
  const current = ranked.find((item) => item.scholarship.id === scholarshipId) ?? null;
  const trackerEntry = tracker[scholarshipId];
  const savedDraft = drafts[scholarshipId];
  const draftPrompt = savedDraft?.prompt ?? current?.scholarship.meta.essayPrompts[0] ?? "Essay prompt";
  const draftBody = savedDraft?.body ?? "";

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(tracker));
  }, [hydrated, tracker]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts, hydrated]);

  function updateStatus(status: ScholarshipApplicationStatus) {
    setTracker((currentTracker) => ({
      ...currentTracker,
      [scholarshipId]: {
        saved: currentTracker[scholarshipId]?.saved ?? false,
        status,
        lastTouchedAt: new Date().toISOString(),
      },
    }));
  }

  function toggleSaved() {
    setTracker((currentTracker) => ({
      ...currentTracker,
      [scholarshipId]: {
        status: currentTracker[scholarshipId]?.status ?? "not-started",
        saved: !(currentTracker[scholarshipId]?.saved ?? false),
        lastTouchedAt: new Date().toISOString(),
      },
    }));
  }

  function saveDraft(nextBody: string, nextPrompt = draftPrompt) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [scholarshipId]: {
        prompt: nextPrompt,
        body: nextBody,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function insertSnippet(text: string) {
    const next = draftBody.trim() ? `${draftBody.trim()}\n\n${text}` : text;
    saveDraft(next);
  }

  if (!current) {
    return (
      <div className="page-shell pb-24">
        <section className="mx-auto max-w-5xl rounded-[2rem] border border-[rgba(140,29,64,0.15)] bg-[#fff8ef] p-8 shadow-[0_24px_70px_rgba(44,17,22,0.08)]">
          <p className="eyebrow">Error state</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
            That scholarship detail page could not be found.
          </h1>
          <Link href="/scholarships" className="button-primary mt-6">
            Back to scholarship coach
          </Link>
        </section>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="page-shell pb-24">
        <section className="maroon-panel mx-auto max-w-7xl">
          <p className="eyebrow text-[var(--asu-gold)]">Scholarship detail</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
            Loading scholarship workspace...
          </h1>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell pb-24">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="maroon-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-[var(--asu-gold)]">Scholarship detail</p>
              <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-5xl leading-tight text-[var(--warm-white)]">
                {current.scholarship.name}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[rgba(255,251,245,0.82)]">
                {current.scholarship.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/scholarships" className="button-ghost-light">
                Back to list
              </Link>
              <a
                href={current.scholarship.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-gold"
              >
                Open ASU posting
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="paper-card">
            <p className="eyebrow">Priority score</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {current.priorityScore}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              Weighted by fit, value, and deadline urgency.
            </p>
          </article>
          <article className="paper-card">
            <p className="eyebrow">Chance estimate</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {current.estimatedChance}%
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              A simple estimate based on fit and effort.
            </p>
          </article>
          <article className="paper-card">
            <p className="eyebrow">Effort needed</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {current.effortLabel}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              About {current.scholarship.meta.estimatedEffortHours} hour{current.scholarship.meta.estimatedEffortHours === 1 ? "" : "s"} to prepare.
            </p>
          </article>
          <article className="paper-card paper-card-featured">
            <p className="eyebrow">Deadline</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {formatDate(current.scholarship.meta.deadlineIso)}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-ink)]">
              {getDeadlineWarning(current.deadlineDays)}
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <aside className="grid gap-6">
            <article className="paper-card">
              <p className="eyebrow">Eligibility snapshot</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                What this scholarship is looking for
              </h2>
              <div className="mt-5 grid gap-3 text-sm leading-6 text-[var(--ink)]/82">
                <div><strong className="text-[var(--asu-maroon)]">Year:</strong> {current.scholarship.eligibility.years.map((value) => getLabel(scholarshipFormOptions.years, value)).join(", ")}</div>
                <div><strong className="text-[var(--asu-maroon)]">Major:</strong> {current.scholarship.eligibility.majors.map((value) => value === "any" ? "Open to all majors" : getLabel(scholarshipFormOptions.majors, value)).join(", ")}</div>
                <div><strong className="text-[var(--asu-maroon)]">GPA:</strong> {current.scholarship.eligibility.gpaRanges.map((value) => getLabel(scholarshipFormOptions.gpaRanges, value)).join(", ")}</div>
                <div><strong className="text-[var(--asu-maroon)]">Residency:</strong> {current.scholarship.eligibility.residency.map((value) => getLabel(scholarshipFormOptions.residency, value)).join(", ")}</div>
                <div><strong className="text-[var(--asu-maroon)]">FAFSA:</strong> {current.scholarship.eligibility.aidStatus.map((value) => getLabel(scholarshipFormOptions.aidStatus, value)).join(", ")}</div>
                <div><strong className="text-[var(--asu-maroon)]">Essay required:</strong> {current.scholarship.meta.essayRequired ? "Yes" : "No"}</div>
              </div>
            </article>

            <article className="paper-card">
              <p className="eyebrow">Why this matches you</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                Fit explanation
              </h2>
              <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink)]/82">
                {current.whyMatches.map((reason) => (
                  <div key={reason} className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                    {reason}
                  </div>
                ))}
              </div>
            </article>

            <article className="paper-card">
              <p className="eyebrow">Requirements</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                What you need to prep
              </h2>
              <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink)]/82">
                {current.scholarship.meta.requirements.map((requirement) => (
                  <div key={requirement} className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4">
                    {requirement}
                  </div>
                ))}
              </div>
            </article>
          </aside>

          <section className="grid gap-6">
            <article className="paper-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Application tracker</p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                    Save your place and keep moving
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={toggleSaved}
                  className={trackerEntry?.saved ? "button-primary" : "button-secondary"}
                >
                  {trackerEntry?.saved ? "Saved to tracker" : "Save to tracker"}
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
                <label className="grid gap-2">
                  <span className="eyebrow">Application status</span>
                  <select
                    className="field-shell"
                    value={trackerEntry?.status ?? "not-started"}
                    onChange={(event) => updateStatus(event.target.value as ScholarshipApplicationStatus)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-[#fffaf4] p-4 text-sm leading-6 text-[var(--ink)]/82">
                  <strong className="text-[var(--asu-maroon)]">Reminder:</strong> {current.scholarship.meta.reminderLabel}
                  {trackerEntry?.lastTouchedAt ? (
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted-ink)]">
                      Last updated {formatDate(trackerEntry.lastTouchedAt)}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="paper-card paper-card-featured">
              <p className="eyebrow">Essay and answer workspace</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                Draft once, reuse what works
              </h2>

              <label className="mt-5 grid gap-2">
                <span className="eyebrow">Current prompt</span>
                <textarea
                  className="field-shell min-h-24"
                  value={draftPrompt}
                  onChange={(event) => {
                    saveDraft(draftBody, event.target.value);
                  }}
                />
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                {snippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    type="button"
                    className="button-secondary"
                    onClick={() => insertSnippet(snippet.body)}
                  >
                    Insert {snippet.title}
                  </button>
                ))}
              </div>

              <label className="mt-5 grid gap-2">
                <span className="eyebrow">Saved draft</span>
                <textarea
                  className="field-shell min-h-72"
                  value={draftBody}
                  onChange={(event) => {
                    saveDraft(event.target.value);
                  }}
                  placeholder="Start drafting here. Your work saves automatically."
                />
              </label>

              <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-white p-4 text-sm leading-6 text-[var(--ink)]/82">
                  <p className="eyebrow">Draft status</p>
                  <p className="mt-3">
                    {savedDraft?.body?.trim().length
                      ? `Saved ${formatDate(savedDraft.updatedAt)}`
                      : "No saved answer yet."}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[rgba(140,29,64,0.12)] bg-white p-4 text-sm leading-6 text-[var(--ink)]/82">
                  <p className="eyebrow">Why this workspace matters</p>
                  <p className="mt-3">
                    Keep the answers you are proud of here, then copy the strongest language into future ASU scholarship forms instead of starting from scratch every time.
                  </p>
                </div>
              </div>
            </article>

            <article className="paper-card">
              <p className="eyebrow">Portal link</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
                Open the official ASU posting when you are ready
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={ASU_SCHOLARSHIP_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="button-secondary">
                  Open ASU scholarships
                </a>
                <a
                  href={current.scholarship.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  Open this scholarship
                </a>
              </div>
            </article>
          </section>
        </section>
      </div>
    </div>
  );
}
