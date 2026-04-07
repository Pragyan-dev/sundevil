"use client";

import type { CampusQuest } from "@/lib/types";

export default function CampusHUD({
  quests,
  discoveredCount,
  totalDiscoverable,
  prompt,
  currentQuestLabel,
  currentQuestBuildingLabel,
  mobileQuestOpen,
  onToggleMobileQuests,
}: {
  quests: CampusQuest[];
  discoveredCount: number;
  totalDiscoverable: number;
  prompt: string | null;
  currentQuestLabel: string | null;
  currentQuestBuildingLabel: string | null;
  mobileQuestOpen: boolean;
  onToggleMobileQuests: () => void;
}) {
  const completedCount = quests.filter((quest) => quest.completed).length;

  return (
    <>
      <aside className="campus-hud">
        <div className="campus-hud-card">
          <p className="campus-hud-eyebrow">Your quests</p>
          <div className="campus-hud-stat">
            <strong>
              {completedCount}/{quests.length}
            </strong>
            <span>main stops cleared</span>
          </div>
          <ul className="campus-quest-list">
            {quests.map((quest) => (
              <li
                key={quest.id}
                className={`campus-quest-item ${quest.completed ? "is-complete" : ""}`}
              >
                <span className="campus-quest-check" aria-hidden="true">
                  {quest.completed ? "✓" : "○"}
                </span>
                <span>{quest.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {currentQuestLabel ? (
          <div className="campus-hud-card campus-hud-card-accent">
            <p className="campus-hud-eyebrow">Next stop</p>
            <p className="campus-next-stop-title">{currentQuestLabel}</p>
            <p className="campus-hud-detail">
              Follow the gold ring on the map toward {currentQuestBuildingLabel ?? "the next building"}.
            </p>
          </div>
        ) : null}

        <div className="campus-hud-card campus-hud-card-muted">
          <p className="campus-hud-eyebrow">Discovery</p>
          <p className="campus-hud-summary">
            You have seen {discoveredCount} of {totalDiscoverable} key support spaces on this map.
          </p>
          <p className="campus-hud-detail">
            The goal is not to memorize campus. It is to make the buildings feel real before you
            need them.
          </p>
        </div>
      </aside>

      <div className="campus-mobile-hud">
        <button type="button" className="campus-mobile-hud-toggle" onClick={onToggleMobileQuests}>
          {mobileQuestOpen ? "Hide quests" : "Show quests"}
        </button>

        <div className={`campus-mobile-quest-drawer ${mobileQuestOpen ? "is-open" : ""}`}>
          <p className="campus-hud-eyebrow">Quest board</p>
          {currentQuestLabel ? (
            <p className="campus-mobile-next-stop">
              Next: {currentQuestLabel}
            </p>
          ) : null}
          <ul className="campus-quest-list">
            {quests.map((quest) => (
              <li
                key={quest.id}
                className={`campus-quest-item ${quest.completed ? "is-complete" : ""}`}
              >
                <span className="campus-quest-check" aria-hidden="true">
                  {quest.completed ? "✓" : "○"}
                </span>
                <span>{quest.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {prompt ? (
        <div className="campus-prompt" role="status" aria-live="polite">
          {prompt}
        </div>
      ) : null}
    </>
  );
}
