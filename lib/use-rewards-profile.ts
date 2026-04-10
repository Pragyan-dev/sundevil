"use client";

import { useEffect, useState } from "react";

import {
  readRewardsProfile,
  REWARDS_UPDATED_EVENT,
  updateRewardsProfile,
} from "@/lib/rewards";
import type { RewardsProfile } from "@/lib/rewards-types";

export function useRewardsProfile() {
  const [profile, setProfile] = useState<RewardsProfile>(() => readRewardsProfile());

  useEffect(() => {
    const syncProfile = () => {
      setProfile(readRewardsProfile());
    };

    window.addEventListener("storage", syncProfile);
    window.addEventListener(REWARDS_UPDATED_EVENT, syncProfile);

    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener(REWARDS_UPDATED_EVENT, syncProfile);
    };
  }, []);

  return {
    profile,
    updateProfile: updateRewardsProfile,
    refreshProfile: () => setProfile(readRewardsProfile()),
  };
}
