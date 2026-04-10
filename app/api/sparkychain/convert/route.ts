import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";

import { mintSparkyCoinsToWallet } from "@/lib/sparkychain";

export const dynamic = "force-dynamic";

type ConvertRequestBody = {
  walletAddress?: unknown;
  pitchforkAmount?: unknown;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ConvertRequestBody;
  const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim() : "";
  const pitchforkAmount =
    typeof body.pitchforkAmount === "number" && Number.isFinite(body.pitchforkAmount)
      ? Math.max(0, Math.floor(body.pitchforkAmount))
      : 0;

  if (!walletAddress || !isAddress(walletAddress) || pitchforkAmount <= 0) {
    return NextResponse.json(
      { error: "A valid wallet address and positive pitchfork amount are required." },
      { status: 400 },
    );
  }

  try {
    const minted = await mintSparkyCoinsToWallet(walletAddress, pitchforkAmount);
    return NextResponse.json(minted);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to convert pitchforks into SparkyCoins.",
      },
      { status: 500 },
    );
  }
}
