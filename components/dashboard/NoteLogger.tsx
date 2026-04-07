"use client";

import { useState } from "react";

import type { AdvisorNoteVisibility, DashboardRole } from "@/lib/types";

import { useDashboardDemoState } from "./DashboardDemoProvider";

interface NoteLoggerProps {
  role: DashboardRole;
  studentId: string;
  authorName: string;
}

export function NoteLogger({ role, studentId, authorName }: NoteLoggerProps) {
  const { addObservation, addAdvisorNote } = useDashboardDemoState();
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<AdvisorNoteVisibility>("shared-with-faculty");

  function handleSubmit() {
    const value = text.trim();
    if (!value) return;

    if (role === "faculty") {
      addObservation({ studentId, authorName, text: value });
    } else {
      addAdvisorNote({ studentId, authorName, text: value, visibility });
    }

    setText("");
  }

  return (
    <section className="paper-card">
      <p className="eyebrow">{role === "faculty" ? "Add observation" : "Log a note"}</p>
      <div className="mt-4 space-y-4">
        <textarea
          className="field-shell min-h-[9rem]"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={
            role === "faculty"
              ? "Shows up early, asks one question after class, seemed nervous in office hours..."
              : "Called student. Discussed financial coaching and DARS review..."
          }
        />
        {role === "advisor" ? (
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              Visibility
            </span>
            <select
              className="field-shell"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as AdvisorNoteVisibility)}
            >
              <option value="shared-with-faculty">Faculty can see</option>
              <option value="advisor-only">Advisor only</option>
            </select>
          </label>
        ) : null}
        <button type="button" className="button-primary" onClick={handleSubmit}>
          {role === "faculty" ? "Add observation" : "Save note"}
        </button>
      </div>
    </section>
  );
}
