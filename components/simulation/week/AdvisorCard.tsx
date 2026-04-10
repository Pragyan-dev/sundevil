"use client";

import { useState } from "react";

import type { WeekAdvisingEvent } from "@/lib/week-simulator-types";

interface AdvisorCardProps {
  event: WeekAdvisingEvent;
  completed: boolean;
  onComplete: () => void;
}

export function AdvisorCard({ event, completed, onComplete }: AdvisorCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Advising Screen
            </p>
            <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
              {event.advisorName}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-[#7d565b]">
            <span className="rounded-full bg-white px-3 py-1">{event.time}</span>
            <span className="rounded-full bg-white px-3 py-1">{event.location}</span>
            <span className="rounded-full bg-white px-3 py-1">{event.reminderLabel}</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">{event.whatItsFor}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {event.resources.map((resource) => (
            <span
              key={resource}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#7d565b]"
            >
              {resource}
            </span>
          ))}
        </div>

        {event.linkedResource ? (
          <div className="mt-4">
            <a
              href={event.linkedResource}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
            >
              Open location in maps
            </a>
          </div>
        ) : null}

        <div className="mt-4 rounded-[1.5rem] border border-[#ecd6be] bg-white p-4">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Walk-in moment
          </p>
          <p className="mt-3 text-base leading-7 text-[#533338]">{event.conversation.intro}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {event.conversation.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => {
                  setSelectedOutcome(choice.outcome);
                }}
                className="rounded-full border border-[#e8c9a3] bg-[#fff8ef] px-4 py-2 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5 hover:border-[#8c1d40]"
              >
                {choice.text}
              </button>
            ))}
          </div>

          {selectedOutcome ? (
            <div className="mt-4 rounded-[1.25rem] border border-[#efd7bf] bg-[#fff8ef] p-4">
              <p className="text-sm leading-7 text-[#533338]">{event.conversation.followUp}</p>
              <p className="mt-3 font-medium leading-7 text-[#2c1116]">{selectedOutcome}</p>
              {!completed ? (
                <button
                  type="button"
                  onClick={onComplete}
                  className="mt-4 rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                >
                  Finish advising
                </button>
              ) : (
                <div className="mt-4 inline-flex rounded-full bg-[#16a34a] px-4 py-2 text-sm font-black text-white">
                  Advising complete
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
