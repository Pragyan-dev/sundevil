import type { MascotExpression, ResourceWorldId } from "@/lib/resource-discovery-types";

export type WeekDayId =
  | "day-1"
  | "day-2"
  | "day-3"
  | "day-4"
  | "day-5"
  | "day-6"
  | "day-7";

export type WeekEventType =
  | "class"
  | "advising"
  | "homework"
  | "message"
  | "resource"
  | "free-day"
  | "deadline";

export type WeekBadgeId =
  | "first-class-day"
  | "first-advising-session"
  | "first-homework-scheduled"
  | "first-professor-message"
  | "first-resource-exploration"
  | "full-week-complete";

export interface WeekBadgeDefinition {
  id: WeekBadgeId;
  title: string;
  description: string;
  icon: string;
}

export interface WeekReminder {
  id: string;
  dayId: WeekDayId;
  time: string;
  message: string;
  sourceEventId: string;
  actionLabel: string;
}

export interface WeekChoice {
  id: string;
  text: string;
  outcome: string;
  expression: MascotExpression;
}

export interface WeekEventBase {
  id: string;
  dayId: WeekDayId;
  title: string;
  type: WeekEventType;
  time: string;
  description: string;
  location: string;
  linkedResource?: string;
  completionCondition: string;
}

export interface WeekClassEvent extends WeekEventBase {
  type: "class";
  courseCode: string;
  facultyName: string;
  noticeText: string;
  canvasLinkLabel: string;
  panoramaLabel: string;
  panoramaVideoSrc: string;
}

export interface WeekAdvisingEvent extends WeekEventBase {
  type: "advising";
  advisorName: string;
  reminderLabel: string;
  whatItsFor: string;
  resources: string[];
  conversation: {
    intro: string;
    followUp: string;
    choices: WeekChoice[];
  };
}

export interface WeekHomeworkEvent extends WeekEventBase {
  type: "homework";
  courseCode: string;
  dueDayId: WeekDayId;
  dueTime: string;
  canvasLinkLabel: string;
}

export interface WeekMessageEvent extends WeekEventBase {
  type: "message";
  facultyName: string;
  suggestedTemplates: string[];
}

export interface WeekResourceEvent extends WeekEventBase {
  type: "resource";
  resourceWorldIds: ResourceWorldId[];
}

export interface WeekFreeDayEvent extends WeekEventBase {
  type: "free-day";
  choices: WeekChoice[];
}

export interface WeekDeadlineEvent extends WeekEventBase {
  type: "deadline";
  courseCode: string;
  canvasLinkLabel: string;
}

export type WeekEvent =
  | WeekClassEvent
  | WeekAdvisingEvent
  | WeekHomeworkEvent
  | WeekMessageEvent
  | WeekResourceEvent
  | WeekFreeDayEvent
  | WeekDeadlineEvent;

export interface WeekDay {
  id: WeekDayId;
  number: number;
  title: string;
  shortTitle: string;
  intro: string;
  mascotExpression: MascotExpression;
  storyBeat: string;
  events: WeekEvent[];
}

export interface ScheduledHomeworkSlot {
  dayId: WeekDayId;
  dateLabel: string;
  dateValue: string;
  timeLabel: string;
  timeValue: string;
}

export interface WeekSimulatorProgress {
  selectedDayId: WeekDayId;
  completedDayIds: WeekDayId[];
  openedEventIds: string[];
  completedEventIds: string[];
  readNoticeIds: string[];
  viewedPanoramaIds: string[];
  acknowledgedReminderIds: string[];
  exploredResourceWorldIds: ResourceWorldId[];
  points: number;
  earnedBadgeIds: WeekBadgeId[];
  scheduledHomeworkSlot: ScheduledHomeworkSlot | null;
  professorMessageDraft: string;
  professorMessageSent: boolean;
  professorMessageSentAt: string | null;
  calendarOpened: boolean;
  submittedHomework: boolean;
}

export interface WeekRewardToast {
  id: string;
  kind: "points" | "badge" | "reminder";
  title: string;
  detail: string;
  points?: number;
  badgeId?: WeekBadgeId;
}
