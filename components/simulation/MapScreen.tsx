"use client";

import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import { MapNode } from "@/components/simulation/MapNode";
import { ProgressBar } from "@/components/simulation/ProgressBar";
import { resourceDiscoveryWorldOrder } from "@/data/resource-discovery-worlds";
import type {
  MascotExpression,
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
  return resourceDiscoveryWorldOrder
    .map((worldId) => worlds.find((world) => world.id === worldId))
    .filter((world): world is ResourceWorld => Boolean(world))
    .slice(0, -1)
    .map((world, index) => {
      const next = resourceDiscoveryWorldOrder
        .map((worldId) => worlds.find((entry) => entry.id === worldId))
        .filter((entry): entry is ResourceWorld => Boolean(entry))[index + 1];

      if (!next) {
        return null;
      }

      return {
        id: `${world.id}-${next.id}`,
        x1: world.position.x,
        y1: world.position.y,
        x2: next.position.x,
        y2: next.position.y,
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
  const completion = Math.round((progress.completedWorldIds.length / worlds.length) * 100);
  const hoveredWorld = hoveredWorldId
    ? worlds.find((world) => world.id === hoveredWorldId) ?? null
    : null;
  const guideExpression: MascotExpression = hoveredWorld?.guideExpression ?? "happy";
  const guideLine =
    hoveredWorld?.guideLine ??
    "Pick a node. I will turn the scary version of the resource into the usable version.";
  const guideTeaser =
    hoveredWorld?.teaser ??
    "Hover a building to see the kind of student moment hiding inside it.";
  const lines = getLineCoordinates(worlds);

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

      <ProgressBar
        value={completion}
        current={progress.completedWorldIds.length}
        total={worlds.length}
        label="Explored"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-3 shadow-[0_28px_90px_rgba(44,17,22,0.22)] backdrop-blur-md">
          <div className="resource-map relative aspect-[9/14] overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,#8f2148_0%,#70203f_35%,#442336_100%)] sm:aspect-[4/5] lg:aspect-[16/10]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,198,39,0.32),transparent_20%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_24%_70%,rgba(20,184,166,0.16),transparent_24%),radial-gradient(circle_at_76%_82%,rgba(255,198,39,0.18),transparent_20%)]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%27280%27_height=%27280%27_viewBox=%270_0_280_280%27_fill=%27none%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath_d=%27M40_40C92_44_97_92_146_97C203_103_208_46_245_40%27_stroke=%27rgba(255,255,255,0.18)%27_stroke-width=%2712%27_stroke-linecap=%27round%27/%3E%3Cpath_d=%27M44_148C100_133_135_157_172_186C211_216_228_198_246_170%27_stroke=%27rgba(255,198,39,0.12)%27_stroke-width=%2714%27_stroke-linecap=%27round%27/%3E%3C/svg%3E')] opacity-55" />

            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {lines.map((line) => (
                <path
                  key={line.id}
                  d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1 - 6}, ${(line.x1 + line.x2) / 2} ${line.y2 + 6}, ${line.x2} ${line.y2}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="5 5"
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
        </section>

        <aside className="grid gap-4">
          <section className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-5 text-[#2c1116] shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
            <div className="flex items-center gap-4">
              <CharacterAvatar expression={guideExpression} size="lg" pulse />
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Mascot guide
                </p>
                <p className="mt-1 font-[var(--font-sim-display)] text-[1.45rem] leading-none">
                  {hoveredWorld?.title ?? "Campus map"}
                </p>
              </div>
            </div>

            <p className="mt-4 font-[var(--font-sim-display)] text-[1.45rem] leading-[1.02]">
              {guideLine}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">{guideTeaser}</p>
          </section>

          <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#ffe2ae]">
              Node states
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-[#ffc627]" />
                Available: ready to play
              </div>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-[#16a34a]" />
                Completed: finished and glowing
              </div>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-white/30" />
                Locked: clear the earlier path first
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
