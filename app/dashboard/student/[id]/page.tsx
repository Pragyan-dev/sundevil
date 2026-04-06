import { notFound } from "next/navigation";

import { ActionPanel } from "@/components/dashboard/ActionPanel";
import { StudentProfile } from "@/components/dashboard/StudentProfile";
import { dashboardClassContext, getDashboardStudent } from "@/lib/dashboard";

export default async function DashboardStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = getDashboardStudent(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="page-shell pb-12">
      <div className="mx-auto max-w-[90rem] space-y-8">
        <section className="paper-card-featured paper-card">
          <p className="eyebrow">Faculty dashboard</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--asu-maroon)]">
            {dashboardClassContext.courseCode} student review
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted-ink)]">
            Full profile for one student. The left column holds the story and the right column holds
            actions you can take without turning the dashboard into a surveillance tool.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <StudentProfile student={student} />
          <ActionPanel student={student} />
        </section>
      </div>
    </div>
  );
}
