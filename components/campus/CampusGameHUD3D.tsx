"use client";

import type { CampusQuest, CampusVector3, CampusWorldDefinition } from "@/lib/types";

function toPercent(value: number, total: number) {
  return `${((value / total + 0.5) * 100).toFixed(2)}%`;
}

export default function CampusGameHUD3D({
  currentQuestBuildingId,
  currentQuestBuildingLabel,
  currentQuestLabel,
  currentSceneTitle,
  discoveredBuildings,
  isFullscreen,
  isIndoor,
  onToggleFullscreen,
  playerPosition,
  prompt,
  quests,
  world,
}: {
  currentQuestBuildingId: string | null;
  currentQuestBuildingLabel: string | null;
  currentQuestLabel: string | null;
  currentSceneTitle: string;
  discoveredBuildings: string[];
  isFullscreen: boolean;
  isIndoor: boolean;
  onToggleFullscreen: () => void;
  playerPosition: CampusVector3;
  prompt: string | null;
  quests: CampusQuest[];
  world: CampusWorldDefinition;
}) {
  const completedCount = quests.filter((quest) => quest.completed).length;
  const buildingEntries = Object.values(world.buildings);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 text-[#fff6eb]">
      <div className="flex h-full flex-col justify-between p-4 lg:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex max-w-[22rem] flex-col gap-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(14,10,7,0.58)] px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#ffc627]">
                {isIndoor ? "Interior Hub" : "Outdoor Campus"}
              </p>
              <p className="mt-2 font-[var(--font-sketch-display)] text-[1.85rem] leading-none text-white">
                {currentSceneTitle}
              </p>
              <p className="mt-2 font-[var(--font-sketch-body)] text-[1.1rem] leading-6 text-[#f1e3d2]">
                {currentQuestLabel
                  ? `Current quest: ${currentQuestLabel}.`
                  : "All five quest stops are complete. Return to the dorm to wrap the run."}
              </p>
            </div>

            {!isIndoor ? (
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(14,10,7,0.48)] px-4 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#ffc627]">
                      Minimap
                    </p>
                    <p className="mt-2 font-[var(--font-sketch-body)] text-lg text-white">
                      {currentQuestBuildingLabel
                        ? `Gold beacon is pointing to ${currentQuestBuildingLabel}.`
                        : "Every required stop is already cleared."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.7rem] uppercase tracking-[0.24em] text-white/55">Cleared</p>
                    <p className="mt-1 font-[var(--font-sketch-display)] text-4xl leading-none text-white">
                      {completedCount}/{quests.length}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 h-44 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,198,39,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                  <div className="absolute inset-x-3 top-1/2 h-px border-t border-dashed border-white/10" />
                  <div className="absolute inset-y-3 left-1/2 w-px border-l border-dashed border-white/10" />

                  {buildingEntries.map((building) => {
                    const isCurrent = currentQuestBuildingId === building.id;
                    const isSeen = discoveredBuildings.includes(building.id);

                    return (
                      <div
                        key={building.id}
                        className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                          isCurrent
                            ? "border-[#ffc627] bg-[#ffc627] shadow-[0_0_0_6px_rgba(255,198,39,0.16)]"
                            : isSeen
                              ? "border-white/50 bg-white/70"
                              : "border-white/20 bg-white/20"
                        }`}
                        style={{
                          left: toPercent(building.position[0], world.groundSize[0]),
                          top: toPercent(building.position[2], world.groundSize[1]),
                        }}
                      />
                    );
                  })}

                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8c1d40] bg-white shadow-[0_0_0_5px_rgba(140,29,64,0.22)]"
                    style={{
                      left: toPercent(playerPosition[0], world.groundSize[0]),
                      top: toPercent(playerPosition[2], world.groundSize[1]),
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex max-w-[20rem] flex-col gap-3">
            <button
              type="button"
              className="pointer-events-auto inline-flex items-center justify-center self-end rounded-full border border-white/15 bg-[rgba(14,10,7,0.62)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </button>

            <aside className="rounded-[1.8rem] border border-white/10 bg-[rgba(14,10,7,0.58)] px-4 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-md">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#ffc627]">
                Quest Board
              </p>
              <div className="mt-3 space-y-2.5">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`flex items-center gap-3 rounded-[1rem] border px-3 py-2.5 ${
                      quest.completed
                        ? "border-[#ffc627]/35 bg-[#ffc627]/12"
                        : "border-white/8 bg-white/5"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-black/20 font-[var(--font-sketch-body)] text-lg">
                      {quest.completed ? "✓" : "○"}
                    </div>
                    <p className="font-[var(--font-sketch-body)] text-[1.05rem] leading-5 text-white">
                      {quest.label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="max-w-[22rem] rounded-[1.4rem] border border-white/10 bg-[rgba(14,10,7,0.48)] px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-md">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-[#ffc627]">
              Controls
            </p>
            <p className="mt-2 font-[var(--font-sketch-body)] text-[1.02rem] leading-6 text-[#f1e3d2]">
              `WASD` move, drag to orbit, `Shift` sprint, `E` interact, `F` full screen.
            </p>
          </div>

          {prompt ? (
            <div className="max-w-[34rem] rounded-full border border-white/10 bg-[rgba(14,10,7,0.68)] px-5 py-3 text-center font-[var(--font-sketch-body)] text-[1.1rem] text-white shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-md">
              {prompt}
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
