import finderLogicJson from "@/data/finder_logic.json";
import resourcesJson from "@/data/asu_resources.json";
import dashboardRosterJson from "@/data/dashboard-roster.json";
import scholarshipsJson from "@/data/asu_scholarships.json";
import simulationScriptsJson from "@/data/simulation_scripts.json";
import advisingWalkthroughJson from "@/data/walkthroughs/advising.json";
import careerServicesWalkthroughJson from "@/data/walkthroughs/career-services.json";
import counselingWalkthroughJson from "@/data/walkthroughs/counseling.json";
import financialAidWalkthroughJson from "@/data/walkthroughs/financial-aid.json";
import scholarshipSearchWalkthroughJson from "@/data/walkthroughs/scholarship-search.json";
import studentSuccessCenterWalkthroughJson from "@/data/walkthroughs/student-success-center.json";
import tutoringWalkthroughJson from "@/data/walkthroughs/tutoring.json";

import type {
  AidStatus,
  DashboardStudent,
  FinderConcern,
  FinderLogic,
  FirstGenStatus,
  GpaRange,
  MajorCategory,
  Resource,
  ResourceExperience,
  ResourceSlug,
  ResidencyStatus,
  ResourceWalkthrough,
  Scholarship,
  SimulationScenario,
  StudentYear,
  WalkthroughMode,
} from "@/lib/types";

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateResources(input: unknown): Resource[] {
  invariant(Array.isArray(input), "asu_resources.json must export an array");

  input.forEach((item, index) => {
    invariant(isRecord(item), `Resource ${index} must be an object`);
    invariant(typeof item.id === "string", `Resource ${index} needs an id`);
    invariant(typeof item.slug === "string", `Resource ${index} needs a slug`);
    invariant(typeof item.name === "string", `Resource ${index} needs a name`);
    invariant(typeof item.category === "string", `Resource ${index} needs a category`);
    invariant(typeof item.description === "string", `Resource ${index} needs a description`);
    invariant(typeof item.location === "string", `Resource ${index} needs a location`);
    invariant(typeof item.hours === "string", `Resource ${index} needs hours`);
    invariant(typeof item.signUpSummary === "string", `Resource ${index} needs signUpSummary`);
    invariant(typeof item.url === "string", `Resource ${index} needs a url`);
    invariant(typeof item.previewPath === "string", `Resource ${index} needs previewPath`);
    invariant(Array.isArray(item.flowSteps), `Resource ${index} needs flowSteps`);
  });

  return input as Resource[];
}

function validateFinderLogic(input: unknown, validSlugs: Set<string>): FinderLogic {
  invariant(isRecord(input), "finder_logic.json must be an object");
  invariant(isRecord(input.questions), "finder_logic.json needs questions");
  invariant(isRecord(input.lookup), "finder_logic.json needs lookup");

  for (const [concern, years] of Object.entries(input.lookup)) {
    invariant(isRecord(years), `Finder concern ${concern} must map to a year object`);
    for (const [year, experiences] of Object.entries(years)) {
      invariant(isRecord(experiences), `Finder year ${year} must map to an experience object`);
      for (const [experience, slugs] of Object.entries(experiences)) {
        invariant(
          isStringArray(slugs),
          `Finder combination ${concern}/${year}/${experience} must be a slug array`,
        );
        slugs.forEach((slug) =>
          invariant(validSlugs.has(slug), `Unknown resource slug in finder logic: ${slug}`),
        );
      }
    }
  }

  return input as unknown as FinderLogic;
}

function validateScenarios(input: unknown): SimulationScenario[] {
  invariant(isRecord(input), "simulation_scripts.json must be an object");
  invariant(Array.isArray(input.scenarios), "simulation_scripts.json needs scenarios");

  input.scenarios.forEach((item, index) => {
    invariant(isRecord(item), `Scenario ${index} must be an object`);
    invariant(typeof item.slug === "string", `Scenario ${index} needs a slug`);
    invariant(Array.isArray(item.steps), `Scenario ${index} needs steps`);
  });

  return input.scenarios as SimulationScenario[];
}

function validateScholarships(input: unknown): Scholarship[] {
  invariant(Array.isArray(input), "asu_scholarships.json must export an array");

  input.forEach((item, index) => {
    invariant(isRecord(item), `Scholarship ${index} must be an object`);
    invariant(typeof item.id === "string", `Scholarship ${index} needs an id`);
    invariant(typeof item.name === "string", `Scholarship ${index} needs a name`);
    invariant(typeof item.amount === "string", `Scholarship ${index} needs an amount`);
    invariant(typeof item.deadlineLabel === "string", `Scholarship ${index} needs a deadline`);
    invariant(typeof item.applicationUrl === "string", `Scholarship ${index} needs a link`);
    invariant(typeof item.description === "string", `Scholarship ${index} needs a description`);
    invariant(isRecord(item.eligibility), `Scholarship ${index} needs eligibility`);
  });

  return input as Scholarship[];
}

