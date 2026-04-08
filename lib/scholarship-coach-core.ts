import type {
  AidStatus,
  FirstGenStatus,
  GpaRange,
  MajorCategory,
  ResidencyStatus,
  Scholarship,
  StudentYear,
} from "./types";

export const ASU_SCHOLARSHIP_PORTAL_URL = "https://students.asu.edu/scholarships";

export type ScholarshipApplicationStatus =
  | "not-started"
  | "in-progress"
  | "submitted"
  | "won"
  | "rejected";

export type DeadlineWindowFilter = "" | "next-14-days" | "next-30-days" | "next-60-days";
export type AwardAmountFilter = "" | "under-2000" | "2000-4999" | "5000-plus";
export type EssayRequiredFilter = "" | "yes" | "no";

export type ScholarshipCoachFilterState = {
  year: StudentYear | "";
  major: Exclude<MajorCategory, "any"> | "";
  gpaRange: GpaRange | "";
  firstGen: FirstGenStatus | "";
  residency: ResidencyStatus | "";
  aidStatus: AidStatus | "";
  deadlineWindow: DeadlineWindowFilter;
  awardAmount: AwardAmountFilter;
  essayRequired: EssayRequiredFilter;
};

export type ScholarshipCoachMetadata = {
  deadlineIso: string;
  essayRequired: boolean;
  estimatedEffortHours: number;
  requirements: string[];
  essayPrompts: string[];
  reminderLabel: string;
};

export type ScholarshipCoachRecord = Scholarship & {
  meta: ScholarshipCoachMetadata;
  awardValue: number;
};

export type RankedScholarshipRecord = {
  scholarship: ScholarshipCoachRecord;
  fitScore: number;
  valueScore: number;
  urgencyScore: number;
  effortScore: number;
  priorityScore: number;
  estimatedChance: number;
  deadlineDays: number;
  whyMatches: string[];
  effortLabel: "Low" | "Medium" | "High";
  deadlineState: "urgent" | "soon" | "upcoming" | "later";
};

export type ScholarshipTrackerEntry = {
  status: ScholarshipApplicationStatus;
  saved: boolean;
  lastTouchedAt: string;
};

export type ScholarshipCoachDashboard = {
  matchedCount: number;
  upcomingDeadlines: number;
  inProgressCount: number;
  possibleAwardTotal: number;
};

export const initialScholarshipCoachFilterState: ScholarshipCoachFilterState = {
  year: "",
  major: "",
  gpaRange: "",
  firstGen: "",
  residency: "",
  aidStatus: "",
  deadlineWindow: "",
  awardAmount: "",
  essayRequired: "",
};

export function parseScholarshipAmount(amount: string) {
  const numbers = amount.match(/\$?([\d,]+)/g);
  if (!numbers?.length) {
    return 0;
  }

  return Math.max(
    ...numbers.map((entry) => Number.parseInt(entry.replace(/[^\d]/g, ""), 10) || 0),
  );
}

export function createScholarshipCoachRecords(
  scholarships: Scholarship[],
  metadata: Record<string, ScholarshipCoachMetadata>,
) {
  return scholarships
    .filter((scholarship) => scholarship.applicationUrl === ASU_SCHOLARSHIP_PORTAL_URL)
    .map((scholarship) => ({
      ...scholarship,
      meta: metadata[scholarship.id],
      awardValue: parseScholarshipAmount(scholarship.amount),
    }))
    .filter((scholarship): scholarship is ScholarshipCoachRecord => Boolean(scholarship.meta));
}

