"use client";

import type { WalkthroughMode, WalkthroughModeDefinition } from "@/lib/types";

const MODE_ICONS: Record<WalkthroughMode, string> = {
  "in-person": "🏢",
  online: "💻",
  "drop-in": "🚶",
};

interface ModeSelectorProps {
  modes: WalkthroughModeDefinition[];
  value: WalkthroughMode;
  onChange: (mode: WalkthroughMode) => void;
}

export function ModeSelector({ modes, value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {modes.map((mode) => {
        const active = value === mode.mode;

        return (
          <button
            key={mode.mode}
            type="button"
            onClick={() => onChange(mode.mode)}
            data-active={active}
            className="choice-pill h-full rounded-[1.4rem] p-4 text-left data-[active=true]:shadow-[0_18px_34px_rgba(140,29,64,0.18)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {MODE_ICONS[mode.mode]}
              </span>
              <div>
                <span className="block font-semibold">{mode.label}</span>
                <span className="choice-meta mt-1 block">{mode.summary}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
