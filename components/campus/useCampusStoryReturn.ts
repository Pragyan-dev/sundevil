"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  getCampusStoryReturnLabel,
  writeCampusStorySession,
  type CampusStoryLaunchContext,
} from "@/lib/campus-story-session";
import type { CampusQuest } from "@/lib/types";

export function useCampusStoryReturn(
  storyLaunch: CampusStoryLaunchContext | null | undefined,
  quests: CampusQuest[],
) {
  const router = useRouter();

  const storyReturnLabel = useMemo(
    () => (storyLaunch ? getCampusStoryReturnLabel(storyLaunch.resume) : null),
    [storyLaunch],
  );

  const returnToStory = useCallback(
    (forceFinished?: boolean) => {
      if (!storyLaunch) {
        return;
      }

      const completedQuestIds = quests
        .filter((quest) => quest.completed)
        .map((quest) => quest.id);

      writeCampusStorySession({
        sourceScreen: storyLaunch.resume,
        activeWorldId: storyLaunch.world,
        returnTo: storyLaunch.returnTo,
        returnRequested: true,
        campusFinished: forceFinished ?? completedQuestIds.length === quests.length,
        completedQuestIds,
        questCompletionCount: completedQuestIds.length,
      });

      router.push(storyLaunch.returnTo);
    },
    [quests, router, storyLaunch],
  );

  return {
    canReturnToStory: Boolean(storyLaunch),
    returnToStory,
    storyReturnLabel,
  };
}
