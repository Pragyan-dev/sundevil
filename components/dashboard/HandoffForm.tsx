"use client";

import Link from "next/link";
import { useState } from "react";

import { dashboardClassContext } from "@/lib/dashboard";
import type { DashboardMessage, DashboardStudent, HandoffRecord, SharedTimelineEvent } from "@/lib/types";

import { useDashboardDemoState } from "./DashboardDemoProvider";

export function HandoffForm({ student }: { student: DashboardStudent }) {
  const { data, applyHandoffResult } = useDashboardDemoState();
  const [message, setMessage] = useState(
    `${student.initials} mentioned ${student.supportFocus.toLowerCase()} Might be worth a concrete advising follow-up.`,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSend() {
    setError(null);
    setFeedback(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/handoff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          fromRole: "faculty",
          fromId: data.faculty.id,
          fromName: data.faculty.name,
          toId: student.advisorId,
          message,
        }),
      });

      const result = (await response.json()) as
        | {
            studentId: string;
            handoff: HandoffRecord;
            threadMessage: DashboardMessage;
            timelineEvent: SharedTimelineEvent;
          }
        | { error?: string };

      if (!response.ok || !("handoff" in result) || !("threadMessage" in result) || !("timelineEvent" in result)) {
        throw new Error("error" in result && result.error ? result.error : "Could not send the handoff.");
      }

      applyHandoffResult(result);
      setFeedback("Handoff sent to advising and added to the shared thread.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send the handoff.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section id="handoff-form" className="paper-card scroll-mt-28">
      <p className="eyebrow">Warm handoff to advisor</p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
        Send context to {student.advisorName}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">
        This goes into the shared student thread so advising sees the classroom signal in context.
      </p>
      <textarea
        className="field-shell mt-5 min-h-[10rem]"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="button-primary" onClick={handleSend} disabled={isPending}>
          {isPending ? "Sending..." : "Send to Advisor"}
        </button>
        <Link href={`/dashboard/messages?role=faculty&student=${student.id}`} className="button-secondary">
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
