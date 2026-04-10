import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";

import { readWalletCollection } from "@/lib/sparkychain";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get("wallet")?.trim() ?? "";

  if (!walletAddress || !isAddress(walletAddress)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  try {
    const collection = await readWalletCollection(walletAddress);
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load the SparkyChain collection.",
      },
      { status: 500 },
    );
  }
}
