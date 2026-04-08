"use client";

import Link from "next/link";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import CampusHUD from "@/components/campus/CampusHUD";
import CampusInteractionModal from "@/components/campus/CampusInteractionModal";
import { CAMPUS_KEYMAP, useCampusKeyboardControls } from "@/components/campus/CampusControls";
import MobileControls from "@/components/campus/MobileControls";
import {
  buildingProgressLabel,
  clampCamera,
  clampPlayer,
  collidesWithBuildings,
  directionVector,
  findNearbyBuilding,
  getBuildingById,
  getPathTargetFromTap,
  getQuestCompletion,
  renderCampusScene,
} from "@/components/campus/CampusRenderer";
import { useBuildingImages } from "@/components/campus/useBuildingImages";
import { useSoundEngine } from "@/components/sketch/SoundEngine";
import type { CampusDirection, CampusMapData, CampusPlayer, CampusQuest } from "@/lib/types";

const PLAYER_SPEED = 3.2;

function createInitialPlayer(map: CampusMapData): CampusPlayer {
  return {
    x: map.spawnX,
    y: map.spawnY,
    direction: "down",
    isMoving: false,
    frame: 0,
  };
}

function createInitialQuests(map: CampusMapData): CampusQuest[] {
  return map.quests.map((quest) => ({ ...quest, completed: false }));
}

