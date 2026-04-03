import alexStoryJson from "@/data/alex_story.json";

import type {
  AlexStoryData,
  BadgeDefinition,
  EndingDefinition,
  JumpInPreset,
  PersistedStoryState,
  StoryChoice,
  StoryEffect,
  StoryScene,
} from "@/lib/types";

const alexStory = alexStoryJson as AlexStoryData;

export const ALEX_STORY_STORAGE_KEY = "sundevilconnect-alex-story-v1";

export const storyDays = alexStory.days;
export const storyScenes = alexStory.scenes;
export const storyBadges = alexStory.badges;
export const storyEndings = [...alexStory.endings].sort(
  (left, right) => right.minConfidence - left.minConfidence,
);
export const storyJumpIns = alexStory.jumpIns;
export const storyStartSceneId = alexStory.startSceneId;
export const storySaveVersion = alexStory.saveVersion;

export const storySceneById = Object.fromEntries(
  storyScenes.map((scene) => [scene.id, scene]),
) as Record<string, StoryScene>;

export const storyBadgeById = Object.fromEntries(
  storyBadges.map((badge) => [badge.id, badge]),
) as Record<string, BadgeDefinition>;

export const storyJumpInBySlug = Object.fromEntries(
  storyJumpIns.map((preset) => [preset.slug, preset]),
) as Record<JumpInPreset["slug"], JumpInPreset>;

export function getScene(id: string) {
  return storySceneById[id];
}

export function getEndingForConfidence(confidence: number): EndingDefinition {
  return storyEndings.find((ending) => confidence >= ending.minConfidence) ?? storyEndings.at(-1)!;
}

export function createDefaultStoryState(): PersistedStoryState {
  const startScene = getScene(storyStartSceneId);

  return {
    saveVersion: storySaveVersion,
    currentDayId: startScene.dayId,
    currentSceneId: storyStartSceneId,
    confidence: 50,
    xp: 0,
    unlockedBadgeIds: [],
    choiceHistory: [],
    appliedSceneIds: [],
    endingId: null,
  };
}

export function createPreviewStoryState(preset: JumpInPreset): PersistedStoryState {
  const startScene = getScene(preset.startSceneId);

  return {
    saveVersion: storySaveVersion,
    currentDayId: startScene.dayId,
    currentSceneId: preset.startSceneId,
    confidence: preset.confidence,
    xp: preset.xp,
    unlockedBadgeIds: preset.unlockedBadgeIds,
    choiceHistory: [],
    appliedSceneIds: [],
    endingId: null,
  };
}

export function isValidPersistedStoryState(value: unknown): value is PersistedStoryState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<PersistedStoryState>;

  return (
    candidate.saveVersion === storySaveVersion &&
    typeof candidate.currentDayId === "string" &&
    typeof candidate.currentSceneId === "string" &&
    typeof candidate.confidence === "number" &&
    typeof candidate.xp === "number" &&
    Array.isArray(candidate.unlockedBadgeIds) &&
    Array.isArray(candidate.choiceHistory) &&
    Array.isArray(candidate.appliedSceneIds)
  );
}

export function clampConfidence(confidence: number) {
  return Math.max(0, Math.min(100, confidence));
}

export function mergeBadgeIds(existing: string[], incoming: string[] = []) {
  return Array.from(new Set([...existing, ...incoming]));
}

export function applyStoryEffect(
  state: PersistedStoryState,
  scene: StoryScene,
  effect: StoryEffect,
): PersistedStoryState {
  return {
    ...state,
    currentDayId: scene.dayId,
    confidence: clampConfidence(state.confidence + (effect.confidenceDelta ?? 0)),
    xp: state.xp + (effect.xpDelta ?? 0),
    unlockedBadgeIds: mergeBadgeIds(state.unlockedBadgeIds, effect.unlockBadgeIds),
    appliedSceneIds: [...state.appliedSceneIds, scene.id],
  };
}

export function sceneHasPendingEffect(state: PersistedStoryState, scene: StoryScene) {
  return Boolean(scene.effects) && !state.appliedSceneIds.includes(scene.id);
}

export function getChoiceById(scene: StoryScene, choiceId: string): StoryChoice | undefined {
  return scene.choices?.find((choice) => choice.id === choiceId);
}
