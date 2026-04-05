"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { ScholarshipMatcher } from "@/components/ScholarshipMatcher";
import {
  ALEX_STORY_STORAGE_KEY,
  applyStoryEffect,
  createDefaultStoryState,
  createPreviewStoryState,
  getEndingForConfidence,
  getScene,
  isValidPersistedStoryState,
  sceneHasPendingEffect,
  storyBadgeById,
  storyBadges,
  storyDays,
  storyJumpInBySlug,
} from "@/lib/alex-story";
import type {
  BadgeDefinition,
  JumpInSlug,
  PersistedStoryState,
  StoryChoice,
  StoryScene,
} from "@/lib/types";

const dayById = Object.fromEntries(storyDays.map((day) => [day.id, day]));

const backdropLabels: Record<string, string> = {
  "campus-arrival": "Tempe arrival",
  "python-classroom": "Python lecture",
  "math-classroom": "Math classroom",
  "chemistry-classroom": "Chemistry lecture",
  "advising-center": "Academic advising",
  "canvas-night": "Canvas and syllabi",
  "office-hours-room": "Office hours",
  "myasu-dashboard": "MyASU dashboard",
  "dorm-night": "Late-night reset",
  "phone-glow": "Phone and schedule",
  "campus-walk": "Between classes",
  inbox: "Email draft",
  sunrise: "Week one wrap",
};

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
const initialStoryState = createDefaultStoryState();

interface StoryGameProps {
  mode?: "main" | "preview";
  previewSlug?: JumpInSlug;
}

function useFocusTrap(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const container = ref.current;
    const previousActive = document.activeElement as HTMLElement | null;

    function getFocusableElements() {
      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
      );
    }

    const focusable = getFocusableElements();
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      const nodes = getFocusableElements();

      if (!nodes.length) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousActive?.focus();
    };
  }, [enabled, ref]);
}

function hasMeaningfulProgress(state: PersistedStoryState) {
  return (
    state.currentSceneId !== initialStoryState.currentSceneId ||
    state.confidence !== 50 ||
    state.xp !== 0 ||
    state.unlockedBadgeIds.length > 0 ||
    state.choiceHistory.length > 0 ||
    state.appliedSceneIds.length > 0
  );
}

function buildNextState(current: PersistedStoryState, nextSceneId: string) {
  const nextScene = getScene(nextSceneId);

  if (!nextScene) {
    return current;
  }

  let nextState: PersistedStoryState = {
    ...current,
    currentDayId: nextScene.dayId,
    currentSceneId: nextScene.id,
    endingId: null,
  };

  if (
    nextScene.kind !== "resource" &&
    nextScene.effects &&
    !nextState.appliedSceneIds.includes(nextScene.id)
  ) {
    nextState = applyStoryEffect(nextState, nextScene, nextScene.effects);
  }

  return {
    ...nextState,
    endingId: nextScene.kind === "ending" ? getEndingForConfidence(nextState.confidence).id : null,
  };
}

function StoryLink({
  href,
  label,
  external = false,
  className,
}: {
  href: string;
  label: string;
  external?: boolean;
  className?: string;
}) {
  const classes = className ?? "button-secondary";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}

function getVideoMimeType(src: string) {
  if (src.endsWith(".mov")) {
    return "video/quicktime";
  }

  if (src.endsWith(".webm")) {
    return "video/webm";
  }

  return "video/mp4";
}

