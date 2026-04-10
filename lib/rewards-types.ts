import type { ResourceWorldId } from "./resource-discovery-types.ts";

export type RewardsBadgeId =
  | "student-success-spark"
  | "advising-pathfinder"
  | "explore-asu-trailblazer"
  | "campus-walker-2km"
  | "campus-walker-10km"
  | "login-streak-10"
  | "login-streak-30";

export type RewardsMissionId =
  | "resource-day-1-login"
  | `badge-${RewardsBadgeId}`;

export interface RewardsBadgeDefinition {
  id: RewardsBadgeId;
  title: string;
  description: string;
  unlockHint: string;
  icon: string;
  silhouetteLabel: string;
  obtainableNow: boolean;
  missionTitle: string;
}

export interface RewardsMissionDefinition {
  id: RewardsMissionId;
  title: string;
  description: string;
  linkedBadgeId?: RewardsBadgeId;
}

export interface RewardsRedemptionDefinition {
  id: string;
  title: string;
  cost: number;
  description: string;
  category: string;
}

export interface ResourceCompletionRewardDefinition {
  worldId: ResourceWorldId;
  badgeId: RewardsBadgeId;
  badgeTitle: string;
  popupTitle: string;
  popupDetail: string;
}

export interface RewardsRedemptionRecord {
  rewardId: string;
  redeemedAt: string;
}

export interface RewardsProfile {
  pitchforkBalance: number;
  claimedDayEntryIds: string[];
  claimedWorldRewardIds: ResourceWorldId[];
  obtainedBadgeIds: RewardsBadgeId[];
  redemptionHistory: RewardsRedemptionRecord[];
}

export interface DayEntryRewardResult {
  awarded: boolean;
  amount: number;
  profile: RewardsProfile;
}

export interface WorldCompletionRewardResult {
  awarded: boolean;
  pitchforksAwarded: number;
  badgeId: RewardsBadgeId;
  profile: RewardsProfile;
}

export interface RewardsRedemptionResult {
  success: boolean;
  rewardId: string;
  profile: RewardsProfile;
}
