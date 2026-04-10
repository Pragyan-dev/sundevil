import type {
  ResourceCompletionRewardDefinition,
  RewardsBadgeDefinition,
  RewardsMissionDefinition,
  RewardsRedemptionDefinition,
} from "./rewards-types.ts";

export const DAY_ENTRY_PITCHFORK_REWARD = 20;
export const WORLD_COMPLETION_PITCHFORK_REWARD = 100;
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
    title: "Campus Walker 1 Mile",
    description: "A distance-based campus badge for future GPS or step tracking demos.",
    unlockHint: "Walk 1 mile in the campus experience. This is a locked future demo badge right now.",
    icon: "👟",
    silhouetteLabel: "Walking badge silhouette",
    obtainableNow: false,
    missionTitle: "Walk 1 mile in campus",
  },
  {
    id: "campus-walker-10km",
    title: "Campus Walker 6 Miles",
    description: "A long-haul campus roaming badge for a future movement-tracking milestone.",
    unlockHint: "Walk 6 miles in the campus experience. This is a locked future demo badge right now.",
    icon: "🏃",
    silhouetteLabel: "Distance badge silhouette",
    obtainableNow: false,
    missionTitle: "Walk 6 miles in campus",
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

export const rewardsRedemptionCatalog: RewardsRedemptionDefinition[] = [
  {
    id: "athletics-ticket",
    title: "Athletics Ticket",
    cost: 150,
    description: "Trade pitchforks for entry to a Sun Devil athletics event.",
    category: "Tickets",
  },
  {
    id: "arts-event-ticket",
    title: "Arts Event Ticket",
    cost: 150,
    description: "Redeem for a music, theater, or arts event around ASU.",
    category: "Tickets",
  },
  {
    id: "sun-devil-merchandise",
    title: "Sun Devil Merchandise",
    cost: 300,
    description: "Put your pitchforks toward maroon-and-gold gear.",
    category: "Merch",
  },
  {
    id: "local-attraction-pass",
    title: "Local Attraction Pass",
    cost: 450,
    description: "Swap points for a local attraction or partner experience.",
    category: "Experiences",
  },
  {
    id: "autographed-item",
    title: "Autographed Item",
    cost: 600,
    description: "Redeem for signed ASU memorabilia and collector drops.",
    category: "Exclusive",
  },
  {
    id: "exclusive-asu-experience",
    title: "Exclusive ASU Experience",
    cost: 900,
    description: "Save up for a one-of-a-kind Sun Devil experience.",
    category: "Exclusive",
  },
];

export const resourceCompletionRewards: ResourceCompletionRewardDefinition[] = [
  {
    worldId: "first-gen-support",
    badgeId: "student-success-spark",
    badgeTitle: "Student Success Spark",
    popupTitle: "Student Success rewards unlocked",
    popupDetail: "Badge earned and 100 pitchforks dropped into your balance.",
  },
  {
    worldId: "academic-advising",
    badgeId: "advising-pathfinder",
    badgeTitle: "Advising Pathfinder",
    popupTitle: "Advising rewards unlocked",
    popupDetail: "Badge earned and 100 pitchforks dropped into your balance.",
  },
  {
    worldId: "explore-asu",
    badgeId: "explore-asu-trailblazer",
    badgeTitle: "Explore ASU Trailblazer",
    popupTitle: "Explore ASU rewards unlocked",
    popupDetail: "Badge earned and 100 pitchforks dropped into your balance.",
  },
];
