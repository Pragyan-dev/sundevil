"use client";

import { useMemo } from "react";

import {
  dashboardClassContext,
  formatDashboardYear,
  getContextTags,
  getFacultyRead,
  getFacultyVisibleTimeline,
  getSuggestedCheckInPrompts,
  getUsageText,
} from "@/lib/dashboard";

import { ConcernBadge } from "./ConcernBadge";
import { ContextTags } from "./ContextTags";
import { EmailComposer } from "./EmailComposer";
import { HandoffForm } from "./HandoffForm";
import { NoteLogger } from "./NoteLogger";
import { ResourceEngagementBar } from "./ResourceEngagementBar";
import { SharedTimeline } from "./SharedTimeline";
import { SimulationProgress } from "./SimulationProgress";
import { useDashboardDemoState } from "./DashboardDemoProvider";

export function FacultyStudentDetail({ studentId }: { studentId: string }) {
  const { data, getStudentById, logOutreach } = useDashboardDemoState();
  const student = getStudentById(studentId);
  const prompts = useMemo(() => (student ? getSuggestedCheckInPrompts(student) : []), [student]);

  if (!student) {
    return null;
  }

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[92rem] space-y-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(25rem,0.9fr)]">
          <div className="space-y-6">
            <section className="paper-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">What I see in my class</p>
                  <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                    {student.initials} · {dashboardClassContext.courseCode}
                  </h1>
                  <p className="mt-3 text-lg leading-8 text-[var(--ink)]/84">
                    {formatDashboardYear(student.year)} · {student.major}
                  </p>
                </div>
                <ConcernBadge level={student.concernLevel} />
              </div>
              <div className="mt-6">
                <ContextTags tags={getContextTags(student)} />
              </div>
            </section>

            <section className="paper-card">
              <p className="eyebrow">Course performance</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MetricCard label="Quiz 1">{student.coursePerformance.quizScores[0] ?? "—"}%</MetricCard>
                <MetricCard label="Quiz 2">{student.coursePerformance.quizScores[1] ?? "—"}%</MetricCard>
                <MetricCard label="HW avg">{student.coursePerformance.hwAverage}%</MetricCard>
                <MetricCard label="Attendance">
                  {student.coursePerformance.attendance.attended}/{student.coursePerformance.attendance.total}
                </MetricCard>
              </div>
            </section>

            <section className="paper-card">
              <p className="eyebrow">My observations</p>
              <div className="mt-5 space-y-3">
                {student.observations.map((observation) => (
                  <article
                    key={observation.id}
                    className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink)]/84"
                  >
                    • {observation.text}
                  </article>
                ))}
              </div>
            </section>

            <NoteLogger role="faculty" studentId={student.id} authorName={data.faculty.name} />

            <section className="paper-card">
              <p className="eyebrow">Simulation & resources</p>
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-5">
                  <SimulationProgress simulation={student.simulation} />
                </div>
                <div className="rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-5">
                  <p className="text-sm font-semibold text-[var(--asu-maroon)]">Resource engagement</p>
                  <div className="mt-4">
                    <ResourceEngagementBar usage={student.resourceUsage} />
                  </div>
                </div>
              </div>
            </section>

            <section className="paper-card">
              <p className="eyebrow">Self-check-in</p>
              <div className="mt-5 space-y-3">
                {student.checkIns.map((checkIn) => (
                  <article
                    key={`${checkIn.studentId}-${checkIn.week}-${checkIn.date}`}
                    className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink)]/84"
                  >
                    Week {checkIn.week}: {checkIn.mood} · blocker: {checkIn.blocker} · outreach:{" "}
                    {checkIn.wantsOutreach ? "yes" : "no"}
                  </article>
                ))}
              </div>
            </section>

            <SharedTimeline events={getFacultyVisibleTimeline(student)} />
          </div>

          <div className="space-y-6">
            <section className="paper-card">
              <p className="eyebrow">Recommended actions</p>
              <div className="mt-5 rounded-[1.45rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-5 text-sm leading-7 text-[var(--ink)]/84">
                {getFacultyRead(student)}
              </div>
              <div className="mt-5 space-y-3">
                {prompts.map((prompt) => (
                  <div
                    key={prompt}
                    className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] px-4 py-3 text-sm leading-7 text-[var(--ink)]/84"
                  >
                    • {prompt}
                  </div>
                ))}
              </div>
            </section>

            <EmailComposer
              role="faculty"
              student={student}
              senderName={data.faculty.name}
              campus={data.faculty.course.campus}
              contextLabel={`${data.faculty.course.code} ${data.faculty.course.name}`}
              onOutreachLogged={(summary) =>
                logOutreach({
                  studentId: student.id,
                  actorRole: "faculty",
                  actorId: data.faculty.id,
                  actorName: data.faculty.name,
                  summary,
                })
              }
            />

            <HandoffForm student={student} />

            <section className="paper-card">
              <p className="eyebrow">Current support status</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MetricCard label="Tutoring">{getUsageText(student.resourceUsage.tutoring)}</MetricCard>
                <MetricCard label="Office hours">{getUsageText(student.resourceUsage.officeHours)}</MetricCard>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{children}</p>
    </div>
  );
}
