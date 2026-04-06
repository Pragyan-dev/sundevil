"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { CharacterAvatar } from "@/components/SketchCharacters";
import { SketchDialogBubble } from "@/components/sketch/SketchDialogBubble";
import { SketchNotation } from "@/components/SketchNotation";
import { useSoundEngine } from "@/components/sketch/SoundEngine";
import { SketchDialogSequence } from "@/components/sketch/SketchDialogSequence";
import MiniGameRouter from "@/components/sketch/minigames/MiniGameRouter";
import {
  ALEX_STORY_STORAGE_KEY,
  applyStoryEffect,
  createDefaultStoryState,
  createPreviewStoryState,
  getEndingForConfidence,
  getLineText,
  getOverlay,
  getReward,
  getRewardMilestoneForReward,
  getScene,
  isValidPersistedStoryState,
  markOverlaySeen,
  markRewardPopupSeen,
  resolveRewardUnlocks,
  sceneHasPendingEffect,
  storyArchetypeById,
  storyArchetypes,
  storyBadgeById,
  storyBadges,
  storyCharacterById,
  storyDays,
  storyJumpInBySlug,
  storyRewards,
} from "@/lib/alex-story";
import type {
  ArchetypeDefinition,
  ArchetypeId,
  ChoiceOption,
  DialogLine,
  JumpInSlug,
  PersistedStoryState,
  RewardDefinition,
  ResourceOverlayDefinition,
  SceneFrame,
} from "@/lib/types";

interface StoryGameProps {
  mode?: "main" | "preview";
  previewSlug?: JumpInSlug;
}

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function useFocusTrap(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = Array.from(node.querySelectorAll<HTMLElement>(focusableSelector));
    focusable[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      const items = Array.from(node.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (item) => !item.hasAttribute("disabled"),
      );

      if (!items.length) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [enabled, ref]);
}

function hasMeaningfulProgress(state: PersistedStoryState) {
  return (
    state.currentSceneId !== createDefaultStoryState().currentSceneId ||
    state.archetypeId !== null ||
    state.xp !== 0 ||
    state.pitchforks !== 0 ||
    state.confidence !== 50 ||
    state.choiceHistory.length > 0 ||
    state.unlockedBadgeIds.length > 0 ||
    state.unlockedRewardIds.length > 0
  );
}

function buildSceneState(current: PersistedStoryState, scene: SceneFrame) {
  let next: PersistedStoryState = {
    ...current,
    currentSceneId: scene.id,
    currentLineIndex: 0,
    currentDayId: scene.dayId,
    endingId: scene.type === "ending" ? getEndingForConfidence(current.confidence).id : null,
  };

  if (scene.type === "dialogue" && sceneHasPendingEffect(current, scene)) {
    next = applyStoryEffect(next, scene.id, scene.effects);
  }

  next.endingId = scene.type === "ending" ? getEndingForConfidence(next.confidence).id : null;
  return resolveRewardUnlocks(next, scene.id);
}

function DoodleStrip() {
  return (
    <div className="sim-ground-doodles" aria-hidden="true">
      <span>⌇</span>
      <span>✦</span>
      <span>⌇⌇</span>
      <span>◌</span>
      <span>⌇</span>
      <span>∿</span>
      <span>✳</span>
      <span>⌇</span>
      <span>◦</span>
      <span>⌇⌇</span>
    </div>
  );
}

function TitleScreen({
  scene,
  onStart,
}: {
  scene: Extract<SceneFrame, { type: "title" }>;
  onStart: () => void;
}) {
  return (
    <section className="sim-title-screen">
      <div className="sim-title-doodle sim-title-doodle-left">✦ ⌇ ☆</div>
      <div className="sim-title-doodle sim-title-doodle-right">⌇⌇ ☼ ∿</div>

      <p className="sim-title-kicker">hand-drawn first-week survival story</p>
      <h1 className="sim-title-mark">
        <SketchNotation type="underline" color="#FFC627" padding={10}>
          {scene.title}
        </SketchNotation>
      </h1>
      <p className="sim-title-subtitle">{scene.subtitle}</p>

      <div className="sim-preview-row">
        {scene.previewCharacterIds.map((characterId) => {
          const character = storyCharacterById[characterId];

          return (
            <article key={character.id} className="sim-preview-card">
              <div className="sim-preview-avatar">
                <CharacterAvatar characterId={character.id} size="small" />
              </div>
              <strong>{character.name}</strong>
              <span>{character.previewLabel}</span>
            </article>
          );
        })}
      </div>

      <button type="button" className="sim-action-button sim-action-button-gold" onClick={onStart}>
        {scene.startLabel}
      </button>
    </section>
  );
}

