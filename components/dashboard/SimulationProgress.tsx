import { getBadgeMeta, getSimulationDots, getSimulationLabel } from "@/lib/dashboard";
import type { DashboardSimulationStatus } from "@/lib/types";

interface SimulationProgressProps {
  simulation: DashboardSimulationStatus;
  compact?: boolean;
}

export function SimulationProgress({ simulation, compact = false }: SimulationProgressProps) {
  const dots = getSimulationDots(simulation);
  const badges = getBadgeMeta(simulation.badges);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-[var(--asu-maroon)]">
          Simulation: {getSimulationLabel(simulation)}
        </span>
        <span className="text-sm text-[var(--muted-ink)]">
          Badges: {badges.length}/8
        </span>
      </div>

      <div className="flex items-center gap-2">
        {dots.map((state, index) => (
          <span
            key={`${state}-${index + 1}`}
            className={`inline-flex h-4 w-4 rounded-full border ${
              state === "completed"
                ? "border-[var(--asu-gold)] bg-[var(--asu-gold)]"
                : state === "current"
                  ? "border-[var(--asu-gold)] bg-[rgba(255,198,39,0.2)]"
                  : "border-[rgba(140,29,64,0.14)] bg-transparent"
            }`}
            aria-label={`Day ${index + 1}: ${state}`}
          />
        ))}
      </div>

      {badges.length ? (
        <div className={`flex flex-wrap gap-2 ${compact ? "" : "pt-1"}`}>
          {badges.slice(0, compact ? 5 : badges.length).map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,198,39,0.3)] bg-[rgba(255,198,39,0.12)] px-3 py-2 text-xs font-medium text-[var(--asu-maroon)]"
              title={badge.title}
            >
              <span aria-hidden="true">{badge.icon}</span>
              <span>{badge.shortLabel}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