function validateDashboardRoster(input: unknown, validSlugs: Set<string>): DashboardStudent[] {
  invariant(Array.isArray(input), "dashboard-roster.json must export an array");

  input.forEach((item, index) => {
    invariant(isRecord(item), `Dashboard student ${index} must be an object`);
    invariant(typeof item.id === "string", `Dashboard student ${index} needs an id`);
    invariant(typeof item.initials === "string", `Dashboard student ${index} needs initials`);
    invariant(typeof item.firstName === "string", `Dashboard student ${index} needs firstName`);
    invariant(typeof item.pronouns === "string", `Dashboard student ${index} needs pronouns`);
    invariant(typeof item.year === "string", `Dashboard student ${index} needs year`);
    invariant(typeof item.major === "string", `Dashboard student ${index} needs major`);
    invariant(typeof item.campus === "string", `Dashboard student ${index} needs campus`);
    invariant(typeof item.isFirstGen === "boolean", `Dashboard student ${index} needs isFirstGen`);
    invariant(
      typeof item.isInternational === "boolean",
      `Dashboard student ${index} needs isInternational`,
    );
    invariant(typeof item.isCommuter === "boolean", `Dashboard student ${index} needs isCommuter`);
    invariant(
      typeof item.livesOnCampus === "boolean",
      `Dashboard student ${index} needs livesOnCampus`,
    );
    invariant(
      typeof item.workHoursPerWeek === "number",
      `Dashboard student ${index} needs workHoursPerWeek`,
    );
    invariant(
      typeof item.hasScholarship === "boolean",
      `Dashboard student ${index} needs hasScholarship`,
    );
    invariant(
      isStringArray(item.behaviorTags),
      `Dashboard student ${index} needs behaviorTags`,
    );
    invariant(isStringArray(item.strengths), `Dashboard student ${index} needs strengths`);
    invariant(Array.isArray(item.signals), `Dashboard student ${index} needs signals`);
    invariant(isRecord(item.resourceUsage), `Dashboard student ${index} needs resourceUsage`);
    invariant(isRecord(item.simulation), `Dashboard student ${index} needs simulation`);
    invariant(
      typeof item.concernLevel === "string",
      `Dashboard student ${index} needs concernLevel`,
    );
    invariant(
      typeof item.supportFocus === "string",
      `Dashboard student ${index} needs supportFocus`,
    );
    invariant(
      isRecord(item.recommendedResource),
      `Dashboard student ${index} needs recommendedResource`,
    );
    invariant(
      typeof item.recommendedResource.type === "string" &&
        validSlugs.has(item.recommendedResource.type),
      `Dashboard student ${index} needs a valid recommendedResource.type`,
    );
    invariant(
      typeof item.recommendedResource.reason === "string",
      `Dashboard student ${index} needs recommendedResource.reason`,
    );
    invariant(
      Array.isArray(item.outreachHistory),
      `Dashboard student ${index} needs outreachHistory`,
    );
  });

  return input as DashboardStudent[];
}

function validateWalkthrough(input: unknown, validSlugs: Set<string>): ResourceWalkthrough {
  invariant(isRecord(input), "Walkthrough must be an object");
  invariant(typeof input.slug === "string", "Walkthrough needs a slug");
  invariant(validSlugs.has(input.slug), `Unknown walkthrough slug: ${String(input.slug)}`);
  invariant(typeof input.title === "string", `Walkthrough ${input.slug} needs a title`);
  invariant(typeof input.summary === "string", `Walkthrough ${input.slug} needs a summary`);
  invariant(Array.isArray(input.modes), `Walkthrough ${input.slug} needs modes`);
  invariant(isRecord(input.questionSet), `Walkthrough ${input.slug} needs questionSet`);

  const validModes = new Set<WalkthroughMode>(["in-person", "online", "drop-in"]);

  input.modes.forEach((mode, modeIndex) => {
    invariant(isRecord(mode), `Walkthrough ${input.slug} mode ${modeIndex} must be an object`);
    invariant(
      typeof mode.mode === "string" && validModes.has(mode.mode as WalkthroughMode),
      `Walkthrough ${input.slug} mode ${modeIndex} needs a valid mode id`,
    );
    invariant(typeof mode.label === "string", `Walkthrough ${input.slug} mode ${modeIndex} needs label`);
    invariant(
      typeof mode.summary === "string",
      `Walkthrough ${input.slug} mode ${modeIndex} needs summary`,
    );
    invariant(Array.isArray(mode.steps), `Walkthrough ${input.slug} mode ${modeIndex} needs steps`);

    mode.steps.forEach((step, stepIndex) => {
      invariant(
        isRecord(step),
        `Walkthrough ${input.slug} mode ${modeIndex} step ${stepIndex} must be an object`,
      );
      invariant(
        typeof step.id === "string",
        `Walkthrough ${input.slug} mode ${modeIndex} step ${stepIndex} needs id`,
      );
      invariant(
        typeof step.title === "string",
        `Walkthrough ${input.slug} mode ${modeIndex} step ${stepIndex} needs title`,
      );
      invariant(
        typeof step.description === "string",
        `Walkthrough ${input.slug} mode ${modeIndex} step ${stepIndex} needs description`,
      );
      invariant(
        isStringArray(step.bullets),
        `Walkthrough ${input.slug} mode ${modeIndex} step ${stepIndex} needs bullets`,
      );
    });
  });

  invariant(
    typeof input.questionSet.defaultOpener === "string",
    `Walkthrough ${input.slug} needs defaultOpener`,
  );
  invariant(
    typeof input.questionSet.defaultProTip === "string",
    `Walkthrough ${input.slug} needs defaultProTip`,
  );
  invariant(
    isRecord(input.questionSet.questionsByYear),
    `Walkthrough ${input.slug} needs questionsByYear`,
  );

  const validYears = new Set<StudentYear>([
    "first-year",
    "second-year",
    "third-year",
    "fourth-year-plus",
  ]);

  for (const [year, questions] of Object.entries(input.questionSet.questionsByYear)) {
    invariant(
      validYears.has(year as StudentYear),
      `Walkthrough ${input.slug} has invalid year key ${year}`,
    );
    invariant(
      isStringArray(questions),
      `Walkthrough ${input.slug} year ${year} must map to a string array`,
    );
  }

  return input as unknown as ResourceWalkthrough;
}

