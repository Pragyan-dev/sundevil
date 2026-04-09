"use client";

import { useMemo, useState } from "react";

import {
  buildingProgressLabel,
  getBuildingById,
  getQuestCompletion,
} from "@/components/campus/CampusRenderer";
import type { CampusMapData, CampusQuest } from "@/lib/types";

export function createInitialCampusQuests(map: CampusMapData): CampusQuest[] {
  return map.quests.map((quest) => ({ ...quest, completed: false }));
}

export function useCampusQuestState(map: CampusMapData) {
  const [quests, setQuests] = useState<CampusQuest[]>(() => createInitialCampusQuests(map));
  const [discoveredBuildings, setDiscoveredBuildings] = useState<string[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const currentQuest =
    quests.find(
      (quest) =>
        !quest.completed &&
        (!quest.requires ||
          quest.requires.every(
            (requirement) => quests.find((item) => item.id === requirement)?.completed,
          )),
    ) ?? null;
  const currentQuestBuilding = currentQuest ? getBuildingById(map, currentQuest.buildingId) : null;
  const coreQuestsComplete = quests
    .filter((quest) => quest.id !== "q5")
    .every((quest) => quest.completed);
  const progress = useMemo(
    () => buildingProgressLabel(map.buildings, discoveredBuildings),
    [discoveredBuildings, map.buildings],
  );
  const questCompletion = useMemo(() => getQuestCompletion(quests), [quests]);

  function resetQuestState() {
    setQuests(createInitialCampusQuests(map));
    setDiscoveredBuildings([]);
    setSummaryOpen(false);
  }

  function markBuildingDiscovered(buildingId: string) {
    setDiscoveredBuildings((previous) =>
      previous.includes(buildingId) ? previous : [...previous, buildingId],
    );
  }

  function closeSummary() {
    setSummaryOpen(false);
  }

  function completeInteraction(buildingId: string) {
    let finishedJourney = false;
    const completedMap = new Map(quests.map((quest) => [quest.id, Boolean(quest.completed)]));
    const nextQuests = quests.map((quest) => {
      const prereqsMet =
        !quest.requires || quest.requires.every((requirement) => completedMap.get(requirement));

      if (quest.completed || quest.buildingId !== buildingId || !prereqsMet) {
        return quest;
      }

      completedMap.set(quest.id, true);

      if (quest.id === "q5") {
        finishedJourney = true;
      }

      return { ...quest, completed: true };
    });

    setQuests(nextQuests);

    if (finishedJourney) {
      setSummaryOpen(true);
    }
  }

  return {
    closeSummary,
    completeInteraction,
    coreQuestsComplete,
    currentQuest,
    currentQuestBuilding,
    discoveredBuildings,
    markBuildingDiscovered,
    progress,
    questCompletion,
    quests,
    resetQuestState,
    setSummaryOpen,
    summaryOpen,
  };
}
