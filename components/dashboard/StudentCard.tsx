import Link from "next/link";

import {
  formatDashboardYear,
  formatSignalDate,
  getContextTags,
  getLatestSignal,
  getResourceSummarySentence,
} from "@/lib/dashboard";
import type { DashboardStudent } from "@/lib/types";

import { ConcernBadge } from "./ConcernBadge";
import { ContextTags } from "./ContextTags";
import { SimulationProgress } from "./SimulationProgress";

interface StudentCardProps {
  student: DashboardStudent;
}

export function StudentCard({ student }: StudentCardProps) {
  const latestSignal = getLatestSignal(student);

  return (
    <article className="paper-card flex h-full flex-col gap-5 rounded-[1.8rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.84)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted-ink)]">
            {student.initials} · {student.pronouns}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
            {formatDashboardYear(student.year)} · {student.major}
          </h3>
        </div>
        <ConcernBadge level={student.concernLevel} compact />
      </div>

      <ContextTags tags={getContextTags(student)} />

      <div className="rounded-[1.5rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-5">
        <p className="text-sm font-semibold text-[var(--asu-maroon)]">Resource snapshot</p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]/84">
          {getResourceSummarySentence(student)}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-5">
        <p className="text-sm font-semibold text-[var(--asu-maroon)]">Last signal</p>
        {latestSignal ? (
          <>
            <p className="mt-3 text-base leading-7 text-[var(--ink)]/84">{latestSignal.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">
              {formatSignalDate(latestSignal.date)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">No recent signals logged.</p>
        )}
      </div>

      <SimulationProgress simulation={student.simulation} compact />

      <div className="mt-auto flex flex-wrap gap-3">
        <Link href={`/dashboard/student/${student.id}`} className="button-primary">
          View Full Profile
        </Link>
        <Link href={`/dashboard/student/${student.id}#email-composer`} className="button-secondary">
          Write Email
        </Link>
        <Link href={`/dashboard/student/${student.id}#faculty-notes`} className="button-secondary">
          Log Check-in
        </Link>
      </div>
    </article>
  );
}
