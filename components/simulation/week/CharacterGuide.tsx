"use client";

import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import type { MascotExpression } from "@/lib/resource-discovery-types";

interface CharacterGuideProps {
  expression: MascotExpression;
  title: string;
  message: string;
  accent?: string;
}

export function CharacterGuide({
  expression,
  title,
  message,
  accent = "Week Guide",
}: CharacterGuideProps) {
  return (
    <div className="w-full self-start rounded-[1.6rem] border border-[#f0dbc6] bg-[#fff8ef] p-3 shadow-[0_14px_34px_rgba(44,17,22,0.08)] sm:p-4">
      <div className="grid gap-3 md:grid-cols-[4.8rem_minmax(0,1fr)] md:items-center">
        <div className="grid justify-center">
          <CharacterAvatar expression={expression} size="lg" pulse framed={false} />
        </div>
        <div className="max-w-[60rem]">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            {accent}
          </p>
          <h2 className="mt-1.5 font-[var(--font-sim-display)] text-[1.45rem] leading-none text-[#2c1116] sm:text-[1.65rem]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6f4a4e] sm:text-[0.98rem]">{message}</p>
        </div>
      </div>
    </div>
  );
}
