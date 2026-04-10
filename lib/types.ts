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
export type AccessibilityTextSize = "default" | "large" | "x-large";
export type AccessibilityContrastMode = "default" | "high";
export type AccessibilityMotionMode = "default" | "reduced";
export type AccessibilityFocusMode = "default" | "enhanced";

export interface AccessibilitySettings {
  textSize: AccessibilityTextSize;
  contrast: AccessibilityContrastMode;
  motion: AccessibilityMotionMode;
  focusMode: AccessibilityFocusMode;
}

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

export type WalkthroughMode = "in-person" | "online" | "drop-in";

export interface StudentContext {
  concern: FinderConcern | null;
  year: StudentYear | null;
  experience: ResourceExperience | null;
}

export interface WalkthroughVisual {
  icon: string;
  eyebrow?: string;
  title: string;
  caption?: string;
}

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  reassurance?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  visual?: WalkthroughVisual;
}

export interface WalkthroughModeDefinition {
  mode: WalkthroughMode;
  label: string;
  summary: string;
  steps: WalkthroughStep[];
}

export interface WalkthroughQuestionSet {
  defaultOpener: string;
  defaultProTip: string;
  firstTimeIntro?: string;
  scenarioPlaceholders?: Partial<Record<FinderConcern, string>>;
  questionsByYear: Record<StudentYear, string[]>;
}

export interface ResourceWalkthrough {
  slug: ResourceSlug;
  title: string;
  summary: string;
  modes: WalkthroughModeDefinition[];
  questionSet: WalkthroughQuestionSet;
}

export interface GeneratedQuestionsResult {
  opener: string;
  questions: string[];
  proTip: string;
}

export type CampusInteractionType = "dialog" | "walkthrough" | "minigame";
export type CampusDialogTarget = "tooker-intro" | "byeng-preview";
export type CampusNpcAvatar =
  | "jordan"
  | "prof-chen"
  | "advisor-rivera"
  | "counselor-park"
  | "tutor"
  | "desk-aide";
export type CampusAvatarPresetId = "player" | CampusNpcAvatar;
export type CampusDirection = "up" | "down" | "left" | "right";

export interface CampusAvatarAppearance {
  skinColor: string;
  hairColor: string;
  topColor: string;
  topAccentColor?: string | null;
  bottomColor: string;
  shoeColor: string;
  soleColor: string;
  backpackColor?: string | null;
  backpackAccentColor?: string | null;
  outerwearColor?: string | null;
  hairStyle:
    | "short-curl"
    | "locs"
    | "curly-bun"
    | "parted-short"
    | "ponytail"
    | "wavy-bob"
    | "pulled-back";
}

export interface CampusAvatarRoleStyle {
  shirtText?: string | null;
  sleeveLength: "short" | "long";
  accessory: "none" | "clipboard" | "book" | "lanyard" | "badge";
  hasBackpack: boolean;
  posture: "open" | "professional" | "relaxed";
}

export interface CampusNpc {
  name: string;
  role: string;
  avatar: CampusNpcAvatar;
  greeting: string;
  followUp?: string;
}

export interface CampusRealLocation {
  address: string;
  hours: string;
  phone: string | null;
  mapLink: string | null;
}

export interface CampusBuilding {
  id: string;
  name: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  entranceX: number;
  entranceY: number;
  interactionType: CampusInteractionType;
  interactionTarget?: CampusDialogTarget | ResourceSlug | MiniGameType;
  npc?: CampusNpc | null;
  realLocation?: CampusRealLocation | null;
  photo?: string | null;
}

export interface CampusPath {
  from: string;
  to: string;
  type: "horizontal" | "vertical" | "connector";
}

export interface CampusDecoration {
  type: "palm_tree" | "bench";
  x: number;
  y: number;
}

export interface CampusQuest {
  id: string;
  label: string;
  buildingId: string;
  completed?: boolean;
  requires?: string[];
}

export interface CampusMapData {
  mapWidth: number;
  mapHeight: number;
  spawnX: number;
  spawnY: number;
  buildings: CampusBuilding[];
  paths: CampusPath[];
  decorations: CampusDecoration[];
  quests: CampusQuest[];
}

export interface CampusPlayer {
  x: number;
  y: number;
  direction: CampusDirection;
  isMoving: boolean;
  frame: 0 | 1;
}

export interface CampusGameState {
  player: CampusPlayer;
  camera: { x: number; y: number };
  quests: CampusQuest[];
  nearBuilding: string | null;
  activeInteraction: string | null;
  discoveredBuildings: string[];
}

