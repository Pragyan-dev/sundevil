"use client";

import type { CampusBuilding, CharacterId, DialogLine } from "@/lib/types";

export function getSpeakerForBuilding(building: CampusBuilding): CharacterId {
  const avatar = building.npc?.avatar;

  if (avatar === "jordan") return "jordan";
  if (avatar === "prof-chen") return "prof-chen";
  if (avatar === "advisor-rivera") return "advisor-rivera";
  if (avatar === "counselor-park") return "counselor-park";

  return "marcus";
}

export function getDialogLines(
  building: CampusBuilding,
  coreQuestsComplete: boolean,
): DialogLine[] {
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
