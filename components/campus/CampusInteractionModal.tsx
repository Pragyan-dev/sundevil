"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SketchDialogSequence } from "@/components/sketch/SketchDialogSequence";
import MiniGameRouter from "@/components/sketch/minigames/MiniGameRouter";
import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import type { CampusBuilding, CharacterId, DialogLine, MiniGameType, ResourceSlug } from "@/lib/types";

function getSpeakerForBuilding(building: CampusBuilding): CharacterId {
  const avatar = building.npc?.avatar;

  if (avatar === "jordan") return "jordan";
  if (avatar === "prof-chen") return "prof-chen";
  if (avatar === "advisor-rivera") return "advisor-rivera";
  if (avatar === "counselor-park") return "counselor-park";

  return "marcus";
}

function getDialogLines(building: CampusBuilding, coreQuestsComplete: boolean): DialogLine[] {
  if (building.id === "tooker") {
    if (coreQuestsComplete) {
      return [
        {
          id: "tooker-return-1",
          speaker: "Jordan",
          speakerType: "jordan",
          text: "Okay, now those places are actual rooms instead of vague campus words.",
        },
        {
          id: "tooker-return-2",
          speaker: "You",
          speakerType: "you",
          text: "Yeah. Advising and tutoring feel way less dramatic once you can picture the front desk and what happens first.",
        },
        {
          id: "tooker-return-3",
          speaker: "Jordan",
          speakerType: "jordan",
          text: "Exactly. Save the walkthroughs if you want the full step-by-step later, but now you know where the doors actually are.",
        },
      ];
    }

    return [
      {
        id: "tooker-intro-1",
        speaker: "Jordan",
        speakerType: "jordan",
        text: "Before classes get loud, go see a few support spaces in person. It is way easier to use them once you know what they look like.",
      },
      {
        id: "tooker-intro-2",
        speaker: "You",
        speakerType: "you",
        text: "Honestly, that would help. Half the stress is not knowing what happens when you walk in.",
      },
      {
        id: "tooker-intro-3",
        speaker: "Jordan",
        speakerType: "jordan",
        text: "Perfect. Hit tutoring, DARS, advising, and counseling, then swing back here once the map feels less abstract.",
      },
    ];
  }

  if (building.id === "byeng") {
    return [
      {
        id: "byeng-1",
        speaker: "Prof. Chen",
        speakerType: "prof-chen",
        text: "The first week is mostly translation work. Syllabus, DARS, office hours, course codes, building names.",
      },
      {
        id: "byeng-2",
        speaker: "You",
        speakerType: "you",
        text: "So if it feels confusing, that does not automatically mean I am behind?",
      },
      {
        id: "byeng-3",
        speaker: "Prof. Chen",
        speakerType: "prof-chen",
        text: "Correct. The fastest way to settle in is to make the support system concrete before you urgently need it.",
      },
    ];
  }

  const speakerType = getSpeakerForBuilding(building);
  const lines: DialogLine[] = [];

  if (building.npc?.greeting) {
    lines.push({
      id: `${building.id}-greeting`,
      speaker: building.npc.name,
      speakerType,
      text: building.npc.greeting,
    });
  }

  if (building.npc?.followUp) {
    lines.push({
      id: `${building.id}-follow-up`,
      speaker: building.npc.name,
      speakerType,
      text: building.npc.followUp,
    });
  }

  return lines;
}

