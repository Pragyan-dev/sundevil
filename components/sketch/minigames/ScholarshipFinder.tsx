"use client";

import { useMemo, useState } from "react";

import { scholarshipFormOptions } from "@/lib/data";
import {
  filterScholarships,
  getScholarshipValueTotal,
  initialScholarshipFilterState,
  type ScholarshipFilterState,
} from "@/lib/scholarships";
import type {
  FirstGenStatus,
  GpaRange,
  ResidencyStatus,
  StudentYear,
} from "@/lib/types";
import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

export default function ScholarshipFinder({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [form, setForm] = useState<ScholarshipFilterState>({
    ...initialScholarshipFilterState,
    year: "first-year",
    gpaRange: "3.0-3.49",
    residency: "in-state",
    firstGen: "no",
  });
  const [confirmed, setConfirmed] = useState(false);

  const matches = useMemo(() => filterScholarships(form), [form]);
  const firstGenMatches = useMemo(
    () => filterScholarships({ ...form, firstGen: "yes" }),
    [form],
  );
  const extraFirstGenCount = Math.max(0, firstGenMatches.length - matches.length);
  const valueTotal = getScholarshipValueTotal(matches);

  function updateField<K extends keyof ScholarshipFilterState>(key: K, value: ScholarshipFilterState[K]) {
    onInteract?.();
    setConfirmed(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleConfirm() {
    onInteract?.();
    setConfirmed(true);
    sound.correct();
  }

  return (
    <MiniGameShell
      title="SCHOLARSHIP FINDER"
      instructions="Adjust the profile and watch real scholarship matches update live."
      icon="🏆"
      completed={confirmed}
      onComplete={onComplete}
    >
      <div className="sketch-scholarship-grid">
        <div className="sketch-scholarship-controls">
          <label className="sketch-mini-field">
            <span>Year</span>
            <select
              value={form.year}
              onChange={(event) => updateField("year", event.target.value as StudentYear | "")}
            >
              {scholarshipFormOptions.years.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sketch-mini-field">
            <span>GPA range</span>
            <select
              value={form.gpaRange}
              onChange={(event) => updateField("gpaRange", event.target.value as GpaRange | "")}
            >
              {scholarshipFormOptions.gpaRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sketch-mini-field">
            <span>Residency</span>
            <select
              value={form.residency}
              onChange={(event) => updateField("residency", event.target.value as ResidencyStatus | "")}
            >
              {scholarshipFormOptions.residency.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="sketch-toggle-group">
            <span>First-gen</span>
            <div>
              {(["yes", "no"] as FirstGenStatus[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`sketch-toggle-pill ${form.firstGen === option ? "is-active" : ""}`}
                  onClick={() => updateField("firstGen", option)}
                >
                  {option === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="sketch-action-button sketch-action-button-gold" onClick={handleConfirm}>
            Lock this profile
          </button>
        </div>

        <div className="sketch-scholarship-results">
          <div className="sketch-results-card">
            <strong>
              You qualify for {matches.length} scholarships worth up to $
              {valueTotal.toLocaleString()}.
            </strong>
            <p>
              {extraFirstGenCount > 0
                ? `Checking “first-gen: yes” unlocks ${extraFirstGenCount} extra scholarship matches.`
                : "Keep adjusting the profile to see how one detail changes the list."}
            </p>
          </div>

          <div className="sketch-scholarship-card-grid">
            {matches.slice(0, 4).map((scholarship) => (
              <article key={scholarship.id} className="sketch-scholarship-card">
                <p className="sketch-mini-eyebrow">{scholarship.amount}</p>
                <strong>{scholarship.name}</strong>
                <p>{scholarship.description}</p>
                <span>Deadline: {scholarship.deadlineLabel}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </MiniGameShell>
  );
}

