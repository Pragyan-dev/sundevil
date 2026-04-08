"use client";

import { ResourceDiscoveryGame } from "@/components/simulation/ResourceDiscoveryGame";
import type { ResourcePreviewSlug } from "@/lib/resource-discovery-types";

interface StoryGameProps {
  mode?: "main" | "preview";
  previewSlug?: ResourcePreviewSlug;
}

export function StoryGame({ mode = "main", previewSlug }: StoryGameProps) {
  return <ResourceDiscoveryGame previewSlug={mode === "preview" ? previewSlug : undefined} />;
}
