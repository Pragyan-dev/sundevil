import type {
  ResourceCompletionRewardDefinition,
  RewardsBadgeDefinition,
  RewardsMissionDefinition,
  SparkyFigurineDefinition,
} from "@/lib/rewards-types";

export const DAY_ENTRY_PITCHFORK_REWARD = 20;
export const WORLD_COMPLETION_PITCHFORK_REWARD = 100;
export const SPARKYCOIN_REDEMPTION_COST = 100;
export const DEMO_PITCHFORK_INCREMENT = 250;

export const rewardsBadgeCatalog: RewardsBadgeDefinition[] = [
  {
    id: "student-success-spark",
    title: "Student Success Spark",
    description: "You cleared the Student Success module and translated campus language into something human.",
    unlockHint: "Complete the Student Success world in Resource Discovery.",
    icon: "🌱",
    silhouetteLabel: "Coach spark silhouette",
    obtainableNow: true,
    missionTitle: "Earn the Student Success Spark badge",
  },
  {
    id: "advising-pathfinder",
    title: "Advising Pathfinder",
    description: "You completed the advising module and turned DARS stress into a real plan.",
    unlockHint: "Complete the Advising world in Resource Discovery.",
    icon: "🧭",
    silhouetteLabel: "Compass badge silhouette",
    obtainableNow: true,
    missionTitle: "Earn the Advising Pathfinder badge",
  },
  {
    id: "explore-asu-trailblazer",
    title: "Explore ASU Trailblazer",
    description: "You finished Explore ASU and made the support map feel much less abstract.",
    unlockHint: "Complete the Explore ASU world in Resource Discovery.",
    icon: "🗺️",
    silhouetteLabel: "Map badge silhouette",
    obtainableNow: true,
    missionTitle: "Earn the Explore ASU Trailblazer badge",
  },
  {
    id: "campus-walker-2km",
    title: "Campus Walker 2km",
    description: "A distance-based campus badge for future GPS or step tracking demos.",
    unlockHint: "Walk 2km in the campus experience. This is a locked future demo badge right now.",
    icon: "👟",
    silhouetteLabel: "Walking badge silhouette",
    obtainableNow: false,
    missionTitle: "Walk 2km in campus",
  },
  {
    id: "campus-walker-10km",
    title: "Campus Walker 10km",
    description: "A long-haul campus roaming badge for a future movement-tracking milestone.",
    unlockHint: "Walk 10km in the campus experience. This is a locked future demo badge right now.",
    icon: "🏃",
    silhouetteLabel: "Distance badge silhouette",
    obtainableNow: false,
    missionTitle: "Walk 10km in campus",
  },
  {
    id: "login-streak-10",
    title: "10 Day Login Streak",
    description: "A streak reward reserved for a future multi-day login system.",
    unlockHint: "Log in for 10 straight days. This is a locked future demo badge right now.",
    icon: "🔥",
    silhouetteLabel: "Streak flame silhouette",
    obtainableNow: false,
    missionTitle: "Hit a 10 day login streak",
  },
  {
    id: "login-streak-30",
    title: "30 Day Login Streak",
    description: "A long streak reward reserved for a future retention demo.",
    unlockHint: "Log in for 30 straight days. This is a locked future demo badge right now.",
    icon: "🌞",
    silhouetteLabel: "Sun streak silhouette",
    obtainableNow: false,
    missionTitle: "Hit a 30 day login streak",
  },
];

export const rewardsMissionCatalog: RewardsMissionDefinition[] = [
  {
    id: "resource-day-1-login",
    title: "Log into Resource Discovery Day 1",
    description: "Visit Day 1 in the week simulator and collect the 20 pitchfork login reward.",
  },
  ...rewardsBadgeCatalog.map((badge) => ({
    id: `badge-${badge.id}` as const,
    title: badge.missionTitle,
    description: badge.unlockHint,
    linkedBadgeId: badge.id,
  })),
];

export const resourceCompletionRewards: ResourceCompletionRewardDefinition[] = [
  {
    worldId: "first-gen-support",
    badgeId: "student-success-spark",
    badgeTitle: "Student Success Spark",
    popupTitle: "Student Success rewards unlocked",
    popupDetail: "Badge earned, a mystery Sparky figurine box was added, and 100 pitchforks dropped into your balance.",
  },
  {
    worldId: "academic-advising",
    badgeId: "advising-pathfinder",
    badgeTitle: "Advising Pathfinder",
    popupTitle: "Advising rewards unlocked",
    popupDetail: "Badge earned, a mystery Sparky figurine box was added, and 100 pitchforks dropped into your balance.",
  },
  {
    worldId: "explore-asu",
    badgeId: "explore-asu-trailblazer",
    badgeTitle: "Explore ASU Trailblazer",
    popupTitle: "Explore ASU rewards unlocked",
    popupDetail: "Badge earned, a mystery Sparky figurine box was added, and 100 pitchforks dropped into your balance.",
  },
];

export const sparkyFigurineCatalog: SparkyFigurineDefinition[] = [
  {
    id: "glitch-guide",
    name: "Glitch Guide Sparky",
    rarity: "Common",
    vibe: "A campus helper figurine with a debug-happy grin and notebook glow.",
    accentFrom: "#8c1d40",
    accentTo: "#ffc627",
    glyph: "GG",
  },
  {
    id: "quest-runner",
    name: "Quest Runner Sparky",
    rarity: "Rare",
    vibe: "A faster, sharper figurine variant built for map-clearing demo runs.",
    accentFrom: "#f59e0b",
    accentTo: "#8c1d40",
    glyph: "QR",
  },
  {
    id: "chain-caster",
    name: "Chain Caster Sparky",
    rarity: "Epic",
    vibe: "A wallet-connected Sparky with coin rings, scan lines, and maroon lightning.",
    accentFrom: "#2c1116",
    accentTo: "#d6657e",
    glyph: "CC",
  },
  {
    id: "sun-forge",
    name: "Sun Forge Sparky",
    rarity: "Legendary",
    vibe: "A rare molten-gold figurine that looks like it dropped out of a glitched sunrise.",
    accentFrom: "#ffc627",
    accentTo: "#f97316",
    glyph: "SF",
  },
];
