import asuUnlockedStory from "@/data/asu_unlocked_story";
import { dashboardRoster, getResourceBySlug } from "@/lib/data";
import type {
  CohortPattern,
  DashboardConcernLevel,
  DashboardResourceUsageLevel,
  DashboardStudent,
  FacultyEmailFocusArea,
  Resource,
} from "@/lib/types";

type DashboardSort = "concern" | "name" | "simulation";

const concernRank: Record<DashboardConcernLevel, number> = {
  high: 0,
  watch: 1,
  steady: 2,
};

const badgeIconMap: Record<string, string> = {
  "classroom-navigator": "🗺️",
  "dars-scout": "🧭",
  "advisor-check-in": "🗓️",
  "tutor-trial": "📚",
  "office-hours-drafted": "✉️",
  "office-hours-visited": "🎓",
  "wellness-door-open": "💚",
  "myasu-cleanup": "✅",
};

export const dashboardClassContext = {
  courseCode: "CSE 110",
  courseName: "Principles of Programming",
  courseLabel: "CSE 110 · Principles of Programming · Fall 2026",
  professorName: "Prof. Chen",
  professorMailName: "Prof. Chen",
  campusLabel: "Tempe Campus",
  campus: "Tempe",
  term: "Fall 2026",
} as const;

export function getDashboardStudents(): DashboardStudent[] {
  return dashboardRoster;
}

export function getDashboardStudent(id: string): DashboardStudent | undefined {
  return dashboardRoster.find((student) => student.id === id);
}

export function formatDashboardYear(year: DashboardStudent["year"]): string {
  switch (year) {
    case "first-year":
      return "First-year";
    case "second-year":
      return "Second-year";
    case "third-year":
      return "Third-year";
    case "fourth-year-plus":
      return "Fourth-year+";
  }
}

export function formatDashboardCampus(campus: DashboardStudent["campus"]): string {
  switch (campus) {
    case "tempe":
      return "Tempe";
    case "downtown":
      return "Downtown";
    case "polytechnic":
      return "Polytechnic";
    case "west":
      return "West";
    case "online":
      return "Online";
  }
}

export function getConcernMeta(level: DashboardConcernLevel) {
  switch (level) {
    case "high":
      return { label: "Needs Outreach", icon: "🔴" };
    case "watch":
      return { label: "Watch Closely", icon: "🟡" };
    case "steady":
      return { label: "On Track", icon: "🟢" };
  }
}

export function getContextTags(student: DashboardStudent): string[] {
  const tags: string[] = [];

  if (student.isFirstGen) tags.push("First-gen");
  if (student.isInternational) tags.push("International");
  if (student.isCommuter) tags.push("Commuter");
  if (student.livesOnCampus) tags.push("Lives on campus");
  if (student.workHoursPerWeek > 0) tags.push(`Works ${student.workHoursPerWeek} hrs/wk`);
  if (student.hasScholarship) tags.push("Scholarship");

  return [...tags, ...student.behaviorTags];
}

export function getLatestSignal(student: DashboardStudent) {
  return student.signals[0] ?? null;
}

export function formatSignalDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getUsageText(level: DashboardResourceUsageLevel): string {
  switch (level) {
    case "never":
      return "Never";
    case "once":
      return "Once";
    case "regular":
      return "Regular";
  }
}

export function getUsageFillCount(level: DashboardResourceUsageLevel): number {
  switch (level) {
    case "never":
      return 0;
    case "once":
      return 1;
    case "regular":
      return 5;
  }
}

export function getResourceSummarySentence(student: DashboardStudent): string {
  const positives: string[] = [];
  const missing: string[] = [];

  if (student.resourceUsage.advising !== "never") positives.push(`Advising ${getUsageText(student.resourceUsage.advising).toLowerCase()}`);
  else missing.push("advising");

  if (student.resourceUsage.tutoring !== "never") positives.push(`Tutoring ${getUsageText(student.resourceUsage.tutoring).toLowerCase()}`);
  else missing.push("tutoring");

  if (student.resourceUsage.officeHours !== "never") positives.push(`Office hours ${getUsageText(student.resourceUsage.officeHours).toLowerCase()}`);
  else missing.push("office hours");

  if (!positives.length) {
    const limited = missing.slice(0, 3).join(", ");
    return `No ${limited} yet.`;
  }

  if (!missing.length) {
    return positives.join(" · ");
  }

  return `${positives.join(" · ")} · No ${missing.slice(0, 2).join(" or ")} yet`;
}

