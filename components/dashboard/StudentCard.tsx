import Link from "next/link";

import {
  formatDashboardYear,
  getAdvisorStudentSummary,
  getContextTags,
  getFacultyStudentSummary,
} from "@/lib/dashboard";
import type { DashboardRole, DashboardStudent } from "@/lib/types";

import { ConcernBadge } from "./ConcernBadge";
import { ContextTags } from "./ContextTags";
import { SimulationProgress } from "./SimulationProgress";

interface StudentCardProps {
  student: DashboardStudent;
  role: DashboardRole;
}

export function StudentCard({ student, role }: StudentCardProps) {
  const tags = getContextTags(student);
  const detailHref =
    role === "faculty"
      ? `/dashboard/faculty/student/${student.id}`
      : `/dashboard/advisor/student/${student.id}`;
  const emailHref = `${detailHref}#email-composer`;
  const messageHref = `/dashboard/messages?role=${role}&student=${student.id}`;

  return (
    <article className="paper-card flex h-full flex-col gap-5 rounded-[1.9rem] border border-[rgba(140,29,64,0.1)] bg-[rgba(255,255,255,0.88)]">
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

      <ContextTags tags={tags} />

      {role === "faculty" ? (
        <FacultyCardBody student={student} />
      ) : (
        <AdvisorCardBody student={student} />
      )}

      <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.72)] p-5">
        <SimulationProgress simulation={student.simulation} compact />
      </div>

      <div className="mt-auto flex flex-wrap gap-3">
        <Link href={detailHref} className="button-primary">
          View
        </Link>
        <Link href={emailHref} className="button-secondary">
          Write Email
        </Link>
        {role === "faculty" ? (
          <Link href={`${detailHref}#handoff-form`} className="button-secondary">
            🤝 Handoff to Advisor
          </Link>
        ) : (
          <Link href={messageHref} className="button-secondary">
            Reply to Faculty
          </Link>
        )}
      </div>
    </article>
  );
}

function FacultyCardBody({ student }: { student: DashboardStudent }) {
  const summary = getFacultyStudentSummary(student);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-5">
        <p className="text-sm leading-7 text-[var(--ink)]/84">
          <span className="font-semibold text-[var(--asu-maroon)]">📉 {summary.performance}</span> · 🏫{" "}
          {summary.attendance}
        </p>
      </div>

      <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-5">
        <p className="text-sm font-semibold text-[var(--asu-maroon)]">{summary.advisor}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-ink)]">{summary.advisorTouch}</p>
      </div>
    </div>
  );
}

function AdvisorCardBody({ student }: { student: DashboardStudent }) {
  const summary = getAdvisorStudentSummary(student);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-5">
        <p className="text-sm font-semibold text-[var(--asu-maroon)]">
          Degree progress: {summary.degree} · {summary.onTrack}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{summary.courses}</p>
      </div>

      <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] p-5">
        <p className="text-sm leading-7 text-[var(--ink)]/84">
          <span className="font-semibold text-[var(--asu-maroon)]">Financial:</span> {summary.financial}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-ink)]">{summary.facultySignal}</p>
      </div>
    </div>
  );
}
