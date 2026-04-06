"use client";

import type { ComponentType } from "react";

import type { MiniGameType } from "@/lib/types";
import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import BudgetSplitter from "@/components/sketch/minigames/BudgetSplitter";
import CampusJargonMatch from "@/components/sketch/minigames/CampusJargonMatch";
import DarsExplorer from "@/components/sketch/minigames/DarsExplorer";
import ResourceMatchQuiz from "@/components/sketch/minigames/ResourceMatchQuiz";
import ScholarshipFinder from "@/components/sketch/minigames/ScholarshipFinder";
import ScheduleBuilder from "@/components/sketch/minigames/ScheduleBuilder";

const GAMES: Record<
  MiniGameType,
  ComponentType<{ onComplete: () => void; sound: SoundEngineControls; onInteract?: () => void }>
> = {
  "resource-match": ResourceMatchQuiz,
  "jargon-match": CampusJargonMatch,
  "dars-explorer": DarsExplorer,
  "budget-splitter": BudgetSplitter,
  "scholarship-finder": ScholarshipFinder,
  "schedule-builder": ScheduleBuilder,
};

export default function MiniGameRouter({
  type,
  onComplete,
  sound,
  onInteract,
}: {
  type: MiniGameType;
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const Game = GAMES[type];
  return <Game onComplete={onComplete} sound={sound} onInteract={onInteract} />;
}
