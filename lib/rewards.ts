"use client";

import type { ResourceWorldId } from "@/lib/resource-discovery-types";
import {
  DAY_ENTRY_PITCHFORK_REWARD,
  DEMO_PITCHFORK_INCREMENT,
  SPARKYCOIN_REDEMPTION_COST,
  WORLD_COMPLETION_PITCHFORK_REWARD,
} from "@/lib/rewards-data";
import type {
  OwnedFigurineRecord,
  RewardsBadgeId,
  RewardsProfile,
  WorldCompletionRewardResult,
} from "@/lib/rewards-types";

export const REWARDS_STORAGE_KEY = "sundevilconnect-rewards-v1";
export const REWARDS_UPDATED_EVENT = "sundevilconnect:rewards-updated";

export function createDefaultRewardsProfile(): RewardsProfile {
  return {
    pitchforkBalance: 0,
    claimedDayEntryIds: [],
    claimedWorldRewardIds: [],
    obtainedBadgeIds: [],
    mysteryBoxCount: 0,
    openedMysteryBoxIds: [],
    connectedWalletAddress: null,
    figurineMetadataByTokenId: {},
  };
}

function dedupe<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function normalizeRewardsProfile(value: unknown): RewardsProfile {
  const defaults = createDefaultRewardsProfile();

  if (typeof value !== "object" || value === null) {
    return defaults;
  }

  const candidate = value as Partial<RewardsProfile>;

  return {
    pitchforkBalance:
      typeof candidate.pitchforkBalance === "number" && Number.isFinite(candidate.pitchforkBalance)
        ? candidate.pitchforkBalance
        : defaults.pitchforkBalance,
    claimedDayEntryIds: Array.isArray(candidate.claimedDayEntryIds)
      ? dedupe(candidate.claimedDayEntryIds.filter((item): item is string => typeof item === "string"))
      : defaults.claimedDayEntryIds,
    claimedWorldRewardIds: Array.isArray(candidate.claimedWorldRewardIds)
      ? dedupe(
          candidate.claimedWorldRewardIds.filter((item): item is ResourceWorldId => typeof item === "string"),
        )
      : defaults.claimedWorldRewardIds,
    obtainedBadgeIds: Array.isArray(candidate.obtainedBadgeIds)
      ? dedupe(candidate.obtainedBadgeIds.filter((item): item is RewardsBadgeId => typeof item === "string"))
      : defaults.obtainedBadgeIds,
    mysteryBoxCount:
      typeof candidate.mysteryBoxCount === "number" && Number.isFinite(candidate.mysteryBoxCount)
        ? candidate.mysteryBoxCount
        : defaults.mysteryBoxCount,
    openedMysteryBoxIds: Array.isArray(candidate.openedMysteryBoxIds)
      ? dedupe(candidate.openedMysteryBoxIds.filter((item): item is string => typeof item === "string"))
      : defaults.openedMysteryBoxIds,
    connectedWalletAddress:
      typeof candidate.connectedWalletAddress === "string" && candidate.connectedWalletAddress.trim()
        ? candidate.connectedWalletAddress
        : null,
    figurineMetadataByTokenId:
      typeof candidate.figurineMetadataByTokenId === "object" && candidate.figurineMetadataByTokenId !== null
        ? (candidate.figurineMetadataByTokenId as Record<string, OwnedFigurineRecord>)
        : defaults.figurineMetadataByTokenId,
  };
}

export function readRewardsProfile(): RewardsProfile {
  if (typeof window === "undefined") {
    return createDefaultRewardsProfile();
  }

  const raw = window.localStorage.getItem(REWARDS_STORAGE_KEY);
  if (!raw) {
    return createDefaultRewardsProfile();
  }

  try {
    return normalizeRewardsProfile(JSON.parse(raw) as unknown);
  } catch {
    window.localStorage.removeItem(REWARDS_STORAGE_KEY);
    return createDefaultRewardsProfile();
  }
}

function emitRewardsUpdated(profile: RewardsProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(REWARDS_UPDATED_EVENT, { detail: profile }));
}

