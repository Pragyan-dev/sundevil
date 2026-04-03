import { notFound } from "next/navigation";

import { SimulationStep } from "@/components/SimulationStep";
import { getSimulationBySlug } from "@/lib/data";

export default function TutoringSimulationPage() {
  const scenario = getSimulationBySlug("tutoring");

  if (!scenario) {
    notFound();
  }

  return <SimulationStep scenario={scenario} />;
}
