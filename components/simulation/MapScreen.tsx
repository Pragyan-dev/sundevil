"use client";

import { useState, type CSSProperties } from "react";

import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import { MapNode } from "@/components/simulation/MapNode";
import { ProgressBar } from "@/components/simulation/ProgressBar";
import { resourceDiscoveryWorldOrder } from "@/data/resource-discovery-worlds";
import type {
  ResourceDiscoveryProgress,
  ResourceWorld,
  ResourceWorldId,
} from "@/lib/resource-discovery-types";

interface MapScreenProps {
  worlds: ResourceWorld[];
  progress: ResourceDiscoveryProgress;
  unlockedWorldIds: ResourceWorldId[];
  hoveredWorldId: ResourceWorldId | null;
  zoomingWorldId: ResourceWorldId | null;
  onOpenWorld: (worldId: ResourceWorldId) => void;
  onHoverWorld: (worldId: ResourceWorldId | null) => void;
}

interface MapCurve {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
}

const MAP_END_WIDGET = {
  label: "More...",
  icon: "⋯",
  position: { x: 74, y: 82, mobileX: 78, mobileY: 86 },
};

function buildLine(
  start: { id: string; position: { x: number; y: number } },
  end: { id: string; position: { x: number; y: number } },
) : MapCurve {
  const dx = end.position.x - start.position.x;
  const dy = end.position.y - start.position.y;
  const bend = Math.max(4, Math.min(10, Math.abs(dx) * 0.18 + Math.abs(dy) * 0.12));

  if (start.id === "counseling" && end.id === "more") {
    return {
      id: `${start.id}-${end.id}`,
      x1: start.position.x,
      y1: start.position.y,
      x2: end.position.x,
      y2: end.position.y,
      c1x: start.position.x + 10,
      c1y: start.position.y - 4.5,
      c2x: end.position.x - 9,
      c2y: end.position.y - 5,
    };
  }

  return {
    id: `${start.id}-${end.id}`,
    x1: start.position.x,
    y1: start.position.y,
    x2: end.position.x,
    y2: end.position.y,
    c1x: start.position.x + dx * 0.35,
    c1y: start.position.y + dy * 0.08 - bend,
    c2x: end.position.x - dx * 0.35,
    c2y: end.position.y - dy * 0.08 + bend,
  };
}

function getLineCoordinates(worlds: ResourceWorld[]) {
  const orderedWorlds = resourceDiscoveryWorldOrder
    .map((worldId) => worlds.find((world) => world.id === worldId))
    .filter((world): world is ResourceWorld => Boolean(world));
  const lines = orderedWorlds.slice(0, -1).map((world, index) => buildLine(world, orderedWorlds[index + 1]!));
  const lastWorld = orderedWorlds.at(-1);

  if (lastWorld) {
    lines.push(
      buildLine(lastWorld, {
        id: "more",
        position: { x: MAP_END_WIDGET.position.x, y: MAP_END_WIDGET.position.y },
      }),
    );
  }

  return lines;
}

