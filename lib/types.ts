export type ResourceSlug =
  | "tutoring"
  | "advising"
  | "counseling"
  | "financial-aid"
  | "scholarship-search"
  | "career-services"
  | "student-success-center";

export type FinderConcern =
  | "class"
  | "money"
  | "overwhelmed"
  | "schedule"
  | "something-else";

export type StudentYear =
  | "first-year"
  | "second-year"
  | "third-year"
  | "fourth-year-plus";

export type ResourceExperience = "yes" | "no" | "not-sure";

export type MajorCategory =
  | "any"
  | "arts-humanities"
  | "business"
  | "education"
  | "engineering"
  | "health"
  | "science"
  | "social-sciences"
  | "undeclared"
  | "other";

export type GpaRange = "under-2.5" | "2.5-2.99" | "3.0-3.49" | "3.5-4.0";
export type FirstGenStatus = "yes" | "no" | "not-sure";
export type ResidencyStatus = "in-state" | "out-of-state" | "international";
export type AidStatus = "fafsa-filed" | "not-filed" | "not-sure";

export interface ResourceFlowStep {
  title: string;
  description: string;
}

export interface Resource {
  id: string;
  slug: ResourceSlug;
  name: string;
  category: string;
  description: string;
  location: string;
  hours: string;
  signUpSummary: string;
  url: string;
  previewPath: string;
  flowSteps: ResourceFlowStep[];
}

export interface FinderOption<T extends string> {
  label: string;
  value: T;
}

export interface FinderLogic {
  questions: {
    concerns: FinderOption<FinderConcern>[];
    years: FinderOption<StudentYear>[];
    experience: FinderOption<ResourceExperience>[];
  };
  lookup: Record<
    FinderConcern,
    Record<StudentYear, Record<ResourceExperience, ResourceSlug[]>>
  >;
}

export interface SimulationStepItem {
  title: string;
  description: string;
  icon: string;
}

export interface SimulationScenario {
  slug: "tutoring" | "advising" | "first-day";
  title: string;
  summary: string;
  accent: string;
  steps: SimulationStepItem[];
}

export interface Scholarship {
  id: string;
  name: string;
  amount: string;
  deadlineLabel: string;
  applicationUrl: string;
  description: string;
  eligibility: {
    years: StudentYear[];
    majors: MajorCategory[];
    gpaRanges: Exclude<GpaRange, "under-2.5">[];
    firstGen: FirstGenStatus[];
    residency: ResidencyStatus[];
    aidStatus: AidStatus[];
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type JumpInSlug = "advising" | "first-day" | "office-hours";

export interface StoryEffect {
  confidenceDelta?: number;
  xpDelta?: number;
  unlockBadgeIds?: string[];
}

export interface StoryChoice {
  id: string;
  label: string;
  caption: string;
  resultSceneId: string;
}

export interface StoryRichCard {
  title: string;
  body: string;
}

export interface StoryMockEmail {
  subject: string;
  from: string;
  to: string;
  body: string;
  replySubject?: string;
  replyFrom?: string;
  replyBody?: string;
}

export interface StoryMockMessage {
  sender: string;
  title: string;
  body: string;
}

export interface StoryChecklistItem {
  title: string;
  detail: string;
}

export interface StoryScene {
  id: string;
  dayId: string;
  kind: "story" | "choice" | "consequence" | "resource" | "ending";
  title: string;
  speaker: string;
  location: string;
  backdrop: string;
  body: string;
  continueLabel?: string;
  nextSceneId?: string;
  choices?: StoryChoice[];
  effects?: StoryEffect;
  cards?: StoryRichCard[];
  bullets?: string[];
  badgeId?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  emailMock?: StoryMockEmail;
  messageMock?: StoryMockMessage;
  embedScholarshipChecker?: boolean;
  courseLabel?: string;
  buildingLabel?: string;
  roomLabel?: string;
  routeSteps?: string[];
  taskChecklist?: StoryChecklistItem[];
  videoSrc?: string;
  videoFallbackSrc?: string;
  videoPoster?: string;
  videoTitle?: string;
  videoCaption?: string;
}

export interface StoryDay {
  id: string;
  label: string;
  title: string;
  subtitle: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
}

export interface EndingDefinition {
  id: "ready" | "rhythm" | "adjusting";
  title: string;
  summary: string;
  minConfidence: number;
}

export interface JumpInPreset {
  slug: JumpInSlug;
  title: string;
  recap: string;
  startSceneId: string;
  confidence: number;
  xp: number;
  unlockedBadgeIds: string[];
}

export interface PersistedStoryState {
  saveVersion: string;
  currentDayId: string;
  currentSceneId: string;
  confidence: number;
  xp: number;
  unlockedBadgeIds: string[];
  choiceHistory: string[];
  appliedSceneIds: string[];
  endingId: EndingDefinition["id"] | null;
}

export interface AlexStoryData {
  saveVersion: string;
  startSceneId: string;
  days: StoryDay[];
  scenes: StoryScene[];
  badges: BadgeDefinition[];
  endings: EndingDefinition[];
  jumpIns: JumpInPreset[];
}
