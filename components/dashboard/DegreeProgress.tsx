import { formatRelativeDate } from "@/lib/dashboard";
import type { DashboardStudent } from "@/lib/types";

export function DegreeProgress({ student }: { student: DashboardStudent }) {
  return (
    <section className="paper-card">
      <p className="eyebrow">Degree progress</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <DetailCard label="Credits">
          {student.degree.creditsCompleted}/{student.degree.creditsNeeded} completed
        </DetailCard>
        <DetailCard label="DARS status">
          Last checked {formatRelativeDate(student.degree.lastDarsCheck)}
        </DetailCard>
        <DetailCard label="On track">{student.degree.onTrack ? "Yes, with support" : "Needs review"}</DetailCard>
        <DetailCard label="Holds">
          {student.degree.holds.length ? student.degree.holds.join(", ") : "None"}
        </DetailCard>
      </div>
    </section>
  );
}

function DetailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.78)] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{children}</p>
    </div>
  );
}
