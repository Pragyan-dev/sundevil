import { formatSignalDate } from "@/lib/dashboard";
import type { DashboardOutreachItem } from "@/lib/types";

interface OutreachHistoryProps {
  items: DashboardOutreachItem[];
}

export function OutreachHistory({ items }: OutreachHistoryProps) {
  if (!items.length) {
    return (
      <div className="rounded-[1.4rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-5">
        <p className="text-sm leading-7 text-[var(--muted-ink)]">No outreach logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={`${item.date}-${item.type}-${item.summary}`}
          className="rounded-[1.4rem] border border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.76)] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow">{item.type}</span>
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              {formatSignalDate(item.date)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ink)]/84">{item.summary}</p>
        </article>
      ))}
    </div>
  );
}
