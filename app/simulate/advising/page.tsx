import { notFound } from "next/navigation";

import { SimulationStep } from "@/components/SimulationStep";
import { getSimulationBySlug } from "@/lib/data";

export default function AdvisingSimulationPage() {
  const scenario = getSimulationBySlug("advising");

  if (!scenario) {
    notFound();
  }

  return <SimulationStep scenario={scenario} />;
}
