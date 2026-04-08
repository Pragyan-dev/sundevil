"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { dashboardClassContext } from "@/lib/dashboard";
import type { DashboardFlag, DashboardFlagKind, DashboardStudent, SharedTimelineEvent } from "@/lib/types";

import { useDashboardDemoState } from "./DashboardDemoProvider";

type FlagResponse =
  | {
      studentId: string;
      flag: DashboardFlag;
      timelineEvent: SharedTimelineEvent;
    }
  | { error?: string };

function getDefaultMessage(student: DashboardStudent, kind: DashboardFlagKind) {
  if (kind === "review") {
    return `${student.initials} could use advisor review around ${student.supportFocus.toLowerCase()}`;
  }

  return `${student.initials} context for advising: ${student.supportFocus}`;
}

export function FlagForm({ student }: { student: DashboardStudent }) {
  const { data, applyFlagResult } = useDashboardDemoState();
  const [kind, setKind] = useState<DashboardFlagKind>("review");
  const [message, setMessage] = useState(() => getDefaultMessage(student, "review"));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const actionLabel = useMemo(
    () => (kind === "review" ? "Flag for Advisor Review" : "Leave Advisor Note"),
    [kind],
  );

  useEffect(() => {
    setMessage(getDefaultMessage(student, kind));
  }, [kind, student]);

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Add a short note before saving this flag.");
      return;
    }

    setError(null);
    setFeedback(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          kind,
          createdByRole: "faculty",
          createdById: data.faculty.id,
          createdByName: data.faculty.name,
          message: trimmed,
        }),
      });

      const result = (await response.json()) as FlagResponse;

      if (!response.ok || !("flag" in result) || !("timelineEvent" in result)) {
        throw new Error("error" in result && result.error ? result.error : "Could not save the flag.");
      }

      applyFlagResult(result);
      setFeedback(
        kind === "review"
          ? "Student flagged for advisor review."
          : "Advisor note attached to the student profile.",
      );
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not save the flag.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section id="flag-form" className="paper-card scroll-mt-28">
      <p className="eyebrow">Advisor-facing flag</p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
        Attach async context for {student.advisorName}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
        Use a review flag when you want advising to triage the student later. Use an advisor note when you just want to add context without creating queue work.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={`pill ${kind === "review" ? "bg-[var(--asu-maroon)] text-white" : ""}`}
          onClick={() => setKind("review")}
        >
          Flag for Advisor Review
        </button>
        <button
          type="button"
          className={`pill ${kind === "advisor-note" ? "bg-[var(--asu-maroon)] text-white" : ""}`}
          onClick={() => setKind("advisor-note")}
        >
          Leave Advisor Note
        </button>
      </div>

      <textarea
        className="field-shell mt-5 min-h-[10rem]"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="button-primary" onClick={handleSend} disabled={isPending}>
          {isPending ? "Saving..." : actionLabel}
        </button>
        <Link href={`/dashboard/messages?role=faculty&student=${student.id}`} className="text-sm text-[var(--asu-maroon)] underline-offset-4 hover:underline">
          Open shared thread
        </Link>
      </div>

      {feedback ? <p className="mt-4 text-sm text-[#2E7D32]">{feedback}</p> : null}
      {error ? <p className="mt-4 text-sm text-[#8B1E1E]">{error}</p> : null}
      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
        Sender: {dashboardClassContext.professorName}
      </p>
    </section>
  );
}
