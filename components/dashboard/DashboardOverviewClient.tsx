"use client";

import { useMemo, useState } from "react";

import {
  sortDashboardStudents,
} from "@/lib/dashboard";
import type { CohortPattern, DashboardStudent } from "@/lib/types";

import { CohortPatterns } from "./CohortPatterns";
import { StudentCard } from "./StudentCard";

type DashboardSort = "concern" | "name" | "simulation";
type DashboardFilter = "all" | "high" | "watch" | "steady";

interface DashboardOverviewClientProps {
  students: DashboardStudent[];
  patterns: CohortPattern[];
  counts: {
    needsOutreach: number;
    watchClosely: number;
    onTrack: number;
    emailsSent: number;
  };
}

const statCards = [
  {
    key: "needsOutreach",
    label: "Need Outreach",
    icon: "🔴",
    accent: "border-[#C62828]/18 bg-[#C62828]/8 text-[#8B1E1E]",
  },
  {
    key: "watchClosely",
    label: "Watch Closely",
    icon: "🟡",
    accent: "border-[#F57F17]/18 bg-[#F57F17]/8 text-[#8A4B00]",
  },
  {
    key: "onTrack",
    label: "On Track",
    icon: "🟢",
    accent: "border-[#2E7D32]/18 bg-[#2E7D32]/8 text-[#1E5A24]",
  },
  {
    key: "emailsSent",
    label: "Emails Sent",
    icon: "📧",
    accent: "border-[rgba(140,29,64,0.14)] bg-[rgba(140,29,64,0.05)] text-[var(--asu-maroon)]",
  },
] as const;

export function DashboardOverviewClient({
  students,
  patterns,
  counts,
}: DashboardOverviewClientProps) {
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const [sortBy, setSortBy] = useState<DashboardSort>("concern");
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  const visibleStudents = useMemo(() => {
    let next = [...students];

    if (filter !== "all") {
      next = next.filter((student) => student.concernLevel === filter);
    }

    if (activePatternId) {
      const pattern = patterns.find((item) => item.id === activePatternId);
      if (pattern) {
        const ids = new Set(pattern.studentIds);
        next = next.filter((student) => ids.has(student.id));
      }
    }

    return sortDashboardStudents(next, sortBy);
  }, [activePatternId, filter, patterns, sortBy, students]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.key}
            className={`paper-card rounded-[1.8rem] border ${card.accent} flex min-h-[10rem] flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-2xl" aria-hidden="true">
                {card.icon}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-current/70">Class snapshot</span>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-5xl leading-none">
                {counts[card.key]}
              </p>
              <p className="mt-3 text-base font-semibold">{card.label}</p>
            </div>
          </article>
        ))}
      </section>

      <CohortPatterns
        patterns={patterns}
        activePatternId={activePatternId}
        onSelectPattern={setActivePatternId}
      />

      <section className="paper-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Students</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--asu-maroon)]">
              Scan the class before you drill down
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Filter</span>
              <select
                className="field-shell min-w-[12rem]"
                value={filter}
                onChange={(event) => setFilter(event.target.value as DashboardFilter)}
              >
                <option value="all">All students</option>
                <option value="high">Needs outreach</option>
                <option value="watch">Watch closely</option>
                <option value="steady">On track</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Sort</span>
              <select
                className="field-shell min-w-[12rem]"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as DashboardSort)}
              >
                <option value="concern">Concern level</option>
                <option value="simulation">Simulation progress</option>
                <option value="name">Student initials</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(140,29,64,0.03)] px-4 py-3 text-sm text-[var(--muted-ink)]">
          <span>
            Showing <strong className="text-[var(--asu-maroon)]">{visibleStudents.length}</strong> of{" "}
            <strong className="text-[var(--asu-maroon)]">{students.length}</strong> students.
          </span>
          {activePatternId ? (
            <span>Pattern filter is active. The grid is narrowed to the matching cohort.</span>
          ) : (
            <span>The overview keeps critical signals visible; details sit one click deeper.</span>
          )}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {visibleStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </section>
    </div>
  );
}