export const resources = validateResources(resourcesJson);
export const resourceBySlug = Object.fromEntries(
  resources.map((resource) => [resource.slug, resource]),
) as Record<ResourceSlug, Resource>;

const walkthroughSource = [
  tutoringWalkthroughJson,
  advisingWalkthroughJson,
  counselingWalkthroughJson,
  financialAidWalkthroughJson,
  scholarshipSearchWalkthroughJson,
  careerServicesWalkthroughJson,
  studentSuccessCenterWalkthroughJson,
];

export const finderLogic = validateFinderLogic(
  finderLogicJson,
  new Set(resources.map((resource) => resource.slug)),
);
export const simulationScenarios = validateScenarios(simulationScriptsJson);
export const scholarships = validateScholarships(scholarshipsJson);
export const dashboardRoster = validateDashboardRoster(
  dashboardRosterJson,
  new Set(resources.map((resource) => resource.slug)),
);
export const walkthroughs = walkthroughSource.map((item) =>
  validateWalkthrough(item, new Set(resources.map((resource) => resource.slug))),
);
export const walkthroughBySlug = Object.fromEntries(
  walkthroughs.map((walkthrough) => [walkthrough.slug, walkthrough]),
) as Record<ResourceSlug, ResourceWalkthrough>;

export function getResourceBySlug(slug: string): Resource | undefined {
  return resourceBySlug[slug as ResourceSlug];
}

export function getFinderMatches(
  concern: FinderConcern,
  year: StudentYear,
  experience: ResourceExperience,
): Resource[] {
  const slugs = finderLogic.lookup[concern][year][experience];
  return slugs
    .map((slug) => getResourceBySlug(slug))
    .filter((resource): resource is Resource => Boolean(resource));
}

export function getSimulationBySlug(slug: string): SimulationScenario | undefined {
  return simulationScenarios.find((scenario) => scenario.slug === slug);
}

export function getWalkthroughBySlug(slug: string): ResourceWalkthrough | undefined {
  return walkthroughBySlug[slug as ResourceSlug];
}

export function getDashboardStudentById(id: string): DashboardStudent | undefined {
  return dashboardRoster.find((student) => student.id === id);
}

export function getSignupHref(resource: Resource): string {
  return `/flow/${resource.slug}`;
}

export const scholarshipFormOptions = {
  years: [
    { label: "First year", value: "first-year" },
    { label: "Second year", value: "second-year" },
    { label: "Third year", value: "third-year" },
    { label: "Fourth year+", value: "fourth-year-plus" },
  ] satisfies { label: string; value: StudentYear }[],
  majors: [
    { label: "Arts & humanities", value: "arts-humanities" },
    { label: "Business", value: "business" },
    { label: "Education", value: "education" },
    { label: "Engineering", value: "engineering" },
    { label: "Health", value: "health" },
    { label: "Science", value: "science" },
    { label: "Social sciences", value: "social-sciences" },
    { label: "Undeclared", value: "undeclared" },
    { label: "Other", value: "other" },
  ] satisfies { label: string; value: Exclude<MajorCategory, "any"> }[],
  gpaRanges: [
    { label: "Under 2.5", value: "under-2.5" },
    { label: "2.5 - 2.99", value: "2.5-2.99" },
    { label: "3.0 - 3.49", value: "3.0-3.49" },
    { label: "3.5 - 4.0", value: "3.5-4.0" },
  ] satisfies { label: string; value: GpaRange }[],
  firstGen: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
    { label: "Not sure", value: "not-sure" },
  ] satisfies { label: string; value: FirstGenStatus }[],
  residency: [
    { label: "Arizona resident", value: "in-state" },
    { label: "Out of state", value: "out-of-state" },
    { label: "International", value: "international" },
  ] satisfies { label: string; value: ResidencyStatus }[],
  aidStatus: [
    { label: "FAFSA filed", value: "fafsa-filed" },
    { label: "Not filed yet", value: "not-filed" },
    { label: "Not sure", value: "not-sure" },
  ] satisfies { label: string; value: AidStatus }[],
};
