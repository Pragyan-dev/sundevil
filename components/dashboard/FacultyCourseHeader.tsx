import type { ReturnTypeGetDashboardCounts } from "./types";

interface FacultyCourseHeaderProps {
  title: string;
  subtitle: string;
  counts: ReturnTypeGetDashboardCounts;
}

const cards = [
  {
    key: "needsOutreach",
    icon: "🔴",
    label: "Need Outreach",
    accent: "border-[#C62828]/18 bg-[#C62828]/8 text-[#8B1E1E]",
  },
  {
    key: "watchClosely",
    icon: "🟡",
    label: "Watch List",
    accent: "border-[#F57F17]/18 bg-[#F57F17]/8 text-[#8A4B00]",
  },
  {
    key: "onTrack",
    icon: "🟢",
    label: "On Track",
    accent: "border-[#2E7D32]/18 bg-[#2E7D32]/8 text-[#1E5A24]",
  },
  {
    key: "emailsSent",
    icon: "📧",
    label: "Emails Sent",
    accent: "border-[rgba(140,29,64,0.14)] bg-[rgba(140,29,64,0.05)] text-[var(--asu-maroon)]",
  },
  {
    key: "handoffsToAdvisor",
    icon: "🤝",
    label: "Handoffs",
    accent: "border-[rgba(255,198,39,0.24)] bg-[rgba(255,198,39,0.12)] text-[var(--asu-maroon)]",
  },
] as const;

export type FacultyQuickCounts = {
  needsOutreach: number;
  watchClosely: number;
  onTrack: number;
  emailsSent: number;
  handoffsToAdvisor: number;
};

export function FacultyCourseHeader({
  title,
  subtitle,
  counts,
}: FacultyCourseHeaderProps) {
  return (
    <section className="space-y-6">
      <div className="maroon-panel">
        <p className="eyebrow !text-[rgba(255,255,255,0.72)]">🎓 Faculty view</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--warm-white)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[rgba(255,255,255,0.84)]">{subtitle}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.key}
            className={`paper-card flex min-h-[10rem] flex-col justify-between rounded-[1.8rem] border ${card.accent}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-current/70">Quick stats</span>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-5xl leading-none">
                {counts[card.key]}
              </p>
              <p className="mt-3 text-base font-semibold">{card.label}</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