function SceneIllustration({
  scene,
  confidence,
}: {
  scene: StoryScene;
  confidence: number;
}) {
  const sceneFacts = [
    scene.courseLabel,
    scene.buildingLabel ? `Building: ${scene.buildingLabel}` : null,
    scene.roomLabel ? `Room: ${scene.roomLabel}` : null,
  ].filter(Boolean) as string[];

  return (
    <section className="story-visual-panel">
      <div className="story-visual-meta">
        <div>
          <p className="story-overline">{backdropLabels[scene.backdrop] ?? "Your first week"}</p>
          <h2 className="story-visual-title">{scene.location}</h2>
        </div>
        <div className="story-visual-score">
          <span>Campus Confidence</span>
          <strong>{confidence}%</strong>
        </div>
      </div>

      <div className="story-illustration-card">
        {scene.videoSrc ? (
          <div className="story-media-card">
            <div className="story-video-shell">
              <video
                className="story-scene-video"
                controls
                muted
                playsInline
                preload="metadata"
                poster={scene.videoPoster}
              >
                <source src={scene.videoSrc} type={getVideoMimeType(scene.videoSrc)} />
                {scene.videoFallbackSrc ? (
                  <source
                    src={scene.videoFallbackSrc}
                    type={getVideoMimeType(scene.videoFallbackSrc)}
                  />
                ) : null}
                Your browser does not support inline video previews.
              </video>
            </div>

            <div className="story-media-caption">
              <p className="story-overline">Video preview</p>
              <h3>{scene.videoTitle ?? scene.title}</h3>
              {scene.videoCaption ? <p>{scene.videoCaption}</p> : null}
            </div>
          </div>
        ) : (
          <div className="story-illustration-frame">
            <div className="story-illustration-topline" />
            <div className="story-illustration-grid">
              <div className="story-illustration-panel story-illustration-panel-wide" />
              <div className="story-illustration-panel story-illustration-panel-accent" />
              <div className="story-illustration-panel" />
              <div className="story-illustration-panel story-illustration-panel-deep" />
            </div>
            <div className="story-illustration-orb story-illustration-orb-gold" />
            <div className="story-illustration-orb story-illustration-orb-maroon" />
            <div className="story-illustration-caption">
              <p>{scene.title}</p>
              <span>{scene.kind === "resource" ? "Support scene" : "Story scene"}</span>
            </div>
          </div>
        )}
      </div>

      {sceneFacts.length ? (
        <div className="story-fact-row">
          {sceneFacts.map((fact) => (
            <span key={fact} className="story-fact-pill">
              {fact}
            </span>
          ))}
        </div>
      ) : null}

      {scene.routeSteps?.length ? (
        <div className="story-route-card">
          <p className="story-overline">How To Find It</p>
          <ol>
            {scene.routeSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function ResourceSceneBody({ scene }: { scene: StoryScene }) {
  const badge = scene.badgeId ? storyBadgeById[scene.badgeId] : null;

  return (
    <div className="story-resource-stack">
      {badge ? (
        <div className="story-badge-callout">
          <span className="story-badge-callout-label">Milestone reward</span>
          <strong>{badge.title}</strong>
          <p>Finish this scene to unlock it in your milestone tray.</p>
        </div>
      ) : null}

      {scene.cards?.length ? (
        <div className="story-info-grid">
          {scene.cards.map((card) => (
            <article key={card.title} className="story-info-card">
              <p className="story-overline">{card.title}</p>
              <p className="story-info-card-body">{card.body}</p>
            </article>
          ))}
        </div>
      ) : null}

      {scene.emailMock ? (
        <div className="story-mock-card">
          <p className="story-overline">What the email looks like</p>
          <div className="story-email-block">
            <p>
              <strong>Subject:</strong> {scene.emailMock.subject}
            </p>
            <p>
              <strong>From:</strong> {scene.emailMock.from}
            </p>
            <p>
              <strong>To:</strong> {scene.emailMock.to}
            </p>
            <p className="story-email-body">{scene.emailMock.body}</p>
          </div>
          {scene.emailMock.replySubject && scene.emailMock.replyFrom && scene.emailMock.replyBody ? (
            <div className="story-email-block story-email-block-reply">
              <p>
                <strong>Subject:</strong> {scene.emailMock.replySubject}
              </p>
              <p>
                <strong>From:</strong> {scene.emailMock.replyFrom}
              </p>
              <p className="story-email-body">{scene.emailMock.replyBody}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {scene.messageMock ? (
        <div className="story-mock-card">
          <p className="story-overline">Message preview</p>
          <div className="story-message-block">
            <p className="story-message-sender">{scene.messageMock.sender}</p>
            <h3>{scene.messageMock.title}</h3>
            <p>{scene.messageMock.body}</p>
          </div>
        </div>
      ) : null}

      {scene.taskChecklist?.length ? (
        <div className="story-task-card">
          <p className="story-overline">Priority Tasks</p>
          <div className="story-task-grid">
            {scene.taskChecklist.map((item) => (
              <article key={item.title} className="story-task-item">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {scene.bullets?.length ? (
        <ul className="story-bullet-list">
          {scene.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      {scene.embedScholarshipChecker ? (
        <div className="story-scholarship-overlay">
          <ScholarshipMatcher variant="overlay" />
        </div>
      ) : null}
    </div>
  );
}

function EndingScene({
  state,
  onRestart,
  previewMode,
}: {
  state: PersistedStoryState;
  onRestart: () => void;
  previewMode: boolean;
}) {
  const ending = getEndingForConfidence(state.confidence);
  const unlockedBadges = storyBadges.filter((badge) => state.unlockedBadgeIds.includes(badge.id));
  const missedBadges = storyBadges.filter((badge) => !state.unlockedBadgeIds.includes(badge.id));

  return (
    <div className="story-ending-stack">
      <div className="story-ending-hero">
        <p className="story-overline">Week-One Result</p>
        <h3>{ending.title}</h3>
        <p>{ending.summary}</p>
      </div>

      <div className="story-ending-stats">
        <div className="story-ending-stat">
          <span>Campus Confidence</span>
          <strong>{state.confidence}%</strong>
        </div>
        <div className="story-ending-stat">
          <span>Momentum</span>
          <strong>{state.xp}</strong>
        </div>
        <div className="story-ending-stat">
          <span>Milestones unlocked</span>
          <strong>{unlockedBadges.length}</strong>
        </div>
      </div>

      <div className="story-ending-section">
        <p className="story-overline">Milestones You Hit This Week</p>
        {unlockedBadges.length ? (
          <div className="story-badge-grid">
            {unlockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} unlocked />
            ))}
          </div>
        ) : (
          <div className="story-muted-card">
            You did not unlock any first-week milestones this time. The doors are still open.
          </div>
        )}
      </div>

      <div className="story-ending-section">
        <p className="story-overline">
          {ending.id === "adjusting" ? "These are still here for you" : "Milestones still waiting"}
        </p>
        <p className="story-ending-copy">
          {ending.id === "adjusting"
            ? "Nothing here closed because the week was hard. These support moves are still available whenever you want to try them."
            : "These next steps are still available if you want to make week two feel easier than week one did."}
        </p>
        <div className="story-badge-grid">
          {missedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} unlocked={false} />
          ))}
        </div>
      </div>

      <div className="story-ending-actions">
        <button type="button" onClick={onRestart} className="button-gold">
          {previewMode ? "Replay this preview" : "Restart your first week"}
        </button>
        {previewMode ? (
          <Link href="/simulate" className="button-secondary">
            Play the full story
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function BadgeCard({
  badge,
  unlocked,
}: {
  badge: BadgeDefinition;
  unlocked: boolean;
}) {
  return (
    <article className={`story-badge-card ${unlocked ? "story-badge-card-unlocked" : ""}`}>
      <div>
        <p className="story-overline">{unlocked ? "Unlocked this week" : "Still available"}</p>
        <h4>{badge.title}</h4>
        <p>{badge.description}</p>
      </div>
      <StoryLink
        href={badge.ctaHref}
        label={badge.ctaLabel}
        external={badge.ctaExternal}
        className={unlocked ? "button-secondary" : "button-primary"}
      />
    </article>
  );
}

export function StoryGame({ mode = "main", previewSlug }: StoryGameProps) {
  const previewPreset = previewSlug ? storyJumpInBySlug[previewSlug] : undefined;
  const previewMode = mode === "preview" && Boolean(previewPreset);

  const [storyState, setStoryState] = useState<PersistedStoryState>(() => {
    if (previewPreset) {
      return createPreviewStoryState(previewPreset);
    }

    return createDefaultStoryState();
  });
  const [isReady, setIsReady] = useState(previewMode);
  const [storageReady, setStorageReady] = useState(previewMode);
  const [resumeCandidate, setResumeCandidate] = useState<PersistedStoryState | null>(null);
  const [badgeTrayOpen, setBadgeTrayOpen] = useState(false);
  const [recentBadgeId, setRecentBadgeId] = useState<string | null>(null);

  const badgeTrayRef = useRef<HTMLDivElement>(null);
  const resumeDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(badgeTrayRef, badgeTrayOpen);
  useFocusTrap(resumeDialogRef, Boolean(resumeCandidate));

  const currentScene = getScene(storyState.currentSceneId);
  const currentDay = currentScene ? dayById[currentScene.dayId] : undefined;
  const currentDayIndex = currentDay
    ? storyDays.findIndex((day) => day.id === currentDay.id)
    : 0;
  const unlockedBadges = storyBadges.filter((badge) => storyState.unlockedBadgeIds.includes(badge.id));

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const rawState = window.localStorage.getItem(ALEX_STORY_STORAGE_KEY);

      if (!rawState) {
        setStoryState(createDefaultStoryState());
        setStorageReady(true);
        setIsReady(true);
        return;
      }

      try {
        const parsed = JSON.parse(rawState) as unknown;

        if (!isValidPersistedStoryState(parsed) || !getScene(parsed.currentSceneId)) {
          window.localStorage.removeItem(ALEX_STORY_STORAGE_KEY);
          setStoryState(createDefaultStoryState());
          setStorageReady(true);
          setIsReady(true);
          return;
        }

        if (hasMeaningfulProgress(parsed)) {
          setResumeCandidate(parsed);
          setStorageReady(false);
        } else {
          setStoryState(createDefaultStoryState());
          setStorageReady(true);
        }
      } catch {
        window.localStorage.removeItem(ALEX_STORY_STORAGE_KEY);
        setStoryState(createDefaultStoryState());
        setStorageReady(true);
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [previewMode]);

  useEffect(() => {
    if (!recentBadgeId) {
      return;
    }

    const timeoutId = window.setTimeout(() => setRecentBadgeId(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [recentBadgeId]);

  useEffect(() => {
    if (previewMode || !isReady || !storageReady) {
      return;
    }

    window.localStorage.setItem(ALEX_STORY_STORAGE_KEY, JSON.stringify(storyState));
  }, [isReady, previewMode, storageReady, storyState]);

  useEffect(() => {
    if (!badgeTrayOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBadgeTrayOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [badgeTrayOpen]);

  function handleChoice(choice: StoryChoice) {
    setBadgeTrayOpen(false);
    setStoryState((current) =>
      buildNextState(
        { ...current, choiceHistory: [...current.choiceHistory, choice.id] },
        choice.resultSceneId,
      ),
    );
  }

  function handleContinue() {
    if (!currentScene?.nextSceneId) {
      return;
    }

    if (
      currentScene.kind === "resource" &&
      currentScene.effects?.unlockBadgeIds?.length &&
      sceneHasPendingEffect(storyState, currentScene)
    ) {
      setRecentBadgeId(currentScene.effects.unlockBadgeIds[0]);
    }

    setBadgeTrayOpen(false);
    setStoryState((current) => {
      let nextState = current;

      if (currentScene.kind === "resource" && sceneHasPendingEffect(current, currentScene)) {
        nextState = applyStoryEffect(current, currentScene, currentScene.effects!);
      }

      return buildNextState(nextState, currentScene.nextSceneId!);
    });
  }

  function handleResume() {
    if (!resumeCandidate) {
      return;
    }

    setStoryState(resumeCandidate);
    setResumeCandidate(null);
    setStorageReady(true);
  }

  function handleRestart() {
    const nextState = previewPreset ? createPreviewStoryState(previewPreset) : createDefaultStoryState();

    if (!previewMode) {
      window.localStorage.removeItem(ALEX_STORY_STORAGE_KEY);
      setStorageReady(true);
      setResumeCandidate(null);
    }

    setBadgeTrayOpen(false);
    setRecentBadgeId(null);
    setStoryState(nextState);
  }

  if (!isReady || !currentScene || !currentDay) {
    return (
      <div className="story-shell" data-backdrop="sunrise">
        <div className="story-loading">
          <p className="story-overline">Loading story</p>
          <h1>Getting your first week ready.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="story-shell" data-backdrop={currentScene.backdrop}>
      <div className="story-shell-grain" />

      <div className="story-hud">
        <div className="story-hud-row">
          <div>
            <p className="story-overline story-overline-gold">Your First Week at ASU</p>
            <h1 className="story-hud-title">
              {currentDay.label}: {currentDay.title}
            </h1>
            <p className="story-hud-copy">{currentDay.subtitle}</p>
          </div>

          <div className="story-hud-actions">
            {previewMode ? (
              <Link href="/simulate" className="button-secondary">
                Open full story
              </Link>
            ) : (
              <button type="button" onClick={handleRestart} className="button-secondary">
                Restart week
              </button>
            )}
            <button type="button" onClick={() => setBadgeTrayOpen(true)} className="button-gold">
              Milestone tray ({unlockedBadges.length}/{storyBadges.length})
            </button>
          </div>
        </div>

        <div className="story-hud-row story-hud-row-stats">
          <div className="story-meter-card">
            <div className="story-meter-copy">
              <span>Campus Confidence</span>
              <strong>{storyState.confidence}%</strong>
            </div>
            <div className="story-meter-shell" aria-label={`Campus Confidence ${storyState.confidence}%`}>
              <span className="story-meter-fill" style={{ width: `${storyState.confidence}%` }} />
            </div>
          </div>

          <div className="story-stat-card">
            <span>Momentum</span>
            <strong>{storyState.xp}</strong>
          </div>
        </div>

        <div className="story-day-track" aria-label="Story progress">
          {storyDays.map((day, index) => (
            <div
              key={day.id}
              className={`story-day-pill ${
                index < currentDayIndex
                  ? "story-day-pill-complete"
                  : index === currentDayIndex
                    ? "story-day-pill-current"
                    : ""
              }`}
            >
              <span>{day.label}</span>
              <strong>{day.title}</strong>
            </div>
          ))}
        </div>

        {previewPreset ? (
          <div className="story-preview-banner">
            <p className="story-overline story-overline-gold">{previewPreset.title}</p>
            <p>{previewPreset.recap} This preview does not overwrite the saved full playthrough.</p>
          </div>
        ) : null}
      </div>

      <div className="story-body">
        <div key={currentScene.id} className="story-scene-frame">
          <SceneIllustration scene={currentScene} confidence={storyState.confidence} />

          <section className={`story-dialogue-card story-dialogue-card-${currentScene.kind}`}>
            <div className="story-dialogue-meta">
              <div>
                <p className="story-overline">{currentScene.speaker}</p>
                <span>{currentScene.location}</span>
              </div>
              <div className="story-dialogue-kind">{currentScene.kind}</div>
            </div>

            <div className="story-dialogue-copy">
              <h2>{currentScene.title}</h2>
              <p>{currentScene.body}</p>
            </div>

            {currentScene.kind === "choice" ? (
              <div className="story-choice-grid">
                {currentScene.choices?.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className="story-choice-card"
                    onClick={() => handleChoice(choice)}
                  >
                    <strong>{choice.label}</strong>
                    <span>{choice.caption}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {currentScene.kind === "resource" ? <ResourceSceneBody scene={currentScene} /> : null}

            {currentScene.kind === "ending" ? (
              <EndingScene
                state={storyState}
                onRestart={handleRestart}
                previewMode={previewMode}
              />
            ) : null}

            {currentScene.kind !== "choice" && currentScene.kind !== "ending" ? (
              <div className="story-action-row">
                {currentScene.ctaHref && currentScene.ctaLabel ? (
                  <StoryLink
                    href={currentScene.ctaHref}
                    label={currentScene.ctaLabel}
                    external={currentScene.ctaExternal}
                    className="button-secondary"
                  />
                ) : null}

                {currentScene.nextSceneId ? (
                  <button type="button" onClick={handleContinue} className="button-primary">
                    {currentScene.continueLabel ?? "Continue"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {recentBadgeId ? (
        <div className="story-badge-toast" role="status" aria-live="polite">
          <p className="story-overline">Milestone unlocked</p>
          <strong>{storyBadgeById[recentBadgeId]?.title ?? "New milestone"}</strong>
        </div>
      ) : null}

      {badgeTrayOpen ? (
        <div className="story-overlay">
          <aside ref={badgeTrayRef} className="story-badge-tray" aria-modal="true" role="dialog">
            <div className="story-badge-tray-header">
              <div>
                <p className="story-overline">Milestone tray</p>
                <h3>Your first-week map</h3>
              </div>
              <button
                type="button"
                onClick={() => setBadgeTrayOpen(false)}
                className="story-close-button"
              >
                Close
              </button>
            </div>

            <p className="story-badge-tray-copy">
              Each unlocked milestone marks one part of ASU that now feels less mysterious than it did on Monday.
            </p>

            <div className="story-badge-grid">
              {storyBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  unlocked={storyState.unlockedBadgeIds.includes(badge.id)}
                />
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {resumeCandidate ? (
        <div className="story-overlay">
          <div ref={resumeDialogRef} className="story-resume-dialog" aria-modal="true" role="dialog">
            <p className="story-overline">Saved progress found</p>
            <h2>Resume your first week?</h2>
            <p>
              There is a saved playthrough at {dayById[resumeCandidate.currentDayId]?.label ?? "later in the week"} with{" "}
              {resumeCandidate.xp} Momentum and {resumeCandidate.unlockedBadgeIds.length} milestone
              {resumeCandidate.unlockedBadgeIds.length === 1 ? "" : "s"} unlocked.
            </p>
            <div className="story-action-row">
              <button type="button" onClick={handleResume} className="button-primary">
                Resume story
              </button>
              <button type="button" onClick={handleRestart} className="button-secondary">
                Restart from day 1
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
