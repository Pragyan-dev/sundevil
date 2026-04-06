import {
  formatDashboardCampus,
  formatDashboardYear,
  formatSignalDate,
  getContextTags,
} from "@/lib/dashboard";
import type { DashboardStudent } from "@/lib/types";

import { ConcernBadge } from "./ConcernBadge";
import { ContextTags } from "./ContextTags";
import { FacultyNotes } from "./FacultyNotes";
import { ResourceEngagementBar } from "./ResourceEngagementBar";
import { SimulationProgress } from "./SimulationProgress";

interface StudentProfileProps {
  student: DashboardStudent;
}

export function StudentProfile({ student }: StudentProfileProps) {
  return (
    <div className="space-y-6">
      <section className="paper-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Student profile</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
              {student.initials} · {student.pronouns}
            </h1>
            <p className="mt-3 text-lg leading-8 text-[var(--ink)]/84">
              {formatDashboardYear(student.year)} · {student.major} · {formatDashboardCampus(student.campus)} Campus
            </p>
          </div>
          <ConcernBadge level={student.concernLevel} />
        </div>

        <div className="mt-6">
          <ContextTags tags={getContextTags(student)} />
        </div>
      </section>

      <section className="paper-card">
        <p className="eyebrow">Strengths</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
          Things faculty can name out loud
        </h2>
        <ul className="mt-5 space-y-3">
          {student.strengths.map((strength) => (
            <li
              key={strength}
              className="rounded-[1.3rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.74)] px-4 py-3 text-[var(--ink)]/84"
            >
              • {strength}
            </li>
          ))}
        </ul>
      </section>

      <section className="paper-card">
        <p className="eyebrow">Signals this week</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">Recent behavior timeline</h2>
        <div className="mt-5 space-y-4">
          {student.signals.map((signal) => (
            <article
              key={`${signal.date}-${signal.description}`}
              className="rounded-[1.4rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`pill ${
                    signal.type === "positive"
                      ? "text-[#2E7D32]"
                      : signal.type === "concern"
                        ? "text-[#8B1E1E]"
                        : "text-[var(--muted-ink)]"
                  }`}
                >
                  {signal.type}
                </span>
                <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                  {formatSignalDate(signal.date)}
                </span>
              </div>
              <p className="mt-3 leading-7 text-[var(--ink)]/84">{signal.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="paper-card">
        <p className="eyebrow">Resource engagement</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">
          What has actually happened so far
        </h2>
        <div className="mt-5">
          <ResourceEngagementBar usage={student.resourceUsage} />
        </div>
      </section>

      <section className="paper-card">
        <p className="eyebrow">Simulation progress</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--asu-maroon)]">First-week story map</h2>
        <div className="mt-5">
          <SimulationProgress simulation={student.simulation} />
        </div>
      </section>

      <FacultyNotes studentName={student.firstName} />
    </div>
  );
}