export function writeRewardsProfile(profile: RewardsProfile) {
  if (typeof window === "undefined") {
    return profile;
  }

  const normalized = normalizeRewardsProfile(profile);
  window.localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(normalized));
  emitRewardsUpdated(normalized);
  return normalized;
}

export function updateRewardsProfile(
  updater: (current: RewardsProfile) => RewardsProfile,
) {
  return writeRewardsProfile(updater(readRewardsProfile()));
}

export function claimDayEntryPitchforks(dayEntryId: string) {
  let awarded = false;
  const profile = updateRewardsProfile((current) => {
    if (current.claimedDayEntryIds.includes(dayEntryId)) {
      return current;
    }

    awarded = true;

    return {
      ...current,
      pitchforkBalance: current.pitchforkBalance + DAY_ENTRY_PITCHFORK_REWARD,
      claimedDayEntryIds: [...current.claimedDayEntryIds, dayEntryId],
    };
  });

  return {
    awarded,
    amount: DAY_ENTRY_PITCHFORK_REWARD,
    profile,
  };
}

export function claimWorldCompletionBundle(
  worldId: ResourceWorldId,
  badgeId: RewardsBadgeId,
): WorldCompletionRewardResult {
  let awarded = false;

  const profile = updateRewardsProfile((current) => {
    if (current.claimedWorldRewardIds.includes(worldId)) {
      return current;
    }

    awarded = true;

    return {
      ...current,
      pitchforkBalance: current.pitchforkBalance + WORLD_COMPLETION_PITCHFORK_REWARD,
      mysteryBoxCount: current.mysteryBoxCount + 1,
      claimedWorldRewardIds: [...current.claimedWorldRewardIds, worldId],
      obtainedBadgeIds: dedupe([...current.obtainedBadgeIds, badgeId]),
    };
  });

  return {
    awarded,
    pitchforksAwarded: WORLD_COMPLETION_PITCHFORK_REWARD,
    mysteryBoxesAwarded: 1,
    badgeId,
    profile,
  };
}

export function addDemoPitchforks(amount = DEMO_PITCHFORK_INCREMENT) {
  return updateRewardsProfile((current) => ({
    ...current,
    pitchforkBalance: current.pitchforkBalance + amount,
  }));
}

export function spendPitchforks(amount: number) {
  let success = false;

  const profile = updateRewardsProfile((current) => {
    if (current.pitchforkBalance < amount) {
      return current;
    }

    success = true;
    return {
      ...current,
      pitchforkBalance: current.pitchforkBalance - amount,
    };
  });

  return { success, profile };
}

export function setConnectedWalletAddress(address: string | null) {
  return updateRewardsProfile((current) => ({
    ...current,
    connectedWalletAddress: address?.trim() || null,
  }));
}

export function recordMintedFigurine(record: OwnedFigurineRecord) {
  return updateRewardsProfile((current) => ({
    ...current,
    figurineMetadataByTokenId: {
      ...current.figurineMetadataByTokenId,
      [record.tokenId]: record,
    },
  }));
}

export function consumeMysteryBox(openedMysteryBoxId: string) {
  let success = false;

  const profile = updateRewardsProfile((current) => {
    if (current.mysteryBoxCount <= 0 || current.openedMysteryBoxIds.includes(openedMysteryBoxId)) {
      return current;
    }

    success = true;

    return {
      ...current,
      mysteryBoxCount: current.mysteryBoxCount - 1,
      openedMysteryBoxIds: [...current.openedMysteryBoxIds, openedMysteryBoxId],
    };
  });

  return { success, profile };
}

export function getDayEntryRewardId(dayNumber: number) {
  return `resource-discovery-day-${dayNumber}`;
}

export function formatPitchforks(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatSparkyCoins(value: bigint) {
  const base = BigInt(10) ** BigInt(18);
  const whole = value / base;
  return new Intl.NumberFormat("en-US").format(Number(whole));
}

export function getRedeemCostLabel() {
  return `${SPARKYCOIN_REDEMPTION_COST} SparkyCoins`;
}
