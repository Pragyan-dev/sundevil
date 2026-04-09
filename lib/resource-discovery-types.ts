export type MascotExpression =
  | "happy"
  | "sad"
  | "anxious"
  | "confused"
  | "angry"
  | "smirk"
  | "shocked"
  | "idea";

export type ResourceWorldId =
  | "first-gen-support"
  | "academic-advising"
  | "tutoring"
  | "explore-asu"
  | "financial-aid"
  | "career-services"
  | "counseling"
  | "office-hours";

export type ResourcePreviewSlug = "first-day" | "advising" | "tutoring" | "office-hours";

export interface BadgeDefinition {
  id: "first-step" | "help-seeker" | "explorer" | "office-hours-warrior";
  title: string;
  description: string;
  icon: string;
}

export interface ChoiceReward {
  helpful?: boolean;
}

export interface ChatChoice {
  id: string;
  text: string;
  nextStepId: string;
  reward?: ChoiceReward;
}

export interface ResourceLinkCard {
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  external?: boolean;
}

export interface ExperienceCard {
  kind: "success-coach" | "campus-handoff";
  title: string;
  body: string;
  ctaLabel: string;
}

export interface ScenarioStep {
  id: string;
  expression: MascotExpression;
  text: string;
  choices?: ChatChoice[];
  autoNextStepId?: string;
  experience?: ExperienceCard;
  resourceLink?: ResourceLinkCard;
  complete?: boolean;
}

export interface ResourceScenario {
  id: string;
  title: string;
  teaser: string;
  entryStepId: string;
  steps: ScenarioStep[];
}

export interface MapNodePosition {
  x: number;
  y: number;
  mobileX?: number;
  mobileY?: number;
}

export interface ResourceWorld {
  id: ResourceWorldId;
  title: string;
  mapLabel: string;
  icon: string;
  teaser: string;
  summary: string;
  lockedHint: string;
  accentFrom: string;
  accentTo: string;
  position: MapNodePosition;
  guideExpression: MascotExpression;
  guideLine: string;
  scenarios: ResourceScenario[];
}

export interface RenderedChatMessage {
  id: string;
  side: "left" | "right";
  text: string;
  expression?: MascotExpression;
  experience?: ExperienceCard;
  resourceLink?: ResourceLinkCard;
}

export interface ResourceDiscoveryProgress {
  points: number;
  openedWorldIds: ResourceWorldId[];
  completedWorldIds: ResourceWorldId[];
  completedScenarioIds: string[];
  helpfulChoiceIds: string[];
  clickedResourceLinkIds: string[];
  earnedBadgeIds: BadgeDefinition["id"][];
}

export interface RewardPopupItem {
  id: string;
  kind: "points" | "badge" | "unlock";
  title: string;
  detail: string;
  points?: number;
  badgeId?: BadgeDefinition["id"];
}
