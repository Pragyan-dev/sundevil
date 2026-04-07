import type { Metadata } from "next";

import CampusNavigator from "@/components/campus/CampusNavigator";
import { campusMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Explore Campus",
  description:
    "Walk a sketch-style ASU Tempe campus map, enter support buildings, and see what tutoring, advising, counseling, and DARS actually feel like.",
};

export default function CampusPage() {
  return (
    <div className="page-shell campus-page-shell">
      <CampusNavigator map={campusMap} />
    </div>
  );
}