export default function CampusInteractionModal({
  building,
  coreQuestsComplete,
  isOpen,
  onClose,
  onInteractionComplete,
  sound,
}: {
  building: CampusBuilding | null;
  coreQuestsComplete: boolean;
  isOpen: boolean;
  onClose: () => void;
  onInteractionComplete: (buildingId: string) => void;
  sound: SoundEngineControls;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [sequenceDone, setSequenceDone] = useState(false);

  const lines = useMemo(
    () => (building ? getDialogLines(building, coreQuestsComplete) : []),
    [building, coreQuestsComplete],
  );

  if (!isOpen || !building) {
    return null;
  }

  function handleDialogComplete() {
    if (!building) {
      return;
    }

    sound.pop();
    onInteractionComplete(building.id);
  }

  function handleWalkthroughSequenceDone() {
    sound.pop();
    setSequenceDone(true);
  }

  return (
    <div className="campus-modal-backdrop" role="dialog" aria-modal="true" aria-label={building.name}>
      <div className="campus-modal-card">
        <div className="campus-modal-header">
          <div>
            <p className="campus-modal-eyebrow">Campus stop</p>
            <h2>{building.name}</h2>
          </div>
          <button type="button" className="campus-modal-close" onClick={onClose}>
            Close
          </button>
        </div>

        {building.interactionType === "minigame" ? (
          <div className="campus-modal-minigame">
            <p className="campus-modal-support-copy">
              Sit down at the terminal and scan your DARS the way a first-semester student actually
              would.
            </p>
            <MiniGameRouter
              type={building.interactionTarget as MiniGameType}
              onComplete={() => onInteractionComplete(building.id)}
              onInteract={sound.prime}
              sound={sound}
            />
          </div>
        ) : null}

        {building.interactionType === "dialog" ? (
          <div className="campus-modal-dialog">
            <SketchDialogSequence
              lines={lines}
              initialLineIndex={lineIndex}
              locationLabel={building.label}
              finalButtonLabel={building.id === "tooker" ? "Back to map ►" : "Step back outside ►"}
              onLineIndexChange={setLineIndex}
              onSequenceComplete={handleDialogComplete}
              onInteract={sound.prime}
              onSpeakerChange={sound.whoosh}
            />
          </div>
        ) : null}

        {building.interactionType === "walkthrough" ? (
          <div className="campus-modal-body">
            <div className="campus-modal-preview">
              {!sequenceDone ? (
                <SketchDialogSequence
                  lines={lines}
                  initialLineIndex={lineIndex}
                  locationLabel={building.label}
                  finalButtonLabel="See details ▼"
                  onLineIndexChange={setLineIndex}
                  onSequenceComplete={handleWalkthroughSequenceDone}
                  onInteract={sound.prime}
                  onSpeakerChange={sound.whoosh}
                />
              ) : (
                <div className="campus-modal-preview-copy">
                  <p className="campus-modal-preview-quote">
                    “{building.npc?.followUp ?? building.npc?.greeting ?? "You now know what the first step looks like."}”
                  </p>
                  <p className="campus-modal-support-copy">
                    This is the emotional preview: where to stand, what to say first, and what the
                    room usually feels like.
                  </p>
                </div>
              )}
            </div>

            <div className="campus-modal-meta">
              <p className="campus-modal-eyebrow">Real ASU info</p>
              <div className="campus-modal-meta-grid">
                <div>
                  <span>📍</span>
                  <p>{building.realLocation?.address ?? "Campus location available in walkthrough"}</p>
                </div>
                <div>
                  <span>🕐</span>
                  <p>{building.realLocation?.hours ?? "Hours vary by location"}</p>
                </div>
                <div>
                  <span>📞</span>
                  <p>{building.realLocation?.phone ?? "Call the front desk or check the walkthrough page"}</p>
                </div>
              </div>

              {sequenceDone ? (
                <div className="campus-modal-actions">
                  <Link
                    href={`/finder/walkthrough/${building.interactionTarget as ResourceSlug}`}
                    className="button-gold"
                    onClick={() => {
                      sound.correct();
                      onInteractionComplete(building.id);
                    }}
                  >
                    Full Walkthrough
                  </Link>

                  {building.realLocation?.mapLink ? (
                    <a
                      href={building.realLocation.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-ghost-light campus-button-dark"
                    >
                      Open in Maps
                    </a>
                  ) : null}

                  <button
                    type="button"
                    className="button-ghost-light campus-button-dark"
                    onClick={() => onInteractionComplete(building.id)}
                  >
                    Back to map
                  </button>
                </div>
              ) : (
                <p className="campus-modal-support-copy">
                  Finish the short preview above to mark this stop visited and unlock the
                  walkthrough link.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