export type CampusExperienceMode = "3d" | "2d-fallback";
export type CampusVector3 = [number, number, number];
export type CampusPropKind =
  | "desk"
  | "terminal"
  | "bench"
  | "palm"
  | "whiteboard"
  | "sofa"
  | "table"
  | "plant"
  | "sign";
export type CampusInteriorSceneType = "dialog" | "walkthrough" | "minigame";

export interface CampusSpawnPoint {
  position: CampusVector3;
  rotationY?: number;
}

export interface CampusPortal {
  position: CampusVector3;
  size: CampusVector3;
  promptOffset?: CampusVector3;
}

export interface CampusCollider {
  position: CampusVector3;
  size: CampusVector3;
  rotation?: CampusVector3;
}

export interface CampusPropDefinition {
  id: string;
  kind: CampusPropKind;
  position: CampusVector3;
  rotationY?: number;
  scale?: number | CampusVector3;
  tint?: string;
}

export interface CampusWorldBuilding {
  id: string;
  position: CampusVector3;
  rotationY?: number;
  scale: CampusVector3;
  height: number;
  roofColor: string;
  wallColor: string;
  accentColor?: string;
  labelOffset?: CampusVector3;
  beaconOffset?: CampusVector3;
  collider: CampusCollider;
  portal: CampusPortal;
  interiorSceneId: string;
  npcPosition?: CampusVector3;
  npcRotationY?: number;
  props?: CampusPropDefinition[];
}

export interface CampusInteriorScene {
  id: string;
  buildingId: string;
  type: CampusInteriorSceneType;
  title: string;
  summary: string;
  roomSize: CampusVector3;
  accentColor: string;
  floorColor: string;
  wallColor: string;
  spawn: CampusSpawnPoint;
  exitPortal: CampusPortal;
  interactionPoint: CampusPortal;
  npcPosition?: CampusVector3;
  npcRotationY?: number;
  props?: CampusPropDefinition[];
  importedModel?: {
    kind: "fbx";
    src: string;
    position?: CampusVector3;
    rotation?: CampusVector3;
    scale?: number | CampusVector3;
    fitToRoom?: boolean;
    fitMode?: "contain" | "height";
    autoCenter?: boolean;
    floorToZero?: boolean;
    replaceShell?: boolean;
  };
}

export interface CampusWorldDefinition {
  mapScale: number;
  outdoorSpawn: CampusSpawnPoint;
  groundSize: [number, number];
  buildings: Record<string, CampusWorldBuilding>;
  interiors: Record<string, CampusInteriorScene>;
}

export type DashboardRole = "faculty" | "advisor";
export type DashboardCampus = "tempe" | "downtown" | "polytechnic" | "west" | "online";
export type DashboardConcernLevel = "high" | "watch" | "steady";
export type DashboardResourceUsageLevel = "never" | "once" | "regular";
export type DashboardMood = "great" | "okay" | "meh" | "struggling" | "drowning";
export type DashboardBlocker = "none" | "money" | "academics" | "health" | "personal";
export type AdvisorNoteVisibility = "advisor-only" | "shared-with-faculty";
export type DashboardTimelineVisibility = "shared" | "advisor-only";
export type DashboardMessageKind = "handoff" | "reply" | "note";
export type DashboardFlagKind = "review" | "advisor-note";
export type DashboardFlagStatus = "open" | "resolved";
export type DashboardTimelineType =
  | "email"
  | "flag-created"
  | "flag-resolved"
  | "reply"
  | "note"
  | "resource"
  | "check-in"
  | "milestone";
export type DashboardEmailTone = "warm" | "direct" | "encouraging";
export type DashboardEmailFocusArea =
  | "academic"
  | "navigation"
  | "tutoring"
  | "advising"
  | "financial"
  | "general";
export type FacultyEmailTone = DashboardEmailTone;
export type FacultyEmailFocusArea = DashboardEmailFocusArea;
export type AdvisorEmailTone = DashboardEmailTone;
export type AdvisorEmailFocusArea = DashboardEmailFocusArea;

export interface FacultyContext {
  id: string;
  name: string;
  course: {
    code: string;
    name: string;
    campus: string;
    semester: string;
    totalStudents: number;
  };
}

export interface AdvisorContext {
  id: string;
  name: string;
  department: string;
  campus: string;
  totalStudents: number;
}

export interface DashboardSignal {
  date: string;
  description: string;
  type: "positive" | "neutral" | "concern";
}

export interface DashboardResourceUsage {
  officeHours: DashboardResourceUsageLevel;
  tutoring: DashboardResourceUsageLevel;
  advising: DashboardResourceUsageLevel;
  counseling: DashboardResourceUsageLevel;
  financialCoaching: DashboardResourceUsageLevel;
}

