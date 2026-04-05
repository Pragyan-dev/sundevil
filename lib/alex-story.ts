import asuUnlockedStory from "@/data/asu_unlocked_story";

import type {
  ArchetypeDefinition,
  CharacterDefinition,
  DialogueScene,
  EndingDefinition,
  JumpInPreset,
  PersistedStoryState,
  ResourceOverlayDefinition,
  SceneFrame,
  StoryEffect,
  StoryLine,
} from "@/lib/types";

const storyData = asuUnlockedStory;

export const ALEX_STORY_STORAGE_KEY = "sundevilconnect-asu-unlocked-v1";

export const storyDays = storyData.days;
export const storyArchetypes = storyData.archetypes;
export const storyCharacters = storyData.characters;
export const storyBadges = storyData.badges;
export const storyOverlays = storyData.overlays;
export const storyEndings = [...storyData.endings].sort(
  (left, right) => right.minConfidence - left.minConfidence,
);
export const storyScenes = storyData.scenes;
export const storyJumpIns = storyData.jumpIns;
export const storyStartSceneId = storyData.startSceneId;
export const storyTitleSceneId = storyData.titleSceneId;
export const storyCharacterSelectSceneId = storyData.characterSelectSceneId;
export const storySaveVersion = storyData.saveVersion;

export const storySceneById = Object.fromEntries(
  storyScenes.map((scene) => [scene.id, scene]),
) as Record<string, SceneFrame>;

export const storyBadgeById = Object.fromEntries(
  storyBadges.map((badge) => [badge.id, badge]),
);

export const storyOverlayById = Object.fromEntries(
  storyOverlays.map((overlay) => [overlay.id, overlay]),
) as Record<string, ResourceOverlayDefinition>;

export const storyCharacterById = Object.fromEntries(
  storyCharacters.map((character) => [character.id, character]),
) as Record<string, CharacterDefinition>;

export const storyArchetypeById = Object.fromEntries(
  storyArchetypes.map((archetype) => [archetype.id, archetype]),
) as Record<string, ArchetypeDefinition>;

export const storyJumpInBySlug = Object.fromEntries(
  storyJumpIns.map((preset) => [preset.slug, preset]),
) as Record<JumpInPreset["slug"], JumpInPreset>;

export function getScene(id: string) {
  return storySceneById[id];
}

export function getDialogueScene(id: string) {
  const scene = getScene(id);
  return scene?.type === "dialogue" ? scene : undefined;
}

export function getOverlay(id: string) {
  return storyOverlayById[id];
}

export function getEndingForConfidence(confidence: number): EndingDefinition {
  return storyEndings.find((ending) => confidence >= ending.minConfidence) ?? storyEndings.at(-1)!;
}

export function getLineText(line: StoryLine, archetypeId: PersistedStoryState["archetypeId"]) {
  if (archetypeId && line.archetypeText?.[archetypeId]) {
    return line.archetypeText[archetypeId]!;
  }

  return line.text;
}

export function getLineById(
  sceneId: string,
  lineId: string,
): { scene: DialogueScene; line: StoryLine } | null {
  const scene = getDialogueScene(sceneId);

  if (!scene) {
    return null;
  }

  const line = scene.lines.find((entry) => entry.id === lineId);
  return line ? { scene, line } : null;
}

export function createDefaultStoryState(): PersistedStoryState {
  const startScene = getScene(storyTitleSceneId);

  return {
    saveVersion: storySaveVersion,
    archetypeId: null,
    currentSceneId: storyTitleSceneId,
    currentLineIndex: 0,
    currentDayId: startScene.dayId,
    confidence: 50,
    xp: 0,
    unlockedBadgeIds: [],
    seenOverlayIds: [],
    choiceHistory: [],
    appliedSceneIds: [],
    endingId: null,
  };
}

export function createPreviewStoryState(preset: JumpInPreset): PersistedStoryState {
  const startScene = getScene(preset.startSceneId);

  return {
    saveVersion: storySaveVersion,
    archetypeId: preset.archetypeId,
    currentSceneId: preset.startSceneId,
    currentLineIndex: 0,
    currentDayId: startScene.dayId,
    confidence: preset.confidence,
    xp: preset.xp,
    unlockedBadgeIds: preset.unlockedBadgeIds,
    seenOverlayIds: preset.seenOverlayIds,
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
    (candidate.archetypeId === null || typeof candidate.archetypeId === "string") &&
    typeof candidate.currentSceneId === "string" &&
    typeof candidate.currentLineIndex === "number" &&
    typeof candidate.currentDayId === "string" &&
    typeof candidate.confidence === "number" &&
    typeof candidate.xp === "number" &&
    Array.isArray(candidate.unlockedBadgeIds) &&
    Array.isArray(candidate.seenOverlayIds) &&
    Array.isArray(candidate.choiceHistory) &&
    Array.isArray(candidate.appliedSceneIds)
  );
}

export function clampConfidence(confidence: number) {
  return Math.max(0, Math.min(100, confidence));
}

function mergeIds(existing: string[], incoming: string[] = []) {
  return Array.from(new Set([...existing, ...incoming]));
}

export function applyStoryEffect(
  state: PersistedStoryState,
  sceneId: string,
  effect: StoryEffect | undefined,
): PersistedStoryState {
  if (!effect || state.appliedSceneIds.includes(sceneId)) {
    return state;
  }

  return {
    ...state,
    confidence: clampConfidence(state.confidence + (effect.confidenceDelta ?? 0)),
    xp: state.xp + (effect.xpDelta ?? 0),
    unlockedBadgeIds: mergeIds(state.unlockedBadgeIds, effect.unlockBadgeIds),
    appliedSceneIds: [...state.appliedSceneIds, sceneId],
  };
}

export function sceneHasPendingEffect(state: PersistedStoryState, scene: SceneFrame) {
  return "effects" in scene && Boolean(scene.effects) && !state.appliedSceneIds.includes(scene.id);
}

export function markOverlaySeen(state: PersistedStoryState, overlayId: string): PersistedStoryState {
  return {
    ...state,
    seenOverlayIds: mergeIds(state.seenOverlayIds, [overlayId]),
  };
}
