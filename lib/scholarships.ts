import { scholarships } from "@/lib/data";
import type {
  AidStatus,
  FirstGenStatus,
  GpaRange,
  MajorCategory,
  ResidencyStatus,
  Scholarship,
  StudentYear,
} from "@/lib/types";

export type ScholarshipFilterState = {
  year: StudentYear | "";
  major: Exclude<MajorCategory, "any"> | "";
  gpaRange: GpaRange | "";
  firstGen: FirstGenStatus | "";
  residency: ResidencyStatus | "";
  aidStatus: AidStatus | "";
};

export const initialScholarshipFilterState: ScholarshipFilterState = {
  year: "",
  major: "",
  gpaRange: "",
  firstGen: "",
  residency: "",
  aidStatus: "",
};

export function matchesScholarship(scholarship: Scholarship, form: ScholarshipFilterState) {
  if (form.year && !scholarship.eligibility.years.includes(form.year)) return false;
  if (
    form.major &&
    !(
      scholarship.eligibility.majors.includes("any") ||
      scholarship.eligibility.majors.includes(form.major)
    )
  ) {
    return false;
  }
  if (
    form.gpaRange &&
    !scholarship.eligibility.gpaRanges.includes(form.gpaRange as Exclude<GpaRange, "under-2.5">)
  ) {
    return false;
  }
  if (form.firstGen && !scholarship.eligibility.firstGen.includes(form.firstGen)) return false;
  if (form.residency && !scholarship.eligibility.residency.includes(form.residency)) return false;
  if (form.aidStatus && !scholarship.eligibility.aidStatus.includes(form.aidStatus)) return false;
  return true;
}

export function filterScholarships(form: ScholarshipFilterState) {
  return scholarships.filter((scholarship) => matchesScholarship(scholarship, form));
}

export function parseScholarshipAmount(amount: string) {
  const numbers = amount.match(/\$?([\d,]+)/g);
  if (!numbers?.length) {
    return 0;
  }

  return Math.max(
    ...numbers.map((entry) => Number.parseInt(entry.replace(/[^\d]/g, ""), 10) || 0),
  );
}

export function getScholarshipValueTotal(matches: Scholarship[]) {
  return matches.reduce((sum, scholarship) => sum + parseScholarshipAmount(scholarship.amount), 0);
}

