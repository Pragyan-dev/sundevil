"use client";

import type { ScheduledHomeworkSlot } from "@/lib/week-simulator-types";

interface CalendarPickerProps {
  selectedSlot: ScheduledHomeworkSlot | null;
  onSelect: (slot: ScheduledHomeworkSlot) => void;
}

const thursdaySlots: ScheduledHomeworkSlot[] = [
  { dayId: "day-4", label: "Thursday", timeRange: "10:00 AM - 11:00 AM" },
  { dayId: "day-4", label: "Thursday", timeRange: "2:00 PM - 3:00 PM" },
  { dayId: "day-4", label: "Thursday", timeRange: "6:30 PM - 7:30 PM" },
];

export function CalendarPicker({ selectedSlot, onSelect }: CalendarPickerProps) {
  return (
    <div className="rounded-[1.6rem] border border-[#ecd7c0] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Calendar
          </p>
          <p className="mt-1 font-[var(--font-sim-display)] text-[1.05rem] leading-none text-[#2c1116]">
            Pick a Thursday homework slot
          </p>
        </div>
        {selectedSlot ? (
          <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-white">
            Saved
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {thursdaySlots.map((slot) => {
          const selected = selectedSlot?.timeRange === slot.timeRange;
          return (
            <button
              key={slot.timeRange}
              type="button"
              onClick={() => onSelect(slot)}
              className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                selected
                  ? "border-[#ffc627] bg-[linear-gradient(135deg,#fff0c7,#fff8ea)]"
                  : "border-[#eedac4] bg-[#fff8ef] hover:-translate-y-0.5 hover:border-[#e2bc78]"
              }`}
            >
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                {slot.label}
              </p>
              <p className="mt-2 font-[var(--font-sim-display)] text-[1.1rem] leading-none text-[#2c1116]">
                {slot.timeRange}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
