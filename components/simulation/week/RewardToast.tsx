"use client";

import { useEffect, useRef } from "react";

import { weekSimulatorBadges } from "@/data/week-simulator";
import type { WeekRewardToast } from "@/lib/week-simulator-types";

interface RewardToastProps {
  items: WeekRewardToast[];
  onDismiss: (id: string) => void;
}

export function RewardToast({ items, onDismiss }: RewardToastProps) {
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    items.forEach((item) => {
      if (timersRef.current[item.id]) {
        return;
      }

      timersRef.current[item.id] = window.setTimeout(() => {
        delete timersRef.current[item.id];
        onDismiss(item.id);
      }, 3200);
    });
  }, [items, onDismiss]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => window.clearTimeout(timer));
      timersRef.current = {};
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 grid w-[min(92vw,24rem)] gap-3">
      {items.map((item) => {
        const badge = item.badgeId
          ? weekSimulatorBadges.find((entry) => entry.id === item.badgeId)
          : null;

        return (
          <div
            key={item.id}
            className="pointer-events-auto rounded-[1.5rem] border border-[#f0dbc6] bg-white px-4 py-4 shadow-[0_22px_60px_rgba(44,17,22,0.22)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2c1116] text-lg text-white">
                {item.kind === "badge" ? badge?.icon ?? "🏅" : item.kind === "reminder" ? "⏰" : "🔱"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                    {item.kind === "badge" ? "Badge earned" : item.kind === "reminder" ? "Reminder" : "Pitchforks earned"}
                  </span>
                  {item.points ? (
                    <span className="rounded-full bg-[#ffc627] px-2.5 py-1 text-[0.72rem] font-black text-[#2c1116]">
                      +{item.points}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-[var(--font-sim-display)] text-[1.2rem] leading-none text-[#2c1116]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">{item.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
