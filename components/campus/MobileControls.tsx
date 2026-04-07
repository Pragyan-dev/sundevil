"use client";

import type { PointerEvent } from "react";

import type { CampusDirection } from "@/lib/types";

export default function MobileControls({
  disabled = false,
  onDirectionChange,
  onInteract,
}: {
  disabled?: boolean;
  onDirectionChange: (direction: CampusDirection | null) => void;
  onInteract: () => void;
}) {
  function bindDirection(direction: CampusDirection) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (disabled) {
          return;
        }

        onDirectionChange(direction);
      },
      onPointerUp: () => onDirectionChange(null),
      onPointerCancel: () => onDirectionChange(null),
      onPointerLeave: () => onDirectionChange(null),
    };
  }

  return (
    <div className="campus-mobile-controls" aria-hidden={false}>
      <div className="campus-dpad">
        <div />
        <button type="button" className="campus-control-button" aria-label="Move up" {...bindDirection("up")}>
          ▲
        </button>
        <div />

        <button type="button" className="campus-control-button" aria-label="Move left" {...bindDirection("left")}>
          ◀
        </button>
        <div className="campus-control-center">walk</div>
        <button type="button" className="campus-control-button" aria-label="Move right" {...bindDirection("right")}>
          ▶
        </button>

        <div />
        <button type="button" className="campus-control-button" aria-label="Move down" {...bindDirection("down")}>
          ▼
        </button>
        <div />
      </div>

      <button
        type="button"
        className="campus-interact-button"
        disabled={disabled}
        onClick={onInteract}
      >
        ✋ Enter
      </button>
    </div>
  );
}