export default function CampusNavigator({ map }: { map: CampusMapData }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<CampusPlayer>(createInitialPlayer(map));
  const cameraRef = useRef({ x: 0, y: 0 });
  const tapTargetRef = useRef<{ x: number; y: number } | null>(null);
  const frameStepRef = useRef(0);
  const nearBuildingRef = useRef<string | null>(null);

  const sound = useSoundEngine();
  const buildingImagesRef = useBuildingImages(map.buildings);

  const [viewport, setViewport] = useState({ width: 980, height: 680 });
  const [quests, setQuests] = useState<CampusQuest[]>(() => createInitialQuests(map));
  const [nearBuildingId, setNearBuildingId] = useState<string | null>(null);
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [discoveredBuildings, setDiscoveredBuildings] = useState<string[]>([]);
  const [mobileQuestOpen, setMobileQuestOpen] = useState(false);
  const [mobileDirection, setMobileDirection] = useState<CampusDirection | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const interactionLocked = activeBuildingId !== null || summaryOpen;
  const activeBuilding = getBuildingById(map, activeBuildingId);
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
  const progress = buildingProgressLabel(map.buildings, discoveredBuildings);
  const questCompletion = getQuestCompletion(quests);

  function resetNavigator() {
    playerRef.current = createInitialPlayer(map);
    cameraRef.current = { x: 0, y: 0 };
    tapTargetRef.current = null;
    nearBuildingRef.current = null;
    frameStepRef.current = 0;
    setQuests(createInitialQuests(map));
    setNearBuildingId(null);
    setActiveBuildingId(null);
    setDiscoveredBuildings([]);
    setMobileQuestOpen(false);
    setMobileDirection(null);
    setSummaryOpen(false);
  }

  function openBuilding(buildingId: string) {
    tapTargetRef.current = null;
    setMobileDirection(null);
    setActiveBuildingId(buildingId);
    setDiscoveredBuildings((previous) =>
      previous.includes(buildingId) ? previous : [...previous, buildingId],
    );
    sound.whoosh();
  }

  function handleInteract() {
    sound.prime();

    if (interactionLocked) {
      return;
    }

    const targetBuilding = nearBuildingRef.current;

    if (!targetBuilding) {
      return;
    }

    openBuilding(targetBuilding);
  }

  const pressedKeys = useCampusKeyboardControls({
    disabled: interactionLocked,
    onInteract: handleInteract,
    onPrime: sound.prime,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;

    if (!stage || !canvas) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const nextWidth = Math.max(320, Math.round(entry.contentRect.width));
      const nextHeight = Math.max(440, Math.round(entry.contentRect.height));
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      setViewport({ width: nextWidth, height: nextHeight });
    });

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let rafId = 0;

    function frame(time: number) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !ctx) {
        rafId = window.requestAnimationFrame(frame);
        return;
      }

      const player = playerRef.current;
      let rawDx = 0;
      let rawDy = 0;
      let usedTapTarget = false;

      if (!interactionLocked) {
        pressedKeys.current.forEach((key) => {
          const move = CAMPUS_KEYMAP[key as keyof typeof CAMPUS_KEYMAP];

          if (!move) {
            return;
          }

          rawDx += move.dx;
          rawDy += move.dy;
        });

        if (mobileDirection) {
          const move = directionVector(mobileDirection);
          rawDx += move.dx;
          rawDy += move.dy;
        }

        if (rawDx !== 0 || rawDy !== 0) {
          tapTargetRef.current = null;
        } else if (tapTargetRef.current) {
          const dx = tapTargetRef.current.x - player.x;
          const dy = tapTargetRef.current.y - player.y;
          const distance = Math.hypot(dx, dy);

          if (distance <= PLAYER_SPEED) {
            tapTargetRef.current = null;
          } else {
            rawDx = dx / distance;
            rawDy = dy / distance;
            usedTapTarget = true;
          }
        }
      }

      let nextX = player.x;
      let nextY = player.y;
      let isMoving = false;

      if (rawDx !== 0 || rawDy !== 0) {
        const magnitude = Math.hypot(rawDx, rawDy);
        const stepX = (rawDx / magnitude) * PLAYER_SPEED;
        const stepY = (rawDy / magnitude) * PLAYER_SPEED;
        const clamped = clampPlayer(player.x + stepX, player.y + stepY, map);

        if (!collidesWithBuildings(clamped.x, clamped.y, map.buildings)) {
          nextX = clamped.x;
          nextY = clamped.y;
          isMoving = true;

          if (Math.abs(stepX) > Math.abs(stepY)) {
            player.direction = stepX > 0 ? "right" : "left";
          } else {
            player.direction = stepY > 0 ? "down" : "up";
          }
        } else if (usedTapTarget) {
          tapTargetRef.current = null;
        }
      }

      player.x = nextX;
      player.y = nextY;
      player.isMoving = isMoving;

      if (isMoving && time - frameStepRef.current > 160) {
        player.frame = player.frame === 0 ? 1 : 0;
        frameStepRef.current = time;
      }

      cameraRef.current = clampCamera(
        player.x - viewport.width / 2,
        player.y - viewport.height / 2,
        viewport.width,
        viewport.height,
        map,
      );

      const nearby = findNearbyBuilding(player, map.buildings);
      const nextNearId = nearby?.id ?? null;

      if (nearBuildingRef.current !== nextNearId) {
        nearBuildingRef.current = nextNearId;
        setNearBuildingId(nextNearId);
      }

      renderCampusScene({
        ctx,
        map,
        player,
        camera: cameraRef.current,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        nearBuildingId: interactionLocked ? null : nextNearId,
        currentQuestBuildingId: currentQuestBuilding?.id ?? null,
        discoveredBuildingIds: discoveredBuildings,
        buildingImages: buildingImagesRef.current,
        time,
      });

      rafId = window.requestAnimationFrame(frame);
    }

    rafId = window.requestAnimationFrame(frame);

    return () => window.cancelAnimationFrame(rafId);
  }, [
    currentQuestBuilding?.id,
    discoveredBuildings,
    interactionLocked,
    map,
    mobileDirection,
    pressedKeys,
    viewport.height,
    viewport.width,
  ]);

  const prompt = useMemo(() => {
    if (!nearBuildingId || interactionLocked) {
      return null;
    }

    const building = getBuildingById(map, nearBuildingId);

    if (!building) {
      return null;
    }

    if (building.id === "tooker" && !coreQuestsComplete) {
      return isCoarsePointer
        ? "Tap ✋ to talk to Jordan. The dorm return quest unlocks after the other four stops."
        : "Press E to talk to Jordan. The dorm return quest unlocks after the other four stops.";
    }

    return isCoarsePointer
      ? `Tap ✋ to enter ${building.label}.`
      : `Press E to enter ${building.label}, or click the map to walk there.`;
  }, [coreQuestsComplete, interactionLocked, isCoarsePointer, map, nearBuildingId]);

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

    setActiveBuildingId(null);

    if (finishedJourney) {
      sound.chime();
      setSummaryOpen(true);
      return;
    }

    sound.correct();
  }

  function handleCanvasPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (interactionLocked) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    sound.prime();
    const target = getPathTargetFromTap(
      event.clientX,
      event.clientY,
      canvas.getBoundingClientRect(),
      cameraRef.current,
      canvas.width,
      canvas.height,
    );

    tapTargetRef.current = clampPlayer(target.x, target.y, map);
  }

  const summaryBuildings = map.buildings.filter(
    (building) =>
      discoveredBuildings.includes(building.id) && building.id !== "tooker" && building.id !== "byeng",
  );

  return (
    <div className="campus-shell">
      <section className="campus-hero">
        <div className="campus-hero-copy">
          <p className="eyebrow">Explore campus spatially</p>
          <h1>Walk the support map before the semester makes you need it fast.</h1>
          <p>
            This is a sketchy, top-down Tempe map built to make resources feel concrete. Walk to
            the doors, see the front desk, and keep the deeper walkthroughs for later.
          </p>
        </div>
        <div className="campus-hero-meta">
          <div>
            <span>Map mode</span>
            <strong>Quested free roam</strong>
          </div>
          <div>
            <span>Controls</span>
            <strong>WASD / arrows / click / tap</strong>
          </div>
          <div>
            <span>Progress</span>
            <strong>
              {questCompletion.completed}/{questCompletion.total} quests
            </strong>
          </div>
        </div>
      </section>

      <section className="campus-stage-shell">
        <div className="campus-stage" ref={stageRef}>
          <canvas
            ref={canvasRef}
            className="campus-canvas"
            onPointerDown={handleCanvasPointerDown}
          />

          <MobileControls
            disabled={interactionLocked}
            onDirectionChange={setMobileDirection}
            onInteract={handleInteract}
          />
        </div>

        <CampusHUD
          quests={quests}
          discoveredCount={progress.discovered}
          totalDiscoverable={progress.total}
          prompt={prompt}
          currentQuestLabel={currentQuest?.label ?? null}
          currentQuestBuildingLabel={currentQuestBuilding?.label ?? null}
          mobileQuestOpen={mobileQuestOpen}
          onToggleMobileQuests={() => setMobileQuestOpen((previous) => !previous)}
        />
      </section>

      <section className="campus-footer-copy">
        <p>
          Finder is still the fastest route if you already know what you want. Campus mode is for
          making the buildings, desks, and first steps feel familiar first.
        </p>
        <div className="campus-footer-links">
          <Link href="/finder" className="button-primary">
            Go to finder
          </Link>
          <Link href="/simulate" className="button-secondary">
            Back to first-week story
          </Link>
        </div>
      </section>

      <CampusInteractionModal
        key={activeBuildingId ?? "campus-modal"}
        building={activeBuilding}
        coreQuestsComplete={coreQuestsComplete}
        isOpen={activeBuilding !== null}
        onClose={() => setActiveBuildingId(null)}
        onInteractionComplete={completeInteraction}
        sound={sound}
      />

      {summaryOpen ? (
        <div className="campus-modal-backdrop" role="dialog" aria-modal="true" aria-label="Campus summary">
          <div className="campus-summary-card">
            <p className="campus-modal-eyebrow">Quest complete</p>
            <h2>You now have a mental map, not just a list of links.</h2>
            <p className="campus-summary-copy">
              You visited the main support spaces, checked DARS, and came back knowing where the
              doors, desks, and next steps actually are.
            </p>

            <div className="campus-summary-grid">
              {summaryBuildings.map((building) => (
                <article key={building.id} className="campus-summary-item">
                  {building.photo ? (
                    <img src={building.photo} alt="" className="campus-summary-thumb" />
                  ) : null}
                  <h3>
                    {building.icon} {building.label}
                  </h3>
                  <p>{building.realLocation?.address ?? "You found the DARS checkpoint and practiced reading the portal before classes made it urgent."}</p>
                  <p>{building.realLocation?.hours ?? "Use the DARS mini-game as your low-pressure first pass before the real portal."}</p>
                  <div className="campus-summary-links">
                    {building.interactionType === "walkthrough" ? (
                      <Link
                        href={`/finder/walkthrough/${String(building.interactionTarget)}`}
                        className="campus-inline-link"
                      >
                        Walkthrough
                      </Link>
                    ) : null}
                    {building.realLocation?.mapLink ? (
                      <a
                        href={building.realLocation.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="campus-inline-link"
                      >
                        Map link
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="campus-summary-actions">
              <button type="button" className="button-secondary" onClick={resetNavigator}>
                Explore again
              </button>
              <Link href="/finder" className="button-primary">
                Go to finder
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