export function getSimulationDots(simulation: DashboardStudent["simulation"]) {
  return Array.from({ length: 5 }, (_, index) => {
    const day = index + 1;

    if (simulation.completed) return "completed" as const;
    if (!simulation.started || simulation.currentDay === 0) return "upcoming" as const;
    if (day < simulation.currentDay) return "completed" as const;
    if (day === simulation.currentDay) return "current" as const;
    return "upcoming" as const;
  });
}

export function getSimulationLabel(simulation: DashboardStudent["simulation"]): string {
  if (!simulation.started) return "Not started";
  if (simulation.completed) return "Completed";
  return `Day ${simulation.currentDay}`;
}

export function getBadgeMeta(badgeIds: string[]) {
  return badgeIds
    .map((badgeId) => {
      const badge = asuUnlockedStory.badges.find((item) => item.id === badgeId);
      if (!badge) return null;

      return {
        id: badge.id,
        title: badge.title,
        shortLabel: badge.shortLabel,
        icon: badgeIconMap[badge.id] ?? "✨",
      };
    })
    .filter((badge): badge is NonNullable<typeof badge> => Boolean(badge));
}

export function getFacultyRead(student: DashboardStudent): string {
  const topStrength = student.strengths[0];
  const latestConcern = student.signals.find((signal) => signal.type === "concern")?.description;
  const noResources = Object.values(student.resourceUsage).every((usage) => usage === "never");
  const simState = getSimulationLabel(student.simulation).toLowerCase();

  const lines = [
    `${student.firstName} is showing a real strength worth naming out loud: ${topStrength.charAt(0).toLowerCase()}${topStrength.slice(1)}.`,
    noResources
      ? "The main pattern is not absence from class. It is hesitation around turning uncertainty into a first support step."
      : "The student is engaged, but the current support pattern still leaves one important barrier unresolved.",
    latestConcern
      ? `The clearest recent signal is: ${latestConcern.charAt(0).toLowerCase()}${latestConcern.slice(1)}`
      : `Simulation progress is currently ${simState}.`,
    `${student.supportFocus} This is where a specific, low-pressure email can help most.`,
  ];

  return lines.join(" ");
}

export function getSuggestedCheckInPrompts(student: DashboardStudent): string[] {
  const prompts: string[] = [];

  if (student.supportFocus.toLowerCase().includes("office hours")) {
    prompts.push("What part of office hours still feels unclear or awkward?");
    prompts.push("Would it help to walk through what the first two minutes in that room usually look like?");
  } else if (student.recommendedResource.type === "advising") {
    prompts.push("Is DARS or MyASU still harder to read than it should be?");
    prompts.push("Would a short advising visit feel easier if we named the first question together?");
  } else if (student.recommendedResource.type === "tutoring") {
    prompts.push("Which class or concept feels most stuck right now?");
    prompts.push("Would seeing where tutoring is and how drop-in works make it feel more doable?");
  } else if (student.recommendedResource.type === "financial-aid") {
    prompts.push("Are money or MyASU tasks competing with your focus right now?");
    prompts.push("Would it help to translate the financial-aid steps into one next action?");
  } else {
    prompts.push("What part of this week still feels harder than it should?");
    prompts.push("Is there a campus support step that still feels too vague to start?");
  }

  prompts.push("What would make the next support step feel concrete instead of abstract?");
  return prompts;
}

export function getRecommendedResource(student: DashboardStudent): Resource | undefined {
  return getResourceBySlug(student.recommendedResource.type);
}

export function getDefaultFocusArea(student: DashboardStudent): FacultyEmailFocusArea {
  if (
    student.supportFocus.toLowerCase().includes("navigation") ||
    student.supportFocus.toLowerCase().includes("room") ||
    student.supportFocus.toLowerCase().includes("myasu")
  ) {
    return "navigation";
  }

  if (student.recommendedResource.type === "tutoring") {
    return "tutoring";
  }

  if (student.recommendedResource.type === "advising") {
    return "advising";
  }

  return "general";
}

export function getResourceOptionsForEmail(student: DashboardStudent) {
  const slugs = new Set([student.recommendedResource.type]);

  for (const [key, value] of Object.entries(student.resourceUsage)) {
    if (value === "never") {
      if (key === "officeHours") {
        continue;
      }

      if (key === "financialCoaching") {
        slugs.add("financial-aid");
        continue;
      }

      slugs.add(
        key === "counseling"
          ? "counseling"
          : key === "tutoring"
            ? "tutoring"
            : key === "advising"
              ? "advising"
              : "student-success-center",
      );
    }
  }

  return [...slugs]
    .map((slug) => getResourceBySlug(slug))
    .filter((resource): resource is Resource => Boolean(resource));
}

