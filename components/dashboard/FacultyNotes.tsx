"use client";

import { useState } from "react";

interface FacultyNotesProps {
  studentName: string;
}

export function FacultyNotes({ studentName }: FacultyNotesProps) {
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  function addNote() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setNotes((current) => [trimmed, ...current]);
    setDraft("");
  }

  return (
    <div id="faculty-notes" className="rounded-[1.8rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.82)] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Faculty notes</p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
            Session-only notes for {studentName}
          </h3>
        </div>
        <span className="pill">Demo-only</span>
      </div>

      <div className="mt-5 grid gap-3">
        <textarea
          className="field-shell min-h-28 resize-y"
          placeholder="Add a quick check-in note, hallway observation, or follow-up reminder."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <button type="button" className="button-primary" onClick={addNote}>
            Add note
          </button>
          <span className="text-sm text-[var(--muted-ink)]">
            These notes stay only in this browser session.
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <div
              key={note}
              className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-4 text-sm leading-7 text-[var(--ink)]/84"
            >
              {note}
            </div>
          ))
        ) : (
          <p className="text-sm leading-7 text-[var(--muted-ink)]">
            No notes added in this session yet.
          </p>
        )}
      </div>
    </div>
  );
}
