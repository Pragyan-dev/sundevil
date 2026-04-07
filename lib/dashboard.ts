import asuUnlockedStory from "@/data/asu_unlocked_story";
import { dashboardData, getResourceBySlug } from "@/lib/data";
import type {
  AdvisorContext,
  CohortPattern,
  DashboardBlocker,
  DashboardConcernLevel,
  DashboardData,
  DashboardEmailFocusArea,
  DashboardResourceUsageLevel,
  DashboardStudent,
  FacultyContext,
  FacultyEmailFocusArea,
  MessageThread,
  Resource,
  ResourceSlug,
  SelfCheckIn,
} from "@/lib/types";

type DashboardSort = "concern" | "name" | "simulation" | "last-contact";

export type FacultySignal = {
  id: string;
  icon: string;
  tone: "high" | "medium" | "positive";
  text: string;
};

export type AdvisorIncomingItem = {
  id: string;
  type: "handoff" | "check-in";
  studentId: string;
  studentInitials: string;
  studentName: string;
  date: string;
  sourceLabel: string;
  summary: string;
};

export type AdvisorAlert = {
  id: string;
  icon: string;
  tone: "high" | "watch";
  text: string;
  studentIds: string[];
};

export type AdvisorRecommendation = {
  id: string;
  icon: string;
  title: string;
  reason: string;
  resourceSlug?: ResourceSlug;
};

const concernRank: Record<DashboardConcernLevel, number> = {
  high: 0,
  watch: 1,
  steady: 2,
};

const moodRank = {
  great: 0,
  okay: 1,
  meh: 2,
  struggling: 3,
  drowning: 4,
} as const;

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

const courseStatusLabelMap = {
  fine: "fine",
  okay: "okay",
  struggling: "struggling",
} as const;

const moodLabelMap = {
  great: "great",
  okay: "okay",
  meh: "meh",
  struggling: "struggling",
  drowning: "drowning",
} as const;

export const dashboardStorageKey = "asu-unlocked-dashboard-v2";

const timelineAnchorDate = (() => {
  const candidateDates = dashboardData.students.flatMap((student) => [
    ...student.timeline.map((event) => event.date),
    ...student.handoffs.map((handoff) => handoff.date),
    ...student.observations.map((note) => note.date),
    ...student.advisorNotes.map((note) => note.date),
    ...student.checkIns.map((checkIn) => checkIn.date),
    ...student.signals.map((signal) => signal.date),
    student.lastAdvisingVisit,
    student.degree.lastDarsCheck,
  ]);

  return candidateDates.reduce((latest, value) => {
    const current = new Date(value).getTime();
    return current > latest ? current : latest;
  }, new Date("2026-09-11T12:00:00").getTime());
})();

export const dashboardClassContext = {
  courseCode: dashboardData.faculty.course.code,
  courseName: dashboardData.faculty.course.name,
  courseLabel: `${dashboardData.faculty.course.code} · ${dashboardData.faculty.course.name} · ${dashboardData.faculty.course.semester}`,
  professorName: dashboardData.faculty.name,
  professorMailName: dashboardData.faculty.name,
  campusLabel: `${dashboardData.faculty.course.campus} Campus`,
  campus: dashboardData.faculty.course.campus,
  term: dashboardData.faculty.course.semester,
} as const;

export const dashboardAdvisorContext = {
  advisorName: dashboardData.advisor.name,
  department: dashboardData.advisor.department,
  campus: dashboardData.advisor.campus,
  totalStudents: dashboardData.advisor.totalStudents,
} as const;

function getAnchorDate() {
  return new Date(timelineAnchorDate);
}

export function getDashboardData(): DashboardData {
  return dashboardData;
}

export function getFacultyContext(): FacultyContext {
  return dashboardData.faculty;
}

export function getAdvisorContext(): AdvisorContext {
  return dashboardData.advisor;
}

export function getDashboardStudents(): DashboardStudent[] {
  return dashboardData.students;
}

export function getDashboardStudent(id: string): DashboardStudent | undefined {
  return dashboardData.students.find((student) => student.id === id);
}

