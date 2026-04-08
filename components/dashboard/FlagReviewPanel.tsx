"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatRelativeDate, formatTimestamp, getOpenReviewFlags } from "@/lib/dashboard";
import type { DashboardStudent, SharedTimelineEvent } from "@/lib/types";

import { useDashboardDemoState } from "./DashboardDemoProvider";

type ResolveResponse =
  | {
      studentId: string;
      flagId: string;
      resolvedAt: string;
      resolvedById: string;
      resolvedByName: string;
      resolutionNote?: string;
      timelineEvent: SharedTimelineEvent;
    }
  | { error?: string };

export function FlagReviewPanel({ student }: { student: DashboardStudent }) {
  const { data, resolveFlag } = useDashboardDemoState();
  const reviewFlags = useMemo(
    () => getOpenReviewFlags(student).filter((flag) => flag.createdByRole === "faculty"),
    [student],
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResolve(flagId: string) {
    setError(null);
    setPendingId(flagId);

    try {
      const response = await fetch("/api/flag/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          flagId,
          resolvedById: data.advisor.id,
          resolvedByName: data.advisor.name,
          resolutionNote: drafts[flagId]?.trim() || undefined,
        }),
      });

      const result = (await response.json()) as ResolveResponse;
      if (!response.ok || !("flagId" in result) || !("timelineEvent" in result)) {
        throw new Error("error" in result && result.error ? result.error : "Could not resolve the flag.");
      }

      resolveFlag(result);
      setDrafts((current) => ({ ...current, [flagId]: "" }));
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Could not resolve the flag.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="paper-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Review flags</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">Flagged by faculty</h2>
        </div>
        <Link href={`/dashboard/messages?role=advisor&student=${student.id}`} className="text-sm text-[var(--asu-maroon)] underline-offset-4 hover:underline">
          Open shared thread
        </Link>
      </div>

      {reviewFlags.length ? (
        <div className="mt-5 space-y-4">
          {reviewFlags.map((flag) => (
            <article
              key={flag.id}
              className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--asu-maroon)]">
                  {flag.createdByName} · {formatRelativeDate(flag.createdAt)}
                </p>
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                  {formatTimestamp(flag.createdAt)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{flag.message}</p>
              <textarea
                className="field-shell mt-4 min-h-[7rem]"
                placeholder="Optional shared resolution note back to faculty..."
                value={drafts[flag.id] ?? ""}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [flag.id]: event.target.value,
                  }))
                }
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => handleResolve(flag.id)}
                  disabled={pendingId === flag.id}
                >
                  {pendingId === flag.id ? "Resolving..." : "Resolve flag"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-5 text-sm leading-7 text-[var(--muted-ink)]">
          No open faculty review flags right now. Resolved items stay visible in the shared timeline below.
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-[#8B1E1E]">{error}</p> : null}
    </section>
  );
}
