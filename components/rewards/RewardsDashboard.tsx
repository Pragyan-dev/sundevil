"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  rewardsBadgeCatalog,
  rewardsMissionCatalog,
  rewardsRedemptionCatalog,
} from "@/lib/rewards-data";
import {
  convertPitchforksToCookies,
  feedSunBuddy,
  formatPitchforks,
  getDayEntryRewardId,
  getSunBuddyStage,
  redeemPitchforkReward,
  setSunBuddyCarryEnabled,
  setSunBuddyVisible,
  SUN_BUDDY_COOKIE_PITCHFORK_COST,
} from "@/lib/rewards";
import { useRewardsProfile } from "@/lib/use-rewards-profile";
import type { RewardsBadgeId } from "@/lib/rewards-types";

type ActionTone = "success" | "warning";

type ActionMessage = {
  text: string;
  tone: ActionTone;
};

const CARD_SURFACE =
  "relative h-full overflow-hidden rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,247,240,0.94))] shadow-[0_24px_80px_rgba(44,17,22,0.08)]";

const SLIDE_TITLES = ["Missions", "Badges", "Pitchfork Redemption", "Sun Buddy"] as const;
const buddyStageImage = {
  1: "/buddy-stage-1.png",
  2: "/buddy-stage-2.png",
  3: "/buddy-stage-3.png",
} as const;
const buddyStageLabel = {
  1: "Sprout",
  2: "Glow-up",
  3: "Full sun",
} as const;

