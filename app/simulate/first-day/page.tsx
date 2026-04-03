import { notFound } from "next/navigation";

import { SimulationStep } from "@/components/SimulationStep";
import { getSimulationBySlug } from "@/lib/data";

export default function FirstDaySimulationPage() {
  const scenario = getSimulationBySlug("first-day");

  if (!scenario) {
    notFound();
  }

  return <SimulationStep scenario={scenario} />;
}
