"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { dashboardStorageKey } from "@/lib/dashboard";
import type {
  AdvisorNoteVisibility,
  DashboardData,
  DashboardDemoState,
  DashboardFlag,
  DashboardMessage,
  DashboardRole,
  DashboardStudent,
  SelfCheckIn,
  SharedTimelineEvent,
} from "@/lib/types";

type FlagPayload = {
  studentId: string;
  flag: DashboardFlag;
  timelineEvent: SharedTimelineEvent;
};

type CheckInPayload = {
  studentId: string;
  checkIn: SelfCheckIn;
  timelineEvent: SharedTimelineEvent;
};

type ResolveFlagPayload = {
  studentId: string;
  flagId: string;
  resolvedAt: string;
  resolvedById: string;
  resolvedByName: string;
  resolutionNote?: string;
  timelineEvent: SharedTimelineEvent;
};

type DashboardDemoContextValue = {
  data: DashboardDemoState;
  getStudentById: (id: string) => DashboardStudent | undefined;
  logOutreach: (input: {
    studentId: string;
    actorRole: DashboardRole;
    actorId: string;
    actorName: string;
    summary: string;
  }) => void;
  addObservation: (input: { studentId: string; authorName: string; text: string }) => void;
  addAdvisorNote: (input: {
    studentId: string;
    authorName: string;
    text: string;
    visibility: AdvisorNoteVisibility;
  }) => void;
  appendThreadReply: (input: {
    studentId: string;
    senderId: string;
    senderName: string;
    senderRole: DashboardRole;
    text: string;
  }) => void;
  applyFlagResult: (payload: FlagPayload) => void;
  resolveFlag: (payload: ResolveFlagPayload) => void;
  applyCheckInResult: (payload: CheckInPayload) => void;
  resetDemo: () => void;
};

const DashboardDemoContext = createContext<DashboardDemoContextValue | null>(null);

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function sortStudentTimeline(student: DashboardStudent) {
  student.timeline.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
  student.checkIns.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
  student.flags.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  student.observations.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
  student.advisorNotes.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
}

export function DashboardDemoProvider({
  initialData,
  children,
}: {
  initialData: DashboardData;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<DashboardDemoState>(() => cloneData(initialData));
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(dashboardStorageKey);
      if (!raw) {
        setHasLoaded(true);
        return;
      }

      setData(cloneData(JSON.parse(raw) as DashboardDemoState));
    } catch {
      setData(cloneData(initialData));
    } finally {
      setHasLoaded(true);
    }
  }, [initialData]);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(dashboardStorageKey, JSON.stringify(data));
  }, [data, hasLoaded]);

  const value = useMemo<DashboardDemoContextValue>(
    () => ({
      data,
      getStudentById(id) {
        return data.students.find((student) => student.id === id);
      },
      logOutreach({ studentId, actorRole, actorId, actorName, summary }) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === studentId);
          if (!student) return current;

          student.timeline.unshift({
            id: makeId("timeline-email"),
            date: new Date().toISOString(),
            type: "email",
            actorId,
            actorName,
            actorRole,
            summary,
            visibility: "shared",
          });

          sortStudentTimeline(student);
          return next;
        });
      },
      addObservation({ studentId, authorName, text }) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === studentId);
          if (!student) return current;

          const now = new Date().toISOString();

          student.observations.unshift({
            id: makeId("observation"),
            date: now,
            authorName,
            text,
          });

          student.timeline.unshift({
            id: makeId("timeline-observation"),
            date: now,
            type: "note",
            actorId: next.faculty.id,
            actorName: authorName,
            actorRole: "faculty",
            summary: `Added an observation: ${text}`,
            visibility: "shared",
          });

          sortStudentTimeline(student);
          return next;
        });
      },
      addAdvisorNote({ studentId, authorName, text, visibility }) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === studentId);
          if (!student) return current;

          const now = new Date().toISOString();

          student.advisorNotes.unshift({
            id: makeId("advisor-note"),
            date: now,
            authorName,
            text,
            visibility,
          });

          student.timeline.unshift({
            id: makeId("timeline-advisor-note"),
            date: now,
            type: "note",
            actorId: next.advisor.id,
            actorName: authorName,
            actorRole: "advisor",
            summary:
              visibility === "shared-with-faculty"
                ? `Shared a note: ${text}`
                : `Logged an advisor-only note.`,
            visibility: visibility === "shared-with-faculty" ? "shared" : "advisor-only",
          });

          sortStudentTimeline(student);
          return next;
        });
      },
      appendThreadReply({ studentId, senderId, senderName, senderRole, text }) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === studentId);
          if (!student) return current;

          const now = new Date().toISOString();
          const message: DashboardMessage = {
            id: makeId("message"),
            senderId,
            senderName,
            senderRole,
            date: now,
            type: "reply",
            text,
          };

          const existingThread = next.messages.find((thread) => thread.studentId === studentId);

          if (existingThread) {
            existingThread.messages.push(message);
          } else {
            next.messages.push({
              studentId,
              studentInitials: student.initials,
              messages: [message],
            });
          }

          student.timeline.unshift({
            id: makeId("timeline-reply"),
            date: now,
            type: "reply",
            actorId: senderId,
            actorName: senderName,
            actorRole: senderRole,
            summary: `Replied in the shared thread: ${text}`,
            visibility: "shared",
          });

          sortStudentTimeline(student);
          return next;
        });
      },
      applyFlagResult(payload) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === payload.studentId);
          if (!student) return current;

          student.flags.unshift(payload.flag);
          student.timeline.unshift(payload.timelineEvent);

          sortStudentTimeline(student);
          return next;
        });
      },
      resolveFlag({ studentId, flagId, resolvedAt, resolvedById, resolvedByName, resolutionNote, timelineEvent }) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === studentId);
          if (!student) return current;

          student.flags = student.flags.map((flag) =>
            flag.id === flagId && flag.kind === "review"
              ? {
                  ...flag,
                  status: "resolved",
                  resolvedAt,
                  resolvedById,
                  resolvedByName,
                  resolutionNote,
                }
              : flag,
          );
          student.timeline.unshift(timelineEvent);
          sortStudentTimeline(student);

          return next;
        });
      },
      applyCheckInResult(payload) {
        setData((current) => {
          const next = cloneData(current);
          const student = next.students.find((item) => item.id === payload.studentId);
          if (!student) return current;

          student.checkIns.unshift(payload.checkIn);
          student.timeline.unshift(payload.timelineEvent);
          next.selfCheckIns.unshift(payload.checkIn);
          sortStudentTimeline(student);
          return next;
        });
      },
      resetDemo() {
        const reset = cloneData(initialData);
        setData(reset);
        window.localStorage.setItem(dashboardStorageKey, JSON.stringify(reset));
      },
    }),
    [data, initialData],
  );

  return <DashboardDemoContext.Provider value={value}>{children}</DashboardDemoContext.Provider>;
}

export function useDashboardDemoState() {
  const context = useContext(DashboardDemoContext);
  if (!context) {
    throw new Error("useDashboardDemoState must be used inside DashboardDemoProvider.");
  }

  return context;
}
