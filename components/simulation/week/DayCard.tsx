"use client";

import type { WeekDay } from "@/lib/week-simulator-types";

interface DayCardProps {
  day: WeekDay;
  selected: boolean;
  unlocked: boolean;
  completed: boolean;
  reminderCount: number;
  onClick: () => void;
}

export function DayCard({
  day,
  selected,
  unlocked,
  completed,
  reminderCount,
  onClick,
}: DayCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!unlocked}
      className={`relative h-full w-full min-h-[5.8rem] rounded-[1.45rem] border px-5 py-4 text-left transition ${
        selected
          ? "border-[#ffc627] bg-[linear-gradient(135deg,#fff0c6,#fff9f0)] shadow-[0_16px_40px_rgba(44,17,22,0.14)]"
          : unlocked
            ? "border-[#edd8c1] bg-white hover:-translate-y-0.5 hover:border-[#e4bb73]"
            : "border-white/10 bg-white/6 text-white/55"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[0.95rem] font-black uppercase tracking-[0.16em] ${
              selected || unlocked ? "text-[#8c1d40]" : "text-white/45"
            }`}
          >
            Day {day.number}
          </p>
        </div>
        <div className="relative">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-[1.2rem] text-base ${
              completed
                ? "bg-[#16a34a] text-white"
                : unlocked
                  ? "bg-[#fff3cf] text-[#8c1d40]"
                  : "bg-white/10 text-white/60"
            }`}
          >
            {completed ? "✓" : unlocked ? day.number : "🔒"}
          </span>
        </div>
      </div>
      {reminderCount ? (
        <span className="absolute right-2 top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#8c1d40] px-1 text-[0.56rem] font-black text-white">
          {reminderCount}
        </span>
      ) : null}
    </button>
  );
}
