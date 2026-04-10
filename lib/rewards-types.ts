import type { ResourceWorldId } from "@/lib/resource-discovery-types";

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

export type FigurineSource = "mystery-box" | "sparkycoin-redemption";

export type FigurineRarity = "Common" | "Rare" | "Epic" | "Legendary";

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

export interface ResourceCompletionRewardDefinition {
  worldId: ResourceWorldId;
  badgeId: RewardsBadgeId;
  badgeTitle: string;
  popupTitle: string;
  popupDetail: string;
}

export interface SparkyFigurineDefinition {
  id: string;
  name: string;
  rarity: FigurineRarity;
  vibe: string;
  accentFrom: string;
  accentTo: string;
  glyph: string;
}

export interface OwnedFigurineRecord {
  tokenId: string;
  figurineId: string;
  name: string;
  rarity: FigurineRarity;
  source: FigurineSource;
  receivedAt: string;
  tokenUri?: string;
}

export interface RewardsProfile {
  pitchforkBalance: number;
  claimedDayEntryIds: string[];
  claimedWorldRewardIds: ResourceWorldId[];
  obtainedBadgeIds: RewardsBadgeId[];
  mysteryBoxCount: number;
  openedMysteryBoxIds: string[];
  connectedWalletAddress: string | null;
  figurineMetadataByTokenId: Record<string, OwnedFigurineRecord>;
}

export interface DayEntryRewardResult {
  awarded: boolean;
  amount: number;
  profile: RewardsProfile;
}

export interface WorldCompletionRewardResult {
  awarded: boolean;
  pitchforksAwarded: number;
  mysteryBoxesAwarded: number;
  badgeId: RewardsBadgeId;
  profile: RewardsProfile;
}
