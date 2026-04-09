import type { Metadata } from "next";

import CampusExperienceSwitch from "@/components/campus/CampusExperienceSwitch";
import { campusMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Explore Campus",
  description:
    "Walk a sketch-style ASU Tempe campus map, enter support buildings, and see what tutoring, advising, counseling, and DARS actually feel like.",
};

export default function CampusPage() {
  return (
    <div className="campus-page-shell">
      <CampusExperienceSwitch map={campusMap} />
    </div>
  );
}
