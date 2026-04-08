"use client";

import { weekSimulatorBadges } from "@/data/week-simulator";
import type { WeekBadgeId } from "@/lib/week-simulator-types";

interface BadgeEarnedModalProps {
  badgeId: WeekBadgeId | null;
  onClose: () => void;
}

export function BadgeEarnedModal({ badgeId, onClose }: BadgeEarnedModalProps) {
  const badge = badgeId ? weekSimulatorBadges.find((entry) => entry.id === badgeId) ?? null : null;

  if (!badge) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(23,8,12,0.54)] p-4 backdrop-blur-md">
      <div className="w-[min(92vw,30rem)] rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-6 shadow-[0_26px_90px_rgba(44,17,22,0.26)]">
        <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
          Badge earned
        </p>
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#2c1116] text-3xl text-white">
            {badge.icon}
          </div>
          <div>
            <h2 className="font-[var(--font-sim-display)] text-[2rem] leading-none text-[#2c1116]">
              {badge.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">{badge.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
        >
          Keep going
        </button>
      </div>
    </div>
  );
}
