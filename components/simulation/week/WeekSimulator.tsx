"use client";

import { useEffect, useMemo, useState } from "react";

import { CharacterGuide } from "@/components/simulation/week/CharacterGuide";
import { ProgressTracker } from "@/components/simulation/week/ProgressTracker";
import { DayCard } from "@/components/simulation/week/DayCard";
import { ReminderBanner } from "@/components/simulation/week/ReminderBanner";
import { EventCard } from "@/components/simulation/week/EventCard";
import { ClassCard } from "@/components/simulation/week/ClassCard";
import { AdvisorCard } from "@/components/simulation/week/AdvisorCard";
import { CalendarPicker } from "@/components/simulation/week/CalendarPicker";
import { MessageComposer } from "@/components/simulation/week/MessageComposer";
import { RewardToast } from "@/components/simulation/week/RewardToast";
import { BadgeEarnedModal } from "@/components/simulation/week/BadgeEarnedModal";
import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import {
  createWeekSimulatorProgress,
  getWeekDay,
  getWeekReminders,
  isWeekSimulatorProgress,
  weekResourceQuestIds,
  weekSimulatorBadges,
  weekSimulatorDays,
} from "@/data/week-simulator";
import { resourceWorlds } from "@/data/resource-discovery-worlds";
import type {
  ResourceWorldId,
} from "@/lib/resource-discovery-types";
import type {
  ScheduledHomeworkSlot,
  WeekBadgeId,
  WeekDayId,
  WeekEvent,
  WeekRewardToast,
  WeekSimulatorProgress,
} from "@/lib/week-simulator-types";

interface WeekSimulatorProps {
  onLaunchResourceWorld: (worldId: ResourceWorldId) => void;
}

const STORAGE_KEY = "asu-week-simulator-v1";

function createToast(
  kind: WeekRewardToast["kind"],
  title: string,
  detail: string,
  options: Pick<WeekRewardToast, "points" | "badgeId"> = {},
): WeekRewardToast {
  return {
    id: `${kind}-${Math.random().toString(36).slice(2, 9)}`,
    kind,
    title,
    detail,
    ...options,
  };
}

function getEventComplete(progress: WeekSimulatorProgress, event: WeekEvent) {
  if (event.type === "class") {
    return progress.readNoticeIds.includes(event.id);
  }

  if (event.type === "message") {
    return progress.professorMessageSent;
  }

  if (event.type === "resource") {
    return progress.exploredResourceWorldIds.length > 0;
  }

  if (event.type === "homework" && event.id === "day3-homework-plan") {
    return Boolean(progress.scheduledHomeworkSlot);
  }

  if (event.type === "deadline") {
    return progress.submittedHomework;
  }

  return progress.completedEventIds.includes(event.id);
}

function getDayComplete(progress: WeekSimulatorProgress, dayId: WeekDayId) {
  const day = getWeekDay(dayId);
  if (!day) {
    return false;
  }

  return day.events.every((event) => getEventComplete(progress, event));
}

function getEventGuideCopy(event: WeekEvent | null) {
  if (!event) {
    return {
      expression: "happy" as const,
      title: "Pick a task",
      message: "Sparky is ready whenever you want to open the next part of the day.",
    };
  }

  switch (event.type) {
    case "class":
      return {
        expression: "happy" as const,
        title: `${event.courseCode} scene`,
        message: `Let us make ${event.title} feel familiar before you walk in. Room vibe first, Canvas notice second.`,
      };
    case "advising":
      return {
        expression: "idea" as const,
        title: "Advising walkthrough",
        message: "This is just a supportive conversation. Bring the confusing part into the room and let the appointment do its job.",
      };
    case "homework":
      return {
        expression: "idea" as const,
        title: "Calendar move",
        message: "The goal is not perfection. The goal is giving the week one real, protected slot so the reminder has somewhere to land.",
      };
    case "message":
      return {
        expression: "smirk" as const,
        title: "Office-hours message",
        message: "Short, polite, and specific wins here. You do not need a fancy email, just a clear one.",
      };
    case "resource":
      return {
        expression: "happy" as const,
        title: "Free-day side quest",
        message: "Low-pressure exploration is the best kind. Pick any support world that feels useful today.",
      };
    case "free-day":
      return {
        expression: "smirk" as const,
        title: "Saturday reset",
        message: "Rest and light prep both count. Choose the version of calm that feels most real for you.",
      };
    case "deadline":
      return {
        expression: "anxious" as const,
        title: "Due-date check",
        message: "Urgent does not have to mean scary. This should feel like a final nudge, not a spiral.",
      };
    default:
      return {
        expression: "happy" as const,
        title: "Next task",
        message: "Open the task and take it one move at a time.",
      };
  }
}

