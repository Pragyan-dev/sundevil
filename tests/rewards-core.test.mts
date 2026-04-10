import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import {
  claimDayEntryPitchforks,
  claimWorldCompletionBundle,
  createDefaultRewardsProfile,
  getDayEntryRewardId,
  normalizeRewardsProfile,
  readRewardsProfile,
  redeemPitchforkReward,
  REWARDS_STORAGE_KEY,
  writeRewardsProfile,
} from "../lib/rewards.ts";

class LocalStorageMock {
  private readonly store = new Map<string, string>();

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

function installWindow() {
  const eventTarget = new EventTarget();
  const localStorage = new LocalStorageMock();
  const windowMock = Object.assign(eventTarget, {
    localStorage,
  });

  class CustomEventMock<T = unknown> extends Event {
    detail: T;

    constructor(type: string, init?: CustomEventInit<T>) {
      super(type, init);
      this.detail = init?.detail as T;
    }
  }

  Object.assign(globalThis, {
    CustomEvent: CustomEventMock,
    localStorage,
    window: windowMock,
  });
}

function resetRewardsProfile(profile = createDefaultRewardsProfile()) {
  writeRewardsProfile(profile);
}

beforeEach(() => {
  installWindow();
  resetRewardsProfile();
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "localStorage");
});

test("day entry pitchfork rewards are only granted once", () => {
  const rewardId = getDayEntryRewardId(1);
  const firstClaim = claimDayEntryPitchforks(rewardId);
  const secondClaim = claimDayEntryPitchforks(rewardId);

  assert.equal(firstClaim.awarded, true);
  assert.equal(firstClaim.amount, 20);
  assert.equal(secondClaim.awarded, false);
  assert.equal(readRewardsProfile().pitchforkBalance, 20);
});

test("world completion awards pitchforks and badges without mystery box state", () => {
  const result = claimWorldCompletionBundle("first-gen-support", "student-success-spark");
  const profile = readRewardsProfile();

  assert.equal(result.awarded, true);
  assert.equal(result.pitchforksAwarded, 100);
  assert.deepEqual(profile.claimedWorldRewardIds, ["first-gen-support"]);
  assert.deepEqual(profile.obtainedBadgeIds, ["student-success-spark"]);
  assert.equal(profile.redemptionHistory.length, 0);
});

test("redeeming a local reward deducts pitchforks and persists redemption history", () => {
  resetRewardsProfile({
    ...createDefaultRewardsProfile(),
    pitchforkBalance: 450,
  });

  const result = redeemPitchforkReward("local-attraction-pass");
  const profile = readRewardsProfile();

  assert.equal(result.success, true);
  assert.equal(profile.pitchforkBalance, 0);
  assert.equal(profile.redemptionHistory.length, 1);
  assert.equal(profile.redemptionHistory[0]?.rewardId, "local-attraction-pass");
});

test("redemption does not spend pitchforks when the balance is too low", () => {
  resetRewardsProfile({
    ...createDefaultRewardsProfile(),
    pitchforkBalance: 100,
  });

  const result = redeemPitchforkReward("athletics-ticket");
  const profile = readRewardsProfile();

  assert.equal(result.success, false);
  assert.equal(profile.pitchforkBalance, 100);
  assert.equal(profile.redemptionHistory.length, 0);
});

test("legacy blockchain-era reward profiles normalize into the simplified shape", () => {
  const normalized = normalizeRewardsProfile({
    pitchforkBalance: 275,
    claimedDayEntryIds: ["resource-discovery-day-1", "resource-discovery-day-1"],
    claimedWorldRewardIds: ["first-gen-support"],
    obtainedBadgeIds: ["student-success-spark"],
    mysteryBoxCount: 2,
    openedMysteryBoxIds: ["box-1"],
    connectedWalletAddress: "0x123",
    figurineMetadataByTokenId: {
      "1": {
        tokenId: "1",
      },
    },
    redemptionHistory: [
      {
        rewardId: "athletics-ticket",
        redeemedAt: "2026-04-10T00:00:00.000Z",
      },
    ],
  });

  assert.deepEqual(normalized, {
    pitchforkBalance: 275,
    claimedDayEntryIds: ["resource-discovery-day-1"],
    claimedWorldRewardIds: ["first-gen-support"],
    obtainedBadgeIds: ["student-success-spark"],
    redemptionHistory: [
      {
        rewardId: "athletics-ticket",
        redeemedAt: "2026-04-10T00:00:00.000Z",
      },
    ],
  });

  const raw = JSON.stringify({
    pitchforkBalance: 75,
    mysteryBoxCount: 3,
  });

  globalThis.window.localStorage.setItem(REWARDS_STORAGE_KEY, raw);
  assert.deepEqual(readRewardsProfile(), {
    ...createDefaultRewardsProfile(),
    pitchforkBalance: 75,
  });
});
