import type { ResourceWorldId } from "@/lib/resource-discovery-types";

export const CAMPUS_STORY_SESSION_KEY = "campus-story-handoff-v1";

export type CampusStoryResumeMode = "resource-map" | "week-sim";

export interface CampusStoryLaunchContext {
  entry: "explore-asu";
  returnTo: string;
  resume: CampusStoryResumeMode;
  world: ResourceWorldId;
}

export interface CampusStorySession {
  sourceScreen: CampusStoryResumeMode;
  activeWorldId: ResourceWorldId;
  returnTo: string;
  returnRequested: boolean;
  campusFinished: boolean;
  completedQuestIds: string[];
  questCompletionCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCampusStoryResumeMode(value: string): value is CampusStoryResumeMode {
  return value === "resource-map" || value === "week-sim";
}

export function normalizeCampusStoryLaunchContext(input: {
  entry?: string | null;
  returnTo?: string | null;
  resume?: string | null;
  world?: string | null;
}): CampusStoryLaunchContext | null {
  if (
    input.entry !== "explore-asu" ||
    !input.returnTo ||
    !input.resume ||
    !isCampusStoryResumeMode(input.resume)
  ) {
    return null;
  }

  const world = (input.world ?? "explore-asu") as ResourceWorldId;

  return {
    entry: "explore-asu",
    returnTo: input.returnTo,
    resume: input.resume,
    world,
  };
}

export function getCampusStoryReturnLabel(resume: CampusStoryResumeMode) {
  return resume === "week-sim" ? "Back to week simulator" : "Back to first-week story";
}

export function readCampusStorySession(): CampusStorySession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(CAMPUS_STORY_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      !isCampusStoryResumeMode(String(parsed.sourceScreen)) ||
      typeof parsed.activeWorldId !== "string" ||
      typeof parsed.returnTo !== "string" ||
      typeof parsed.returnRequested !== "boolean" ||
      typeof parsed.campusFinished !== "boolean" ||
      !Array.isArray(parsed.completedQuestIds) ||
      typeof parsed.questCompletionCount !== "number"
    ) {
      return null;
    }

    return {
      sourceScreen: parsed.sourceScreen as CampusStoryResumeMode,
      activeWorldId: parsed.activeWorldId as ResourceWorldId,
      returnTo: parsed.returnTo,
      returnRequested: parsed.returnRequested,
      campusFinished: parsed.campusFinished,
      completedQuestIds: parsed.completedQuestIds.filter(
        (value): value is string => typeof value === "string",
      ),
      questCompletionCount: parsed.questCompletionCount,
    };
  } catch {
    return null;
  }
}

export function writeCampusStorySession(session: CampusStorySession) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CAMPUS_STORY_SESSION_KEY, JSON.stringify(session));
}

export function clearCampusStorySession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CAMPUS_STORY_SESSION_KEY);
}
