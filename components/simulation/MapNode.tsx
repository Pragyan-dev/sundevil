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
        className={`relative flex h-24 w-24 items-center justify-center rounded-[2rem] border text-3xl shadow-[0_18px_48px_rgba(44,17,22,0.2)] transition duration-200 md:h-28 md:w-28 ${
          isLocked
            ? "border-white/12 bg-white/10 text-white/45"
            : isCompleted
              ? "border-[#fff2c9] bg-[linear-gradient(135deg,var(--node-from),var(--node-to))] text-[#2c1116] resource-node-complete"
              : "border-white/30 bg-[linear-gradient(135deg,var(--node-from),var(--node-to))] text-[#2c1116] group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(44,17,22,0.24)]"
        }`}
      >
        <span className="drop-shadow-[0_2px_6px_rgba(255,255,255,0.24)]">{world.icon}</span>

        {isCompleted ? (
          <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#16a34a] text-sm text-white shadow-lg">
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
        <div className="font-[var(--font-sim-display)] text-[1rem] leading-none text-white md:text-[1.08rem]">
          {world.mapLabel}
        </div>
      </div>
    </button>
  );
}
