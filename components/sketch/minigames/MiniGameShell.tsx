"use client";

import type { ReactNode } from "react";

import { generateWobblyRect } from "@/components/sketch/sketchShapes";

interface MiniGameShellProps {
  title: string;
  instructions: string;
  icon: string;
  children: ReactNode;
  onComplete: () => void;
  completed?: boolean;
  score?: { correct: number; total: number };
  continueLabel?: string;
}

export default function MiniGameShell({
  title,
  instructions,
  icon,
  children,
  onComplete,
  completed = false,
  score,
  continueLabel = "Continue ►",
}: MiniGameShellProps) {
  return (
    <section className="sketch-minigame-shell">
      <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="sketch-minigame-frame" aria-hidden="true">
        <path d={generateWobblyRect(400, 400, title.length * 13)} />
      </svg>

      <div className="sketch-minigame-header">
        <div>
          <h2>
            <span aria-hidden="true">{icon}</span>
            <span>{title}</span>
          </h2>
          <p>{instructions}</p>
        </div>
        {score ? (
          <div className="sketch-minigame-score">
            <span>Score</span>
            <strong>
              {score.correct}/{score.total}
            </strong>
          </div>
        ) : null}
      </div>

      <div className="sketch-minigame-body">{children}</div>

      <div className="sketch-minigame-footer">
        <span className="sketch-minigame-note">Tap through and learn by trying things.</span>
        {completed ? (
          <button type="button" className="sketch-action-button sketch-action-button-gold" onClick={onComplete}>
            {continueLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