export function matchesScholarshipCoachFilters(
  scholarship: ScholarshipCoachRecord,
  filters: ScholarshipCoachFilterState,
  now = new Date(),
) {
  if (filters.year && !scholarship.eligibility.years.includes(filters.year)) return false;
  if (
    filters.major &&
    !(
      scholarship.eligibility.majors.includes("any") ||
      scholarship.eligibility.majors.includes(filters.major)
    )
  ) {
    return false;
  }
  if (
    filters.gpaRange &&
    !scholarship.eligibility.gpaRanges.includes(filters.gpaRange as Exclude<GpaRange, "under-2.5">)
  ) {
    return false;
  }
  if (filters.firstGen && !scholarship.eligibility.firstGen.includes(filters.firstGen)) return false;
  if (filters.residency && !scholarship.eligibility.residency.includes(filters.residency)) return false;
  if (filters.aidStatus && !scholarship.eligibility.aidStatus.includes(filters.aidStatus)) return false;
  if (filters.essayRequired && (filters.essayRequired === "yes") !== scholarship.meta.essayRequired) {
    return false;
  }

  if (filters.awardAmount) {
    if (filters.awardAmount === "under-2000" && scholarship.awardValue >= 2000) return false;
    if (
      filters.awardAmount === "2000-4999" &&
      (scholarship.awardValue < 2000 || scholarship.awardValue >= 5000)
    ) {
      return false;
    }
    if (filters.awardAmount === "5000-plus" && scholarship.awardValue < 5000) return false;
  }

  if (filters.deadlineWindow) {
    const days = getDaysUntilDeadline(scholarship.meta.deadlineIso, now);
    if (filters.deadlineWindow === "next-14-days" && days > 14) return false;
    if (filters.deadlineWindow === "next-30-days" && days > 30) return false;
    if (filters.deadlineWindow === "next-60-days" && days > 60) return false;
  }

  return true;
}

export function filterScholarshipCoachRecords(
  scholarships: ScholarshipCoachRecord[],
  filters: ScholarshipCoachFilterState,
  now = new Date(),
) {
  return scholarships.filter((scholarship) => matchesScholarshipCoachFilters(scholarship, filters, now));
}

export function getDaysUntilDeadline(deadlineIso: string, now = new Date()) {
  const millis = new Date(deadlineIso).getTime() - now.getTime();
  return Math.ceil(millis / (1000 * 60 * 60 * 24));
}

function getUrgencyScore(deadlineDays: number) {
  if (deadlineDays <= 14) return 100;
  if (deadlineDays <= 30) return 82;
  if (deadlineDays <= 60) return 64;
  return 42;
}

function getDeadlineState(deadlineDays: number): RankedScholarshipRecord["deadlineState"] {
  if (deadlineDays <= 14) return "urgent";
  if (deadlineDays <= 30) return "soon";
  if (deadlineDays <= 60) return "upcoming";
  return "later";
}

function getEffortScore(hours: number) {
  if (hours <= 2) return 18;
  if (hours <= 4) return 42;
  return 72;
}

function getEffortLabel(hours: number): RankedScholarshipRecord["effortLabel"] {
  if (hours <= 2) return "Low";
  if (hours <= 4) return "Medium";
  return "High";
}

function getValueScore(amount: number) {
  if (amount >= 5000) return 100;
  if (amount >= 3000) return 82;
  if (amount >= 2000) return 68;
  return 52;
}

function getFitScore(
  scholarship: ScholarshipCoachRecord,
  filters: ScholarshipCoachFilterState,
) {
  let score = 55;

  if (filters.major && scholarship.eligibility.majors.includes(filters.major)) {
    score += scholarship.eligibility.majors.includes("any") ? 8 : 18;
  }

  if (filters.year && scholarship.eligibility.years.includes(filters.year)) {
    score += scholarship.eligibility.years.length <= 2 ? 14 : 8;
  }

  if (filters.firstGen && scholarship.eligibility.firstGen.includes(filters.firstGen)) {
    score += scholarship.eligibility.firstGen.length === 1 ? 12 : 7;
  }

  if (filters.residency && scholarship.eligibility.residency.includes(filters.residency)) {
    score += scholarship.eligibility.residency.length === 1 ? 10 : 6;
  }

  if (filters.aidStatus && scholarship.eligibility.aidStatus.includes(filters.aidStatus)) {
    score += scholarship.eligibility.aidStatus.length === 1 ? 10 : 6;
  }

  if (filters.gpaRange && scholarship.eligibility.gpaRanges.includes(filters.gpaRange as Exclude<GpaRange, "under-2.5">)) {
    score += 8;
  }

  return Math.min(score, 100);
}