export interface DashboardSimulationStatus {
  started: boolean;
  currentDay: number;
  completed: boolean;
  badges: string[];
  confidence: number;
}

export interface DashboardRecommendedResource {
  type: ResourceSlug;
  reason: string;
}

export interface DashboardObservation {
  id: string;
  date: string;
  authorName: string;
  text: string;
}

export interface DashboardAdvisorNote {
  id: string;
  date: string;
  authorName: string;
  text: string;
  visibility: AdvisorNoteVisibility;
}

export interface DashboardOutreachItem {
  date: string;
  type: "email" | "check-in" | "note";
  summary: string;
}

export interface DashboardDegreeProgress {
  creditsCompleted: number;
  creditsNeeded: number;
  onTrack: boolean;
  lastDarsCheck: string;
  holds: string[];
  eligibleScholarships: number;
}

export interface DashboardCoursePerformance {
  quizScores: number[];
  hwAverage: number;
  attendance: { attended: number; total: number };
  officeHoursVisits: number;
  weeklyMissedLectures: number;
}

export interface DashboardCourseStatus {
  code: string;
  professorName: string;
  status: "fine" | "okay" | "struggling";
  facultySignals: string[];
}

export interface DashboardFinancialSnapshot {
  scholarshipAmount: number;
  financialCoachingVisits: number;
  unappliedScholarships: number;
}

export interface SelfCheckIn {
  studentId: string;
  week: number;
  mood: DashboardMood;
  blocker: DashboardBlocker;
  wantsOutreach: boolean;
  date: string;
}

export interface DashboardFlag {
  id: string;
  kind: DashboardFlagKind;
  status: DashboardFlagStatus;
  createdByRole: DashboardRole;
  createdById: string;
  createdByName: string;
  createdAt: string;
  message: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolvedByName?: string;
  resolutionNote?: string;
}

export interface SharedTimelineEvent {
  id: string;
  date: string;
  type: DashboardTimelineType;
  actorId: string;
  actorName: string;
  actorRole: DashboardRole | "student" | "system";
  summary: string;
  visibility?: DashboardTimelineVisibility;
}

export interface DashboardMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: DashboardRole;
  date: string;
  type: DashboardMessageKind;
  text: string;
}

export interface MessageThread {
  studentId: string;
  studentInitials: string;
  messages: DashboardMessage[];
}

export interface DashboardStudent {
  id: string;
  initials: string;
  firstName: string;
  pronouns: string;
  year: StudentYear;
  major: string;
  campus: DashboardCampus;
  isFirstGen: boolean;
  isInternational: boolean;
  isCommuter: boolean;
  commuteMinutes?: number;
  livesOnCampus: boolean;
  workHoursPerWeek: number;
  hasScholarship: boolean;
  contextTags: string[];
  advisorId: string;
  advisorName: string;
  lastAdvisingVisit: string;
  behaviorTags: string[];
  strengths: string[];
  signals: DashboardSignal[];
  degree: DashboardDegreeProgress;
  coursePerformance: DashboardCoursePerformance;
  allCourses: DashboardCourseStatus[];
  financial: DashboardFinancialSnapshot;
  resourceUsage: DashboardResourceUsage;
  simulation: DashboardSimulationStatus;
  checkIns: SelfCheckIn[];
  concernLevel: DashboardConcernLevel;
  supportFocus: string;
  observations: DashboardObservation[];
  advisorNotes: DashboardAdvisorNote[];
  flags: DashboardFlag[];
  recommendedResource: DashboardRecommendedResource;
  timeline: SharedTimelineEvent[];
}

export interface DashboardData {
  faculty: FacultyContext;
  advisor: AdvisorContext;
  students: DashboardStudent[];
  messages: MessageThread[];
  selfCheckIns: SelfCheckIn[];
}

export type DashboardDemoState = DashboardData;

export interface CohortPattern {
  id: string;
  icon: string;
  text: string;
  severity: "high" | "medium" | "low";
  studentIds: string[];
}

export interface FacultyEmailDraft {
  subject: string;
  body: string;
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
export type MiniGameType =
  | "resource-match"
  | "jargon-match"
  | "dars-explorer"
  | "budget-splitter"
  | "scholarship-finder"
  | "schedule-builder";

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

export interface DialogLine {
  id: string;
  speaker: string;
  speakerType: CharacterId;
  text: string;
  isThought?: boolean;
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
  miniGameType?: MiniGameType;
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
