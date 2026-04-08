import test from "node:test";
import assert from "node:assert/strict";

import {
  createScholarshipCoachRecords,
  filterScholarshipCoachRecords,
  getScholarshipDashboard,
  rankScholarshipCoachRecords,
  type ScholarshipCoachMetadata,
} from "../lib/scholarship-coach-core.ts";
import type { Scholarship } from "../lib/types.ts";

const mockScholarships: Scholarship[] = [
  {
    id: "high-fit",
    name: "High Fit Scholarship",
    amount: "$5,000",
    deadlineLabel: "Soon",
    applicationUrl: "https://students.asu.edu/scholarships",
    description: "Best-fit scholarship for the current student.",
    eligibility: {
      years: ["first-year"],
      majors: ["engineering"],
      gpaRanges: ["3.5-4.0"],
      firstGen: ["yes"],
      residency: ["in-state"],
      aidStatus: ["fafsa-filed"],
    },
  },
  {
    id: "lighter-fit",
    name: "Lighter Fit Scholarship",
    amount: "$2,000",
    deadlineLabel: "Later",
    applicationUrl: "https://students.asu.edu/scholarships",
    description: "Still valid, but lower urgency and value.",
    eligibility: {
      years: ["first-year", "second-year"],
      majors: ["any"],
      gpaRanges: ["3.0-3.49", "3.5-4.0"],
      firstGen: ["yes", "no", "not-sure"],
      residency: ["in-state", "out-of-state"],
      aidStatus: ["fafsa-filed", "not-filed", "not-sure"],
    },
  },
  {
    id: "non-portal",
    name: "Non Portal Scholarship",
    amount: "$9,000",
    deadlineLabel: "Ignore",
    applicationUrl: "https://example.com/not-asu",
    description: "Should be filtered out by the coach.",
    eligibility: {
      years: ["first-year"],
      majors: ["engineering"],
      gpaRanges: ["3.5-4.0"],
      firstGen: ["yes"],
      residency: ["in-state"],
      aidStatus: ["fafsa-filed"],
    },
  },
];

const metadata: Record<string, ScholarshipCoachMetadata> = {
  "high-fit": {
    deadlineIso: "2026-04-15",
    essayRequired: true,
    estimatedEffortHours: 3,
    requirements: ["Essay"],
    essayPrompts: ["Prompt"],
    reminderLabel: "Soon",
  },
  "lighter-fit": {
    deadlineIso: "2026-06-20",
    essayRequired: false,
    estimatedEffortHours: 2,
    requirements: ["Short form"],
    essayPrompts: ["Prompt"],
    reminderLabel: "Later",
  },
  "non-portal": {
    deadlineIso: "2026-04-10",
    essayRequired: true,
    estimatedEffortHours: 5,
    requirements: ["Essay"],
    essayPrompts: ["Prompt"],
    reminderLabel: "Ignore",
  },
};

const filters = {
  year: "first-year",
  major: "engineering",
  gpaRange: "3.5-4.0",
  firstGen: "yes",
  residency: "in-state",
  aidStatus: "fafsa-filed",
  deadlineWindow: "",
  awardAmount: "",
  essayRequired: "",
} as const;

test("coach records keep only curated ASU scholarship portal entries", () => {
  const records = createScholarshipCoachRecords(mockScholarships, metadata);

  assert.equal(records.length, 2);
  assert.deepEqual(
    records.map((record) => record.id),
    ["high-fit", "lighter-fit"],
  );
});

test("ranking favors stronger fit plus deadline urgency and value", () => {
  const records = createScholarshipCoachRecords(mockScholarships, metadata);
  const filtered = filterScholarshipCoachRecords(records, filters, new Date("2026-04-07"));
  const ranked = rankScholarshipCoachRecords(filtered, filters, new Date("2026-04-07"));

  assert.equal(ranked[0]?.scholarship.id, "high-fit");
  assert.ok(ranked[0].priorityScore > ranked[1].priorityScore);
  assert.ok(ranked[0].urgencyScore > ranked[1].urgencyScore);
  assert.ok(ranked[0].valueScore > ranked[1].valueScore);
});

test("dashboard counts matched awards and in-progress work", () => {
  const records = createScholarshipCoachRecords(mockScholarships, metadata);
  const filtered = filterScholarshipCoachRecords(records, filters, new Date("2026-04-07"));
  const ranked = rankScholarshipCoachRecords(filtered, filters, new Date("2026-04-07"));
  const dashboard = getScholarshipDashboard(
    ranked,
    {
      "high-fit": {
        status: "in-progress",
        saved: true,
        lastTouchedAt: "2026-04-07T12:00:00.000Z",
      },
      "lighter-fit": {
        status: "submitted",
        saved: true,
        lastTouchedAt: "2026-04-07T12:00:00.000Z",
      },
    },
    new Date("2026-04-07"),
  );

  assert.equal(dashboard.matchedCount, 2);
  assert.equal(dashboard.upcomingDeadlines, 1);
  assert.equal(dashboard.inProgressCount, 2);
  assert.equal(dashboard.possibleAwardTotal, 7000);
});
