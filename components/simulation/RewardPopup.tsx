"use client";

import { useEffect, useRef } from "react";

import { resourceDiscoveryBadges } from "@/data/resource-discovery-worlds";
import type { RewardPopupItem } from "@/lib/resource-discovery-types";

interface RewardPopupProps {
  items: RewardPopupItem[];
  onDismiss: (id: string) => void;
}

export function RewardPopup({ items, onDismiss }: RewardPopupProps) {
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
    <div className="pointer-events-none fixed right-4 top-4 z-50 grid w-[min(92vw,23rem)] gap-3">
      {items.map((item) => {
        const badge = item.badgeId
          ? resourceDiscoveryBadges.find((entry) => entry.id === item.badgeId)
          : null;

        return (
          <div
            key={item.id}
            className="resource-reward-popup pointer-events-auto relative overflow-hidden rounded-[1.65rem] border border-[#f2d6b7] bg-white px-4 py-4 shadow-[0_24px_70px_rgba(44,17,22,0.24)]"
          >
            <div className="resource-reward-glow absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2c1116] text-lg text-white">
                {item.kind === "badge"
                  ? badge?.icon ?? "🏅"
                  : item.kind === "unlock"
                    ? "🗺️"
                    : item.kind === "bundle"
                      ? "🎁"
                      : "🔱"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                    {item.kind === "badge"
                      ? "Badge earned"
                      : item.kind === "unlock"
                        ? "Node unlocked"
                        : item.kind === "bundle"
                          ? "Reward bundle"
                          : "Pitchforks gained"}
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {item.points ? (
                      <span className="rounded-full bg-[#ffc627] px-2.5 py-1 text-[0.72rem] font-black text-[#2c1116]">
                        +{item.points} pitchforks
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="mt-1 font-[var(--font-sim-display)] text-[1.25rem] leading-none text-[#2c1116]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">{item.detail}</p>
                {item.kind === "bundle" && badge ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ead6c3] bg-[#fff8ef] px-3 py-1.5 text-[0.74rem] font-bold text-[#6f4a4e]">
                    <span aria-hidden="true">{badge.icon}</span>
                    <span>{badge.title} badge added</span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="rounded-full border border-[#ead6c3] bg-white/90 px-2 py-1 text-[0.72rem] font-bold text-[#6f4a4e] transition hover:border-[#8c1d40] hover:text-[#8c1d40]"
              >
                x
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
