import type { Metadata } from "next";

import CampusExperienceSwitch from "@/components/campus/CampusExperienceSwitch";
import { normalizeCampusStoryLaunchContext } from "@/lib/campus-story-session";
import { campusMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Explore Campus",
  description:
    "Walk a sketch-style ASU Tempe campus map, enter support buildings, and see what tutoring, advising, counseling, and DARS actually feel like.",
};

function takeFirst(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CampusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const storyLaunch = normalizeCampusStoryLaunchContext({
    entry: takeFirst(params.entry),
    returnTo: takeFirst(params.returnTo),
    resume: takeFirst(params.resume),
    world: takeFirst(params.world),
  });

  return (
    <div className="campus-page-shell">
      <CampusExperienceSwitch map={campusMap} storyLaunch={storyLaunch} />
    </div>
  );
}