function ArchetypeCard({
  archetype,
  selected,
  onSelect,
}: {
  archetype: ArchetypeDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={`sim-archetype-card ${selected ? "sim-archetype-card-selected" : ""}`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="sim-archetype-art">
        <CharacterAvatar characterId="you" size="small" className={`sim-archetype-avatar sim-archetype-avatar-${archetype.id}`} />
      </div>
      <h3>
        <SketchNotation
          type="circle"
          color={selected || hovered ? "#FFC627" : "transparent"}
          padding={10}
          animate={selected || hovered}
          show={selected || hovered}
        >
          {archetype.title}
        </SketchNotation>
      </h3>
      <p>{archetype.description}</p>
      <span>Starting Confidence: {archetype.startingConfidence}%</span>
    </button>
  );
}

function CharacterSelectScreen({
  scene,
  selectedArchetypeId,
  onSelectArchetype,
  onBack,
  onNext,
}: {
  scene: Extract<SceneFrame, { type: "character-select" }>;
  selectedArchetypeId: ArchetypeId | null;
  onSelectArchetype: (archetypeId: ArchetypeId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="sim-select-screen">
      <div className="sim-select-header">
        <span>{scene.title}</span>
      </div>
      <p className="sim-select-copy">{scene.subtitle}</p>

      <div className="sim-archetype-grid">
        {storyArchetypes.map((archetype) => (
          <ArchetypeCard
            key={archetype.id}
            archetype={archetype}
            selected={selectedArchetypeId === archetype.id}
            onSelect={() => onSelectArchetype(archetype.id)}
          />
        ))}
      </div>

      <div className="sim-screen-actions">
        <button type="button" className="sim-action-button" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="sim-action-button sim-action-button-gold"
          onClick={onNext}
          disabled={!selectedArchetypeId}
        >
          Next
        </button>
      </div>
    </section>
  );
}

function BadgeDrawer({
  open,
  unlockedBadgeIds,
  onClose,
}: {
  open: boolean;
  unlockedBadgeIds: string[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  if (!open) {
    return null;
  }

  return (
    <div className="sim-modal-backdrop">
      <aside ref={ref} className="sim-badge-drawer">
        <div className="sim-badge-drawer-header">
          <div>
            <p className="sim-small-label">Badge tray</p>
            <h3>Every resource you surfaced this week</h3>
          </div>
          <button type="button" className="sim-icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sim-badge-drawer-grid">
          {storyBadges.map((badge) => {
            const unlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <article
                key={badge.id}
                className={`sim-badge-card ${unlocked ? "sim-badge-card-unlocked" : ""}`}
              >
                <div className="sim-badge-icon">{badge.shortLabel}</div>
                <strong>{badge.title}</strong>
                <p>{badge.description}</p>
                <Link href={badge.ctaHref} className="sim-text-link">
                  {badge.ctaLabel}
                </Link>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function BadgeUnlockModal({
  badgeId,
  onClose,
}: {
  badgeId: string | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, Boolean(badgeId));

  if (!badgeId) {
    return null;
  }

  const badge = storyBadgeById[badgeId];

  if (!badge) {
    return null;
  }

  return (
    <div className="sim-modal-backdrop">
      <div ref={ref} className="sim-badge-unlock-card">
        <div className="sim-badge-burst" aria-hidden="true">
          ✦ ✳ ! ✦
        </div>
        <div className="sim-badge-icon sim-badge-icon-large">{badge.shortLabel}</div>
        <p className="sim-small-label">BADGE UNLOCKED</p>
        <h3>{badge.title}</h3>
        <p>{badge.description}</p>
        <button type="button" className="sim-action-button sim-action-button-gold" onClick={onClose}>
          Nice!
        </button>
      </div>
    </div>
  );
}

function RewardCardLink({
  reward,
  className,
  children,
}: {
  reward: RewardDefinition;
  className: string;
  children: React.ReactNode;
}) {
  if (reward.external) {
    return (
      <a href={reward.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={reward.href} className={className}>
      {children}
    </Link>
  );
}

function RewardsDrawer({
  open,
  pitchforks,
  unlockedRewardIds,
  onClose,
}: {
  open: boolean;
  pitchforks: number;
  unlockedRewardIds: string[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  if (!open) {
    return null;
  }

  return (
    <div className="sim-modal-backdrop">
      <aside ref={ref} className="sim-rewards-drawer">
        <div className="sim-rewards-header">
          <div>
            <p className="sim-small-label">Rewards hub</p>
            <h3>Game day perks and official ASU links</h3>
          </div>
          <button type="button" className="sim-icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <section className="sim-pitchfork-balance">
          <div>
            <p className="sim-small-label">Pitchforks balance</p>
            <h4>{pitchforks} Pitchforks</h4>
          </div>
          <p>In-game Pitchforks are for this demo only and do not sync to your official Sun Devil Rewards balance.</p>
        </section>

        <section className="sim-reward-section">
          <div className="sim-reward-section-header">
            <p className="sim-small-label">Unlocked now</p>
            <span>{unlockedRewardIds.length}/{storyRewards.length}</span>
          </div>

          <div className="sim-reward-grid">
            {storyRewards.map((reward) => {
              const unlocked = unlockedRewardIds.includes(reward.id);

              return (
                <article
                  key={reward.id}
                  className={`sim-reward-card sim-reward-card-${reward.rewardKind} ${
                    unlocked ? "sim-reward-card-unlocked" : "sim-reward-card-locked"
                  }`}
                >
                  <div className="sim-reward-card-topline">
                    <span className="sim-reward-card-kind">
                      {reward.rewardKind === "ticket"
                        ? "Ticket"
                        : reward.rewardKind === "giveaway"
                          ? "Giveaway"
                          : "Pitchforks"}
                    </span>
                    <strong>{unlocked ? "Unlocked" : "Keep going"}</strong>
                  </div>
                  <h4>{reward.title}</h4>
                  <p>{reward.description}</p>
                  {unlocked ? (
                    <RewardCardLink reward={reward} className="sim-action-button sim-action-button-gold">
                      {reward.ctaLabel}
                    </RewardCardLink>
                  ) : (
                    <span className="sim-reward-card-locked-note">Earn more badges to reveal this card.</span>
                  )}
                  <p className="sim-disclaimer">{reward.disclaimer}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="sim-reward-section">
          <div className="sim-reward-section-header">
            <p className="sim-small-label">How to claim</p>
          </div>
          <div className="sim-reward-howto">
            <article className="sim-reward-howto-card">
              <strong>1. Use the official link</strong>
              <p>Each unlocked reward opens the real ASU page or official student channel tied to that perk.</p>
            </article>
            <article className="sim-reward-howto-card">
              <strong>2. Check event details</strong>
              <p>Tickets and giveaways change by game, and student eligibility may depend on current ASU policies.</p>
            </article>
            <article className="sim-reward-howto-card">
              <strong>3. Keep the game separate</strong>
              <p>In-game Pitchforks are motivational progress only. Real redemption lives in official ASU systems.</p>
            </article>
          </div>
        </section>

        <p className="sim-hub-footer">
          In-game Pitchforks are for this demo only and do not sync to your official Sun Devil Rewards balance.
        </p>
      </aside>
    </div>
  );
}

function RewardUnlockModal({
  rewardId,
  pitchforks,
  onClose,
}: {
  rewardId: string | null;
  pitchforks: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, Boolean(rewardId));

  if (!rewardId) {
    return null;
  }

  const reward = getReward(rewardId);
  const milestone = getRewardMilestoneForReward(rewardId);

  if (!reward || !milestone) {
    return null;
  }

  return (
    <div className="sim-modal-backdrop">
      <div ref={ref} className="sim-reward-popup-card">
        <p className="sim-small-label">REWARD UNLOCKED</p>
        <h3>{reward.title}</h3>
        <p>You unlocked a new official-style game day card.</p>
        <div className="sim-reward-popup-bonus">
          {milestone.pitchforkBonus > 0 ? (
            <strong>+{milestone.pitchforkBonus} Pitchforks</strong>
          ) : (
            <strong>{pitchforks} Pitchforks banked</strong>
          )}
        </div>
        <RewardCardLink reward={reward} className="sim-action-button sim-action-button-gold">
          {reward.ctaLabel}
        </RewardCardLink>
        <p className="sim-disclaimer">{reward.disclaimer}</p>
        <button type="button" className="sim-action-button" onClick={onClose}>
          Back to story
        </button>
      </div>
    </div>
  );
}

function ResourceOverlayModal({
  overlay,
  onClose,
}: {
  overlay: ResourceOverlayDefinition | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, Boolean(overlay));

  if (!overlay) {
    return null;
  }

  return (
    <div className="sim-modal-backdrop">
      <div ref={ref} className="sim-overlay-card">
        <div className="sim-overlay-header">
          <div>
            <p className="sim-small-label">Real-world overlay</p>
            <h3>{overlay.title}</h3>
            <p>{overlay.subtitle}</p>
          </div>
          <button type="button" className="sim-icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {overlay.videoSrc ? (
          <div className="sim-overlay-video-shell">
            <video controls muted playsInline preload="metadata" poster={overlay.videoPoster}>
              <source src={overlay.videoSrc} type={overlay.videoSrc.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
              {overlay.videoFallbackSrc ? (
                <source
                  src={overlay.videoFallbackSrc}
                  type={overlay.videoFallbackSrc.endsWith(".mov") ? "video/quicktime" : "video/mp4"}
                />
              ) : null}
            </video>
            {overlay.videoTitle || overlay.videoCaption ? (
              <div className="sim-overlay-video-caption">
                {overlay.videoTitle ? <strong>{overlay.videoTitle}</strong> : null}
                {overlay.videoCaption ? <p>{overlay.videoCaption}</p> : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="sim-overlay-description">{overlay.description}</p>

        <div className="sim-overlay-card-grid">
          {overlay.cards.map((card) => (
            <article key={card.title} className="sim-overlay-info-card">
              <p className="sim-small-label">{card.title}</p>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        {overlay.taskChecklist?.length ? (
          <div className="sim-task-list">
            {overlay.taskChecklist.map((task) => (
              <article key={task.title} className="sim-task-card">
                <strong>{task.title}</strong>
                <p>{task.detail}</p>
              </article>
            ))}
          </div>
        ) : null}

        <div className="sim-screen-actions">
          {overlay.ctaHref ? (
            overlay.ctaExternal ? (
              <a
                href={overlay.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sim-action-button"
              >
                {overlay.ctaLabel ?? "Open link"}
              </a>
            ) : (
              <Link href={overlay.ctaHref} className="sim-action-button">
                {overlay.ctaLabel ?? "Open link"}
              </Link>
            )
          ) : null}
          <button type="button" className="sim-action-button sim-action-button-gold" onClick={onClose}>
            Back to story
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumeDialog({
  onResume,
  onRestart,
}: {
  onResume: () => void;
  onRestart: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);

  return (
    <div className="sim-modal-backdrop">
      <div ref={ref} className="sim-resume-card">
        <p className="sim-small-label">Saved story found</p>
        <h3>Resume your sketchbook week?</h3>
        <p>You already started ASU Unlocked. Pick up where you left off or start over from the title screen.</p>
        <div className="sim-screen-actions">
          <button type="button" className="sim-action-button sim-action-button-gold" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="sim-action-button" onClick={onRestart}>
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  choice,
  onSelect,
}: {
  choice: ChoiceOption;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className="sim-choice-card"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <span className="sim-choice-icon">{choice.icon}</span>
      <div>
        <strong>
          <SketchNotation
            type="circle"
            color={hovered ? "#FFC627" : "transparent"}
            padding={8}
            show={hovered}
            animate={hovered}
          >
            {choice.label}
          </SketchNotation>
        </strong>
        <span>{choice.caption}</span>
      </div>
    </button>
  );
}

function EndingScene({
  state,
  onRestart,
}: {
  state: PersistedStoryState;
  onRestart: () => void;
}) {
  const ending = getEndingForConfidence(state.confidence);
  const archetype = state.archetypeId ? storyArchetypeById[state.archetypeId] : null;

  return (
    <section className="sim-ending-screen">
      <div className="sim-ending-character">
        <CharacterAvatar characterId="you" size="large" className={`sim-archetype-avatar-${state.archetypeId ?? "overwhelmed-one"}`} />
      </div>

      <div className="sim-ending-copy">
        <h2>{ending.title}</h2>
        <p>{ending.summary}</p>
        {archetype ? <span className="sim-ending-tag">{archetype.title}</span> : null}

        <div className="sim-ending-stats">
          <div>
            <span>Confidence</span>
            <strong>{state.confidence}%</strong>
          </div>
          <div>
            <span>XP</span>
            <strong>{state.xp}</strong>
          </div>
          <div>
            <span>Pitchforks</span>
            <strong>{state.pitchforks}</strong>
          </div>
          <div>
            <span>Badges</span>
            <strong>
              {state.unlockedBadgeIds.length}/{storyBadges.length}
            </strong>
          </div>
        </div>

        <div className="sim-ending-badges">
          {storyBadges.map((badge) => (
            <Link
              key={badge.id}
              href={badge.ctaHref}
              className={`sim-ending-badge ${
                state.unlockedBadgeIds.includes(badge.id) ? "sim-ending-badge-unlocked" : ""
              }`}
            >
              <span>{badge.shortLabel}</span>
            </Link>
          ))}
        </div>

        <button type="button" className="sim-action-button sim-action-button-gold" onClick={onRestart}>
          Play Again
        </button>
        <p className="sim-ending-note">
          Every resource mentioned in this game is real. Tap any badge to learn more.
        </p>
      </div>
    </section>
  );
}

export function StoryGame({ mode = "main", previewSlug }: StoryGameProps) {
  const previewPreset = previewSlug ? storyJumpInBySlug[previewSlug] : undefined;
  const previewMode = mode === "preview" && Boolean(previewPreset);
  const sound = useSoundEngine();

  const [storyState, setStoryState] = useState<PersistedStoryState>(() =>
    previewPreset ? createPreviewStoryState(previewPreset) : createDefaultStoryState(),
  );
  const [resumeCandidate, setResumeCandidate] = useState<PersistedStoryState | null>(null);
  const [isReady, setIsReady] = useState(previewMode);
  const [storageReady, setStorageReady] = useState(previewMode);
  const [badgeDrawerOpen, setBadgeDrawerOpen] = useState(false);
  const [rewardDrawerOpen, setRewardDrawerOpen] = useState(false);
  const [badgeModalId, setBadgeModalId] = useState<string | null>(null);
  const [rewardModalId, setRewardModalId] = useState<string | null>(null);
  const [overlayId, setOverlayId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [phase, setPhase] = useState<"dialog" | "minigame" | "reflect">("dialog");

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioAbortRef = useRef<AbortController | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const unlockedBadgeCountRef = useRef(storyState.unlockedBadgeIds.length);

  const currentScene = getScene(storyState.currentSceneId);
  const currentDay = storyDays.find((day) => day.id === storyState.currentDayId) ?? storyDays[0];
  const currentDialogue =
    currentScene?.type === "dialogue" ? currentScene.lines[storyState.currentLineIndex] : null;
  const currentOverlay = overlayId ? getOverlay(overlayId) : null;
  const activeSpeakerId =
    currentScene?.type === "choice"
      ? currentScene.prompt.speakerId
      : currentDialogue?.speakerId ?? "you";
  const activeSpeaker = storyCharacterById[activeSpeakerId];
  const ending = currentScene?.type === "ending" ? getEndingForConfidence(storyState.confidence) : null;
  const previewTitle = previewPreset?.title;
  const dialogLines = useMemo<DialogLine[]>(
    () =>
      currentScene?.type === "dialogue"
        ? currentScene.lines.map((line) => ({
            id: line.id,
            speaker: storyCharacterById[line.speakerId].name,
            speakerType: line.speakerId,
            text: getLineText(line, storyState.archetypeId),
            isThought: line.bubbleType === "thought",
            overlayId: line.overlayId,
            annotation: line.annotation,
          }))
        : [],
    [currentScene, storyState.archetypeId],
  );

  const navigateToScene = useCallback((nextSceneId: string, choiceId?: string) => {
    const nextScene = getScene(nextSceneId);

    if (!nextScene) {
      return;
    }

    setOverlayId(null);
    setRewardDrawerOpen(false);
    setSettingsOpen(false);
    setPhase("dialog");
    if (!isMuted) {
      sound.whoosh();
    }
    setStoryState((current) =>
      buildSceneState(
        {
          ...current,
          choiceHistory: choiceId ? [...current.choiceHistory, choiceId] : current.choiceHistory,
        },
        nextScene,
      ),
    );
  }, [isMuted, sound]);

  const playCurrentLineAudio = useCallback(async () => {
    if (!currentScene || currentScene.type !== "dialogue" || !currentDialogue || !storyState.archetypeId) {
      return;
    }

    const cacheKey = `${currentScene.id}:${currentDialogue.id}:${storyState.archetypeId}`;
    const cachedUrl = audioCacheRef.current.get(cacheKey);

    audioAbortRef.current?.abort();
    activeAudioRef.current?.pause();

    if (cachedUrl) {
      const audio = new Audio(cachedUrl);
      audio.volume = 1;
      activeAudioRef.current = audio;
      await audio.play().catch(() => undefined);
      return;
    }

    const controller = new AbortController();
    audioAbortRef.current = controller;

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sceneId: currentScene.id,
          lineId: currentDialogue.id,
          archetypeId: storyState.archetypeId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setTtsAvailable(false);
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      audioCacheRef.current.set(cacheKey, objectUrl);
      const audio = new Audio(objectUrl);
      activeAudioRef.current = audio;
      await audio.play().catch(() => undefined);
    } catch {
      setTtsAvailable(false);
    }
  }, [currentDialogue, currentScene, storyState.archetypeId]);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const rawState = window.localStorage.getItem(ALEX_STORY_STORAGE_KEY);

      if (!rawState) {
        setStorageReady(true);
        setIsReady(true);
        unlockedBadgeCountRef.current = storyState.unlockedBadgeIds.length;
        return;
      }

      try {
        const parsed = JSON.parse(rawState) as unknown;

        if (!isValidPersistedStoryState(parsed) || !getScene(parsed.currentSceneId)) {
          window.localStorage.removeItem(ALEX_STORY_STORAGE_KEY);
          setStorageReady(true);
          setIsReady(true);
          return;
        }

        if (hasMeaningfulProgress(parsed)) {
          setResumeCandidate(parsed);
          setStorageReady(false);
        } else {
          setStorageReady(true);
        }
      } catch {
        window.localStorage.removeItem(ALEX_STORY_STORAGE_KEY);
        setStorageReady(true);
      }

      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [previewMode, storyState.unlockedBadgeIds.length]);

  useEffect(() => {
    if (previewMode || !isReady || !storageReady) {
      return;
    }

    window.localStorage.setItem(ALEX_STORY_STORAGE_KEY, JSON.stringify(storyState));
  }, [isReady, previewMode, storageReady, storyState]);

  useEffect(() => {
    if (storyState.unlockedBadgeIds.length > unlockedBadgeCountRef.current) {
      const newestBadge = storyState.unlockedBadgeIds.at(-1);
      if (newestBadge) {
        const frameId = window.requestAnimationFrame(() => {
          if (!isMuted) {
            sound.chime();
          }
          setBadgeModalId(newestBadge);
        });
        unlockedBadgeCountRef.current = storyState.unlockedBadgeIds.length;
        return () => window.cancelAnimationFrame(frameId);
      }
    }

    unlockedBadgeCountRef.current = storyState.unlockedBadgeIds.length;
  }, [isMuted, sound, storyState.unlockedBadgeIds]);

  useEffect(() => {
    if (badgeModalId || rewardModalId) {
      return;
    }

    const unseenRewardId = storyState.unlockedRewardIds.find(
      (rewardId) => !storyState.seenRewardPopupIds.includes(rewardId),
    );

    if (!unseenRewardId) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setRewardModalId(unseenRewardId);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [badgeModalId, rewardModalId, storyState.seenRewardPopupIds, storyState.unlockedRewardIds]);

  useEffect(() => {
    if (currentScene?.type !== "day-transition" || overlayId || badgeModalId || rewardModalId || resumeCandidate) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (currentScene.nextSceneId) {
        navigateToScene(currentScene.nextSceneId);
      }
    }, currentScene.autoAdvanceMs ?? 2000);

    return () => window.clearTimeout(timeoutId);
  }, [badgeModalId, currentScene, navigateToScene, overlayId, resumeCandidate, rewardModalId]);

  useEffect(() => {
    const cachedAudio = audioCacheRef.current;

    return () => {
      audioAbortRef.current?.abort();
      activeAudioRef.current?.pause();
      cachedAudio.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const currentLineKey = useMemo(() => {
    if (currentScene?.type !== "dialogue" || !currentDialogue || !storyState.archetypeId) {
      return null;
    }

    return `${currentScene.id}:${currentDialogue.id}:${storyState.archetypeId}`;
  }, [currentDialogue, currentScene, storyState.archetypeId]);

  useEffect(() => {
    if (
      !ttsAvailable ||
      isMuted ||
      phase !== "dialog" ||
      !currentLineKey ||
      !storyState.archetypeId ||
      currentScene?.type !== "dialogue" ||
      currentDialogue?.bubbleType !== "speech"
    ) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      void playCurrentLineAudio();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    currentDialogue,
    currentLineKey,
    currentScene,
    phase,
    isMuted,
    playCurrentLineAudio,
    storyState.archetypeId,
    ttsAvailable,
  ]);

  function handleContinue() {
    void sound.prime();

    if (!currentScene) {
      return;
    }

    if (currentScene.type === "title") {
      navigateToScene(currentScene.nextSceneId);
      return;
    }

    if (currentScene.type === "day-transition") {
      navigateToScene(currentScene.nextSceneId);
    }
  }

  function handleArchetypeSelect(archetypeId: ArchetypeId) {
    void sound.prime();
    const archetype = storyArchetypeById[archetypeId];

    setStoryState((current) => ({
      ...current,
      archetypeId,
      confidence: archetype.startingConfidence,
    }));
  }

  function handleBeginStory() {
    void sound.prime();
    const currentSceneValue = currentScene;
    if (!currentSceneValue || currentSceneValue.type !== "character-select" || !storyState.archetypeId) {
      return;
    }

    navigateToScene(currentSceneValue.nextSceneId);
  }

  function handleChoice(choice: ChoiceOption) {
    void sound.prime();
    if (!isMuted) {
      sound.pop();
    }
    navigateToScene(choice.resultSceneId, choice.id);
  }

  function handleRestart() {
    const nextState = previewPreset ? createPreviewStoryState(previewPreset) : createDefaultStoryState();

    if (!previewMode) {
      window.localStorage.removeItem(ALEX_STORY_STORAGE_KEY);
      setResumeCandidate(null);
      setStorageReady(true);
    }

    setOverlayId(null);
    setBadgeModalId(null);
    setRewardModalId(null);
    setBadgeDrawerOpen(false);
    setRewardDrawerOpen(false);
    setSettingsOpen(false);
    unlockedBadgeCountRef.current = nextState.unlockedBadgeIds.length;
    setStoryState(nextState);
  }

  function handleResume() {
    if (!resumeCandidate) {
      return;
    }

    unlockedBadgeCountRef.current = resumeCandidate.unlockedBadgeIds.length;
    setStoryState(resumeCandidate);
    setResumeCandidate(null);
    setStorageReady(true);
  }

  function openOverlay(overlayIdValue: string) {
    void sound.prime();
    setOverlayId(overlayIdValue);
    setStoryState((current) => markOverlaySeen(current, overlayIdValue));
  }

  function handleDialogLineChange(index: number) {
    setStoryState((current) => ({
      ...current,
      currentLineIndex: index,
    }));
  }

  function handleDialogSequenceComplete() {
    if (!currentScene || currentScene.type !== "dialogue") {
      return;
    }

    if (currentScene.miniGameType) {
      setPhase("minigame");
      return;
    }

    if (currentScene.nextSceneId) {
      navigateToScene(currentScene.nextSceneId);
    }
  }

  function handleMiniGameComplete() {
    if (!currentScene || currentScene.type !== "dialogue") {
      return;
    }

    void sound.prime();
    if (!isMuted) {
      sound.chime();
    }

    setPhase("reflect");

    if (currentScene.nextSceneId) {
      navigateToScene(currentScene.nextSceneId);
    }
  }

  function handleRewardClose() {
    if (!rewardModalId) {
      return;
    }

    setStoryState((current) => markRewardPopupSeen(current, rewardModalId));
    setRewardModalId(null);
  }

  if (!currentScene) {
    return null;
  }

  const confidenceWidth = `${storyState.confidence}%`;

  return (
    <div className="story-shell">
      <div className="sim-paper-noise" />

      {resumeCandidate && !previewMode ? (
        <ResumeDialog onResume={handleResume} onRestart={handleRestart} />
      ) : null}

      <BadgeUnlockModal badgeId={badgeModalId} onClose={() => setBadgeModalId(null)} />
      <RewardUnlockModal rewardId={rewardModalId} pitchforks={storyState.pitchforks} onClose={handleRewardClose} />
      <ResourceOverlayModal overlay={currentOverlay} onClose={() => setOverlayId(null)} />
      <RewardsDrawer
        open={rewardDrawerOpen}
        pitchforks={storyState.pitchforks}
        unlockedRewardIds={storyState.unlockedRewardIds}
        onClose={() => setRewardDrawerOpen(false)}
      />
      <BadgeDrawer
        open={badgeDrawerOpen}
        unlockedBadgeIds={storyState.unlockedBadgeIds}
        onClose={() => setBadgeDrawerOpen(false)}
      />

      {currentScene.type === "title" ? (
        <TitleScreen scene={currentScene} onStart={handleContinue} />
      ) : currentScene.type === "character-select" ? (
        <CharacterSelectScreen
          scene={currentScene}
          selectedArchetypeId={storyState.archetypeId}
          onSelectArchetype={handleArchetypeSelect}
          onBack={() => navigateToScene(currentScene.backSceneId)}
          onNext={handleBeginStory}
        />
      ) : currentScene.type === "day-transition" ? (
        <section className="sim-day-transition" onClick={handleContinue}>
          <SketchNotation type="box" color="#1a1a1a" padding={14}>
            <span className="sim-day-transition-mark">{currentScene.title}</span>
          </SketchNotation>
          <p>{currentScene.subtitle}</p>
        </section>
      ) : currentScene.type === "ending" && ending ? (
        <EndingScene state={storyState} onRestart={handleRestart} />
      ) : (
        <div className="sim-stage">
          <header className="sim-hud">
            <div className="sim-hud-top">
              <div>
                <p className="sim-small-label">ASU UNLOCKED</p>
                <h1>ASU UNLOCKED</h1>
              </div>

              <div className="sim-hud-actions">
                <button type="button" className="sim-hud-pill" onClick={() => setRewardDrawerOpen(true)}>
                  🎟 Rewards
                </button>
                <span className="sim-hud-pill">🔱 {storyState.pitchforks}</span>
                <button type="button" className="sim-hud-pill" onClick={() => setBadgeDrawerOpen(true)}>
                  🏅 {storyState.unlockedBadgeIds.length}/{storyBadges.length}
                </button>
                <span className="sim-hud-pill">⚡ XP: {storyState.xp}</span>
                <button type="button" className="sim-hud-pill" onClick={() => setSettingsOpen((current) => !current)}>
                  ⚙
                </button>
              </div>
            </div>

            <div className="sim-confidence-shell">
              <div className="sim-confidence-meta">
                <span>Confidence</span>
                <strong>{storyState.confidence}%</strong>
              </div>
              <div className="sim-confidence-track">
                <span className="sim-confidence-fill" style={{ width: confidenceWidth }} />
              </div>
            </div>

            {settingsOpen ? (
              <div className="sim-settings-panel">
                <button type="button" className="sim-settings-button" onClick={() => setIsMuted((current) => !current)}>
                  {isMuted ? "Unmute audio" : "Mute audio"}
                </button>
                <button
                  type="button"
                  className="sim-settings-button"
                  onClick={() => {
                    if (!isMuted && ttsAvailable) {
                      void playCurrentLineAudio();
                    }
                  }}
                  disabled={!ttsAvailable || !currentDialogue}
                >
                  Replay line
                </button>
                <button type="button" className="sim-settings-button" onClick={handleRestart}>
                  Restart story
                </button>
                {!ttsAvailable ? <span className="sim-settings-note">TTS unavailable</span> : null}
              </div>
            ) : null}

            {previewMode && previewTitle ? (
              <div className="sim-preview-note">
                <strong>{previewTitle}</strong>
                <span>{previewPreset?.recap}</span>
              </div>
            ) : null}
          </header>

          <div key={`${currentScene.id}:${phase}`} className="sim-scene-grid">
            {currentScene.type === "dialogue" && phase === "dialog" ? (
              <SketchDialogSequence
                lines={dialogLines}
                initialLineIndex={storyState.currentLineIndex}
                onLineIndexChange={handleDialogLineChange}
                onSequenceComplete={handleDialogSequenceComplete}
                onSpeakerChange={() => {
                  if (!isMuted) {
                    sound.whoosh();
                  }
                }}
                onTypingComplete={() => {
                  if (!isMuted) {
                    sound.pop();
                  }
                }}
                onInteract={() => {
                  void sound.prime();
                }}
                locationLabel={currentScene.locationLabel}
                finalButtonLabel={currentScene.continueLabel}
                getSecondaryAction={(line) =>
                  line.overlayId
                    ? {
                        label: currentScene.overlayPromptLabel ?? "Open overlay",
                        onClick: () => openOverlay(line.overlayId!),
                      }
                    : null
                }
                archetypeClassName={
                  storyState.archetypeId ? `sim-archetype-avatar-${storyState.archetypeId}` : undefined
                }
              />
            ) : null}

            {currentScene.type === "dialogue" && phase === "minigame" && currentScene.miniGameType ? (
              <MiniGameRouter
                type={currentScene.miniGameType}
                onComplete={handleMiniGameComplete}
                sound={sound}
                onInteract={() => {
                  void sound.prime();
                }}
              />
            ) : null}

            {currentScene.type === "choice" ? (
              <>
                <div className="sim-character-column">
                  <div className="sim-avatar-wrap">
                    <CharacterAvatar
                      characterId={activeSpeaker.id}
                      size="large"
                      className={
                        activeSpeaker.id === "you" && storyState.archetypeId
                          ? `sim-archetype-avatar-${storyState.archetypeId}`
                          : undefined
                      }
                    />
                  </div>
                  <div className="sim-character-shadow" />
                </div>

                <div className="sim-dialogue-column">
                  <article className="sim-choice-panel">
                    <SketchDialogBubble
                      text={getLineText(currentScene.prompt, storyState.archetypeId)}
                      speakerName={activeSpeaker.name}
                      speakerType={activeSpeaker.id}
                      isThought={currentScene.prompt.bubbleType === "thought"}
                      onComplete={() => undefined}
                      instantReveal
                      showContinueButton={false}
                      onInteract={() => {
                        void sound.prime();
                      }}
                      locationLabel={currentScene.locationLabel}
                      secondaryActionLabel={currentScene.prompt.overlayId ? "Open overlay" : undefined}
                      onSecondaryAction={
                        currentScene.prompt.overlayId
                          ? () => {
                              openOverlay(currentScene.prompt.overlayId!);
                            }
                          : undefined
                      }
                      annotation={currentScene.prompt.annotation}
                    />

                    <div className="sim-choice-stack">
                      {currentScene.choices.map((choice) => (
                        <ChoiceCard key={choice.id} choice={choice} onSelect={() => handleChoice(choice)} />
                      ))}
                    </div>
                  </article>
                </div>
              </>
            ) : null}
          </div>

          <div className="sim-ground-line" />
          <DoodleStrip />
          <div className="sim-day-label">
            <strong>{currentDay.label}</strong>
            <span>{currentDay.title}</span>
          </div>
        </div>
      )}
    </div>
  );
}
