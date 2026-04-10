"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import { useRewardsProfile } from "@/lib/use-rewards-profile";
import {
  getSunBuddyStage,
  toggleSunBuddyVisible,
} from "@/lib/rewards";

const buddyStageImage = {
  1: "/buddy-stage-1.png",
  2: "/buddy-stage-2.png",
  3: "/buddy-stage-3.png",
} as const;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function SunBuddyCompanion() {
  const pathname = usePathname();
  const { profile } = useRewardsProfile();
  const buddyStage = useMemo(
    () => getSunBuddyStage(profile.buddyFeedCount),
    [profile.buddyFeedCount],
  );
  const shouldRenderOnPage = pathname === "/rewards"
    ? profile.buddyVisible
    : profile.buddyCarryEnabled && profile.buddyVisible;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey || event.key.toLowerCase() !== "b" || isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();
      toggleSunBuddyVisible();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!shouldRenderOnPage) {
    return null;
  }

  const buddyOrb = (
    <div className="group relative flex h-36 w-36 animate-[buddyDrift_10s_ease-in-out_infinite] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.98),rgba(255,240,188,0.96)_58%,rgba(255,198,39,0.62))] shadow-[0_18px_40px_rgba(44,17,22,0.14)] ring-1 ring-[#f0ddbf]/70 transition duration-200 hover:scale-[1.04]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,214,92,0.28),transparent_68%)] blur-md" />
      <div className="relative h-[7.75rem] w-[7.75rem] animate-[buddyFloat_4.2s_ease-in-out_infinite]">
        <Image
          src={buddyStageImage[buddyStage]}
          alt="Sun Buddy"
          fill
          className="object-contain"
          sizes="124px"
        />
      </div>
      <div className="pointer-events-none absolute -top-3 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2c1116]/88 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(44,17,22,0.26)] group-hover:block">
        {pathname === "/rewards" ? "Sun Buddy" : "Feed buddy"}
      </div>
    </div>
  );

  return (
    <div className="pointer-events-none fixed bottom-8 left-8 z-30 hidden sm:block">
      <div className="pointer-events-auto">
        {pathname === "/rewards" ? (
          buddyOrb
        ) : (
          <Link href="/rewards" aria-label={`Open rewards and feed Sun Buddy. ${profile.cookieBalance} cookies available.`}>
            {buddyOrb}
          </Link>
        )}
      </div>
    </div>
  );
}
