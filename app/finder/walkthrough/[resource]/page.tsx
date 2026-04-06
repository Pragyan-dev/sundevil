import { notFound } from "next/navigation";

import { WalkthroughEngine } from "@/components/WalkthroughEngine";
import { getResourceBySlug, getWalkthroughBySlug, walkthroughs } from "@/lib/data";
import type { FinderConcern, ResourceExperience, StudentContext, StudentYear } from "@/lib/types";

const VALID_CONCERNS = new Set<FinderConcern>([
  "class",
  "money",
  "overwhelmed",
  "schedule",
  "something-else",
]);

const VALID_YEARS = new Set<StudentYear>([
  "first-year",
  "second-year",
  "third-year",
  "fourth-year-plus",
]);

const VALID_EXPERIENCE = new Set<ResourceExperience>(["yes", "no", "not-sure"]);

function getSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeStudentContext(search: {
  concern?: string | string[];
  year?: string | string[];
  experience?: string | string[];
}): StudentContext {
  const concern = getSingleValue(search.concern);
  const year = getSingleValue(search.year);
  const experience = getSingleValue(search.experience);

  return {
    concern: concern && VALID_CONCERNS.has(concern as FinderConcern) ? (concern as FinderConcern) : null,
    year: year && VALID_YEARS.has(year as StudentYear) ? (year as StudentYear) : null,
    experience:
      experience && VALID_EXPERIENCE.has(experience as ResourceExperience)
        ? (experience as ResourceExperience)
        : null,
  };
}

export function generateStaticParams() {
  return walkthroughs.map((walkthrough) => ({ resource: walkthrough.slug }));
}

export default async function WalkthroughPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{
    concern?: string | string[];
    year?: string | string[];
    experience?: string | string[];
  }>;
}) {
  const { resource } = await params;
  const search = await searchParams;

  const resourceMatch = getResourceBySlug(resource);
  const walkthroughMatch = getWalkthroughBySlug(resource);

  if (!resourceMatch || !walkthroughMatch) {
    notFound();
  }

  return (
    <WalkthroughEngine
      resource={resourceMatch}
      walkthrough={walkthroughMatch}
      studentContext={normalizeStudentContext(search)}
    />
  );
}