export function MapScreen({
  worlds,
  progress,
  unlockedWorldIds,
  hoveredWorldId,
  zoomingWorldId,
  onOpenWorld,
  onHoverWorld,
}: MapScreenProps) {
  const [mapMinimized, setMapMinimized] = useState(false);
  const visibleCompletedCount = worlds.filter((world) =>
    progress.completedWorldIds.includes(world.id),
  ).length;
  const completion = worlds.length ? Math.round((visibleCompletedCount / worlds.length) * 100) : 0;
  const hoveredWorld = hoveredWorldId
    ? worlds.find((world) => world.id === hoveredWorldId) ?? null
    : null;
  const guideTeaser =
    hoveredWorld?.teaser ??
    "Hover a building to see the kind of student moment hiding inside it.";
  const lines = getLineCoordinates(worlds);
  const guideTransform = hoveredWorld
    ? `translate(${hoveredWorld.position.x > 70 ? "-88%" : "18%"}, ${
        hoveredWorld.position.y < 30 ? "16%" : "-84%"
      })`
    : undefined;

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-3 shadow-[0_28px_90px_rgba(44,17,22,0.24)] backdrop-blur-md">
        <div className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3 pt-1 sm:px-3">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#ffe1a0]">
                Student Success Map
              </p>
              <p className="mt-2 font-[var(--font-sim-display)] text-[1.35rem] leading-none text-white sm:text-[1.6rem]">
                Pick a stop and explore.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/14 bg-white/10 px-3 py-2 text-sm font-bold text-white">
                {visibleCompletedCount}/{worlds.length} explored
              </div>
              <button
                type="button"
                onClick={() => setMapMinimized((current) => !current)}
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:border-[#ffc627] hover:text-[#ffc627]"
              >
                {mapMinimized ? "Expand" : "Minimize"}
              </button>
            </div>
          </div>

          {!mapMinimized ? (
            <div className="resource-map relative aspect-[9/14] overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#9b2348_0%,#7a2142_34%,#4e2135_100%)] sm:aspect-[4/5] lg:aspect-[16/10]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,198,39,0.32),transparent_20%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_24%_70%,rgba(20,184,166,0.16),transparent_24%),radial-gradient(circle_at_76%_82%,rgba(255,198,39,0.18),transparent_20%)]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%27280%27_height=%27280%27_viewBox=%270_0_280_280%27_fill=%27none%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath_d=%27M40_40C92_44_97_92_146_97C203_103_208_46_245_40%27_stroke=%27rgba(255,255,255,0.18)%27_stroke-width=%2712%27_stroke-linecap=%27round%27/%3E%3Cpath_d=%27M44_148C100_133_135_157_172_186C211_216_228_198_246_170%27_stroke=%27rgba(255,198,39,0.12)%27_stroke-width=%2714%27_stroke-linecap=%27round%27/%3E%3C/svg%3E')] opacity-55" />

                <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex justify-end sm:left-6 sm:right-6">
                  <div className="w-full max-w-[19rem] rounded-[1.35rem] border border-white/10 bg-[rgba(74,22,40,0.24)] px-4 py-3 text-[#fff3e8] backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <ProgressBar
                          value={completion}
                          current={visibleCompletedCount}
                          total={worlds.length}
                          label="Explored"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {hoveredWorld ? (
                  <div
                    style={
                      {
                        "--guide-x-mobile": `${hoveredWorld.position.mobileX ?? hoveredWorld.position.x}%`,
                        "--guide-y-mobile": `${hoveredWorld.position.mobileY ?? hoveredWorld.position.y}%`,
                        "--guide-x": `${hoveredWorld.position.x}%`,
                        "--guide-y": `${hoveredWorld.position.y}%`,
                        transform: guideTransform,
                      } as CSSProperties
                    }
                    className="resource-map-guide pointer-events-none absolute z-20"
                    aria-hidden="true"
                  >
                    <CharacterAvatar
                      expression={hoveredWorld.guideExpression}
                      size="md"
                      pulse
                      framed={false}
                    />
                  </div>
                ) : null}

                <svg
                  viewBox="0 0 100 100"
                  className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {lines.map((line) => (
                    <path
                      key={line.id}
                      d={`M ${line.x1} ${line.y1} C ${line.c1x} ${line.c1y}, ${line.c2x} ${line.c2y}, ${line.x2} ${line.y2}`}
                      fill="none"
                      stroke="rgba(255,244,214,0.48)"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      strokeDasharray="0.85 6"
                    />
                  ))}
                </svg>

                {worlds.map((world) => {
                  const state = progress.completedWorldIds.includes(world.id)
                    ? "completed"
                    : unlockedWorldIds.includes(world.id)
                      ? "available"
                      : "locked";

                  return (
                    <MapNode
                      key={world.id}
                      world={world}
                      state={state}
                      zooming={zoomingWorldId === world.id}
                      onOpen={() => onOpenWorld(world.id)}
                      onHover={(hovered) => onHoverWorld(hovered ? world.id : null)}
                    />
                  );
                })}

                <div
                  style={
                    {
                      left: `${MAP_END_WIDGET.position.mobileX ?? MAP_END_WIDGET.position.x}%`,
                      top: `${MAP_END_WIDGET.position.mobileY ?? MAP_END_WIDGET.position.y}%`,
                      "--node-x": `${MAP_END_WIDGET.position.x}%`,
                      "--node-y": `${MAP_END_WIDGET.position.y}%`,
                    } as CSSProperties
                  }
                  className="resource-map-node pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(118,72,93,0.85),rgba(82,50,68,0.88))] text-[2rem] text-white/90 shadow-[0_18px_48px_rgba(44,17,22,0.22)] backdrop-blur-sm md:h-24 md:w-24">
                    <span className="translate-y-[-0.08em] tracking-[0.08em]">{MAP_END_WIDGET.icon}</span>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="font-[var(--font-sim-display)] text-[1rem] leading-none text-white md:text-[1.08rem]">
                      {MAP_END_WIDGET.label}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 rounded-[1.6rem] border border-white/14 bg-white/10 p-4 backdrop-blur-md lg:hidden">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#ffe2ae]">
                    Hover teaser
                  </p>
                  <p className="mt-2 font-[var(--font-sim-display)] text-[1.25rem] leading-tight text-white">
                    {hoveredWorld?.title ?? "Tap a node"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7d7df]">{guideTeaser}</p>
                </div>
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-white/12 bg-[rgba(255,255,255,0.08)] px-4 py-5 text-sm leading-6 text-[#f7d7df]">
              Map minimized. Expand it whenever you want to jump back into the path.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
