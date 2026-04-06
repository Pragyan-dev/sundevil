"use client";

import { useMemo, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const slots = Array.from({ length: 20 }, (_, index) => 8 + index * 0.5);

const fixedBlocks = [
  { id: "python", label: "Python", day: "Mon", start: 2, duration: 2, kind: "fixed" },
  { id: "math", label: "Math", day: "Tue", start: 6, duration: 2, kind: "fixed" },
  { id: "chem", label: "Chem", day: "Thu", start: 8, duration: 2, kind: "fixed" },
  { id: "lunch", label: "Lunch", day: "Wed", start: 8, duration: 2, kind: "fixed" },
  { id: "work", label: "Work shift", day: "Fri", start: 10, duration: 4, kind: "fixed" },
] as const;

const resources = [
  { id: "tutoring", label: "Tutoring", duration: 2 },
  { id: "office-hours", label: "Office Hours", duration: 1 },
  { id: "study-group", label: "Study Group", duration: 2 },
  { id: "advising", label: "Advising Visit", duration: 1 },
] as const;

type Placement = {
  id: string;
  label: string;
  day: (typeof days)[number];
  start: number;
  duration: number;
  kind: "resource";
};

function formatTime(slot: number) {
  const hours = Math.floor(slot);
  const minutes = slot % 1 === 0 ? "00" : "30";
  const suffix = hours >= 12 ? "pm" : "am";
  const normalized = hours > 12 ? hours - 12 : hours;
  return `${normalized}:${minutes}${suffix}`;
}

export default function ScheduleBuilder({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);

  const placedCount = placements.length;
  const done = placedCount >= 2;

  const occupiedLookup = useMemo(() => {
    const map = new Map<string, string>();

    [...fixedBlocks, ...placements].forEach((block) => {
      for (let slotIndex = 0; slotIndex < block.duration; slotIndex += 1) {
        map.set(`${block.day}-${block.start + slotIndex}`, block.id);
      }
    });

    return map;
  }, [placements]);

  function placeResource(day: (typeof days)[number], start: number) {
    onInteract?.();

    const resource = resources.find((entry) => entry.id === activeResourceId);
    if (!resource) return;

    const available = Array.from({ length: resource.duration }, (_, index) =>
      !occupiedLookup.has(`${day}-${start + index}`),
    ).every(Boolean);

    if (!available) {
      sound.wrong();
      return;
    }

      sound.correct();
      setPlacements((current) => {
        const filtered = current.filter((entry) => entry.id !== resource.id);
        return [...filtered, { ...resource, day, start, kind: "resource" }];
      });
    setActiveResourceId(null);
  }

  function getBlockAt(day: (typeof days)[number], slotIndex: number) {
    return [...fixedBlocks, ...placements].find(
      (block) => block.day === day && slotIndex >= block.start && slotIndex < block.start + block.duration,
    );
  }

  return (
    <MiniGameShell
      title="SCHEDULE BUILDER"
      instructions="Place at least two support blocks into real gaps and prove they fit in a normal week."
      icon="🗓️"
      completed={done}
      onComplete={onComplete}
    >
      <div className="sketch-schedule-layout">
        <div className="sketch-schedule-palette">
          <article className="sketch-schedule-helper-card">
            <p className="sketch-mini-eyebrow">Current move</p>
            <strong>
              {activeResourceId
                ? `Place ${resources.find((resource) => resource.id === activeResourceId)?.label}.`
                : "Pick a support block, then tap an open slot."}
            </strong>
            <span>
              {done
                ? "You proved at least two support blocks fit into a normal week."
                : "This is meant to make the time cost visible, not perfect."}
            </span>
          </article>

          {resources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              draggable
              className={`sketch-resource-block ${activeResourceId === resource.id ? "is-active" : ""}`}
              onClick={() => {
                onInteract?.();
                setActiveResourceId(resource.id);
              }}
              onDragStart={() => {
                onInteract?.();
                setActiveResourceId(resource.id);
              }}
            >
              <strong>{resource.label}</strong>
              <span>{resource.duration === 1 ? "30 min" : "45-60 min"}</span>
            </button>
          ))}

          <div className="sketch-results-card">
            <strong>{placedCount}/2 support blocks placed</strong>
            <p>On mobile, tap a block first, then tap an open slot to drop it there.</p>
          </div>
        </div>

        <div className="sketch-schedule-board">
          <div className="sketch-schedule-board-intro">
            <p className="sketch-mini-eyebrow">Week map</p>
            <strong>Classes and work are fixed. Support blocks go in the open gaps.</strong>
          </div>
          <div className="sketch-schedule-header">
            <span />
            {days.map((day) => (
              <strong key={day}>{day}</strong>
            ))}
          </div>

          {slots.map((slot, slotIndex) => (
            <div key={slot} className="sketch-schedule-row">
              <span className="sketch-schedule-time">{formatTime(slot)}</span>
              {days.map((day) => {
                const block = getBlockAt(day, slotIndex);
                const isBlockStart = block && block.start === slotIndex;

                return (
                  <button
                    key={`${day}-${slot}`}
                    type="button"
                    className={`sketch-schedule-cell ${
                      block ? (block.kind === "fixed" ? "is-fixed" : "is-resource") : ""
                    }`}
                    onClick={() => placeResource(day, slotIndex)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => placeResource(day, slotIndex)}
                  >
                    {isBlockStart ? (
                      <span style={{ gridRow: `span ${block.duration}` }}>{block.label}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {done ? (
        <div className="sketch-results-card">
          <p>
            Look at that. Tutoring is 45 minutes. Office hours is short. The only thing stopping you was not knowing how it could fit.
          </p>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
