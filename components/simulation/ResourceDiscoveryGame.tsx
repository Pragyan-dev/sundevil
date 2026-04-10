"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  clearCampusStorySession,
  readCampusStorySession,
  writeCampusStorySession,
  type CampusStoryResumeMode,
  type CampusStorySession,
} from "@/lib/campus-story-session";
import {
  previewWorldBySlug,
  resourceDiscoveryVisibleMapWorldIds,
  resourceWorlds,
} from "@/data/resource-discovery-worlds";
import { ChatScreen } from "@/components/simulation/ChatScreen";
import { MapScreen } from "@/components/simulation/MapScreen";
import { RewardPopup } from "@/components/simulation/RewardPopup";
import { SuccessCoachScreen } from "@/components/simulation/SuccessCoachScreen";
import { WeekSimulator } from "@/components/simulation/week/WeekSimulator";
import {
  WORLD_COMPLETION_PITCHFORK_REWARD,
  resourceCompletionRewards,
} from "@/lib/rewards-data";
import { claimWorldCompletionBundle } from "@/lib/rewards";
import type {
  ChatChoice,
  RewardPopupItem,
  RenderedChatMessage,
  ResourceDiscoveryProgress,
  ResourcePreviewSlug,
  ResourceWorld,
  ResourceWorldId,
  ScenarioStep,
} from "@/lib/resource-discovery-types";
import type { ResourceCompletionRewardDefinition } from "@/lib/rewards-types";

interface ResourceDiscoveryGameProps {
  previewSlug?: ResourcePreviewSlug;
}

const STORAGE_KEY = "resource-discovery-map-sim-v2";
const SESSION_STORAGE_KEY = "resource-discovery-map-sim-session-v1";

interface ResourceDiscoverySession {
  screen: "chat" | "success-coach";
  activeWorldId: ResourceWorldId;
  activeScenarioIndex: number;
  messages: RenderedChatMessage[];
  activeStepId: string | null;
}

function createDefaultProgress(): ResourceDiscoveryProgress {
  return {
    points: 0,
    openedWorldIds: [],
    completedWorldIds: [],
    completedScenarioIds: [],
    helpfulChoiceIds: [],
    clickedResourceLinkIds: [],
    earnedBadgeIds: [],
  };
}

function isProgress(value: unknown): value is ResourceDiscoveryProgress {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ResourceDiscoveryProgress>;

  return (
    typeof candidate.points === "number" &&
    Array.isArray(candidate.openedWorldIds) &&
    Array.isArray(candidate.completedWorldIds) &&
    Array.isArray(candidate.completedScenarioIds) &&
    Array.isArray(candidate.helpfulChoiceIds) &&
    Array.isArray(candidate.clickedResourceLinkIds) &&
    Array.isArray(candidate.earnedBadgeIds)
  );
}

function getUnlockedWorldIds(progress?: ResourceDiscoveryProgress) {
  if (progress) {
    return resourceWorlds.map((world) => world.id);
  }

  return resourceWorlds.map((world) => world.id);
}

function getWorld(worldId: ResourceWorldId | null) {
  return worldId ? resourceWorlds.find((world) => world.id === worldId) ?? null : null;
}

function getScenarioStepMap(world: ResourceWorld | null, scenarioIndex: number) {
  if (!world) {
    return {};
  }

  const scenario = world.scenarios[scenarioIndex];
  if (!scenario) {
    return {};
  }

  return Object.fromEntries(scenario.steps.map((step) => [step.id, step])) as Record<string, ScenarioStep>;
}

function isRenderedChatMessage(value: unknown): value is RenderedChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<RenderedChatMessage>;

  return (
    (candidate.side === "left" || candidate.side === "right") &&
    typeof candidate.text === "string" &&
    (candidate.expression === undefined || typeof candidate.expression === "string")
  );
}

function isSession(value: unknown): value is ResourceDiscoverySession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ResourceDiscoverySession>;

  return (
    (candidate.screen === "chat" || candidate.screen === "success-coach") &&
    typeof candidate.activeWorldId === "string" &&
    typeof candidate.activeScenarioIndex === "number" &&
    (typeof candidate.activeStepId === "string" || candidate.activeStepId === null) &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every((message) => isRenderedChatMessage(message))
  );
}

