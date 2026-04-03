import { notFound } from "next/navigation";

import { StepFlow } from "@/components/StepFlow";
import { resources } from "@/lib/data";
import { getResourceBySlug } from "@/lib/data";

export function generateStaticParams() {
  return resources.map((resource) => ({ resource: resource.slug }));
}

export default async function ResourceFlowPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const match = getResourceBySlug(resource);

  if (!match) {
    notFound();
  }

  return <StepFlow resource={match} />;
}
