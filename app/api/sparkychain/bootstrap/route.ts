import { NextResponse } from "next/server";

import { ensureSparkyChainDeployment } from "@/lib/sparkychain";
import { polygonAmoyConfig } from "@/lib/sparkychain-abis";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const deployment = await ensureSparkyChainDeployment();
    return NextResponse.json({
      deployment,
      chain: polygonAmoyConfig,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to deploy the SparkyChain demo contracts.",
      },
      { status: 500 },
    );
  }
}
