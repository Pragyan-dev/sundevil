"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import {
  createWeekSimulatorProgress,
  getWeekDay,
  getWeekReminders,
  isWeekSimulatorProgress,
  weekSimulatorDays,
} from "@/data/week-simulator";
import type {
  ScheduledHomeworkSlot,
  WeekDayId,
  WeekEvent,
  WeekHomeworkEvent,
  WeekRewardToast,
  WeekSimulatorProgress,
} from "@/lib/week-simulator-types";

interface WeekSimulatorProps {
  onOpenResourceMap: () => void;
}

const STORAGE_KEY = "asu-week-simulator-v1";
const homeworkConfettiPieces = [
  { left: "8%", delay: "0ms", duration: "2300ms", color: "#ffc627", rotate: "-18deg" },
  { left: "20%", delay: "110ms", duration: "2500ms", color: "#8c1d40", rotate: "16deg" },
  { left: "34%", delay: "45ms", duration: "2200ms", color: "#ffdd92", rotate: "-8deg" },
  { left: "48%", delay: "180ms", duration: "2600ms", color: "#d6657e", rotate: "22deg" },
  { left: "62%", delay: "80ms", duration: "2400ms", color: "#ffc627", rotate: "-24deg" },
  { left: "76%", delay: "170ms", duration: "2500ms", color: "#8c1d40", rotate: "12deg" },
  { left: "89%", delay: "70ms", duration: "2350ms", color: "#ffe9ba", rotate: "-16deg" },
] as const;

function createToast(
  kind: WeekRewardToast["kind"],
  title: string,
  detail: string,
): WeekRewardToast {
  return {
    id: `${kind}-${Math.random().toString(36).slice(2, 9)}`,
    kind,
    title,
    detail,
  };
}

