"use client";

import { generateWobblyPebblePath } from "@/components/sketch/sketchShapes";

interface SketchProgressDotsProps {
  total: number;
  current: number;
}

export function SketchProgressDots({ total, current }: SketchProgressDotsProps) {
  return (
    <div className="sketch-progress-dots" aria-label={`Dialog progress ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const state =
          index < current ? "complete" : index === current ? "current" : "upcoming";

        return (
          <span
            key={`${total}-${index}`}
            className={`sketch-progress-dot sketch-progress-dot-${state}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 18 14" className="sketch-progress-dot-svg">
              <path d={generateWobblyPebblePath(14, index + 1)} transform="translate(2 0)" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
