"use client";

import type { ChatChoice } from "@/lib/resource-discovery-types";

interface ChoiceButtonsProps {
  choices: ChatChoice[];
  onSelect: (choice: ChatChoice) => void;
}

export function ChoiceButtons({ choices, onSelect }: ChoiceButtonsProps) {
  return (
    <div className="grid gap-3">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          onClick={() => onSelect(choice)}
          className="group rounded-[1.4rem] border border-[#edd7c0] bg-white px-4 py-3 text-left text-sm font-semibold text-[#2c1116] shadow-[0_12px_28px_rgba(44,17,22,0.08)] transition hover:-translate-y-0.5 hover:border-[#8c1d40] hover:shadow-[0_18px_40px_rgba(44,17,22,0.12)]"
        >
          <div className="flex items-center justify-between gap-3">
            <span>{choice.text}</span>
            <span className="rounded-full bg-[#fff3d3] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40] transition group-hover:bg-[#8c1d40] group-hover:text-white">
              Reply
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