function getEventComplete(progress: WeekSimulatorProgress, event: WeekEvent) {
  if (event.type === "class") {
    return progress.readNoticeIds.includes(event.id);
  }

  if (event.type === "advising-preview") {
    return progress.openedEventIds.includes(event.id);
  }

  if (event.type === "message") {
    return progress.professorMessageSent;
  }

  if (event.type === "resource") {
    return (
      progress.completedEventIds.includes(event.id) ||
      progress.exploredResourceWorldIds.length > 0
    );
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

  return getResolvedDayEvents(day, progress).every((event) => getEventComplete(progress, event));
}

function getResolvedDayEvents(day: (typeof weekSimulatorDays)[number], progress: WeekSimulatorProgress) {
  return day.events.flatMap((event) => {
    if (event.id !== "day4-homework-session") {
      return [event];
    }

    if (!progress.scheduledHomeworkSlot) {
      return day.id === "day-4" ? [event] : [];
    }

    if (progress.scheduledHomeworkSlot.dayId !== day.id) {
      return [];
    }

    const movedHomeworkEvent: WeekHomeworkEvent = {
      ...event,
      dayId: progress.scheduledHomeworkSlot.dayId,
      time: progress.scheduledHomeworkSlot.timeLabel,
      description: `Use the saved ${progress.scheduledHomeworkSlot.dateLabel} slot to make real progress on the assignment.`,
    };

    return [movedHomeworkEvent];
  });
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
    case "advising-preview":
      return {
        expression: "idea" as const,
        title: "Advising preview",
        message: "This is the calm before the appointment. Get the day, time, location, and support topics in your head before you walk in.",
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
        expression: "happy" as const,
        title: "Light Saturday",
        message: "Today is intentionally light. Use it to rest and catch your breath.",
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

function AdvisingPreviewVideo({
  mp4Src,
  quicktimeSrc,
  fallbackText,
}: {
  mp4Src: string;
  quicktimeSrc?: string;
  fallbackText: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  }

  return (
    <button
      type="button"
      onClick={togglePlayback}
      aria-pressed={isPlaying}
      className="mt-3 block w-full overflow-hidden rounded-[1rem] border border-[#ead7c4] bg-[#2c1116] text-left shadow-[0_16px_36px_rgba(44,17,22,0.12)] transition hover:-translate-y-0.5"
    >
      <video
        ref={videoRef}
        className="aspect-video w-full bg-[#2c1116] object-cover"
        playsInline
        preload="metadata"
      >
        <source src={mp4Src} type="video/mp4" />
        {quicktimeSrc ? <source src={quicktimeSrc} type="video/quicktime" /> : null}
        {fallbackText}
      </video>
    </button>
  );
}

export function WeekSimulator({ onOpenResourceMap }: WeekSimulatorProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [progress, setProgress] = useState<WeekSimulatorProgress>(createWeekSimulatorProgress);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<WeekRewardToast[]>([]);
  const [homeworkReadyPopupOpen, setHomeworkReadyPopupOpen] = useState(false);

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
  const selectedDayEvents = useMemo(
    () => getResolvedDayEvents(selectedDay, progress),
    [progress, selectedDay],
  );
  const dayReminders = reminders.filter((reminder) => reminder.dayId === selectedDay.id);
  const completedDays = weekSimulatorDays.filter((day) => getDayComplete(progress, day.id)).length;
  const finishedWeek = completedDays === weekSimulatorDays.length;
  const activeEvent =
    selectedDayEvents.find((event) => event.id === activeEventId) ??
    selectedDayEvents.find((event) => !getEventComplete(progress, event)) ??
    selectedDayEvents[0] ??
    null;
  const eventGuide = getEventGuideCopy(activeEvent);
  let nextNavigation: { dayId: WeekDayId; eventId: string; label: string } | null = null;

  if (activeEvent) {
    const activeIndex = selectedDayEvents.findIndex((event) => event.id === activeEvent.id);
    if (activeIndex !== -1 && activeIndex < selectedDayEvents.length - 1) {
      const nextEvent = selectedDayEvents[activeIndex + 1];
      nextNavigation = {
        dayId: selectedDay.id,
        eventId: nextEvent.id,
        label: nextEvent.title,
      };
    } else {
      const selectedDayIndex = weekSimulatorDays.findIndex((day) => day.id === selectedDay.id);
      for (let nextDayIndex = selectedDayIndex + 1; nextDayIndex < weekSimulatorDays.length; nextDayIndex += 1) {
        const nextDay = weekSimulatorDays[nextDayIndex];
        const nextDayEvents = getResolvedDayEvents(nextDay, progress);
        if (!nextDayEvents.length) {
          continue;
        }

        nextNavigation = {
          dayId: nextDay.id,
          eventId: nextDayEvents[0].id,
          label: nextDayEvents[0].title,
        };
        break;
      }
    }
  }

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
            ...createToast("reminder", "Reminder ready", unseenReminder.message),
            id: unseenReminder.id,
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
    },
  ) {
    setProgress((current) => {
      const { nextProgress, toasts: nextToasts = [] } = updater(current);

      if (nextToasts.length) {
        queueMicrotask(() => {
          setToasts((existing) => [...nextToasts, ...existing].slice(0, 4));
        });
      }

      return nextProgress;
    });
  }

function maybeCompleteDay(current: WeekSimulatorProgress, dayId: WeekDayId) {
    if (current.completedDayIds.includes(dayId) || !getDayComplete(current, dayId)) {
      return { nextProgress: current };
    }

    const nextCompletedDayIds = [...current.completedDayIds, dayId];
    return {
      nextProgress: {
        ...current,
        completedDayIds: nextCompletedDayIds,
      },
    };
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
        },
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
        },
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

      let nextProgress: WeekSimulatorProgress = {
        ...current,
        readNoticeIds: [...current.readNoticeIds, eventId],
      };
      const completed = maybeCompleteDay(nextProgress, getWeekDay(selectedDay.id)?.id ?? selectedDay.id);
      nextProgress = completed.nextProgress;

      return {
        nextProgress,
      };
    });
  }

  function finishAdvising(eventId: string) {
    applyProgressUpdate((current) => {
      if (current.completedEventIds.includes(eventId)) {
        return { nextProgress: current };
      }

      let nextProgress: WeekSimulatorProgress = {
        ...current,
        completedEventIds: [...current.completedEventIds, eventId],
      };
      const completed = maybeCompleteDay(nextProgress, "day-2");
      nextProgress = completed.nextProgress;

      return {
        nextProgress,
      };
    });
  }

  function scheduleHomework(slot: ScheduledHomeworkSlot) {
    applyProgressUpdate((current) => {
      let nextProgress: WeekSimulatorProgress = {
        ...current,
        scheduledHomeworkSlot: slot,
        completedEventIds: current.completedEventIds.includes("day3-homework-plan")
          ? current.completedEventIds
          : [...current.completedEventIds, "day3-homework-plan"],
      };
      const completed = maybeCompleteDay(nextProgress, "day-3");
      nextProgress = completed.nextProgress;

      return {
        nextProgress,
      };
    });

    setHomeworkReadyPopupOpen(true);
  }

  function confirmHomeworkSession() {
    applyProgressUpdate((current) => {
      if (current.completedEventIds.includes("day4-homework-session")) {
        return { nextProgress: current };
      }

      let nextProgress: WeekSimulatorProgress = {
        ...current,
        completedEventIds: [...current.completedEventIds, "day4-homework-session"],
      };
      const completed = maybeCompleteDay(nextProgress, "day-4");
      nextProgress = completed.nextProgress;

      return {
        nextProgress,
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

      let nextProgress: WeekSimulatorProgress = {
        ...current,
        professorMessageSent: true,
        professorMessageSentAt: "Sent just now",
        completedEventIds: current.completedEventIds.includes("day3-office-hours-message")
          ? current.completedEventIds
          : [...current.completedEventIds, "day3-office-hours-message"],
      };
      const completed = maybeCompleteDay(nextProgress, "day-3");
      nextProgress = completed.nextProgress;

      return {
        nextProgress,
      };
    });
  }

  function openResourceMap() {
    applyProgressUpdate((current) => {
      let nextProgress: WeekSimulatorProgress = {
        ...current,
        completedEventIds: current.completedEventIds.includes("day5-resource-run")
          ? current.completedEventIds
          : [...current.completedEventIds, "day5-resource-run"],
      };
      const completed = maybeCompleteDay(nextProgress, "day-5");
      nextProgress = completed.nextProgress;

      queueMicrotask(() => {
        onOpenResourceMap();
      });

      return {
        nextProgress,
      };
    });
  }

  function goToNextPage() {
    if (!nextNavigation) {
      return;
    }

    setActiveEventId(nextNavigation.eventId);
    setProgress((current) => ({
      ...current,
      selectedDayId: nextNavigation.dayId,
      openedEventIds: current.openedEventIds.includes(nextNavigation.eventId)
        ? current.openedEventIds
        : [...current.openedEventIds, nextNavigation.eventId],
    }));
  }

  function submitHomework() {
    applyProgressUpdate((current) => {
      if (current.submittedHomework) {
        return { nextProgress: current };
      }

      let nextProgress: WeekSimulatorProgress = {
        ...current,
        submittedHomework: true,
        completedEventIds: current.completedEventIds.includes("day7-submit-homework")
          ? current.completedEventIds
          : [...current.completedEventIds, "day7-submit-homework"],
      };
      const completed = maybeCompleteDay(nextProgress, "day-7");
      nextProgress = completed.nextProgress;

      return {
        nextProgress,
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

      <ProgressTracker
        completedDays={completedDays}
        totalDays={weekSimulatorDays.length}
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

          {selectedDayEvents.map((event) => {
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
            ) : activeEvent?.type === "advising-preview" ? (
              <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[linear-gradient(135deg,#fff0c8,#fff8ea)] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Monday advising preview
                </p>
                <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
                  Academic advising is next
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  {activeEvent.whatItsFor}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.15rem] border border-dashed border-[#e4c79f] bg-white/75 px-4 py-3">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                      Date
                    </p>
                    <p className="mt-2 font-[var(--font-sim-display)] text-[1.2rem] leading-none text-[#2c1116]">
                      {activeEvent.appointmentDayLabel}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] border border-dashed border-[#e4c79f] bg-white/75 px-4 py-3">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                      Time
                    </p>
                    <p className="mt-2 font-[var(--font-sim-display)] text-[1.2rem] leading-none text-[#2c1116]">
                      {activeEvent.time}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] border border-dashed border-[#e4c79f] bg-white/75 px-4 py-3">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                      Location
                    </p>
                    <p className="mt-2 text-base font-medium text-[#2c1116]">
                      {activeEvent.location}
                    </p>
                    {activeEvent.linkedResource ? (
                      <a
                        href={activeEvent.linkedResource}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                      >
                        Open in maps
                      </a>
                    ) : null}
                  </div>
                  <div className="rounded-[1.15rem] border border-dashed border-[#e4c79f] bg-white/75 px-4 py-3">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                      Advisor
                    </p>
                    <p className="mt-2 text-base font-medium text-[#2c1116]">
                      {activeEvent.advisorName}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-dashed border-[#e4c79f] bg-white/75 p-4">
                    <p className="mt-2 font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
                      Advisor intro video
                    </p>
                    <AdvisingPreviewVideo
                      mp4Src="/advising-advisor-intro.mp4"
                      fallbackText="Your browser does not support the advisor intro video."
                    />
                  </div>

                  <div className="rounded-[1.2rem] border border-dashed border-[#e4c79f] bg-white/75 p-4">
                    <p className="mt-2 font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
                      How advising works video
                    </p>
                    <AdvisingPreviewVideo
                      mp4Src="/advising-room-sim.mp4"
                      quicktimeSrc="/advising-room-sim.mov"
                      fallbackText="Your browser does not support the advising room preview video."
                    />
                  </div>
                </div>
              </div>
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
                  The assignment is due Sunday at {activeEvent.dueTime}. Check the calendar first, then claim a Thursday, Friday, or Saturday slot while the week still has room.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {progress.scheduledHomeworkSlot ? (
                    <span className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-black text-white">
                      {progress.scheduledHomeworkSlot.dateLabel} · {progress.scheduledHomeworkSlot.timeLabel}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <CalendarPicker
                    selectedSlot={progress.scheduledHomeworkSlot}
                    onSelect={scheduleHomework}
                  />
                </div>
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
                  Your saved slot is {progress.scheduledHomeworkSlot ? `${progress.scheduledHomeworkSlot.dateLabel} at ${progress.scheduledHomeworkSlot.timeLabel}` : "not set yet"}. The point here is that the reminder lands on something real, not just guilt.
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
                  Open the resource map
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">
                  Friday is a great moment to explore support without an immediate crisis attached. Jump to the resource map and pick whichever support world feels most useful today.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openResourceMap}
                    className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                  >
                    Go to resource map
                  </button>
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

            {nextNavigation ? (
              <div className="rounded-[1.45rem] border border-[#f0dbc6] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(44,17,22,0.08)]">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Next page
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm leading-6 text-[#6f4a4e]">
                    Continue to <span className="font-black text-[#2c1116]">{nextNavigation.label}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={goToNextPage}
                    className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                  >
                    Next
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
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {homeworkReadyPopupOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(23,8,12,0.58)] p-4 backdrop-blur-sm">
          <div className="resource-ready-modal relative w-[min(92vw,31rem)] overflow-hidden rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-6 shadow-[0_26px_90px_rgba(44,17,22,0.26)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden">
              {homeworkConfettiPieces.map((piece, index) => (
                <span
                  key={`${piece.left}-${index}`}
                  className="resource-confetti-piece"
                  style={{
                    left: piece.left,
                    backgroundColor: piece.color,
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                    transform: `rotate(${piece.rotate})`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center gap-4">
              <CharacterAvatar expression="happy" size="md" pulse />
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Homework slot saved
                </p>
                <p className="mt-2 font-[var(--font-sim-display)] text-[1.55rem] leading-[1.02] text-[#2c1116]">
                  Yey, all the best!
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                  {progress.scheduledHomeworkSlot
                    ? `${progress.scheduledHomeworkSlot.dateLabel} at ${progress.scheduledHomeworkSlot.timeLabel} is now on your plan.`
                    : "Your homework time is now saved."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setHomeworkReadyPopupOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
