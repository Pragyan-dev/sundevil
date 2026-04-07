"use client";

import { useMemo, useState } from "react";

import { getAdvisorAlerts, getAdvisorIncomingItems, sortDashboardStudents } from "@/lib/dashboard";

import { AdvisorAlerts } from "./AdvisorAlerts";
import { AdvisorHeader } from "./AdvisorHeader";
import { IncomingQueue } from "./IncomingQueue";
import { StudentCard } from "./StudentCard";
import { useDashboardDemoState } from "./DashboardDemoProvider";

type AdvisorFilter = "all" | "high" | "first-gen" | "holds";
type AdvisorSort = "last-contact" | "concern" | "name";

export function AdvisorOverviewClient() {
  const { data } = useDashboardDemoState();
  const [filter, setFilter] = useState<AdvisorFilter>("all");
  const [sortBy, setSortBy] = useState<AdvisorSort>("last-contact");

  const students = data.students;
  const incoming = getAdvisorIncomingItems(students);
  const alerts = getAdvisorAlerts(students);

  const visibleStudents = useMemo(() => {
    let next = [...students];

    if (filter === "high") {
      next = next.filter((student) => student.concernLevel === "high");
    }

    if (filter === "first-gen") {
      next = next.filter((student) => student.isFirstGen);
    }

    if (filter === "holds") {
      next = next.filter((student) => student.degree.holds.length > 0);
    }

    return sortDashboardStudents(next, sortBy);
  }, [filter, sortBy, students]);

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[92rem] space-y-8">
        <AdvisorHeader
          name={`${data.advisor.name} · ${data.advisor.department}`}
          subtitle={`${data.advisor.totalStudents} students · ${data.advisor.campus} campus`}
        />

        <IncomingQueue items={incoming} />
        <AdvisorAlerts alerts={alerts} />

        <section className="paper-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">All students</p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--asu-maroon)]">
                Assigned caseload
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Sort</span>
                <select
                  className="field-shell min-w-[12rem]"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as AdvisorSort)}
                >
                  <option value="last-contact">Last contact</option>
                  <option value="concern">Concern</option>
                  <option value="name">Name</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">Filter</span>
                <select
                  className="field-shell min-w-[12rem]"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as AdvisorFilter)}
                >
                  <option value="all">All</option>
                  <option value="high">High need</option>
                  <option value="first-gen">First-gen</option>
                  <option value="holds">Enrollment holds</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {visibleStudents.map((student) => (
              <StudentCard key={student.id} student={student} role="advisor" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
