"use client";

import { useMemo, useState } from "react";

import type { ScheduledHomeworkSlot, WeekDayId } from "@/lib/week-simulator-types";

interface CalendarPickerProps {
  selectedSlot: ScheduledHomeworkSlot | null;
  onSelect: (slot: ScheduledHomeworkSlot) => void;
}

const availableHomeworkDates = [
  { dayId: "day-4" as WeekDayId, dateValue: "2026-04-16", dateLabel: "Thursday, Apr 16" },
  { dayId: "day-5" as WeekDayId, dateValue: "2026-04-17", dateLabel: "Friday, Apr 17" },
  { dayId: "day-6" as WeekDayId, dateValue: "2026-04-18", dateLabel: "Saturday, Apr 18" },
];

function formatTimeLabel(timeValue: string) {
  const [hourRaw, minuteRaw] = timeValue.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return timeValue;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function CalendarPicker({ selectedSlot, onSelect }: CalendarPickerProps) {
  const [selectedDateValue, setSelectedDateValue] = useState(
    selectedSlot?.dateValue ?? availableHomeworkDates[0].dateValue,
  );
  const [selectedTimeValue, setSelectedTimeValue] = useState(selectedSlot?.timeValue ?? "16:00");

  const activeDate = useMemo(
    () =>
      availableHomeworkDates.find((date) => date.dateValue === selectedDateValue) ??
      availableHomeworkDates[0],
    [selectedDateValue],
  );

  function handleSave() {
    onSelect({
      dayId: activeDate.dayId,
      dateLabel: activeDate.dateLabel,
      dateValue: activeDate.dateValue,
      timeLabel: formatTimeLabel(selectedTimeValue),
      timeValue: selectedTimeValue,
    });
  }

  return (
    <div className="rounded-[1.6rem] border border-[#ecd7c0] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Calendar
          </p>
          <p className="mt-1 font-[var(--font-sim-display)] text-[1.05rem] leading-none text-[#2c1116]">
            Choose a date and time that works for you
          </p>
        </div>
        {selectedSlot ? (
          <span className="rounded-full bg-[#16a34a] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-white">
            Saved
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Pick a date
          </span>
          <input
            type="date"
            value={selectedDateValue}
            min={availableHomeworkDates[0].dateValue}
            max={availableHomeworkDates.at(-1)?.dateValue}
            onChange={(event) => setSelectedDateValue(event.target.value)}
            className="rounded-[1.15rem] border border-[#eedac4] bg-[#fff8ef] px-4 py-3 text-sm font-bold text-[#2c1116] outline-none transition focus:border-[#8c1d40]"
          />
          <span className="text-xs leading-5 text-[#8b666a]">
            Choose Thursday, Friday, or Saturday for this week.
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Pick a time
          </span>
          <input
            type="time"
            value={selectedTimeValue}
            step={900}
            onChange={(event) => setSelectedTimeValue(event.target.value)}
            className="rounded-[1.15rem] border border-[#eedac4] bg-[#fff8ef] px-4 py-3 text-sm font-bold text-[#2c1116] outline-none transition focus:border-[#8c1d40]"
          />
          <span className="text-xs leading-5 text-[#8b666a]">Set any time that feels comfortable.</span>
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
        >
          Save slot
        </button>
      </div>

      <div className="mt-4 rounded-[1.2rem] border border-[#f1e0cc] bg-[#fff8ef] px-4 py-3 text-sm leading-6 text-[#6f4a4e]">
        Current pick: <span className="font-bold text-[#2c1116]">{activeDate.dateLabel}</span> at{" "}
        <span className="font-bold text-[#2c1116]">{formatTimeLabel(selectedTimeValue)}</span>
      </div>
    </div>
  );
}
