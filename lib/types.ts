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

export type JumpInSlug = "advising" | "first-day" | "office-hours" | "tutoring";
export type ArchetypeId = "shy-one" | "overwhelmed-one" | "stubborn-one";
export type CharacterId =
  | "you"
  | "prof-chen"
  | "advisor-rivera"
  | "marcus"
  | "jordan"
  | "counselor-park";
export type BubbleType = "speech" | "thought";
export type StoryAnnotationType = "underline" | "highlight" | "circle";

export interface StoryEffect {
  confidenceDelta?: number;
  xpDelta?: number;
  pitchforkDelta?: number;
  unlockBadgeIds?: string[];
}

export interface ChoiceOption {
  id: string;
  icon: string;
  label: string;
  caption: string;
  resultSceneId: string;
}

export interface StoryRichCard {
  title: string;
  body: string;
}

export interface ArchetypeDefinition {
  id: ArchetypeId;
  title: string;
  subtitle: string;
  description: string;
  startingConfidence: number;
  accentLabel: string;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  role: string;
  accentColor: string;
  voiceEnvKey: string;
  previewLabel: string;
}

export interface StoryLine {
  id: string;
  speakerId: CharacterId;
  bubbleType: BubbleType;
  text: string;
  archetypeText?: Partial<Record<ArchetypeId, string>>;
  overlayId?: string;
  annotation?: StoryAnnotationType;
}

export interface StoryChecklistItem {
  title: string;
  detail: string;
}

export interface ResourceOverlayDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cards: StoryRichCard[];
  taskChecklist?: StoryChecklistItem[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
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
  id: "found-way" | "getting-there" | "hard-way";
  title: string;
  summary: string;
  minConfidence: number;
}

export interface RewardDefinition {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  external: boolean;
  rewardKind: "ticket" | "giveaway" | "pitchforks";
  disclaimer: string;
}

export interface RewardMilestoneDefinition {
  id: string;
  rewardId: string;
  triggerBadgeId?: string;
  triggerSceneId?: string;
  triggerOnEnding?: boolean;
  pitchforkBonus: number;
}

interface StorySceneBase {
  id: string;
  dayId: string;
  type:
    | "title"
    | "character-select"
    | "day-transition"
    | "dialogue"
    | "choice"
    | "ending";
}

export interface TitleScene extends StorySceneBase {
  type: "title";
  title: string;
  subtitle: string;
  previewCharacterIds: CharacterId[];
  startLabel: string;
  nextSceneId: string;
}

export interface CharacterSelectScene extends StorySceneBase {
  type: "character-select";
  title: string;
  subtitle: string;
  backSceneId: string;
  nextSceneId: string;
}

export interface DayTransitionDefinition extends StorySceneBase {
  type: "day-transition";
  title: string;
  subtitle: string;
  autoAdvanceMs?: number;
  nextSceneId: string;
}

export interface DialogueScene extends StorySceneBase {
  type: "dialogue";
  lines: StoryLine[];
  nextSceneId?: string;
  continueLabel?: string;
  locationLabel?: string;
  overlayPromptLabel?: string;
  overlayDescription?: string;
  effects?: StoryEffect;
  badgeId?: string;
}

export interface ChoiceScene extends StorySceneBase {
  type: "choice";
  prompt: StoryLine;
  locationLabel?: string;
  choices: ChoiceOption[];
}

export interface EndingSceneDefinition extends StorySceneBase {
  type: "ending";
  title: string;
}

export type SceneFrame =
  | TitleScene
  | CharacterSelectScene
  | DayTransitionDefinition
  | DialogueScene
  | ChoiceScene
  | EndingSceneDefinition;

export interface JumpInPreset {
  slug: JumpInSlug;
  title: string;
  recap: string;
  startSceneId: string;
  archetypeId: ArchetypeId;
  confidence: number;
  xp: number;
  pitchforks: number;
  unlockedBadgeIds: string[];
  unlockedRewardIds: string[];
  seenOverlayIds: string[];
  seenRewardPopupIds: string[];
}

export interface PersistedStoryState {
  saveVersion: string;
  archetypeId: ArchetypeId | null;
  currentSceneId: string;
  currentLineIndex: number;
  currentDayId: string;
  confidence: number;
  xp: number;
  pitchforks: number;
  unlockedBadgeIds: string[];
  unlockedRewardIds: string[];
  seenOverlayIds: string[];
  seenRewardPopupIds: string[];
  choiceHistory: string[];
  appliedSceneIds: string[];
  endingId: EndingDefinition["id"] | null;
}

export interface AlexStoryData {
  saveVersion: string;
  titleSceneId: string;
  characterSelectSceneId: string;
  startSceneId: string;
  days: StoryDay[];
  archetypes: ArchetypeDefinition[];
  characters: CharacterDefinition[];
  badges: BadgeDefinition[];
  rewards: RewardDefinition[];
  rewardMilestones: RewardMilestoneDefinition[];
  overlays: ResourceOverlayDefinition[];
  endings: EndingDefinition[];
  scenes: SceneFrame[];
  jumpIns: JumpInPreset[];
}
