import type { DashboardStudent } from "@/lib/types";

export function FinancialSnapshot({ student }: { student: DashboardStudent }) {
  return (
    <section className="paper-card">
      <p className="eyebrow">Financial snapshot</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <FinancialCard label="Scholarship">
          {student.financial.scholarshipAmount > 0
            ? `$${student.financial.scholarshipAmount.toLocaleString()}/yr`
            : "No scholarship on file"}
        </FinancialCard>
        <FinancialCard label="Financial coaching">
          {student.financial.financialCoachingVisits === 0
            ? "Never visited"
            : `${student.financial.financialCoachingVisits} visit(s)`}
        </FinancialCard>
        <FinancialCard label="Open scholarship opportunities">
          {student.financial.unappliedScholarships}
        </FinancialCard>
      </div>
    </section>
  );
}

function FinancialCard({
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