export function buildWhyThisMatches(
  scholarship: ScholarshipCoachRecord,
  filters: ScholarshipCoachFilterState,
) {
  const reasons: string[] = [];

  if (filters.major && scholarship.eligibility.majors.includes(filters.major)) {
    reasons.push("Your major area matches this scholarship.");
  } else if (scholarship.eligibility.majors.includes("any")) {
    reasons.push("This scholarship is open across multiple majors.");
  }

  if (filters.year && scholarship.eligibility.years.includes(filters.year)) {
    reasons.push("Your school year fits the listed eligibility.");
  }

  if (filters.firstGen === "yes" && scholarship.eligibility.firstGen.includes("yes")) {
    reasons.push("Your first-gen status can strengthen the fit here.");
  }

  if (filters.aidStatus === "fafsa-filed" && scholarship.eligibility.aidStatus.includes("fafsa-filed")) {
    reasons.push("Having FAFSA filed lines up with this award.");
  }

  if (scholarship.meta.essayRequired) {
    reasons.push("It needs writing time, so saving a draft early matters.");
  } else {
    reasons.push("This is lighter-lift because it does not require an essay.");
  }

  return reasons.slice(0, 4);
}

export function estimateChanceOfSuccess(
  fitScore: number,
  valueScore: number,
  effortScore: number,
) {
  return Math.max(18, Math.min(92, Math.round(fitScore * 0.58 + valueScore * 0.12 + (100 - effortScore) * 0.3)));
}

export function rankScholarshipCoachRecords(
  scholarships: ScholarshipCoachRecord[],
  filters: ScholarshipCoachFilterState,
  now = new Date(),
) {
  return scholarships
    .map((scholarship) => {
      const deadlineDays = getDaysUntilDeadline(scholarship.meta.deadlineIso, now);
      const fitScore = getFitScore(scholarship, filters);
      const valueScore = getValueScore(scholarship.awardValue);
      const urgencyScore = getUrgencyScore(deadlineDays);
      const effortScore = getEffortScore(scholarship.meta.estimatedEffortHours);
      const priorityScore = Math.round(fitScore * 0.42 + urgencyScore * 0.28 + valueScore * 0.3);

      return {
        scholarship,
        fitScore,
        valueScore,
        urgencyScore,
        effortScore,
        priorityScore,
        estimatedChance: estimateChanceOfSuccess(fitScore, valueScore, effortScore),
        deadlineDays,
        whyMatches: buildWhyThisMatches(scholarship, filters),
        effortLabel: getEffortLabel(scholarship.meta.estimatedEffortHours),
        deadlineState: getDeadlineState(deadlineDays),
      } satisfies RankedScholarshipRecord;
    })
    .sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      return left.deadlineDays - right.deadlineDays;
    });
}

export function getScholarshipDashboard(
  scholarships: RankedScholarshipRecord[],
  tracker: Record<string, ScholarshipTrackerEntry>,
  now = new Date(),
): ScholarshipCoachDashboard {
  const upcomingDeadlines = scholarships.filter(
    ({ scholarship }) => getDaysUntilDeadline(scholarship.meta.deadlineIso, now) <= 30,
  ).length;

  const inProgressCount = scholarships.filter(({ scholarship }) => {
    const status = tracker[scholarship.id]?.status;
    return status === "in-progress" || status === "submitted";
  }).length;

  const possibleAwardTotal = scholarships.reduce((sum, { scholarship }) => sum + scholarship.awardValue, 0);

  return {
    matchedCount: scholarships.length,
    upcomingDeadlines,
    inProgressCount,
    possibleAwardTotal,
  };
}

export function getDeadlineWarning(deadlineDays: number) {
  if (deadlineDays <= 14) {
    return "Deadline warning: due within two weeks.";
  }

  if (deadlineDays <= 30) {
    return "Deadline warning: due this month.";
  }

  if (deadlineDays <= 60) {
    return "Deadline warning: coming up soon.";
  }

  return "Deadline has some breathing room.";
}
