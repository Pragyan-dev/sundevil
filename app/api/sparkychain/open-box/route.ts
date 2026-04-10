import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";

import { mintMysteryFigurineToWallet } from "@/lib/sparkychain";

export const dynamic = "force-dynamic";

type OpenBoxRequestBody = {
  walletAddress?: unknown;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OpenBoxRequestBody;
  const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim() : "";

  if (!walletAddress || !isAddress(walletAddress)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  try {
    const minted = await mintMysteryFigurineToWallet(walletAddress, "mystery-box");
    return NextResponse.json(minted);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to open the mystery box.",
      },
      { status: 500 },
    );
  }
}
