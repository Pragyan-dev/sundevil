import { getConcernMeta } from "@/lib/dashboard";
import type { DashboardConcernLevel } from "@/lib/types";

const classes: Record<DashboardConcernLevel, string> = {
  high: "border-[#C62828]/18 bg-[#C62828]/10 text-[#8B1E1E]",
  watch: "border-[#F57F17]/22 bg-[#F57F17]/12 text-[#8A4B00]",
  steady: "border-[#2E7D32]/18 bg-[#2E7D32]/10 text-[#1E5A24]",
};

interface ConcernBadgeProps {
  level: DashboardConcernLevel;
  compact?: boolean;
}

export function ConcernBadge({ level, compact = false }: ConcernBadgeProps) {
  const meta = getConcernMeta(level);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-semibold ${classes[level]} ${
        compact ? "text-xs uppercase tracking-[0.16em]" : "text-sm"
      }`}
    >
      <span aria-hidden="true">{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
