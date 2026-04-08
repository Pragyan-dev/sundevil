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
  onOpenBadges: () => void;
}

function getLineCoordinates(worlds: ResourceWorld[]) {
  const orderedWorlds = resourceDiscoveryWorldOrder
    .map((worldId) => worlds.find((world) => world.id === worldId))
    .filter((world): world is ResourceWorld => Boolean(world));

  return orderedWorlds
    .slice(0, -1)
    .map((world, index) => {
      const next = orderedWorlds[index + 1];
      if (!next) {
        return null;
      }

      const dx = next.position.x - world.position.x;
      const dy = next.position.y - world.position.y;
      const bend = Math.max(4, Math.min(10, Math.abs(dx) * 0.18 + Math.abs(dy) * 0.12));

      if (world.id === "tutoring" && next.id === "explore-asu") {
        return {
          id: `${world.id}-${next.id}`,
          x1: world.position.x,
          y1: world.position.y,
          x2: next.position.x,
          y2: next.position.y,
          c1x: world.position.x + 5.5,
          c1y: world.position.y + 6.5,
          c2x: next.position.x - 5.5,
          c2y: next.position.y - 8.5,
        };
      }

      return {
        id: `${world.id}-${next.id}`,
        x1: world.position.x,
        y1: world.position.y,
        x2: next.position.x,
        y2: next.position.y,
        c1x: world.position.x + dx * 0.35,
        c1y: world.position.y + dy * 0.08 - bend,
        c2x: next.position.x - dx * 0.35,
        c2y: next.position.y - dy * 0.08 + bend,
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));
}

export function MapScreen({
  worlds,
  progress,
  unlockedWorldIds,
  hoveredWorldId,
  zoomingWorldId,
  onOpenWorld,
  onHoverWorld,
  onOpenBadges,
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-[#ffe1a0]">
            Resource World Map
          </p>
          <h1 className="mt-3 font-[var(--font-sim-display)] text-[clamp(2.6rem,6vw,5rem)] leading-[0.88] text-white">
            Explore campus support like a game world.
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-[#f7d7df]">
            Follow the path, tap a location, and drop into a short chat simulation about when that
            resource actually matters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenBadges}
            className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
          >
            Badges {progress.earnedBadgeIds.length}
          </button>
          <div className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
            🔱 {progress.points} points
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-3 shadow-[0_28px_90px_rgba(44,17,22,0.22)] backdrop-blur-md">
          <div className="rounded-[1.8rem] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <ProgressBar
                  value={completion}
                  current={visibleCompletedCount}
                  total={worlds.length}
                  label="Explored"
                />
              </div>
              <button
                type="button"
                onClick={() => setMapMinimized((current) => !current)}
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white transition hover:border-[#ffc627] hover:text-[#ffc627]"
              >
                {mapMinimized ? "Expand map" : "Minimize map"}
              </button>
            </div>

            {!mapMinimized ? (
              <div className="resource-map relative mt-4 aspect-[9/14] overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,#8f2148_0%,#70203f_35%,#442336_100%)] sm:aspect-[4/5] lg:aspect-[16/10]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,198,39,0.32),transparent_20%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_24%_70%,rgba(20,184,166,0.16),transparent_24%),radial-gradient(circle_at_76%_82%,rgba(255,198,39,0.18),transparent_20%)]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%27280%27_height=%27280%27_viewBox=%270_0_280_280%27_fill=%27none%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath_d=%27M40_40C92_44_97_92_146_97C203_103_208_46_245_40%27_stroke=%27rgba(255,255,255,0.18)%27_stroke-width=%2712%27_stroke-linecap=%27round%27/%3E%3Cpath_d=%27M44_148C100_133_135_157_172_186C211_216_228_198_246_170%27_stroke=%27rgba(255,198,39,0.12)%27_stroke-width=%2714%27_stroke-linecap=%27round%27/%3E%3C/svg%3E')] opacity-55" />

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
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeDasharray="0.8 6.2"
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
              <div className="mt-4 rounded-[1.6rem] border border-white/12 bg-[rgba(255,255,255,0.08)] px-4 py-5 text-sm leading-6 text-[#f7d7df]">
                Map minimized. Expand it whenever you want to jump back into the path.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
