"use client";

import type { WeekReminder } from "@/lib/week-simulator-types";

interface ReminderBannerProps {
  reminder: WeekReminder;
  acknowledged: boolean;
  onAcknowledge: () => void;
  onOpen: () => void;
}

export function ReminderBanner({
  reminder,
  acknowledged,
  onAcknowledge,
  onOpen,
}: ReminderBannerProps) {
  return (
    <div className="rounded-[1.6rem] border border-[#f3cd8d] bg-[linear-gradient(135deg,#fff0c7,#fff8ec)] p-4 shadow-[0_16px_30px_rgba(44,17,22,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Reminder · {reminder.time}
          </p>
          <p className="mt-2 font-[var(--font-sim-display)] text-[1.2rem] leading-none text-[#2c1116]">
            {reminder.message}
          </p>
        </div>
        {acknowledged ? (
          <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-white">
            Seen
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-[#8c1d40] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
        >
          {reminder.actionLabel}
        </button>
        {!acknowledged ? (
          <button
            type="button"
            onClick={onAcknowledge}
            className="rounded-full border border-[#e8bf88] bg-white px-4 py-2 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5"
          >
            Mark seen
          </button>
        ) : null}
      </div>
    </div>
  );
}
