import { getUsageFillCount, getUsageText } from "@/lib/dashboard";
import type { DashboardResourceUsage } from "@/lib/types";

const resourceLabels: Array<{ key: keyof DashboardResourceUsage; label: string }> = [
  { key: "officeHours", label: "Office hours" },
  { key: "tutoring", label: "Tutoring" },
  { key: "advising", label: "Advising" },
  { key: "counseling", label: "Counseling" },
  { key: "financialCoaching", label: "Financial coaching" },
];

interface ResourceEngagementBarProps {
  usage: DashboardResourceUsage;
}

export function ResourceEngagementBar({ usage }: ResourceEngagementBarProps) {
  return (
    <div className="space-y-3">
      {resourceLabels.map((resource) => {
        const level = usage[resource.key];
        const filled = getUsageFillCount(level);

        return (
          <div key={resource.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[var(--ink)]">{resource.label}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                  {getUsageText(level)}
                </span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={`${resource.key}-${index + 1}`}
                    className={`h-3 flex-1 rounded-full ${
                      index < filled ? "bg-[var(--asu-gold)]" : "bg-[rgba(140,29,64,0.08)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
