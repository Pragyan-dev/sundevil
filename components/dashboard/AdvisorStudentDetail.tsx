"use client";

import { formatDashboardCampus, formatDashboardYear, getAdvisorVisibleTimeline, getContextTags } from "@/lib/dashboard";

import { ContextTags } from "./ContextTags";
import { DegreeProgress } from "./DegreeProgress";
import { EmailComposer } from "./EmailComposer";
import { FinancialSnapshot } from "./FinancialSnapshot";
import { FlagReviewPanel } from "./FlagReviewPanel";
import { NoteLogger } from "./NoteLogger";
import { RecommendationEngine } from "./RecommendationEngine";
import { ResourceEngagementBar } from "./ResourceEngagementBar";
import { SharedTimeline } from "./SharedTimeline";
import { SimulationProgress } from "./SimulationProgress";
import { AllCoursesView } from "./AllCoursesView";
import { useDashboardDemoState } from "./DashboardDemoProvider";

export function AdvisorStudentDetail({ studentId }: { studentId: string }) {
  const { data, getStudentById, logOutreach } = useDashboardDemoState();
  const student = getStudentById(studentId);

  if (!student) {
    return null;
  }

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[92rem] space-y-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(25rem,0.9fr)]">
          <div className="space-y-6">
            <section className="paper-card">
              <p className="eyebrow">The whole student</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                {student.initials} · {student.pronouns}
              </h1>
              <p className="mt-3 text-lg leading-8 text-[var(--ink)]/84">
                {formatDashboardYear(student.year)} · {student.major} · {formatDashboardCampus(student.campus)}
              </p>
              <div className="mt-6">
                <ContextTags tags={getContextTags(student)} />
              </div>
            </section>

            <DegreeProgress student={student} />
            <AllCoursesView student={student} />
            <FinancialSnapshot student={student} />

            <section className="paper-card">
              <p className="eyebrow">Resource engagement</p>
              <div className="mt-5">
                <ResourceEngagementBar usage={student.resourceUsage} />
              </div>
            </section>

            <section className="paper-card">
              <p className="eyebrow">Simulation</p>
              <div className="mt-5">
                <SimulationProgress simulation={student.simulation} />
              </div>
            </section>

            <section className="paper-card">
              <p className="eyebrow">Self-check-ins</p>
              <div className="mt-5 space-y-3">
                {student.checkIns.map((checkIn) => (
                  <article
                    key={`${checkIn.studentId}-${checkIn.week}-${checkIn.date}`}
                    className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink)]/84"
                  >
                    Week {checkIn.week}: {checkIn.mood} · {checkIn.blocker} · outreach{" "}
                    {checkIn.wantsOutreach ? "requested" : "not requested"}
                  </article>
                ))}
              </div>
            </section>

            <SharedTimeline events={getAdvisorVisibleTimeline(student)} />
          </div>

          <div className="space-y-6">
            <RecommendationEngine student={student} />

            <EmailComposer
              role="advisor"
              student={student}
              senderName={data.advisor.name}
              campus={data.advisor.campus}
              contextLabel={data.advisor.department}
              onOutreachLogged={(summary) =>
                logOutreach({
                  studentId: student.id,
                  actorRole: "advisor",
                  actorId: data.advisor.id,
                  actorName: data.advisor.name,
                  summary,
                })
              }
            />

            <FlagReviewPanel student={student} />
            <NoteLogger role="advisor" studentId={student.id} authorName={data.advisor.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
