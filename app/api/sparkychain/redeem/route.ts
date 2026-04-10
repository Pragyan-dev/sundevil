import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";

import { redeemFigurineWithSparkyCoins } from "@/lib/sparkychain";

export const dynamic = "force-dynamic";

type RedeemRequestBody = {
  walletAddress?: unknown;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RedeemRequestBody;
  const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim() : "";

  if (!walletAddress || !isAddress(walletAddress)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  try {
    const redeemed = await redeemFigurineWithSparkyCoins(walletAddress);
    return NextResponse.json(redeemed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to redeem a mystery Sparky figurine.";
    const status = /approve|enough SparkyCoins/i.test(message) ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
