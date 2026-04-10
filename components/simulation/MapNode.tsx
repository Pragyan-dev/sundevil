"use client";

import type { CSSProperties } from "react";

import type { ResourceWorld } from "@/lib/resource-discovery-types";

interface MapNodeProps {
  world: ResourceWorld;
  state: "locked" | "available" | "completed";
  zooming: boolean;
  onOpen: () => void;
  onHover: (hovered: boolean) => void;
}

export function MapNode({
  world,
  state,
  zooming,
  onOpen,
  onHover,
}: MapNodeProps) {
  const isLocked = state === "locked";
  const isCompleted = state === "completed";

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={onOpen}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      style={
        {
          left: `${world.position.mobileX ?? world.position.x}%`,
          top: `${world.position.mobileY ?? world.position.y}%`,
          "--node-x": `${world.position.x}%`,
          "--node-y": `${world.position.y}%`,
          "--node-from": world.accentFrom,
          "--node-to": world.accentTo,
        } as CSSProperties
      }
      className={`resource-map-node group absolute -translate-x-1/2 -translate-y-1/2 ${
        zooming ? "resource-map-node-zooming" : ""
      } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`relative flex h-20 w-20 items-center justify-center rounded-[2rem] border text-[2rem] shadow-[0_22px_54px_rgba(44,17,22,0.24)] transition duration-200 md:h-[6.6rem] md:w-[6.6rem] md:text-[2.15rem] ${
          isLocked
            ? "border-white/10 bg-[rgba(255,255,255,0.08)] text-white/45"
            : isCompleted
              ? "border-[rgba(255,246,223,0.85)] bg-[linear-gradient(180deg,var(--node-from),var(--node-to))] text-[#2c1116] resource-node-complete"
              : "border-[rgba(255,247,231,0.38)] bg-[linear-gradient(180deg,var(--node-from),var(--node-to))] text-[#2c1116] group-hover:-translate-y-1 group-hover:shadow-[0_28px_64px_rgba(44,17,22,0.26)]"
        }`}
      >
        <span className="drop-shadow-[0_2px_6px_rgba(255,255,255,0.24)]">{world.icon}</span>

        {isCompleted ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#18a34a] text-sm text-white shadow-[0_10px_22px_rgba(22,163,74,0.28)]">
            ✓
          </span>
        ) : null}

        {isLocked ? (
          <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/15 bg-[#5d4d57] text-sm text-white/80 shadow-lg">
            🔒
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-center">
        <div className="font-[var(--font-sim-display)] text-[0.95rem] leading-none text-white md:text-[1.1rem]">
          {world.mapLabel}
        </div>
      </div>
    </button>
  );
}
