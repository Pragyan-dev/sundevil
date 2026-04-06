import Link from "next/link";
import { notFound } from "next/navigation";

import { BatchOutreachReview } from "@/components/dashboard/BatchOutreachReview";
import {
  dashboardClassContext,
  getDashboardStudents,
  getPatternById,
  getPatternTitle,
} from "@/lib/dashboard";

export default async function DashboardBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ pattern?: string }>;
}) {
  const { pattern: patternId } = await searchParams;

  if (!patternId) {
    notFound();
  }

  const pattern = getPatternById(patternId);
  if (!pattern) {
    notFound();
  }

  const students = getDashboardStudents().filter((student) => pattern.studentIds.includes(student.id));
  if (!students.length) {
    notFound();
  }

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[90rem] space-y-8">
        <section className="paper-card-featured paper-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Faculty dashboard</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
                Batch outreach review
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted-ink)]">
                {dashboardClassContext.courseLabel} · {getPatternTitle(pattern)}. Generate drafts
                in parallel, then review and open them one by one in your mail client.
              </p>
            </div>
            <Link href="/dashboard" className="button-secondary">
              Back to overview
            </Link>
          </div>
        </section>

        <BatchOutreachReview pattern={pattern} students={students} />
      </div>
    </div>
  );
}
