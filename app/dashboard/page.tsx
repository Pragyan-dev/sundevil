import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient";
import {
  computeCohortPatterns,
  dashboardClassContext,
  getDashboardCounts,
  getDashboardStudents,
} from "@/lib/dashboard";

export default function DashboardPage() {
  const students = getDashboardStudents();
  const patterns = computeCohortPatterns(students);
  const counts = getDashboardCounts(students);

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[88rem] space-y-8">
        <section className="maroon-panel">
          <p className="eyebrow !text-[rgba(255,255,255,0.72)]">Faculty dashboard</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--warm-white)] sm:text-5xl">
            {dashboardClassContext.courseLabel}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[rgba(255,255,255,0.84)]">
            {dashboardClassContext.professorName} · {dashboardClassContext.campusLabel}
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(255,255,255,0.8)]">
            Built for scanning, not spreadsheet reading. The cards below surface the students who
            need the professor’s attention first, then give you a direct path into individualized
            outreach.
          </p>
        </section>

        <DashboardOverviewClient students={students} patterns={patterns} counts={counts} />
      </div>
    </div>
  );
}
