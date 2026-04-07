"use client";

import { useMemo, useState } from "react";

import { computeCohortPatterns, getDashboardCounts, getFacultySignals, sortDashboardStudents } from "@/lib/dashboard";

import { FacultyCourseHeader } from "./FacultyCourseHeader";
import { FacultySignals } from "./FacultySignals";
import { StudentCard } from "./StudentCard";
import { useDashboardDemoState } from "./DashboardDemoProvider";

type FacultyFilter = "all" | "high" | "watch" | "steady";
type FacultySort = "concern" | "name" | "simulation";

export function FacultyOverviewClient() {
  const { data } = useDashboardDemoState();
  const [filter, setFilter] = useState<FacultyFilter>("all");
  const [sortBy, setSortBy] = useState<FacultySort>("concern");
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  const students = data.students;
  const counts = getDashboardCounts(students);
  const signals = getFacultySignals(students);
  const patterns = computeCohortPatterns(students);

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
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[92rem] space-y-8">
        <FacultyCourseHeader
          title={`${data.faculty.course.code} · ${data.faculty.course.name} · ${data.faculty.course.semester}`}
          subtitle={`${data.faculty.name} · ${data.faculty.course.totalStudents} students`}
          counts={counts}
        />
        <FacultySignals signals={signals} />

        <section className="paper-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Students</p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--asu-maroon)]">
                Course view
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Sort</span>
                <select
                  className="field-shell min-w-[12rem]"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as FacultySort)}
                >
                  <option value="concern">Concern</option>
                  <option value="simulation">Simulation</option>
                  <option value="name">Name</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Filter</span>
                <select
                  className="field-shell min-w-[12rem]"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as FacultyFilter)}
                >
                  <option value="all">All</option>
                  <option value="high">Needs outreach</option>
                  <option value="watch">Watch list</option>
                  <option value="steady">On track</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActivePatternId(null)}
              className={`pill ${activePatternId === null ? "bg-[var(--asu-maroon)] text-white" : ""}`}
            >
              All students
            </button>
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                onClick={() => setActivePatternId(pattern.id)}
                className={`pill ${activePatternId === pattern.id ? "bg-[var(--asu-maroon)] text-white" : ""}`}
              >
                {pattern.icon} {pattern.text}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {visibleStudents.map((student) => (
              <StudentCard key={student.id} student={student} role="faculty" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
