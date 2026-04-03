"use client";

import { useEffect, useState } from "react";

const roster = [
  { student: "Student A.", week: "Week 4", resources: "None logged", status: "Flagged" },
  { student: "Student B.", week: "Week 4", resources: "Tutoring, Advising", status: "Engaged" },
  { student: "Student C.", week: "Week 3", resources: "Counseling", status: "Monitoring" },
  { student: "Student D.", week: "Week 4", resources: "None logged", status: "Flagged" },
  { student: "Student E.", week: "Week 5", resources: "Financial Aid", status: "Engaged" },
];

export default function DashboardPage() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShowToast(false), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [showToast]);

  return (
    <div className="page-shell pb-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.18fr_0.82fr]">
        <section className="paper-card overflow-hidden">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(140,29,64,0.1)] pb-6">
            <div>
              <p className="eyebrow">Static mock</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                CSE 110, Fall 2026
              </h1>
            </div>
            <span className="pill">Professor dashboard</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                  <th className="px-4 py-2">Student Name</th>
                  <th className="px-4 py-2">Week</th>
                  <th className="px-4 py-2">Resources Used</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((row) => {
                  const flagged = row.status === "Flagged";
                  return (
                    <tr
                      key={`${row.student}-${row.week}`}
                      className={`rounded-[1.4rem] ${
                        flagged ? "bg-[rgba(255,198,39,0.18)]" : "bg-[rgba(255,255,255,0.78)]"
                      }`}
                    >
                      <td className="rounded-l-[1.4rem] px-4 py-4 font-semibold text-[var(--asu-maroon)]">
                        {row.student}
                      </td>
                      <td className="px-4 py-4 text-[var(--ink)]/82">{row.week}</td>
                      <td className="px-4 py-4 text-[var(--ink)]/82">{row.resources}</td>
                      <td className="px-4 py-4 text-[var(--ink)]/82">
                        {flagged ? "No resource engagement by week 4" : row.status}
                      </td>
                      <td className="rounded-r-[1.4rem] px-4 py-4">
                        {flagged ? (
                          <button
                            type="button"
                            onClick={() => setShowToast(true)}
                            className="button-primary"
                          >
                            Send Nudge
                          </button>
                        ) : (
                          <span className="pill">No action needed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="maroon-panel">
          <p className="eyebrow text-[var(--asu-gold)]">Example nudge</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--warm-white)]">
            Personalized, low-pressure outreach
          </h2>
          <div className="mt-6 rounded-[1.7rem] border border-[rgba(255,198,39,0.2)] bg-[rgba(255,255,255,0.07)] p-6 text-[rgba(255,251,245,0.84)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            Hi! 73% of students in CSE 110 use tutoring. Here&apos;s what a session looks like →
            /simulate/tutoring. No pressure.
          </div>
        </aside>
      </div>

      {showToast ? (
        <div className="toast paper-card">
          <p className="eyebrow">Nudge sent</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
            Student will receive a personalized resource recommendation.
          </p>
        </div>
      ) : null}
    </div>
  );
}