function getResumeScenarioIndex(progress: ResourceDiscoveryProgress, worldId: ResourceWorldId) {
  const world = getWorld(worldId);
  if (!world) {
    return 0;
  }

  const firstIncompleteIndex = world.scenarios.findIndex(
    (scenario) => !progress.completedScenarioIds.includes(scenario.id),
  );

  return firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;
}

function getCompletionReward(worldId: ResourceWorldId) {
  return resourceCompletionRewards.find((entry) => entry.worldId === worldId) ?? null;
}

function buildCompletionPopup(reward: ResourceCompletionRewardDefinition): RewardPopupItem {
  return {
    id: `${reward.worldId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: "bundle",
    title: reward.popupTitle,
    detail: reward.popupDetail,
    badgeId: reward.badgeId,
    points: WORLD_COMPLETION_PITCHFORK_REWARD,
  };
}

export function ResourceDiscoveryGame({ previewSlug }: ResourceDiscoveryGameProps) {
  const router = useRouter();
  const previewWorldId = previewSlug ? previewWorldBySlug[previewSlug] : null;
  const [featureMode, setFeatureMode] = useState<"resource-map" | "week-sim">("resource-map");
  const [isHydrated, setIsHydrated] = useState(false);
  const [screen, setScreen] = useState<"map" | "chat" | "success-coach">(
    previewWorldId ? "chat" : "map",
  );
  const [zoomingWorldId, setZoomingWorldId] = useState<ResourceWorldId | null>(null);
  const [hoveredWorldId, setHoveredWorldId] = useState<ResourceWorldId | null>(null);
  const [activeWorldId, setActiveWorldId] = useState<ResourceWorldId | null>(previewWorldId);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [messages, setMessages] = useState<RenderedChatMessage[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState<ResourceDiscoveryProgress>(createDefaultProgress);
  const [rewardPopups, setRewardPopups] = useState<RewardPopupItem[]>([]);
  const [pendingCampusReturn, setPendingCampusReturn] = useState<CampusStorySession | null>(null);
  const [isPending, startTransition] = useTransition();

  const previewOpenedRef = useRef(false);
  const savedSessionRef = useRef<ResourceDiscoverySession | null>(null);
  const stepTimerRef = useRef<number | null>(null);
  const flowTimerRef = useRef<number | null>(null);
  const launchSourceRef = useRef<CampusStoryResumeMode>("resource-map");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const campusReturnSession = !previewWorldId ? readCampusStorySession() : null;
    let frameId = 0;
    let parsedProgress: ResourceDiscoveryProgress | null = null;
    let parsedSession: ResourceDiscoverySession | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (isProgress(parsed)) {
          parsedProgress = parsed;
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (rawSession && !previewWorldId) {
      try {
        const parsed = JSON.parse(rawSession) as unknown;
        if (isSession(parsed)) {
          parsedSession = parsed;
        }
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    frameId = window.requestAnimationFrame(() => {
      if (parsedProgress) {
        setProgress(parsedProgress);
      }
      if (parsedSession) {
        savedSessionRef.current = parsedSession;
        setScreen(parsedSession.screen);
        setActiveWorldId(parsedSession.activeWorldId);
        setActiveScenarioIndex(parsedSession.activeScenarioIndex);
        setMessages(parsedSession.messages);
        setActiveStepId(parsedSession.activeStepId);
      }
      if (campusReturnSession?.returnRequested) {
        setPendingCampusReturn(campusReturnSession);
      }
      setIsHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [previewWorldId]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [isHydrated, progress]);

  useEffect(() => {
    if (!isHydrated || previewWorldId) {
      return;
    }

    if (screen === "map" || !activeWorldId) {
      return;
    }

    const nextSession: ResourceDiscoverySession = {
      screen,
      activeWorldId,
      activeScenarioIndex,
      messages,
      activeStepId,
    };

    savedSessionRef.current = nextSession;
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }, [
    activeScenarioIndex,
    activeStepId,
    activeWorldId,
    isHydrated,
    messages,
    previewWorldId,
    screen,
  ]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const awardedRewards = resourceCompletionRewards.filter((reward) =>
      progress.completedWorldIds.includes(reward.worldId),
    );

    if (!awardedRewards.length) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const nextPopups: RewardPopupItem[] = [];

      for (const reward of awardedRewards) {
        const rewardResult = claimWorldCompletionBundle(reward.worldId, reward.badgeId);

        if (rewardResult.awarded) {
          nextPopups.push(buildCompletionPopup(reward));
        }
      }

      if (nextPopups.length) {
        setRewardPopups((existing) => [...nextPopups, ...existing].slice(0, 4));
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isHydrated, progress.completedWorldIds]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        window.clearTimeout(stepTimerRef.current);
      }
      if (flowTimerRef.current) {
        window.clearTimeout(flowTimerRef.current);
      }
    };
  }, []);

  const unlockedWorldIds = useMemo(() => getUnlockedWorldIds(), []);
  const visibleWorlds = useMemo(
    () => resourceWorlds.filter((world) => resourceDiscoveryVisibleMapWorldIds.includes(world.id)),
    [],
  );
  const visibleCompletedWorldCount = useMemo(
    () =>
      resourceDiscoveryVisibleMapWorldIds.filter((worldId) =>
        progress.completedWorldIds.includes(worldId),
      ).length,
    [progress.completedWorldIds],
  );
  const activeWorld = useMemo(() => getWorld(activeWorldId), [activeWorldId]);
  const activeScenario = activeWorld?.scenarios[activeScenarioIndex] ?? null;
  const stepMap = useMemo(
    () => getScenarioStepMap(activeWorld, activeScenarioIndex),
    [activeScenarioIndex, activeWorld],
  );
  const activeStep = activeStepId ? stepMap[activeStepId] ?? null : null;

  const applyProgressUpdate = useCallback((
    updater: (
      current: ResourceDiscoveryProgress,
    ) => {
      nextProgress: ResourceDiscoveryProgress;
      completionReward?: ResourceCompletionRewardDefinition | null;
    },
  ) => {
    setProgress((current) => {
      const { nextProgress, completionReward } = updater(current);

      if (completionReward) {
        queueMicrotask(() => {
          const rewardResult = claimWorldCompletionBundle(
            completionReward.worldId,
            completionReward.badgeId,
          );

          if (!rewardResult.awarded) {
            return;
          }

          setRewardPopups((existing) => [buildCompletionPopup(completionReward), ...existing].slice(0, 4));
        });
      }

      return nextProgress;
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || previewWorldId || !pendingCampusReturn?.returnRequested) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      clearCampusStorySession();
      savedSessionRef.current = null;
      window.localStorage.removeItem(SESSION_STORAGE_KEY);

      applyProgressUpdate((current) => {
        const world = getWorld(pendingCampusReturn.activeWorldId);
        if (!world) {
          return { nextProgress: current };
        }

        let nextProgress = current;
        let completionReward: ResourceCompletionRewardDefinition | null = null;

        if (!nextProgress.openedWorldIds.includes(world.id)) {
          nextProgress = {
            ...nextProgress,
            openedWorldIds: [...nextProgress.openedWorldIds, world.id],
          };
        }

        const missingScenarioIds = world.scenarios
          .map((scenario) => scenario.id)
          .filter((scenarioId) => !nextProgress.completedScenarioIds.includes(scenarioId));

        if (missingScenarioIds.length) {
          nextProgress = {
            ...nextProgress,
            completedScenarioIds: [...nextProgress.completedScenarioIds, ...missingScenarioIds],
          };
        }

        if (!nextProgress.completedWorldIds.includes(world.id)) {
          const reward = getCompletionReward(world.id);
          nextProgress = {
            ...nextProgress,
            completedWorldIds: [...nextProgress.completedWorldIds, world.id],
            earnedBadgeIds: reward
              ? Array.from(new Set([...nextProgress.earnedBadgeIds, reward.badgeId]))
              : nextProgress.earnedBadgeIds,
          };
          completionReward = reward;
        }

        return {
          nextProgress,
          completionReward,
        };
      });

      launchSourceRef.current = pendingCampusReturn.sourceScreen;

      startTransition(() => {
        setFeatureMode(pendingCampusReturn.sourceScreen);
        setScreen("map");
        setZoomingWorldId(null);
        setHoveredWorldId(
          pendingCampusReturn.sourceScreen === "resource-map"
            ? pendingCampusReturn.activeWorldId
            : null,
        );
        setActiveWorldId(null);
        setActiveScenarioIndex(0);
        setMessages([]);
        setActiveStepId(null);
        setIsTyping(false);
      });

      setPendingCampusReturn(null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [applyProgressUpdate, isHydrated, pendingCampusReturn, previewWorldId, startTransition]);

  const appendCharacterStep = useCallback(function appendCharacterStep(stepId: string) {
    const step = stepMap[stepId];

    if (!step) {
      return;
    }

    if (stepTimerRef.current) {
      window.clearTimeout(stepTimerRef.current);
    }
    if (flowTimerRef.current) {
      window.clearTimeout(flowTimerRef.current);
    }

    setIsTyping(true);
    setActiveStepId(null);

    stepTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `${step.id}-${current.length}`,
          side: "left",
          text: step.text,
          expression: step.expression,
          experience: step.experience,
          resourceLink: step.resourceLink,
        },
      ]);
      setIsTyping(false);

      if (step.choices?.length || step.experience || step.resourceLink || step.complete || step.autoNextStepId) {
        setActiveStepId(step.id);
        return;
      }
    }, 650);
  }, [stepMap]);

  const startScenario = useCallback((worldId: ResourceWorldId, scenarioIndex: number) => {
    const world = getWorld(worldId);
    const scenario = world?.scenarios[scenarioIndex];

    if (!world || !scenario) {
      return;
    }

    if (stepTimerRef.current) {
      window.clearTimeout(stepTimerRef.current);
    }
    if (flowTimerRef.current) {
      window.clearTimeout(flowTimerRef.current);
    }

    startTransition(() => {
      setActiveWorldId(worldId);
      setActiveScenarioIndex(scenarioIndex);
      setMessages([]);
      setActiveStepId(null);
      setIsTyping(false);
      setScreen("chat");
    });

    window.requestAnimationFrame(() => {
      const freshMap = Object.fromEntries(scenario.steps.map((step) => [step.id, step])) as Record<string, ScenarioStep>;
      const firstStep = freshMap[scenario.entryStepId];
      if (!firstStep) {
        return;
      }

      setIsTyping(true);
      stepTimerRef.current = window.setTimeout(() => {
        setMessages([
          {
            id: `${firstStep.id}-0`,
            side: "left",
            text: firstStep.text,
            expression: firstStep.expression,
            experience: firstStep.experience,
            resourceLink: firstStep.resourceLink,
          },
        ]);
        setIsTyping(false);

        if (
          firstStep.choices?.length ||
          firstStep.experience ||
          firstStep.resourceLink ||
          firstStep.complete ||
          firstStep.autoNextStepId
        ) {
          setActiveStepId(firstStep.id);
          return;
        }
      }, 650);
    });
  }, [startTransition]);

  const openWorldFromMap = useCallback((worldId: ResourceWorldId, sourceMode: CampusStoryResumeMode = "resource-map") => {
    const world = getWorld(worldId);

    if (!world) {
      return;
    }

    const isUnlocked = unlockedWorldIds.includes(worldId) || previewWorldId === worldId;
    if (!isUnlocked) {
      return;
    }

    launchSourceRef.current = sourceMode;

    applyProgressUpdate((current) => {
      const nextOpenedWorldIds = current.openedWorldIds.includes(worldId)
        ? current.openedWorldIds
        : [...current.openedWorldIds, worldId];

      return {
        nextProgress: {
          ...current,
          openedWorldIds: nextOpenedWorldIds,
        },
      };
    });

    setZoomingWorldId(worldId);
    window.setTimeout(() => {
      setZoomingWorldId(null);
      const savedSession = savedSessionRef.current;
      if (
        savedSession &&
        savedSession.activeWorldId === worldId &&
        savedSession.messages.length > 0
      ) {
        startTransition(() => {
          setActiveWorldId(savedSession.activeWorldId);
          setActiveScenarioIndex(savedSession.activeScenarioIndex);
          setMessages(savedSession.messages);
          setActiveStepId(savedSession.activeStepId);
          setIsTyping(false);
          setScreen(savedSession.screen);
        });
        return;
      }

      startScenario(worldId, getResumeScenarioIndex(progress, worldId));
    }, 280);
  }, [applyProgressUpdate, previewWorldId, progress, startScenario, startTransition, unlockedWorldIds]);

  useEffect(() => {
    if (!isHydrated || !previewWorldId || previewOpenedRef.current) {
      return;
    }

    previewOpenedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      openWorldFromMap(previewWorldId);
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isHydrated, openWorldFromMap, previewWorldId]);

  function handleChoice(choice: ChatChoice) {
    if (!activeScenario || !activeStep) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `${choice.id}-user-${current.length}`,
        side: "right",
        text: choice.text,
      },
    ]);
    setActiveStepId(null);

    if (choice.reward?.helpful && !progress.helpfulChoiceIds.includes(choice.id)) {
      applyProgressUpdate((current) => ({
        nextProgress: {
          ...current,
          helpfulChoiceIds: [...current.helpfulChoiceIds, choice.id],
        },
      }));
    }

    flowTimerRef.current = window.setTimeout(() => {
      appendCharacterStep(choice.nextStepId);
    }, 240);
  }

  function handleResourceClick() {
    if (!activeScenario || progress.clickedResourceLinkIds.includes(activeScenario.id)) {
      return;
    }

    applyProgressUpdate((current) => ({
      nextProgress: {
        ...current,
        clickedResourceLinkIds: [...current.clickedResourceLinkIds, activeScenario.id],
      },
    }));
  }

  function handleContinue() {
    if (!activeWorld || !activeScenario) {
      return;
    }

    if (activeStep?.autoNextStepId && !activeStep.complete && !activeStep.resourceLink && !activeStep.experience) {
      appendCharacterStep(activeStep.autoNextStepId);
      return;
    }

    const isScenarioAlreadyCompleted = progress.completedScenarioIds.includes(activeScenario.id);

    applyProgressUpdate((current) => {
      let nextProgress = current;
      let completionReward: ResourceCompletionRewardDefinition | null = null;

      if (!current.completedScenarioIds.includes(activeScenario.id)) {
        nextProgress = {
          ...current,
          completedScenarioIds: [...current.completedScenarioIds, activeScenario.id],
        };
      }

      const allScenarioIds = activeWorld.scenarios.map((scenario) => scenario.id);
      const allWorldScenariosCompleted = allScenarioIds.every((scenarioId) =>
        (scenarioId === activeScenario.id
          ? [...current.completedScenarioIds, activeScenario.id]
          : current.completedScenarioIds).includes(scenarioId),
      );

      if (allWorldScenariosCompleted && !current.completedWorldIds.includes(activeWorld.id)) {
        const reward = getCompletionReward(activeWorld.id);
        nextProgress = {
          ...nextProgress,
          completedWorldIds: [...nextProgress.completedWorldIds, activeWorld.id],
          earnedBadgeIds: reward
            ? Array.from(new Set([...nextProgress.earnedBadgeIds, reward.badgeId]))
            : nextProgress.earnedBadgeIds,
        };
        completionReward = reward;
      }

      return {
        nextProgress,
        completionReward,
      };
    });

    const nextScenarioIndex = activeScenarioIndex + 1;
    if (nextScenarioIndex < activeWorld.scenarios.length) {
      startScenario(activeWorld.id, nextScenarioIndex);
      return;
    }

    if (isScenarioAlreadyCompleted || activeStep?.complete) {
      savedSessionRef.current = null;
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      startTransition(() => {
        setScreen("map");
        setActiveStepId(null);
        setIsTyping(false);
      });
    }
  }

  function handleBackToMap() {
    if (stepTimerRef.current) {
      window.clearTimeout(stepTimerRef.current);
    }
    if (flowTimerRef.current) {
      window.clearTimeout(flowTimerRef.current);
    }

    startTransition(() => {
      setScreen("map");
      setIsTyping(false);
      setActiveStepId(null);
    });
  }

  function handleOpenResourceMapFromWeek() {
    launchSourceRef.current = "week-sim";

    startTransition(() => {
      setFeatureMode("resource-map");
      setScreen("map");
      setZoomingWorldId(null);
      setHoveredWorldId(null);
      setActiveWorldId(null);
      setActiveStepId(null);
      setIsTyping(false);
    });
  }

  function handleOpenExperience() {
    if (!activeStep?.experience || !activeWorld) {
      return;
    }

    if (activeStep.experience.kind === "success-coach") {
      setScreen("success-coach");
      return;
    }

    writeCampusStorySession({
      sourceScreen: launchSourceRef.current,
      activeWorldId: activeWorld.id,
      returnTo: "/simulate",
      returnRequested: false,
      campusFinished: false,
      completedQuestIds: [],
      questCompletionCount: 0,
    });

    const params = new URLSearchParams({
      entry: activeWorld.id,
      returnTo: "/simulate",
      resume: launchSourceRef.current,
      world: activeWorld.id,
    });

    router.push(`/campus?${params.toString()}`);
  }

  if (!isHydrated) {
    return (
      <div className="resource-sim-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[76vh] max-w-7xl place-items-center">
          <div className="rounded-[2rem] border border-white/16 bg-white/10 px-8 py-10 text-center text-white shadow-[0_24px_80px_rgba(44,17,22,0.18)] backdrop-blur-md">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#ffe2ae]">
              Loading map
            </p>
            <p className="mt-4 font-[var(--font-sim-display)] text-[2rem] leading-none">
              Dropping into the campus world...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-sim-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <RewardPopup
        items={rewardPopups}
        onDismiss={(id) => setRewardPopups((current) => current.filter((item) => item.id !== id))}
      />
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/16 bg-white/10 px-5 py-4 text-white shadow-[0_24px_80px_rgba(44,17,22,0.18)] backdrop-blur-md">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
              ASU Onboarding Game
            </p>
            <p className="mt-1 font-[var(--font-sim-display)] text-[1.5rem] leading-none">
              Resource Discovery Simulation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {!previewWorldId ? (
              <div className="flex rounded-full border border-white/14 bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setFeatureMode("resource-map")}
                  className={`rounded-full px-4 py-2 font-bold transition ${
                    featureMode === "resource-map"
                      ? "bg-[#ffc627] text-[#2c1116]"
                      : "text-white hover:text-[#ffc627]"
                  }`}
                >
                  Resource map
                </button>
                <button
                  type="button"
                  onClick={() => setFeatureMode("week-sim")}
                  className={`rounded-full px-4 py-2 font-bold transition ${
                    featureMode === "week-sim"
                      ? "bg-[#ffc627] text-[#2c1116]"
                      : "text-white hover:text-[#ffc627]"
                  }`}
                >
                  Week simulator
                </button>
              </div>
            ) : null}

            <span className="rounded-full bg-white/12 px-3 py-2 font-bold text-white">
              {visibleCompletedWorldCount}/{visibleWorlds.length} cleared
            </span>
            <span className="rounded-full bg-white/12 px-3 py-2 font-bold text-white">
              {isPending ? "moving..." : "live"}
            </span>
          </div>
        </div>

        {!previewWorldId && featureMode === "week-sim" ? (
          <WeekSimulator onOpenResourceMap={handleOpenResourceMapFromWeek} />
        ) : screen === "map" || !activeWorld || !activeScenario ? (
          <MapScreen
            worlds={visibleWorlds}
            progress={progress}
            unlockedWorldIds={unlockedWorldIds}
            hoveredWorldId={hoveredWorldId}
            zoomingWorldId={zoomingWorldId}
            onOpenWorld={openWorldFromMap}
            onHoverWorld={setHoveredWorldId}
          />
        ) : screen === "success-coach" ? (
          <SuccessCoachScreen
            world={activeWorld}
            scenario={activeScenario}
            onBack={() => setScreen("chat")}
            onComplete={handleContinue}
            onOpenResource={handleResourceClick}
          />
        ) : (
          <ChatScreen
            world={activeWorld}
            scenario={activeScenario}
            scenarioIndex={activeScenarioIndex}
            totalScenarios={activeWorld.scenarios.length}
            messages={messages}
            activeStep={activeStep}
            isTyping={isTyping}
            onBack={handleBackToMap}
            onChoice={handleChoice}
            onContinue={handleContinue}
            onOpenExperience={handleOpenExperience}
            onOpenResource={handleResourceClick}
          />
        )}
      </div>
    </div>
  );
}