export function getPatternFocusArea(patternId: string): FacultyEmailFocusArea {
  switch (patternId) {
    case "office-hours-hesitation":
    case "simulation-dropoff":
      return "navigation";
    case "first-gen-no-advising":
      return "advising";
    case "no-resource-engagement":
    default:
      return "general";
  }
}

export function getPatternTitle(pattern: CohortPattern) {
  switch (pattern.id) {
    case "no-resource-engagement":
      return "No resource engagement by Week 3";
    case "simulation-dropoff":
      return "Simulation dropoff in the first half";
    case "first-gen-no-advising":
      return "No advising engagement among first-gen students";
    case "office-hours-hesitation":
      return "Office-hours hesitation despite class engagement";
    default:
      return pattern.text;
  }
}

export function getSimulationSupportLink(student: DashboardStudent) {
  if (student.supportFocus.toLowerCase().includes("office hours")) {
    return {
      href: "/simulate/office-hours",
      label: "Office-hours preview",
    };
  }

  switch (student.recommendedResource.type) {
    case "advising":
      return { href: "/simulate/advising", label: "Advising preview" };
    case "tutoring":
      return { href: "/simulate/tutoring", label: "Tutoring preview" };
    case "student-success-center":
      return { href: "/simulate/first-day", label: "First-day preview" };
    default:
      return { href: "/simulate", label: "Full first-week story" };
  }
}

export function getDashboardCounts(students: DashboardStudent[]) {
  return {
    needsOutreach: students.filter((student) => student.concernLevel === "high").length,
    watchClosely: students.filter((student) => student.concernLevel === "watch").length,
    onTrack: students.filter((student) => student.concernLevel === "steady").length,
    emailsSent: students.reduce(
      (count, student) =>
        count + student.outreachHistory.filter((item) => item.type === "email").length,
      0,
    ),
  };
}

export function computeCohortPatterns(students: DashboardStudent[]): CohortPattern[] {
  const patterns: CohortPattern[] = [];

  const noResources = students.filter((student) =>
    Object.values(student.resourceUsage).every((usage) => usage === "never"),
  );
  if (noResources.length > 1) {
    patterns.push({
      id: "no-resource-engagement",
      icon: "📊",
      text: `${noResources.length} students have not used any campus resource yet`,
      severity: "high",
      studentIds: noResources.map((student) => student.id),
    });
  }

  const simDropoff = students.filter(
    (student) =>
      student.simulation.started &&
      !student.simulation.completed &&
      student.simulation.currentDay > 0 &&
      student.simulation.currentDay <= 2,
  );
  if (simDropoff.length > 1) {
    const averageDay =
      Math.round(
        simDropoff.reduce((sum, student) => sum + student.simulation.currentDay, 0) /
          simDropoff.length,
      ) || 1;

    patterns.push({
      id: "simulation-dropoff",
      icon: "🎮",
      text: `${simDropoff.length} students started the simulation but stopped around Day ${averageDay}`,
      severity: "medium",
      studentIds: simDropoff.map((student) => student.id),
    });
  }

  const firstGenNoAdvising = students.filter(
    (student) => student.isFirstGen && student.resourceUsage.advising === "never",
  );
  if (firstGenNoAdvising.length > 1) {
    patterns.push({
      id: "first-gen-no-advising",
      icon: "🗺️",
      text: `${firstGenNoAdvising.length} first-gen students have no advising visits logged`,
      severity: "high",
      studentIds: firstGenNoAdvising.map((student) => student.id),
    });
  }

  const officeHourHesitation = students.filter(
    (student) =>
      student.resourceUsage.officeHours === "never" &&
      student.supportFocus.toLowerCase().includes("office hours"),
  );
  if (officeHourHesitation.length > 1) {
    patterns.push({
      id: "office-hours-hesitation",
      icon: "📬",
      text: `${officeHourHesitation.length} students show office-hours hesitation despite strong class engagement`,
      severity: "medium",
      studentIds: officeHourHesitation.map((student) => student.id),
    });
  }

  return patterns;
}

export function getPatternById(id: string): CohortPattern | undefined {
  return computeCohortPatterns(dashboardRoster).find((pattern) => pattern.id === id);
}

export function sortDashboardStudents(students: DashboardStudent[], sortBy: DashboardSort) {
  return [...students].sort((left, right) => {
    if (sortBy === "name") {
      return left.initials.localeCompare(right.initials);
    }

    if (sortBy === "simulation") {
      return right.simulation.currentDay - left.simulation.currentDay;
    }

    const concernDiff = concernRank[left.concernLevel] - concernRank[right.concernLevel];
    if (concernDiff !== 0) return concernDiff;

    return left.initials.localeCompare(right.initials);
  });
}
