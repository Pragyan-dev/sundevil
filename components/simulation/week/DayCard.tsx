"use client";

import type { WeekDay } from "@/lib/week-simulator-types";

interface DayCardProps {
  day: WeekDay;
  selected: boolean;
  unlocked: boolean;
  demoUnlockable: boolean;
  completed: boolean;
  reminderCount: number;
  onClick: () => void;
}

export function DayCard({
  day,
  selected,
  unlocked,
  demoUnlockable,
  completed,
  reminderCount,
  onClick,
}: DayCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!unlocked && !demoUnlockable}
      className={`relative h-full w-full min-h-[5.8rem] rounded-[1.45rem] border px-5 py-4 text-left transition ${
        selected
          ? "border-[#ffc627] bg-[linear-gradient(135deg,#fff0c6,#fff9f0)] shadow-[0_16px_40px_rgba(44,17,22,0.14)]"
          : unlocked
            ? "border-[#edd8c1] bg-white hover:-translate-y-0.5 hover:border-[#e4bb73]"
            : demoUnlockable
              ? "border-[#e8d8cb] bg-[#f3efeb] text-[#8d7d77] hover:-translate-y-0.5 hover:border-[#d5b997]"
              : "border-[#e4d9d1] bg-[#ece8e4] text-[#a1948f]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[0.95rem] font-black uppercase tracking-[0.16em] ${
              selected || unlocked ? "text-[#8c1d40]" : demoUnlockable ? "text-[#8d6a52]" : "text-[#9b8f88]"
            }`}
          >
            Day {day.number}
          </p>
          {demoUnlockable ? (
            <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#8c1d40]">
              Simulate next day for demo
            </p>
          ) : !unlocked ? (
            <p className="mt-2 text-[0.72rem] font-medium text-[#9b8f88]">Locked</p>
          ) : null}
        </div>
        <div className="relative">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-[1.2rem] text-base ${
              completed
                ? "bg-[#16a34a] text-white"
                : unlocked
                  ? "bg-[#fff3cf] text-[#8c1d40]"
                  : demoUnlockable
                    ? "bg-[#e5ddd6] text-[#8d6a52]"
                    : "bg-[#ddd4cd] text-[#8f8680]"
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