export function getDashboardThread(studentId: string, threads: MessageThread[] = dashboardData.messages) {
  return threads.find((thread) => thread.studentId === studentId);
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
      return { label: "Needs Outreach", icon: "🔴", shortLabel: "High Need" };
    case "watch":
      return { label: "Watch List", icon: "🟡", shortLabel: "Watch" };
    case "steady":
      return { label: "On Track", icon: "🟢", shortLabel: "Steady" };
  }
}

export function getLatestSignal(student: DashboardStudent) {
  return [...student.signals].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0] ?? null;
}

export function getLatestCheckIn(student: DashboardStudent) {
  return [...student.checkIns].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0] ?? null;
}

export function formatSignalDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTimestamp(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeDate(date: string): string {
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  const diffMs = new Date(date).getTime() - getAnchorDate().getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 14) {
    return rtf.format(diffDays, "day");
  }

  const diffWeeks = Math.round(diffDays / 7);
  return rtf.format(diffWeeks, "week");
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

export function getContextTags(student: DashboardStudent): string[] {
  const tags: string[] = [];

  if (student.isFirstGen) tags.push("First-gen");
  if (student.isInternational) tags.push("International");
  if (student.isCommuter) tags.push("Commuter");
  if (student.livesOnCampus) tags.push("On-campus");
  if (student.workHoursPerWeek > 0) tags.push(`Works ${student.workHoursPerWeek}hrs/wk`);

  return [...tags, ...student.contextTags, ...student.behaviorTags];
}

export function getResourceSummarySentence(student: DashboardStudent): string {
  const summary: string[] = [];

  if (student.resourceUsage.officeHours === "never") summary.push("No office hours");
  if (student.resourceUsage.advising === "never") summary.push("no advising");
  if (student.resourceUsage.tutoring === "never") summary.push("no tutoring");
  if (student.resourceUsage.financialCoaching === "never" && getLatestCheckIn(student)?.blocker === "money") {
    summary.push("no financial coaching");
  }

  if (!summary.length) {
    return "Already using multiple support paths.";
  }

  return summary.join(", ");
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

export function getSimulationLabel(simulation: DashboardStudent["simulation"]) {
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

export function getRecommendedResource(student: DashboardStudent): Resource | undefined {
  return getResourceBySlug(student.recommendedResource.type);
}

export function getResourceOptionsForEmail(student: DashboardStudent) {
  const slugs = new Set<ResourceSlug>([student.recommendedResource.type]);

  if (student.resourceUsage.tutoring === "never") slugs.add("tutoring");
  if (student.resourceUsage.advising === "never") slugs.add("advising");
  if (student.resourceUsage.financialCoaching === "never") slugs.add("financial-aid");
  if (student.resourceUsage.counseling === "never") slugs.add("counseling");

  return [...slugs]
    .map((slug) => getResourceBySlug(slug))
    .filter((resource): resource is Resource => Boolean(resource));
}

export function getSimulationSupportLink(student: DashboardStudent) {
  if (student.recommendedResource.type === "tutoring") {
    return { href: "/simulate/tutoring", label: "Tutoring preview" };
  }

  if (student.recommendedResource.type === "advising") {
    return { href: "/simulate/advising", label: "Advising preview" };
  }

  if (student.supportFocus.toLowerCase().includes("office hours")) {
    return { href: "/simulate/office-hours", label: "Office-hours preview" };
  }

  return { href: "/simulate", label: "Full first-week story" };
}

export function getDefaultFocusArea(student: DashboardStudent): DashboardEmailFocusArea {
  const support = student.supportFocus.toLowerCase();

  if (support.includes("money")) return "financial";
  if (support.includes("tutor") || student.recommendedResource.type === "tutoring") return "tutoring";
  if (support.includes("dars") || student.recommendedResource.type === "advising") return "advising";
  if (support.includes("room") || support.includes("navigation")) return "navigation";
  if (student.coursePerformance.quizScores.at(-1) && student.coursePerformance.quizScores.at(-1)! < 70) {
    return "academic";
  }

  return "general";
}

export function getPatternFocusArea(patternId: string): FacultyEmailFocusArea {
  switch (patternId) {
    case "first-gen-no-advising":
      return "advising";
    case "simulation-dropoff":
      return "navigation";
    case "no-resource-engagement":
    default:
      return "general";
  }
}

export function getPatternTitle(pattern: CohortPattern) {
  switch (pattern.id) {
    case "no-resource-engagement":
      return "No resource engagement yet";
    case "simulation-dropoff":
      return "Simulation dropoff in the first half";
    case "first-gen-no-advising":
      return "First-gen students with no advising visit";
    default:
      return pattern.text;
  }
}

export function getDashboardCounts(students: DashboardStudent[]) {
  return {
    needsOutreach: students.filter((student) => student.concernLevel === "high").length,
    watchClosely: students.filter((student) => student.concernLevel === "watch").length,
    onTrack: students.filter((student) => student.concernLevel === "steady").length,
    emailsSent: students.reduce(
      (count, student) =>
        count +
        student.timeline.filter(
          (event) => event.type === "email" && event.actorRole === "faculty",
        ).length,
      0,
    ),
    handoffsToAdvisor: students.reduce(
      (count, student) => count + student.handoffs.filter((handoff) => handoff.fromRole === "faculty").length,
      0,
    ),
  };
}

export function getFacultySignals(students: DashboardStudent[]): FacultySignal[] {
  const quizConcern = students.filter((student) => (student.coursePerformance.quizScores.at(-1) ?? 100) < 60).length;
  const missedLecture = students.filter((student) => student.coursePerformance.weeklyMissedLectures > 0).length;
  const tutoringFirstTime = students.filter((student) => student.resourceUsage.tutoring === "once").length;
  const outreachRequests = students.filter((student) =>
    student.checkIns.some((checkIn) => checkIn.wantsOutreach),
  ).length;

  return [
    {
      id: "quiz-concern",
      icon: "⚠️",
      tone: "high",
      text: `${quizConcern} students scored below 60% on the latest quiz`,
    },
    {
      id: "attendance",
      icon: "⚠️",
      tone: "high",
      text: `${missedLecture} students missed at least one lecture this week`,
    },
    {
      id: "tutoring",
      icon: "✅",
      tone: "positive",
      text: `${tutoringFirstTime} students used tutoring for the first time`,
    },
    {
      id: "self-check-in",
      icon: "📬",
      tone: "medium",
      text: `${outreachRequests} students requested outreach via self-check-in`,
    },
  ];
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

  return patterns;
}

export function getPatternById(id: string): CohortPattern | undefined {
  return computeCohortPatterns(dashboardData.students).find((pattern) => pattern.id === id);
}

function getLastContactDate(student: DashboardStudent): number {
  const dates = [
    ...student.timeline.map((event) => event.date),
    ...student.handoffs.map((handoff) => handoff.date),
    ...student.observations.map((note) => note.date),
    ...student.advisorNotes.map((note) => note.date),
    ...student.checkIns.map((checkIn) => checkIn.date),
  ];

  return dates.reduce((latest, date) => Math.max(latest, Date.parse(date)), 0);
}

export function sortDashboardStudents(students: DashboardStudent[], sortBy: DashboardSort) {
  return [...students].sort((left, right) => {
    if (sortBy === "name") {
      return left.initials.localeCompare(right.initials);
    }

    if (sortBy === "simulation") {
      return right.simulation.currentDay - left.simulation.currentDay;
    }

    if (sortBy === "last-contact") {
      return getLastContactDate(right) - getLastContactDate(left);
    }

    const concernDiff = concernRank[left.concernLevel] - concernRank[right.concernLevel];
    if (concernDiff !== 0) return concernDiff;

    return left.initials.localeCompare(right.initials);
  });
}

export function getFacultyRead(student: DashboardStudent): string {
  const strengths = student.strengths[0]?.toLowerCase() ?? "showing up";
  const latestConcern = student.signals.find((signal) => signal.type === "concern")?.description;
  const noResources = Object.values(student.resourceUsage).every((usage) => usage === "never");
  const quizTrend = student.coursePerformance.quizScores.at(-1);

  return [
    `${student.firstName} is still bringing a real strength into class: ${strengths}.`,
    quizTrend && quizTrend < 70
      ? "The current academic trend needs attention before it hardens into avoidance."
      : "The academic picture is still recoverable with one concrete next step.",
    noResources
      ? "The barrier looks less like effort and more like uncertainty about how support spaces work."
      : "Support has started, but the current pattern is still too thin to absorb this week’s pressure.",
    latestConcern
      ? `The clearest signal right now is that ${latestConcern.charAt(0).toLowerCase()}${latestConcern.slice(1)}`
      : `${student.supportFocus} This is a good moment for a low-pressure, specific email.`,
  ].join(" ");
}

export function getSuggestedCheckInPrompts(student: DashboardStudent): string[] {
  const prompts: string[] = [];
  const blocker = getLatestCheckIn(student)?.blocker;

  if (blocker === "money") {
    prompts.push("Has money stress started changing how you’re planning the week?");
    prompts.push("Would it help if I made the financial support options more concrete?");
  } else if (student.recommendedResource.type === "tutoring") {
    prompts.push("Which concept feels most stuck right now?");
    prompts.push("Would it help if I showed you what tutoring looks like before you go?");
  } else if (student.recommendedResource.type === "advising") {
    prompts.push("Does DARS still feel harder to read than it should?");
    prompts.push("Would it help to name the first advising question together?");
  } else {
    prompts.push("What part of this week still feels harder than it should?");
    prompts.push("What would make the next support step feel concrete instead of abstract?");
  }

  prompts.push("What would make the next step feel specific enough to try this week?");
  return prompts;
}

export function getFacultyVisibleTimeline(student: DashboardStudent) {
  return [...student.timeline]
    .filter((event) => event.visibility !== "advisor-only")
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
}

export function getAdvisorVisibleTimeline(student: DashboardStudent) {
  return [...student.timeline].sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
}

export function getLatestSharedAdvisorNote(student: DashboardStudent) {
  return [...student.advisorNotes]
    .filter((note) => note.visibility === "shared-with-faculty")
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0] ?? null;
}

export function getResourceEngagementSummary(student: DashboardStudent) {
  return [
    `Tutoring: ${getUsageText(student.resourceUsage.tutoring)}`,
    `Office hours: ${getUsageText(student.resourceUsage.officeHours)}`,
    `Advising: ${getUsageText(student.resourceUsage.advising)}`,
  ].join(" · ");
}

function isMoneyFlag(student: DashboardStudent) {
  return (
    getLatestCheckIn(student)?.blocker === "money" ||
    student.handoffs.some((handoff) => handoff.message.toLowerCase().includes("money")) ||
    student.supportFocus.toLowerCase().includes("money")
  );
}

function isHealthOrPersonalFlag(student: DashboardStudent) {
  const latestCheckIn = getLatestCheckIn(student);
  return latestCheckIn?.blocker === "health" || latestCheckIn?.blocker === "personal";
}

export function getAdvisorAssessment(student: DashboardStudent) {
  const parts: string[] = [];
  const strugglingCourses = student.allCourses.filter((course) => course.status === "struggling");
  const latestCheckIn = getLatestCheckIn(student);
  const noResources = Object.values(student.resourceUsage).every((usage) => usage === "never");

  if (strugglingCourses.length) {
    parts.push(
      `This student has converging academic pressure in ${strugglingCourses
        .map((course) => course.code)
        .join(", ")}.`,
    );
  } else {
    parts.push("The student is still early enough in the term to stabilize with one coordinated intervention.");
  }

  if (isMoneyFlag(student)) {
    parts.push("Money pressure is showing up directly in both faculty signal and self-check-in language.");
  }

  if (noResources) {
    parts.push("There is still almost no support engagement beyond class attendance, which suggests process friction rather than total disengagement.");
  }

  if (student.isFirstGen || student.isCommuter) {
    parts.push("Context suggests the student may need college processes translated into concrete, low-friction steps.");
  }

  if (latestCheckIn?.wantsOutreach) {
    parts.push("The latest self-check-in asked for outreach, which is a positive sign of readiness.");
  }

  return parts.join(" ");
}

export function getAdvisorRecommendations(student: DashboardStudent): AdvisorRecommendation[] {
  const recommendations: AdvisorRecommendation[] = [];
  const latestCheckIn = getLatestCheckIn(student);
  const latestQuiz = student.coursePerformance.quizScores.at(-1) ?? 100;
  const hasStrugglingCourse = student.allCourses.some((course) => course.status === "struggling");
  const staleDars = Date.parse(student.degree.lastDarsCheck) < getAnchorDate().getTime() - 1000 * 60 * 60 * 24 * 21;
  const staleAdvisingVisit =
    Date.parse(student.lastAdvisingVisit) < getAnchorDate().getTime() - 1000 * 60 * 60 * 24 * 42;

  if (isMoneyFlag(student) || student.financial.financialCoachingVisits === 0) {
    recommendations.push({
      id: "financial-coaching",
      icon: "💰",
      title: "Refer to financial coaching",
      reason: "Money is the latest blocker, and there is still no financial coaching visit on record.",
      resourceSlug: "financial-aid",
    });
  }

  if ((hasStrugglingCourse || latestQuiz < 70) && student.resourceUsage.tutoring === "never") {
    recommendations.push({
      id: "tutoring",
      icon: "📚",
      title: "Connect with tutoring",
      reason: "At least one course is slipping and tutoring has not started yet.",
      resourceSlug: "tutoring",
    });
  }

  if (staleDars || staleAdvisingVisit || !student.degree.onTrack || student.degree.holds.length > 0) {
    recommendations.push({
      id: "dars-review",
      icon: "🗺️",
      title: "Schedule a DARS review",
      reason: "Degree progress needs a refreshed advising read before the term gets more complicated.",
      resourceSlug: "advising",
    });
  }

  if (
    isHealthOrPersonalFlag(student) ||
    (latestCheckIn && moodRank[latestCheckIn.mood] >= moodRank.struggling)
  ) {
    recommendations.push({
      id: "counseling",
      icon: "💚",
      title: "Mention counseling as an option",
      reason: "Mood trend and blocker language suggest the student may need more than academic triage.",
      resourceSlug: "counseling",
    });
  }

  return recommendations.slice(0, 4);
}

export function getAdvisorIncomingItems(students: DashboardStudent[]): AdvisorIncomingItem[] {
  const handoffs = students.flatMap((student) =>
    student.handoffs
      .filter((handoff) => !handoff.acknowledged)
      .map((handoff) => ({
        id: handoff.id,
        type: "handoff" as const,
        studentId: student.id,
        studentInitials: student.initials,
        studentName: student.firstName,
        date: handoff.date,
        sourceLabel: `Handoff from ${handoff.fromName}`,
        summary: handoff.message,
      })),
  );

  const checkIns = students.flatMap((student) => {
    const latestOutreach = [...student.checkIns]
      .filter((checkIn) => checkIn.wantsOutreach)
      .sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0];

    if (!latestOutreach) return [];

    return [
      {
        id: `checkin-${student.id}-${latestOutreach.week}`,
        type: "check-in" as const,
        studentId: student.id,
        studentInitials: student.initials,
        studentName: student.firstName,
        date: latestOutreach.date,
        sourceLabel: "Self-check-in request",
        summary: `${moodLabelMap[latestOutreach.mood]} · blocker: ${latestOutreach.blocker}`,
      },
    ];
  });

  return [...handoffs, ...checkIns].sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
}

export function getAdvisorAlerts(students: DashboardStudent[]): AdvisorAlert[] {
  const alerts: AdvisorAlert[] = [];

  const studentsWithHolds = students.filter((student) => student.degree.holds.length > 0);
  if (studentsWithHolds.length) {
    alerts.push({
      id: "holds",
      icon: "🔴",
      tone: "high",
      text: `${studentsWithHolds.length} students have enrollment holds`,
      studentIds: studentsWithHolds.map((student) => student.id),
    });
  }

  const staleDars = students.filter(
    (student) =>
      Date.parse(student.degree.lastDarsCheck) <
      getAnchorDate().getTime() - 1000 * 60 * 60 * 24 * 21,
  );
  if (staleDars.length) {
    alerts.push({
      id: "dars",
      icon: "🔴",
      tone: "high",
      text: `${staleDars.length} students have not checked DARS recently`,
      studentIds: staleDars.map((student) => student.id),
    });
  }

  const staleAdvising = students.filter(
    (student) =>
      student.resourceUsage.advising === "never" ||
      Date.parse(student.lastAdvisingVisit) <
        getAnchorDate().getTime() - 1000 * 60 * 60 * 24 * 42,
  );
  if (staleAdvising.length) {
    alerts.push({
      id: "advising-gap",
      icon: "🟡",
      tone: "watch",
      text: `${staleAdvising.length} students have gone 6+ weeks without advising`,
      studentIds: staleAdvising.map((student) => student.id),
    });
  }

  const noSimulation = students.filter((student) => !student.simulation.started);
  if (noSimulation.length) {
    alerts.push({
      id: "simulation-gap",
      icon: "🟡",
      tone: "watch",
      text: `${noSimulation.length} students have not started the simulation`,
      studentIds: noSimulation.map((student) => student.id),
    });
  }

  return alerts;
}

export function getSimulationSupportText(student: DashboardStudent) {
  const link = getSimulationSupportLink(student);
  return `${link.label} (${link.href})`;
}

export function getFacultyStudentSummary(student: DashboardStudent) {
  const latestQuiz = student.coursePerformance.quizScores.at(-1);
  const lectureCopy =
    student.coursePerformance.weeklyMissedLectures > 0
      ? `Missed ${student.coursePerformance.weeklyMissedLectures} lectures this week`
      : "Full attendance this week";

  return {
    performance: latestQuiz ? `Quiz ${student.coursePerformance.quizScores.length}: ${latestQuiz}%` : "No quiz yet",
    attendance: lectureCopy,
    simulation: `${getSimulationLabel(student.simulation)} · Badges ${student.simulation.badges.length}/8`,
    advisor: `Advisor: ${student.advisorName}`,
    advisorTouch: getLatestSharedAdvisorNote(student)
      ? `Last advisor note: ${formatRelativeDate(getLatestSharedAdvisorNote(student)!.date)}`
      : `Last advisor contact: ${formatRelativeDate(student.lastAdvisingVisit)}`,
  };
}

export function getAdvisorStudentSummary(student: DashboardStudent) {
  const struggling = student.allCourses.filter((course) => course.status === "struggling");
  const latestHandoff = [...student.handoffs].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0];

  return {
    degree: `${student.degree.creditsCompleted}/${student.degree.creditsNeeded} credits`,
    onTrack: student.degree.onTrack ? "On track" : "Needs review",
    courses: student.allCourses
      .map((course) => `${course.code} (${courseStatusLabelMap[course.status]})`)
      .join(", "),
    financial:
      student.financial.scholarshipAmount > 0
        ? `Scholarship: $${student.financial.scholarshipAmount.toLocaleString()}/yr`
        : "No scholarship on file",
    facultySignal: latestHandoff
      ? `${latestHandoff.fromName}: ${latestHandoff.message}`
      : struggling.length
        ? `Faculty concern in ${struggling.map((course) => course.code).join(", ")}`
        : "No active faculty handoff",
  };
}

export function getSharedThreadPreview(thread?: MessageThread) {
  if (!thread?.messages.length) {
    return "No shared thread yet.";
  }

  const latest = [...thread.messages].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0];
  return `${latest.senderName}: ${latest.text}`;
}

export function getThreadStudentOptions(threads: MessageThread[], students: DashboardStudent[]) {
  return threads
    .map((thread) => {
      const student = students.find((item) => item.id === thread.studentId);
      if (!student) return null;

      return {
        id: student.id,
        label: student.initials,
        description: getSharedThreadPreview(thread),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getLatestBlocker(checkIns: SelfCheckIn[]): DashboardBlocker {
  return [...checkIns].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0]?.blocker ?? "none";
}