export function RewardsDashboard() {
  const { profile, refreshProfile } = useRewardsProfile();
  const [activeSlide, setActiveSlide] = useState(0);
  const [message, setMessage] = useState<ActionMessage | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const buddyStage = useMemo(() => getSunBuddyStage(profile.buddyFeedCount), [profile.buddyFeedCount]);

  const dayOneClaimed = profile.claimedDayEntryIds.includes(getDayEntryRewardId(1));

  const missions = useMemo(
    () =>
      rewardsMissionCatalog.map((mission) => {
        const completed = mission.linkedBadgeId
          ? profile.obtainedBadgeIds.includes(mission.linkedBadgeId)
          : dayOneClaimed;

        return {
          ...mission,
          completed,
        };
      }),
    [dayOneClaimed, profile.obtainedBadgeIds],
  );

  const obtainedBadgeIds = useMemo(
    () => new Set<RewardsBadgeId>(profile.obtainedBadgeIds),
    [profile.obtainedBadgeIds],
  );

  const completedMissionCount = missions.filter((mission) => mission.completed).length;
  const completedMissionPercent =
    missions.length > 0 ? Math.round((completedMissionCount / missions.length) * 100) : 0;

  const redemptionHistory = useMemo(
    () =>
      profile.redemptionHistory
        .map((entry) => {
          const reward = rewardsRedemptionCatalog.find((item) => item.id === entry.rewardId);

          if (!reward) {
            return null;
          }

          return {
            ...entry,
            title: reward.title,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .slice(0, 6),
    [profile.redemptionHistory],
  );

  function goToSlide(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, SLIDE_TITLES.length - 1));
    const target = carousel.children.item(nextIndex) as HTMLElement | null;

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    setActiveSlide(nextIndex);
  }

  function handleRedeem(rewardId: string) {
    const reward = rewardsRedemptionCatalog.find((entry) => entry.id === rewardId);
    if (!reward) {
      return;
    }

    const result = redeemPitchforkReward(rewardId);

    if (!result.success) {
      setMessage({
        tone: "warning",
        text: `You need ${formatPitchforks(reward.cost)} pitchforks to redeem ${reward.title}.`,
      });
      return;
    }

    refreshProfile();
    setMessage({
      tone: "success",
      text: `${reward.title} redeemed for ${formatPitchforks(reward.cost)} pitchforks.`,
    });
  }

  function handleConvertCookies(cookieCount: number) {
    const result = convertPitchforksToCookies(cookieCount);

    if (!result.success) {
      setMessage({
        tone: "warning",
        text: `You need ${formatPitchforks(result.pitchforkCost)} pitchforks to convert ${result.cookieCount} cookie${result.cookieCount === 1 ? "" : "s"}.`,
      });
      return;
    }

    refreshProfile();
    setMessage({
      tone: "success",
      text: `${result.cookieCount} cookie${result.cookieCount === 1 ? "" : "s"} baked for ${formatPitchforks(result.pitchforkCost)} pitchforks.`,
    });
  }

  function handleFeedBuddy() {
    const result = feedSunBuddy(1);

    if (!result.success) {
      setMessage({
        tone: "warning",
        text: "You need at least 1 cookie before Sun Buddy can snack.",
      });
      return;
    }

    refreshProfile();
    setMessage({
      tone: "success",
      text: "Sun Buddy had a cookie and grew a little brighter.",
    });
  }

  function handleCarryToggle(enabled: boolean) {
    setSunBuddyCarryEnabled(enabled);
    refreshProfile();
    setMessage({
      tone: "success",
      text: enabled
        ? "Sun Buddy will now follow you around the app. Press Shift + B anytime to hide or show it."
        : "Sun Buddy is resting for now.",
    });
  }

  function handleVisibilityToggle(visible: boolean) {
    setSunBuddyVisible(visible);
    refreshProfile();
    setMessage({
      tone: "success",
      text: visible ? "Sun Buddy is visible again." : "Sun Buddy is hidden until you bring it back.",
    });
  }

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const handleScroll = () => {
      const width = carousel.clientWidth;
      if (!width) {
        return;
      }

      const nextIndex = Math.round(carousel.scrollLeft / width);
      setActiveSlide(Math.max(0, Math.min(nextIndex, SLIDE_TITLES.length - 1)));
    };

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,198,39,0.22),transparent_28%),linear-gradient(180deg,#f6f1e9_0%,#efe5dc_50%,#f5efe8_100%)] text-[#2c1116]">
      <header className="shrink-0 border-b border-[#e4d8ca] bg-white">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Rewards
            </p>
            <h1 className="mt-1 font-[Arial,sans-serif] text-[1.5rem] font-black text-[#2c1116] sm:text-[1.8rem]">
              Pitchfork Balance
            </h1>
          </div>
          <div className="rounded-[1.25rem] border border-[#eadfce] bg-[#fff8ef] px-4 py-3 text-right shadow-[0_10px_30px_rgba(44,17,22,0.06)]">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
              Available now
            </p>
            <p className="mt-1 font-[Arial,sans-serif] text-[1.8rem] font-black text-[#2c1116] sm:text-[2.1rem]">
              {formatPitchforks(profile.pitchforkBalance)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#6f4a4e]">
              Swipe, scroll, or use the controls to move between rewards panels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8cab8] bg-white text-lg text-[#8c1d40] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Previous rewards card"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeSlide + 1)}
              disabled={activeSlide === SLIDE_TITLES.length - 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d8cab8] bg-white text-lg text-[#8c1d40] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Next rewards card"
            >
              →
            </button>
          </div>
        </div>

        <div className="mb-4 flex shrink-0 items-center justify-center gap-2">
          {SLIDE_TITLES.map((title, index) => (
            <button
              key={title}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition ${
                index === activeSlide ? "w-10 bg-[#8c1d40]" : "w-3 bg-[#d8cab8]"
              }`}
              aria-label={`Show ${title} card`}
              aria-pressed={index === activeSlide}
            />
          ))}
        </div>

        <div
          ref={carouselRef}
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goToSlide(activeSlide - 1);
            }

            if (event.key === "ArrowRight") {
              event.preventDefault();
              goToSlide(activeSlide + 1);
            }
          }}
          tabIndex={0}
          aria-label="Rewards carousel"
        >
          <div className="min-h-0 w-full shrink-0 snap-start pr-4 last:pr-0">
            <article className={CARD_SURFACE}>
              <div className="flex h-full min-h-0 flex-col p-5 sm:p-6">
                <div className="shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                        Missions
                      </p>
                      <h2 className="mt-2 font-[Arial,sans-serif] text-[1.5rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                        Complete missions to unlock badges
                      </h2>
                    </div>

                    <span className="rounded-full bg-[#fff1cf] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                      {completedMissionCount}/{missions.length} complete
                    </span>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#ede5d8]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#8c1d40,#c94f72)] transition-all duration-700"
                      style={{ width: `${completedMissionPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-3">
                    {missions.map((mission) => (
                      <div
                        key={mission.id}
                        className={`rounded-[1.35rem] border px-4 py-4 ${
                          mission.completed
                            ? "border-[#f0d9e5] bg-[#fce8ee]"
                            : "border-[#eadfce] bg-white/80"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                              mission.completed
                                ? "bg-[#8c1d40] text-white"
                                : "bg-[#efe8df] text-[#8c1d40]"
                            }`}
                          >
                            {mission.completed ? "✓" : mission.linkedBadgeId ? "🏅" : "🔱"}
                          </span>
                          <div>
                            <p className="font-[Arial,sans-serif] text-[1rem] font-bold text-[#2c1116]">
                              {mission.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#6f4a4e]">
                              {mission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="min-h-0 w-full shrink-0 snap-start pr-4 last:pr-0">
            <article className={CARD_SURFACE}>
              <div className="flex h-full min-h-0 flex-col p-5 sm:p-6">
                <div className="shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                        Badges
                      </p>
                      <h2 className="mt-2 font-[Arial,sans-serif] text-[1.5rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                        Badge vault
                      </h2>
                    </div>
                    <p className="text-[0.72rem] text-[#6f4a4e]">Hover to reveal</p>
                  </div>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {rewardsBadgeCatalog.map((badge) => {
                      const obtained = obtainedBadgeIds.has(badge.id);

                      return (
                        <div
                          key={badge.id}
                          className={`group relative rounded-[1.4rem] p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(44,17,22,0.12)] ${
                            obtained
                              ? "border border-[#eadfce] bg-white/88"
                              : "border border-dashed border-[#d7c4af] bg-[#fdf9f4]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-[1.3rem] text-[1.8rem] ${
                                obtained
                                  ? "bg-[linear-gradient(135deg,#fff2c6,#ffd86c)] text-[#8c1d40]"
                                  : "bg-[#2c1116] text-white"
                              }`}
                              aria-label={obtained ? badge.title : badge.silhouetteLabel}
                            >
                              {obtained ? badge.icon : "?"}
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] ${
                                obtained
                                  ? "bg-[#effff5] text-[#0f8f53]"
                                  : badge.obtainableNow
                                    ? "bg-[#fff5e7] text-[#8c1d40]"
                                    : "bg-[#efe8df] text-[#8a7d75]"
                              }`}
                            >
                              {obtained ? "Unlocked" : badge.obtainableNow ? "Available" : "Coming Soon"}
                            </span>
                          </div>

                          <p className="mt-4 font-[Arial,sans-serif] text-[1rem] font-bold text-[#2c1116]">
                            {obtained ? badge.title : "Unknown badge"}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                            {obtained ? badge.description : badge.silhouetteLabel}
                          </p>

                          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[1rem] border border-[#eadfce] bg-[#2c1116] px-3 py-3 text-sm leading-5 text-[#fff4df] opacity-0 shadow-[0_12px_24px_rgba(44,17,22,0.18)] transition group-hover:opacity-100 group-focus-within:opacity-100">
                            {badge.unlockHint}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="min-h-0 w-full shrink-0 snap-start">
            <article className={CARD_SURFACE}>
              <div className="flex h-full min-h-0 flex-col p-5 sm:p-6">
                <div className="shrink-0">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                    Pitchfork Redemption
                  </p>
                  <h2 className="mt-2 font-[Arial,sans-serif] text-[1.5rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                    Spend pitchforks on Sun Devil perks
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f4a4e]">
                    This local demo mirrors the kinds of rewards highlighted by Sun Devil Rewards:
                    tickets, merchandise, attractions, and exclusive experiences.
                  </p>

                  {message ? (
                    <div
                      className={`mt-4 rounded-[1.1rem] border px-4 py-3 text-sm leading-6 ${
                        message.tone === "success"
                          ? "border-[#8fd8a8] bg-[#e8fff0] text-[#23492f]"
                          : "border-[#f1cf8b] bg-[#fff7e6] text-[#734f10]"
                      }`}
                    >
                      {message.text}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
                    <div className="grid gap-3">
                      {rewardsRedemptionCatalog.map((reward) => {
                        const disabled = profile.pitchforkBalance < reward.cost;

                        return (
                          <div
                            key={reward.id}
                            className="rounded-[1.4rem] border border-[#eadfce] bg-white/88 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-[#fff1cf] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                                    {reward.category}
                                  </span>
                                  <span className="rounded-full bg-[#2c1116] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#fff4df]">
                                    {formatPitchforks(reward.cost)} pitchforks
                                  </span>
                                </div>
                                <p className="mt-3 font-[Arial,sans-serif] text-[1.05rem] font-bold text-[#2c1116]">
                                  {reward.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-[#6f4a4e]">
                                  {reward.description}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRedeem(reward.id)}
                                disabled={disabled}
                                className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736] disabled:cursor-not-allowed disabled:bg-[#cfbac1]"
                              >
                                {disabled ? "Not enough pitchforks" : "Redeem"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <aside className="flex h-fit flex-col gap-4 rounded-[1.5rem] border border-[#eadfce] bg-[#fff9f1] p-4">
                      <div className="rounded-[1.2rem] border border-[#eadfce] bg-white px-4 py-4">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40]">
                          Current balance
                        </p>
                        <p className="mt-2 font-[Arial,sans-serif] text-[1.9rem] font-black text-[#2c1116]">
                          {formatPitchforks(profile.pitchforkBalance)}
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] border border-[#eadfce] bg-white px-4 py-4">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40]">
                          Recent redemptions
                        </p>
                        {redemptionHistory.length ? (
                          <div className="mt-3 grid gap-2">
                            {redemptionHistory.map((entry) => (
                              <div
                                key={`${entry.rewardId}-${entry.redeemedAt}`}
                                className="rounded-[1rem] border border-[#efe4d7] bg-[#fffaf4] px-3 py-3 text-sm text-[#6f4a4e]"
                              >
                                <p className="font-bold text-[#2c1116]">{entry.title}</p>
                                <p className="mt-1">
                                  {new Date(entry.redeemedAt).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
                            No local redemptions yet. Complete missions and come back when you have
                            enough pitchforks to cash in.
                          </p>
                        )}
                      </div>

                      <a
                        href="https://sundevilrewards.asu.edu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-[#d8cab8] bg-white px-4 py-3 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5 hover:bg-[#fff4df]"
                      >
                        Browse the official Sun Devil Rewards site
                      </a>
                    </aside>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="min-h-0 w-full shrink-0 snap-start">
            <article className={CARD_SURFACE}>
              <div className="flex h-full min-h-0 flex-col p-5 sm:p-6">
                <div className="shrink-0">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                    Sun Buddy
                  </p>
                  <h2 className="mt-2 font-[Arial,sans-serif] text-[1.5rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                    Feed your buddy and take it with you
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f4a4e]">
                    Convert pitchforks into cookies, feed Sun Buddy, and carry it through the app as a quiet companion.
                  </p>

                  {message ? (
                    <div
                      className={`mt-4 rounded-[1.1rem] border px-4 py-3 text-sm leading-6 ${
                        message.tone === "success"
                          ? "border-[#8fd8a8] bg-[#e8fff0] text-[#23492f]"
                          : "border-[#f1cf8b] bg-[#fff7e6] text-[#734f10]"
                      }`}
                    >
                      {message.text}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                    <div className="grid gap-4">
                      <section className="rounded-[1.6rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdf8,#fff6de)] p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.95),rgba(255,235,170,0.92)_60%,rgba(255,198,39,0.55))] shadow-[0_18px_36px_rgba(255,198,39,0.22)]">
                              <Image
                                src={buddyStageImage[buddyStage]}
                                alt="Sun Buddy growth stage"
                                fill
                                className="object-contain p-2"
                                sizes="112px"
                              />
                            </div>
                            <div>
                              <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                                Current stage
                              </p>
                              <h3 className="mt-2 font-[Arial,sans-serif] text-[1.45rem] font-black text-[#2c1116]">
                                {buddyStageLabel[buddyStage]}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                                {profile.buddyFeedCount} cookie{profile.buddyFeedCount === 1 ? "" : "s"} fed so far
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2 sm:text-right">
                            <div className="rounded-[1rem] border border-[#eadfce] bg-white/85 px-4 py-3">
                              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40]">
                                Cookies
                              </p>
                              <p className="mt-1 text-[1.55rem] font-black text-[#2c1116]">
                                {profile.cookieBalance}
                              </p>
                            </div>
                            <div className="rounded-[1rem] border border-[#eadfce] bg-white/85 px-4 py-3">
                              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40]">
                                Pitchfork cost
                              </p>
                              <p className="mt-1 text-sm font-bold text-[#2c1116]">
                                {formatPitchforks(SUN_BUDDY_COOKIE_PITCHFORK_COST)} per cookie
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-[1.45rem] border border-[#eadfce] bg-white/90 p-4">
                          <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                            Bake cookies
                          </p>
                          <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
                            Trade pitchforks for buddy snacks.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleConvertCookies(1)}
                              className="rounded-full bg-[#ffc627] px-4 py-2.5 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                            >
                              1 cookie
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConvertCookies(5)}
                              className="rounded-full border border-[#d8cab8] bg-white px-4 py-2.5 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5 hover:bg-[#fff4df]"
                            >
                              5 cookies
                            </button>
                          </div>
                        </div>

                        <div className="rounded-[1.45rem] border border-[#eadfce] bg-white/90 p-4">
                          <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                            Feed buddy
                          </p>
                          <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
                            Each cookie helps Sun Buddy grow into the next phase.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={handleFeedBuddy}
                              className="rounded-full bg-[#8c1d40] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                            >
                              Feed 1 cookie
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>

                    <aside className="flex h-fit flex-col gap-4 rounded-[1.5rem] border border-[#eadfce] bg-[#fff9f1] p-4">
                      <div className="rounded-[1.2rem] border border-[#eadfce] bg-white px-4 py-4">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40]">
                          Carry buddy
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
                          Keep Sun Buddy around the app as a small companion.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleCarryToggle(true)}
                            className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                              profile.buddyCarryEnabled
                                ? "bg-[#16a34a] text-white"
                                : "bg-[#8c1d40] text-white hover:-translate-y-0.5 hover:bg-[#731736]"
                            }`}
                          >
                            {profile.buddyCarryEnabled ? "Carrying now" : "Take buddy with me"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCarryToggle(false)}
                            className="rounded-full border border-[#d8cab8] bg-white px-4 py-2.5 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5 hover:bg-[#fff4df]"
                          >
                            Let buddy rest
                          </button>
                        </div>
                      </div>

                      <div className="rounded-[1.2rem] border border-[#eadfce] bg-white px-4 py-4">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8c1d40]">
                          Quick toggle
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
                          Press <span className="font-black text-[#2c1116]">Shift + B</span> anywhere in the app to make Sun Buddy appear or disappear.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleVisibilityToggle(true)}
                            className="rounded-full bg-[#ffc627] px-4 py-2.5 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                          >
                            Show buddy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVisibilityToggle(false)}
                            className="rounded-full border border-[#d8cab8] bg-white px-4 py-2.5 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5 hover:bg-[#fff4df]"
                          >
                            Hide buddy
                          </button>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
