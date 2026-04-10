"use client";

import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import type { MascotExpression } from "@/lib/resource-discovery-types";
import type { WeekEvent } from "@/lib/week-simulator-types";

interface EventCardProps {
  event: WeekEvent;
  completed: boolean;
  active: boolean;
  reminderLabel?: string;
  onClick: () => void;
}

function getEventExpression(event: WeekEvent): MascotExpression {
  switch (event.type) {
    case "class":
      return "happy";
    case "advising":
    case "advising-preview":
      return "idea";
    case "homework":
      return "confused";
    case "message":
      return "smirk";
    case "resource":
      return "happy";
    case "free-day":
      return "smirk";
    case "deadline":
      return "anxious";
    default:
      return "happy";
  }
}

export function EventCard({
  event,
  completed,
  active,
  reminderLabel,
  onClick,
}: EventCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.6rem] border p-4 text-left transition ${
        active
          ? "border-[#ffc627] bg-[linear-gradient(135deg,#fff1c9,#fffaf1)] shadow-[0_16px_36px_rgba(44,17,22,0.12)]"
          : "border-[#ecd7c0] bg-white hover:-translate-y-0.5 hover:border-[#e3bb72]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <CharacterAvatar expression={getEventExpression(event)} size="sm" framed={false} />
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              {event.time}
            </p>
            <p className="mt-2 font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
              {event.title}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] ${
            completed
              ? "bg-[#16a34a] text-white"
              : "bg-[#fff2dc] text-[#8c1d40]"
          }`}
        >
          {completed ? "Done" : event.type === "advising-preview" ? "preview" : event.type.replace("-", " ")}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">{event.description}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#7e5a5f]">
        <span className="rounded-full bg-[#fff8ef] px-3 py-1">{event.location}</span>
        {reminderLabel ? (
          <span className="rounded-full bg-[#8c1d40] px-3 py-1 text-white">{reminderLabel}</span>
        ) : null}
      </div>
    </button>
  );
}
