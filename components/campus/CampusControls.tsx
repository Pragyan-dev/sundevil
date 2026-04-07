"use client";

import { useEffect, useRef } from "react";

interface CampusKeyboardControlsOptions {
  disabled?: boolean;
  onInteract: () => void;
  onPrime?: () => void;
}

export const CAMPUS_KEYMAP = {
  ArrowUp: { dx: 0, dy: -1, dir: "up" },
  ArrowDown: { dx: 0, dy: 1, dir: "down" },
  ArrowLeft: { dx: -1, dy: 0, dir: "left" },
  ArrowRight: { dx: 1, dy: 0, dir: "right" },
  w: { dx: 0, dy: -1, dir: "up" },
  s: { dx: 0, dy: 1, dir: "down" },
  a: { dx: -1, dy: 0, dir: "left" },
  d: { dx: 1, dy: 0, dir: "right" },
} as const;

export function useCampusKeyboardControls({
  disabled = false,
  onInteract,
  onPrime,
}: CampusKeyboardControlsOptions) {
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const activeKeys = pressedKeys.current;

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === "Enter" || key === "e" || key === "E") {
        event.preventDefault();

        if (!disabled && !event.repeat) {
          onPrime?.();
          onInteract();
        }

        return;
      }

      if (!(key in CAMPUS_KEYMAP)) {
        return;
      }

      event.preventDefault();
      onPrime?.();

      if (disabled) {
        return;
      }

      activeKeys.add(key);
    }

    function handleKeyUp(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      activeKeys.delete(key);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      activeKeys.clear();
    };
  }, [disabled, onInteract, onPrime]);

  return pressedKeys;
}