export function WeekSimulator({ onLaunchResourceWorld }: WeekSimulatorProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [progress, setProgress] = useState<WeekSimulatorProgress>(createWeekSimulatorProgress);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<WeekRewardToast[]>([]);
  const [latestBadgeId, setLatestBadgeId] = useState<WeekBadgeId | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let frameId = 0;
    let nextProgress: WeekSimulatorProgress | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (isWeekSimulatorProgress(parsed)) {
          nextProgress = { ...createWeekSimulatorProgress(), ...parsed };
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    frameId = window.requestAnimationFrame(() => {
      if (nextProgress) {
        setProgress(nextProgress);
      }
      setIsHydrated(true);
    });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [isHydrated, progress]);

  const reminders = useMemo(() => getWeekReminders(progress), [progress]);
  const selectedDay = getWeekDay(progress.selectedDayId) ?? weekSimulatorDays[0];
  const dayReminders = reminders.filter((reminder) => reminder.dayId === selectedDay.id);
  const completedDays = weekSimulatorDays.filter((day) => getDayComplete(progress, day.id)).length;
  const finishedWeek = completedDays === weekSimulatorDays.length;
  const activeEvent =
    selectedDay.events.find((event) => event.id === activeEventId) ??
    selectedDay.events.find((event) => !getEventComplete(progress, event)) ??
    selectedDay.events[0] ??
    null;
  const eventGuide = getEventGuideCopy(activeEvent);

  useEffect(() => {
    const unseenReminder = dayReminders.find(
      (reminder) => !progress.acknowledgedReminderIds.includes(reminder.id),
    );

    if (!unseenReminder) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setToasts((current) => {
        if (current.some((item) => item.kind === "reminder" && item.detail === unseenReminder.message)) {
          return current;
        }

        return [
          {
            id: unseenReminder.id,
            kind: "reminder",
            title: "Reminder ready",
            detail: unseenReminder.message,
          },
          ...current,
        ].slice(0, 4);
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [dayReminders, progress.acknowledgedReminderIds]);

  function applyProgressUpdate(
    updater: (
      current: WeekSimulatorProgress,
    ) => {
      nextProgress: WeekSimulatorProgress;
      toasts?: WeekRewardToast[];
      badgeId?: WeekBadgeId | null;
    },
  ) {
    setProgress((current) => {
      const { nextProgress, toasts: nextToasts = [], badgeId } = updater(current);

      if (nextToasts.length) {
        queueMicrotask(() => {
          setToasts((existing) => [...nextToasts, ...existing].slice(0, 4));
        });
      }

      if (badgeId) {
        queueMicrotask(() => {
          setLatestBadgeId(badgeId);
        });
      }

      return nextProgress;
    });
  }

  function maybeAwardBadge(
    nextProgress: WeekSimulatorProgress,
    badgeId: WeekBadgeId,
    toasts: WeekRewardToast[],
  ) {
    if (nextProgress.earnedBadgeIds.includes(badgeId)) {
      return { nextProgress, badgeId: null as WeekBadgeId | null, toasts };
    }

    const badge = weekSimulatorBadges.find((entry) => entry.id === badgeId);
    if (!badge) {
      return { nextProgress, badgeId: null as WeekBadgeId | null, toasts };
    }

    return {
      nextProgress: {
        ...nextProgress,
        earnedBadgeIds: [...nextProgress.earnedBadgeIds, badgeId],
      },
      badgeId,
      toasts: [
        ...toasts,
        createToast("badge", badge.title, badge.description, { badgeId }),
      ],
    };
  }

  function maybeCompleteDay(current: WeekSimulatorProgress, dayId: WeekDayId) {
    if (current.completedDayIds.includes(dayId) || !getDayComplete(current, dayId)) {
      return { nextProgress: current, toasts: [] as WeekRewardToast[], badgeId: null as WeekBadgeId | null };
    }

    const nextCompletedDayIds = [...current.completedDayIds, dayId];
    let nextProgress = {
      ...current,
      completedDayIds: nextCompletedDayIds,
    };
    let toasts = [
      createToast("points", `Day ${weekSimulatorDays.find((day) => day.id === dayId)?.number} complete`, "Nice. The next day is now ready.", {
        points: 20,
      }),
    ];
    nextProgress = { ...nextProgress, points: nextProgress.points + 20 };
    let badgeId: WeekBadgeId | null = null;

    if (dayId === "day-1") {
      const result = maybeAwardBadge(nextProgress, "first-class-day", toasts);
      nextProgress = result.nextProgress;
      toasts = result.toasts;
      badgeId = result.badgeId;
    }

    if (dayId === "day-2") {
      const result = maybeAwardBadge(nextProgress, "first-advising-session", toasts);
      nextProgress = result.nextProgress;
      toasts = result.toasts;
      badgeId = badgeId ?? result.badgeId;
    }

    if (dayId === "day-7") {
      const result = maybeAwardBadge(nextProgress, "full-week-complete", toasts);
      nextProgress = result.nextProgress;
      toasts = result.toasts;
      badgeId = badgeId ?? result.badgeId;
    }

    return { nextProgress, toasts, badgeId };
  }

  function openDay(dayId: WeekDayId) {
    setProgress((current) => ({ ...current, selectedDayId: dayId }));
  }

  function openEvent(eventId: string) {
    setActiveEventId(eventId);

    applyProgressUpdate((current) => {
      if (current.openedEventIds.includes(eventId)) {
        return { nextProgress: current };
      }

      return {
        nextProgress: {
          ...current,
          openedEventIds: [...current.openedEventIds, eventId],
          points: current.points + 5,
        },
        toasts: [
          createToast("points", "+5 event opened", "You stepped into the next part of the week.", {
            points: 5,
          }),
        ],
      };
    });
  }

  function acknowledgeReminder(reminderId: string) {
    applyProgressUpdate((current) => {
      if (current.acknowledgedReminderIds.includes(reminderId)) {
        return { nextProgress: current };
      }

      return {
        nextProgress: {
          ...current,
          acknowledgedReminderIds: [...current.acknowledgedReminderIds, reminderId],
          points: current.points + 5,
        },
        toasts: [
          createToast("points", "+5 reminder checked", "Small check-ins keep the week from sneaking up on you.", {
            points: 5,
          }),
        ],
      };
    });
  }

  function markPanoramaViewed(eventId: string) {
    applyProgressUpdate((current) => {
      if (current.viewedPanoramaIds.includes(eventId)) {
        return { nextProgress: current };
      }

      return {
        nextProgress: {
          ...current,
          viewedPanoramaIds: [...current.viewedPanoramaIds, eventId],
        },
      };
    });
  }

  function markNoticeRead(eventId: string) {
    applyProgressUpdate((current) => {
      if (current.readNoticeIds.includes(eventId)) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        readNoticeIds: [...current.readNoticeIds, eventId],
        points: current.points + 10,
      };
      let toasts = [
        createToast("points", "+10 Canvas check", "You read the professor notice instead of leaving it vague.", {
          points: 10,
        }),
      ];
      const completed = maybeCompleteDay(nextProgress, getWeekDay(selectedDay.id)?.id ?? selectedDay.id);
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: completed.badgeId,
      };
    });
  }

  function finishAdvising(eventId: string) {
    applyProgressUpdate((current) => {
      if (current.completedEventIds.includes(eventId)) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        completedEventIds: [...current.completedEventIds, eventId],
        points: current.points + 15,
      };
      let toasts = [
        createToast("points", "+15 advising complete", "You used the appointment to get actual clarity.", {
          points: 15,
        }),
      ];
      const completed = maybeCompleteDay(nextProgress, "day-2");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: completed.badgeId,
      };
    });
  }

  function openCalendar() {
    applyProgressUpdate((current) => {
      if (current.calendarOpened) {
        return { nextProgress: current };
      }

      return {
        nextProgress: {
          ...current,
          calendarOpened: true,
          points: current.points + 5,
        },
        toasts: [
          createToast("points", "+5 calendar checked", "Good call. Scheduling starts by actually looking at the week.", {
            points: 5,
          }),
        ],
      };
    });
  }

  function scheduleHomework(slot: ScheduledHomeworkSlot) {
    applyProgressUpdate((current) => {
      let nextProgress = {
        ...current,
        scheduledHomeworkSlot: slot,
        completedEventIds: current.completedEventIds.includes("day3-homework-plan")
          ? current.completedEventIds
          : [...current.completedEventIds, "day3-homework-plan"],
        points: current.points + 15,
      };
      let toasts = [
        createToast("points", "+15 work scheduled", `Math homework is now parked on Thursday at ${slot.timeRange}.`, {
          points: 15,
        }),
      ];
      const badgeResult = maybeAwardBadge(nextProgress, "first-homework-scheduled", toasts);
      nextProgress = badgeResult.nextProgress;
      toasts = badgeResult.toasts;

      const completed = maybeCompleteDay(nextProgress, "day-3");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: badgeResult.badgeId ?? completed.badgeId,
      };
    });
  }

  function confirmHomeworkSession() {
    applyProgressUpdate((current) => {
      if (current.completedEventIds.includes("day4-homework-session")) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        completedEventIds: [...current.completedEventIds, "day4-homework-session"],
        points: current.points + 10,
      };
      let toasts = [
        createToast("points", "+10 follow-through", "The reminder worked because you gave it a real slot to protect.", {
          points: 10,
        }),
      ];
      const completed = maybeCompleteDay(nextProgress, "day-4");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: completed.badgeId,
      };
    });
  }

  function updateProfessorDraft(value: string) {
    setProgress((current) => ({ ...current, professorMessageDraft: value }));
  }

  function sendProfessorMessage() {
    applyProgressUpdate((current) => {
      if (current.professorMessageSent || current.professorMessageDraft.trim().length < 35) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        professorMessageSent: true,
        professorMessageSentAt: "Sent just now",
        completedEventIds: current.completedEventIds.includes("day3-office-hours-message")
          ? current.completedEventIds
          : [...current.completedEventIds, "day3-office-hours-message"],
        points: current.points + 15,
      };
      let toasts = [
        createToast("points", "+15 message sent", "Nice. You reached out before the question turned into stress.", {
          points: 15,
        }),
      ];
      const badgeResult = maybeAwardBadge(nextProgress, "first-professor-message", toasts);
      nextProgress = badgeResult.nextProgress;
      toasts = badgeResult.toasts;

      const completed = maybeCompleteDay(nextProgress, "day-3");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: badgeResult.badgeId ?? completed.badgeId,
      };
    });
  }

  function launchResource(worldId: ResourceWorldId) {
    applyProgressUpdate((current) => {
      if (current.exploredResourceWorldIds.includes(worldId)) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        exploredResourceWorldIds: [...current.exploredResourceWorldIds, worldId],
        completedEventIds: current.completedEventIds.includes("day5-resource-run")
          ? current.completedEventIds
          : [...current.completedEventIds, "day5-resource-run"],
        points: current.points + 10,
      };
      let toasts = [
        createToast("points", "+10 resource run", "This is the best time to explore support: before you desperately need it.", {
          points: 10,
        }),
      ];
      const badgeResult = maybeAwardBadge(nextProgress, "first-resource-exploration", toasts);
      nextProgress = badgeResult.nextProgress;
      toasts = badgeResult.toasts;

      const completed = maybeCompleteDay(nextProgress, "day-5");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      queueMicrotask(() => {
        onLaunchResourceWorld(worldId);
      });

      return {
        nextProgress,
        toasts,
        badgeId: badgeResult.badgeId ?? completed.badgeId,
      };
    });
  }

  function finishSaturdayReset(eventId: string) {
    applyProgressUpdate((current) => {
      if (current.completedEventIds.includes(eventId)) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        completedEventIds: [...current.completedEventIds, eventId],
        points: current.points + 10,
      };
      let toasts = [
        createToast("points", "+10 reset locked in", "A calmer Saturday makes Sunday feel smaller.", {
          points: 10,
        }),
      ];
      const completed = maybeCompleteDay(nextProgress, "day-6");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: completed.badgeId,
      };
    });
  }

  function submitHomework() {
    applyProgressUpdate((current) => {
      if (current.submittedHomework) {
        return { nextProgress: current };
      }

      let nextProgress = {
        ...current,
        submittedHomework: true,
        completedEventIds: current.completedEventIds.includes("day7-submit-homework")
          ? current.completedEventIds
          : [...current.completedEventIds, "day7-submit-homework"],
        points: current.points + 20,
      };
      let toasts = [
        createToast("points", "+20 assignment submitted", "You used the reminder system the way it is supposed to work.", {
          points: 20,
        }),
      ];
      const completed = maybeCompleteDay(nextProgress, "day-7");
      nextProgress = completed.nextProgress;
      toasts = [...toasts, ...completed.toasts];

      return {
        nextProgress,
        toasts,
        badgeId: completed.badgeId,
      };
    });
  }

  if (!isHydrated) {
    return (
      <div className="rounded-[2rem] border border-white/16 bg-white/10 px-6 py-10 text-center text-white shadow-[0_24px_80px_rgba(44,17,22,0.18)] backdrop-blur-md">
        <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#ffe2ae]">
          Loading week
        </p>
        <p className="mt-4 font-[var(--font-sim-display)] text-[2rem] leading-none">
          Setting up your first seven days...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <RewardToast
        items={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))}
      />
      <BadgeEarnedModal badgeId={latestBadgeId} onClose={() => setLatestBadgeId(null)} />

      <ProgressTracker
        completedDays={completedDays}
        totalDays={weekSimulatorDays.length}
        points={progress.points}
        badges={progress.earnedBadgeIds.length}
      />

      <section className="rounded-[1.7rem] border border-[#f0dbc6] bg-[#fff8ef] p-3 shadow-[0_16px_36px_rgba(44,17,22,0.08)] sm:p-4">
        <div className="flex items-center gap-2.5">
          <CharacterAvatar expression="happy" size="md" framed={false} />
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Sparky note
            </p>
            <p className="mt-1 text-sm leading-5 text-[#6f4a4e]">
              Every day is open for demo use, so you can jump around instead of unlocking the week one step at a time.
            </p>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto pb-1">
          <div className="grid min-w-max grid-flow-col auto-cols-[12.2rem] items-stretch gap-2 lg:min-w-0 lg:grid-flow-row lg:grid-cols-7 lg:auto-cols-auto lg:gap-2">
            {weekSimulatorDays.map((day) => {
              const reminderCount = reminders.filter((reminder) => reminder.dayId === day.id).length;

              return (
                <div key={day.id} className="h-full lg:min-w-0">
                  <DayCard
                    day={day}
                    selected={progress.selectedDayId === day.id}
                    unlocked
                    completed={getDayComplete(progress, day.id)}
                    reminderCount={reminderCount}
                    onClick={() => openDay(day.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className="grid gap-3 self-start">
          <div className="rounded-[1.7rem] border border-[#f0dbc6] bg-white px-4 py-4 shadow-[0_12px_34px_rgba(44,17,22,0.08)]">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Today queue
            </p>
          </div>

          {selectedDay.events.map((event) => {
            const eventReminder = reminders.find((reminder) => reminder.sourceEventId === event.id);

            return (
              <EventCard
                key={event.id}
                event={event}
                completed={getEventComplete(progress, event)}
                active={activeEvent?.id === event.id}
                reminderLabel={eventReminder ? eventReminder.time : undefined}
                onClick={() => openEvent(event.id)}
              />
            );
          })}

          {selectedDay.id === "day-1" && getDayComplete(progress, "day-1") ? (
            <div className="rounded-[1.6rem] border border-[#f0dbc6] bg-[linear-gradient(135deg,#fff0c8,#fff7e8)] p-4 shadow-[0_16px_36px_rgba(44,17,22,0.08)]">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                Extra peek
              </p>
              <p className="mt-2 font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
                Advising tomorrow at 10:00 AM
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                Before then, campus resources are worth exploring while the pressure is low.
              </p>
              <div className="mt-4 grid gap-2">
                {["Upcoming walk path", "Upcoming resource side quest", "Upcoming planner unlock"].map((label) => (
                  <div
                    key={label}
                    className="rounded-[1.1rem] border border-dashed border-[#e4c79f] bg-white/60 px-4 py-3 text-sm font-medium text-[#8c6b52]"
                  >
                    🔒 {label}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="grid content-start gap-4 self-start">
          {dayReminders.map((reminder) => (
            <ReminderBanner
              key={reminder.id}
              reminder={reminder}
              acknowledged={progress.acknowledgedReminderIds.includes(reminder.id)}
              onAcknowledge={() => acknowledgeReminder(reminder.id)}
              onOpen={() => {
                setActiveEventId(reminder.sourceEventId);
                acknowledgeReminder(reminder.id);
              }}
            />
          ))}

          <CharacterGuide
            expression={eventGuide.expression}
            title={eventGuide.title}
            message={eventGuide.message}
            accent="Sparky on this task"
          />

          <div className="grid content-start gap-4">
            {activeEvent?.type === "class" ? (
              <ClassCard
                event={activeEvent}
                panoramaViewed={progress.viewedPanoramaIds.includes(activeEvent.id)}
                noticeRead={progress.readNoticeIds.includes(activeEvent.id)}
                onViewPanorama={() => markPanoramaViewed(activeEvent.id)}
                onReadNotice={() => markNoticeRead(activeEvent.id)}
              />
            ) : activeEvent?.type === "advising" ? (
              <AdvisorCard
                event={activeEvent}
                completed={progress.completedEventIds.includes(activeEvent.id)}
                onComplete={() => finishAdvising(activeEvent.id)}
              />
            ) : activeEvent?.type === "homework" && activeEvent.id === "day3-homework-plan" ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Homework Scheduling
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
                  Put MAT101 on the calendar
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  The assignment is due Sunday at {activeEvent.dueTime}. Check the calendar first, then claim a Thursday slot while the week still has room.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openCalendar}
                    className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                  >
                    {progress.calendarOpened ? "Calendar open" : "Open calendar"}
                  </button>
                  {progress.scheduledHomeworkSlot ? (
                    <span className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-black text-white">
                      Thursday · {progress.scheduledHomeworkSlot.timeRange}
                    </span>
                  ) : null}
                </div>

                {progress.calendarOpened ? (
                  <div className="mt-4">
                    <CalendarPicker
                      selectedSlot={progress.scheduledHomeworkSlot}
                      onSelect={scheduleHomework}
                    />
                  </div>
                ) : null}
              </div>
            ) : activeEvent?.type === "homework" && activeEvent.id === "day4-homework-session" ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Homework block
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
                  Math homework today
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  Your saved slot is {progress.scheduledHomeworkSlot?.timeRange ?? "Thursday"}. The point here is that the reminder lands on something real, not just guilt.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={confirmHomeworkSession}
                    className="rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                  >
                    I used the slot
                  </button>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#7d565b]">
                    Canvas link: {activeEvent.canvasLinkLabel}
                  </span>
                </div>
              </div>
            ) : activeEvent?.type === "message" ? (
              <MessageComposer
                facultyName={activeEvent.facultyName}
                templates={activeEvent.suggestedTemplates}
                draft={progress.professorMessageDraft}
                sent={progress.professorMessageSent}
                onChange={updateProfessorDraft}
                onUseTemplate={updateProfessorDraft}
                onSend={sendProfessorMessage}
              />
            ) : activeEvent?.type === "resource" ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Free Day Resource Explorer
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
                  Pick one support world and explore it
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  Friday is a great moment to explore support without an immediate crisis attached. Tap any world below to jump into the simulation you already have.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {weekResourceQuestIds.map((worldId) => {
                    const world = resourceWorlds.find((entry) => entry.id === worldId);
                    if (!world) {
                      return null;
                    }

                    const explored = progress.exploredResourceWorldIds.includes(worldId);

                    return (
                      <button
                        key={worldId}
                        type="button"
                        onClick={() => launchResource(worldId)}
                        className={`rounded-[1.4rem] border p-4 text-left transition ${
                          explored
                            ? "border-[#b9dfc2] bg-[#f3fff5]"
                            : "border-[#ecd7c0] bg-white hover:-translate-y-0.5 hover:border-[#e4bb73]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                              Resource sim
                            </p>
                            <p className="mt-2 font-[var(--font-sim-display)] text-[1.1rem] leading-none text-[#2c1116]">
                              {world.title}
                            </p>
                          </div>
                          <span className="text-2xl">{world.icon}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">{world.teaser}</p>
                        <div className="mt-3 inline-flex rounded-full bg-[#fff5df] px-3 py-1 text-xs font-bold text-[#8c1d40]">
                          {explored ? "Launched" : "Launch world"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeEvent?.type === "free-day" ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Saturday reset
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
                  Choose the tone of the day
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  Neither of these is a trap. The point is learning that calm prep and intentional rest both count as good college habits.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {activeEvent.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => finishSaturdayReset(activeEvent.id)}
                      className="rounded-full border border-[#e8c9a3] bg-white px-4 py-3 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5"
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeEvent?.type === "deadline" ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  End-of-week deadline
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
                  Submit MAT101 homework
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  Urgent does not have to mean scary. Because you scheduled time earlier, this reminder is just the final nudge to close the loop.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#7d565b]">
                    Canvas: {activeEvent.canvasLinkLabel}
                  </span>
                  <button
                    type="button"
                    onClick={submitHomework}
                    className="rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                  >
                    Submit assignment
                  </button>
                </div>
              </div>
            ) : null}

            {finishedWeek ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[linear-gradient(135deg,#fff0c8,#fff8ea)] p-5 shadow-[0_18px_44px_rgba(44,17,22,0.1)]">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  End-of-week summary
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.95rem] leading-none text-[#2c1116]">
                  You practiced the rhythm of a real college week
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-[#edd4b0] bg-white/70 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                      What you did
                    </p>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#6f4a4e]">
                      <li>Found class rooms and read professor notices.</li>
                      <li>Used advising for actual planning clarity.</li>
                      <li>Scheduled homework before the deadline rush.</li>
                      <li>Sent a respectful office-hours message.</li>
                      <li>Explored campus support during free time.</li>
                    </ul>
                  </div>
                  <div className="rounded-[1.25rem] border border-[#edd4b0] bg-white/70 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                      Why this matters
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">
                      The week feels less intimidating when the rooms, reminders, calendar habits, and help-seeking moves already feel familiar.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-[#7d565b]">
                      <span className="rounded-full bg-white px-3 py-1">🔱 {progress.points} points</span>
                      <span className="rounded-full bg-white px-3 py-1">🏅 {progress.earnedBadgeIds.length} badges</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
