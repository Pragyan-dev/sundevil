"use client";

import Link from "next/link";

import { formatRelativeDate } from "@/lib/dashboard";
import type { AdvisorIncomingItem } from "@/lib/dashboard";

export function IncomingQueue({ items }: { items: AdvisorIncomingItem[] }) {
  return (
    <section className="paper-card">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Flagged students</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--asu-maroon)]">Async triage queue</h2>
        </div>
        <span className="pill">{items.length} active</span>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.55rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.8)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                  {item.sourceLabel}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--asu-maroon)]">
                  {item.studentInitials} · {item.studentName}
                </h3>
              </div>
              <span className="text-sm text-[var(--muted-ink)]">{formatRelativeDate(item.date)}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--ink)]/84">{item.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/dashboard/advisor/student/${item.studentId}`} className="button-primary">
                View Student
              </Link>
              {item.type === "check-in" ? (
                <Link
                  href={`/dashboard/advisor/student/${item.studentId}#email-composer`}
                  className="button-secondary"
                >
                  Reach Out
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
