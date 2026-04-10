import { NextResponse } from "next/server";

import { getSparkyChainStatus } from "@/lib/sparkychain";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getSparkyChainStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to read SparkyChain status.",
      },
      { status: 500 },
    );
  }
}
