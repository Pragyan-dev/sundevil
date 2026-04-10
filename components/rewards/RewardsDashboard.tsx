"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, isAddress } from "ethers";

import {
  DEMO_PITCHFORK_INCREMENT,
  rewardsBadgeCatalog,
  rewardsMissionCatalog,
  SPARKYCOIN_REDEMPTION_COST,
} from "@/lib/rewards-data";
import {
  addDemoPitchforks,
  consumeMysteryBox,
  formatPitchforks,
  formatSparkyCoins,
  getDayEntryRewardId,
  getRedeemCostLabel,
  recordMintedFigurine,
  setConnectedWalletAddress,
  spendPitchforks,
} from "@/lib/rewards";
import { useRewardsProfile } from "@/lib/use-rewards-profile";
import { polygonAmoyConfig, sparkyCoinAbi } from "@/lib/sparkychain-abis";
import type {
  FigurineRarity,
  FigurineSource,
  OwnedFigurineRecord,
  RewardsBadgeId,
} from "@/lib/rewards-types";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type ChainStatusResponse = {
  chain: {
    chainId: number;
    chainHex: string;
    chainName: string;
    fallbackRpcUrl: string;
    blockExplorerUrl: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  };
  deployment: {
    adminAddress: string;
    chainId: number;
    deployedAt: string;
    mysteryFigurineAddress: string;
    rpcUrl: string;
    sparkyCoinAddress: string;
  } | null;
  rpcUrl: string;
  error?: string;
};

type CollectionItem = {
  tokenId: string;
  tokenUri: string;
  metadata: Record<string, unknown> | null;
};

type CollectionResponse = {
  adminAddress: string;
  collection: CollectionItem[];
  deployment: {
    adminAddress: string;
    chainId: number;
    deployedAt: string;
    mysteryFigurineAddress: string;
    rpcUrl: string;
    sparkyCoinAddress: string;
  };
  redeemAllowance: string;
  redeemAllowanceFormatted: string;
  sparkyCoinBalance: string;
  sparkyCoinBalanceFormatted: string;
  walletAddress: string;
  error?: string;
};

type ActionTone = "success" | "warning" | "error" | "info";

type ActionMessage = {
  text: string;
  tone: ActionTone;
};

type DisplayFigurine = OwnedFigurineRecord & {
  tokenUri?: string;
};

const CARD_SURFACE =
  "relative overflow-hidden rounded-[1.8rem] border border-[#eadfce] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(252,247,240,0.9))] shadow-[0_24px_80px_rgba(44,17,22,0.08)]";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAttributeValue(metadata: Record<string, unknown> | null, traitType: string) {
  const attributes = metadata?.attributes;

  if (!Array.isArray(attributes)) {
    return null;
  }

  const match = attributes.find((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return false;
    }

    return (entry as { trait_type?: unknown }).trait_type === traitType;
  }) as { value?: unknown } | undefined;

  return typeof match?.value === "string" ? match.value : null;
}

function getDisplayFigurineFromChain(item: CollectionItem): DisplayFigurine {
  const name = typeof item.metadata?.name === "string" ? item.metadata.name : `Figurine #${item.tokenId}`;
  const rarity = (getAttributeValue(item.metadata, "Rarity") ?? "Common") as FigurineRarity;
  const sourceValue = getAttributeValue(item.metadata, "Source");
  const source: FigurineSource =
    sourceValue === "Coin Redemption" ? "sparkycoin-redemption" : "mystery-box";

  return {
    tokenId: item.tokenId,
    figurineId: `${source}-${item.tokenId}`,
    name,
    rarity,
    source,
    receivedAt: new Date().toISOString(),
    tokenUri: item.tokenUri,
  };
}

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as T;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Request failed.";
    throw new Error(message);
  }

  return payload;
}

export function RewardsDashboard() {
  const { profile, refreshProfile } = useRewardsProfile();
  const [chainStatus, setChainStatus] = useState<ChainStatusResponse | null>(null);
  const [collection, setCollection] = useState<CollectionResponse | null>(null);
  const [convertAmount, setConvertAmount] = useState("20");
  const [message, setMessage] = useState<ActionMessage | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshingCollection, setIsRefreshingCollection] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isOpeningBox, setIsOpeningBox] = useState(false);

  const dayOneClaimed = profile.claimedDayEntryIds.includes(getDayEntryRewardId(1));
  const connectedWalletAddress = profile.connectedWalletAddress;

  const missions = useMemo(
    () =>
      rewardsMissionCatalog.map((mission) => {
        const completed = mission.linkedBadgeId
          ? profile.obtainedBadgeIds.includes(mission.linkedBadgeId)
          : dayOneClaimed;

        return {
          ...mission,
          completed,
        };
      }),
    [dayOneClaimed, profile.obtainedBadgeIds],
  );

  const obtainedBadgeIds = useMemo(
    () => new Set<RewardsBadgeId>(profile.obtainedBadgeIds),
    [profile.obtainedBadgeIds],
  );

  const displayedFigurines = useMemo(() => {
    const byTokenId = new Map<string, DisplayFigurine>();

    for (const figurine of Object.values(profile.figurineMetadataByTokenId)) {
      byTokenId.set(figurine.tokenId, figurine);
    }

    for (const item of collection?.collection ?? []) {
      const local = byTokenId.get(item.tokenId);
      byTokenId.set(
        item.tokenId,
        local
          ? {
              ...local,
              tokenUri: item.tokenUri,
            }
          : getDisplayFigurineFromChain(item),
      );
    }

    return Array.from(byTokenId.values()).sort((left, right) =>
      right.receivedAt.localeCompare(left.receivedAt),
    );
  }, [collection?.collection, profile.figurineMetadataByTokenId]);

  useEffect(() => {
    void loadChainStatus();
  }, []);

  useEffect(() => {
    if (!connectedWalletAddress || !isAddress(connectedWalletAddress)) {
      setCollection(null);
      return;
    }

    void loadCollection(connectedWalletAddress);
  }, [connectedWalletAddress]);

  useEffect(() => {
    const provider = window.ethereum;

    if (!provider?.on) {
      return;
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const nextAccounts = Array.isArray(args[0]) ? (args[0] as unknown[]) : [];
      const nextAddress =
        typeof nextAccounts[0] === "string" && isAddress(nextAccounts[0])
          ? nextAccounts[0]
          : null;

      setConnectedWalletAddress(nextAddress);
      if (!nextAddress) {
        setCollection(null);
      }
    };

    const handleChainChanged = () => {
      if (connectedWalletAddress) {
        void loadCollection(connectedWalletAddress);
      }
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [connectedWalletAddress]);

  async function loadChainStatus() {
    try {
      const status = await readJson<ChainStatusResponse>("/api/sparkychain/status", {
        cache: "no-store",
      });
      setChainStatus(status);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to load SparkyChain status.",
        tone: "error",
      });
    }
  }

  async function loadCollection(walletAddress: string) {
    setIsRefreshingCollection(true);

    try {
      const nextCollection = await readJson<CollectionResponse>(
        `/api/sparkychain/collection?wallet=${encodeURIComponent(walletAddress)}`,
        { cache: "no-store" },
      );
      setCollection(nextCollection);
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : "Unable to refresh your SparkyChain collection.",
        tone: "error",
      });
    } finally {
      setIsRefreshingCollection(false);
    }
  }

  async function ensureAmoyNetwork() {
    if (!window.ethereum) {
      throw new Error("MetaMask is required for SparkyChain actions.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonAmoyConfig.chainHex }],
      });
    } catch (error) {
      const candidate = error as { code?: number };
      if (candidate.code !== 4902) {
        throw error;
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: polygonAmoyConfig.chainHex,
            chainName: polygonAmoyConfig.chainName,
            rpcUrls: [chainStatus?.rpcUrl ?? polygonAmoyConfig.fallbackRpcUrl],
            blockExplorerUrls: [polygonAmoyConfig.blockExplorerUrl],
            nativeCurrency: polygonAmoyConfig.nativeCurrency,
          },
        ],
      });
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setMessage({
        text: "MetaMask is not available in this browser.",
        tone: "error",
      });
      return;
    }

    setIsConnecting(true);

    try {
      await ensureAmoyNetwork();
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as unknown[];
      const nextAddress =
        typeof accounts[0] === "string" && isAddress(accounts[0]) ? accounts[0] : null;

      if (!nextAddress) {
        throw new Error("MetaMask did not return a usable wallet address.");
      }

      setConnectedWalletAddress(nextAddress);
      await loadCollection(nextAddress);
      setMessage({
        text: `Connected ${shortenAddress(nextAddress)} on Polygon Amoy.`,
        tone: "success",
      });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to connect MetaMask.",
        tone: "error",
      });
    } finally {
      setIsConnecting(false);
    }
  }

  async function bootstrapContracts() {
    setIsBootstrapping(true);

    try {
      await readJson("/api/sparkychain/bootstrap", {
        method: "POST",
      });
      await loadChainStatus();
      setMessage({
        text: "SparkyChain contracts are ready on Polygon Amoy.",
        tone: "success",
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Unable to bootstrap SparkyChain contracts.",
        tone: "error",
      });
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function handleConvert() {
    const amount = Math.max(0, Math.floor(Number(convertAmount)));

    if (!connectedWalletAddress) {
      setMessage({
        text: "Connect MetaMask before converting pitchforks.",
        tone: "warning",
      });
      return;
    }

    if (amount <= 0) {
      setMessage({
        text: "Enter a positive pitchfork amount to convert.",
        tone: "warning",
      });
      return;
    }

    if (amount > profile.pitchforkBalance) {
      setMessage({
        text: "You do not have that many pitchforks yet.",
        tone: "warning",
      });
      return;
    }

    setIsConverting(true);

    try {
      await ensureAmoyNetwork();
      await readJson("/api/sparkychain/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: connectedWalletAddress,
          pitchforkAmount: amount,
        }),
      });

      const spendResult = spendPitchforks(amount);
      if (!spendResult.success) {
        throw new Error("The on-chain mint worked, but the local pitchfork debit did not complete.");
      }

      refreshProfile();
      await loadCollection(connectedWalletAddress);
      setMessage({
        text: `${formatPitchforks(amount)} pitchforks converted into SparkyCoins.`,
        tone: "success",
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Unable to convert pitchforks into SparkyCoins.",
        tone: "error",
      });
    } finally {
      setIsConverting(false);
    }
  }

  async function handleApproveRedemption() {
    if (!window.ethereum || !connectedWalletAddress || !chainStatus?.deployment) {
      setMessage({
        text: "Connect MetaMask and deploy the contracts before approving redemption.",
        tone: "warning",
      });
      return;
    }

    setIsApproving(true);

    try {
      await ensureAmoyNetwork();
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(chainStatus.deployment.sparkyCoinAddress, sparkyCoinAbi, signer);
      const requiredAmount =
        BigInt(SPARKYCOIN_REDEMPTION_COST) * BigInt(10) ** BigInt(18);
      const tx = await contract.approve(chainStatus.deployment.adminAddress, requiredAmount);
      await tx.wait();

      await loadCollection(connectedWalletAddress);
      setMessage({
        text: `Approved ${getRedeemCostLabel()} for figurine redemption.`,
        tone: "success",
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Unable to approve SparkyCoin redemption.",
        tone: "error",
      });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleRedeemFigurine() {
    if (!connectedWalletAddress) {
      setMessage({
        text: "Connect MetaMask before redeeming a figurine.",
        tone: "warning",
      });
      return;
    }

    setIsRedeeming(true);

    try {
      await ensureAmoyNetwork();
      const minted = await readJson<{
        figurine: {
          id: string;
          name: string;
          rarity: FigurineRarity;
        };
        tokenId: string;
        tokenUri: string;
      }>("/api/sparkychain/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: connectedWalletAddress }),
      });

      recordMintedFigurine({
        tokenId: minted.tokenId,
        figurineId: minted.figurine.id,
        name: minted.figurine.name,
        rarity: minted.figurine.rarity,
        source: "sparkycoin-redemption",
        receivedAt: new Date().toISOString(),
        tokenUri: minted.tokenUri,
      });
      refreshProfile();
      await loadCollection(connectedWalletAddress);
      setMessage({
        text: `${minted.figurine.name} is now in your SparkyChain collection.`,
        tone: "success",
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error ? error.message : "Unable to redeem a Sparky figurine right now.",
        tone: "error",
      });
    } finally {
      setIsRedeeming(false);
    }
  }

  async function handleOpenMysteryBox() {
    if (!connectedWalletAddress) {
      setMessage({
        text: "Connect MetaMask before opening a mystery box.",
        tone: "warning",
      });
      return;
    }

    if (profile.mysteryBoxCount <= 0) {
      setMessage({
        text: "There are no mystery boxes ready to open yet.",
        tone: "warning",
      });
      return;
    }

    setIsOpeningBox(true);

    try {
      await ensureAmoyNetwork();
      const minted = await readJson<{
        figurine: {
          id: string;
          name: string;
          rarity: FigurineRarity;
        };
        tokenId: string;
        tokenUri: string;
      }>("/api/sparkychain/open-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: connectedWalletAddress }),
      });

      const consumeResult = consumeMysteryBox(`box-${minted.tokenId}`);
      if (!consumeResult.success) {
        throw new Error("The NFT minted, but the local mystery box counter did not update.");
      }

      recordMintedFigurine({
        tokenId: minted.tokenId,
        figurineId: minted.figurine.id,
        name: minted.figurine.name,
        rarity: minted.figurine.rarity,
        source: "mystery-box",
        receivedAt: new Date().toISOString(),
        tokenUri: minted.tokenUri,
      });
      refreshProfile();
      await loadCollection(connectedWalletAddress);
      setMessage({
        text: `Mystery box opened. ${minted.figurine.name} joined your collection.`,
        tone: "success",
      });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Unable to open the mystery box.",
        tone: "error",
      });
    } finally {
      setIsOpeningBox(false);
    }
  }

  function handleAddDemoPitchforks() {
    addDemoPitchforks();
    refreshProfile();
    setMessage({
      text: `${formatPitchforks(DEMO_PITCHFORK_INCREMENT)} demo pitchforks added.`,
      tone: "success",
    });
  }

  const collectionCount = collection?.collection.length ?? displayedFigurines.length;
  const onChainSparkyCoins = collection
    ? formatSparkyCoins(BigInt(collection.sparkyCoinBalance))
    : "0";
  const approvedForRedeem = collection
    ? Number.parseFloat(collection.redeemAllowanceFormatted) >= SPARKYCOIN_REDEMPTION_COST
    : false;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,198,39,0.2),transparent_32%),linear-gradient(180deg,#f7f2eb_0%,#efe5dc_46%,#f5efe8_100%)] text-[#2c1116]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(140,29,64,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(140,29,64,0.08)_1px,transparent_1px)] bg-[size:34px_34px]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute right-[-4rem] top-12 h-48 w-48 rounded-full bg-[#ffc627]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[-2rem] top-56 h-56 w-56 rounded-full bg-[#8c1d40]/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1360px] gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className={`${CARD_SURFACE} p-5 sm:p-7`}>
          <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(140,29,64,0.45),transparent)]" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
            <div>
              <h1 className="mt-2 font-[Arial,sans-serif] text-[2.2rem] font-black uppercase tracking-[0.08em] text-[#8c1d40] sm:text-[3rem]">
                Sun Devil Rewards
              </h1>
              <p className="mt-3 max-w-2xl text-[1rem] leading-7 text-[#6f4a4e]">
                Earn pitchforks by showing up, unlock badges by completing missions, and collect
                on-chain Sparky figurines. Everything you've earned lives here.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[1.4rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Pitchforks
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[2rem] font-black text-[#2c1116]">
                    {formatPitchforks(profile.pitchforkBalance)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    Your point balance. Earn more by logging in and completing missions.
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Mystery boxes
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[2rem] font-black text-[#2c1116]">
                    {profile.mysteryBoxCount}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    Unlock by completing resource modules. Open them in SparkyChain below.
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Collection
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[2rem] font-black text-[#2c1116]">
                    {collectionCount}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    On-chain Sparky figurines in your connected wallet.
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Badges Earned
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[2rem] font-black text-[#2c1116]">
                    {profile.obtainedBadgeIds.length}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    Badges unlocked from completed missions and resource modules.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.55rem] border border-[#e4d0ba] bg-[linear-gradient(180deg,rgba(44,17,22,0.96),rgba(64,27,35,0.95))] p-5 text-white shadow-[0_18px_44px_rgba(44,17,22,0.18)]">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#ffc627]">
                Quick Actions
              </p>
              <p className="mt-3 font-[Arial,sans-serif] text-[1.7rem] font-black uppercase tracking-[0.06em] text-[#fff4df]">
                Load Up and Level Up
              </p>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Add pitchforks to your balance and connect your MetaMask wallet to start minting on-chain rewards.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddDemoPitchforks}
                  className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#ffcf4f]"
                >
                  Add demo pitchforks
                </button>

                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {connectedWalletAddress
                    ? `Wallet ${shortenAddress(connectedWalletAddress)}`
                    : isConnecting
                      ? "Connecting..."
                      : "Connect MetaMask"}
                </button>
              </div>

              {message ? (
                <div
                  className={`mt-5 rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${
                    message.tone === "success"
                      ? "border-[#8fd8a8] bg-[#e8fff0] text-[#23492f]"
                      : message.tone === "warning"
                        ? "border-[#f1cf8b] bg-[#fff7e6] text-[#734f10]"
                        : message.tone === "error"
                          ? "border-[#efb3b3] bg-[#fff0f0] text-[#7d2323]"
                          : "border-white/16 bg-white/10 text-white"
                  }`}
                >
                  {message.text}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-white/70">
                  Daily logins earn pitchforks. Completing resource modules awards 100 pitchforks, a badge, and a mystery box.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className={`${CARD_SURFACE} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Missions
                </p>
                <p className="mt-2 font-[Arial,sans-serif] text-[1.55rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                  Complete missions to unlock badges
                </p>
              </div>

              <span className="rounded-full bg-[#fff1cf] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                {missions.filter((mission) => mission.completed).length}/{missions.length} complete
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#ede5d8]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#8c1d40,#c94f72)] transition-all duration-700"
                style={{
                  width: `${missions.length > 0 ? Math.round((missions.filter((m) => m.completed).length / missions.length) * 100) : 0}%`,
                }}
              />
            </div>

            <div className="mt-5 grid gap-3">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`rounded-[1.35rem] border px-4 py-4 ${
                    mission.completed
                      ? "border-[#f0d9e5] bg-[#fce8ee]"
                      : "border-[#eadfce] bg-white/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                        mission.completed
                          ? "bg-[#8c1d40] text-white"
                          : "bg-[#efe8df] text-[#8c1d40]"
                      }`}
                    >
                      {mission.completed ? "✓" : mission.linkedBadgeId ? "🏅" : "🔱"}
                    </span>
                    <div>
                      <p className="font-[Arial,sans-serif] text-[1rem] font-bold text-[#2c1116]">
                        {mission.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6f4a4e]">{mission.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`${CARD_SURFACE} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  Badges
                </p>
                <p className="mt-2 font-[Arial,sans-serif] text-[1.55rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                  Badge vault
                </p>
              </div>
              <p className="text-[0.72rem] text-[#6f4a4e]">Hover to reveal</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rewardsBadgeCatalog.map((badge) => {
                const obtained = obtainedBadgeIds.has(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`group relative rounded-[1.4rem] p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(44,17,22,0.12)] ${
                      obtained
                        ? "border border-[#eadfce] bg-white/88"
                        : "border border-dashed border-[#d7c4af] bg-[#fdf9f4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-[1.3rem] text-[1.8rem] ${
                          obtained
                            ? "bg-[linear-gradient(135deg,#fff2c6,#ffd86c)] text-[#8c1d40]"
                            : "bg-[#2c1116] text-white"
                        }`}
                        aria-label={obtained ? badge.title : badge.silhouetteLabel}
                      >
                        {obtained ? badge.icon : "?"}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] ${
                          obtained
                            ? "bg-[#effff5] text-[#0f8f53]"
                            : badge.obtainableNow
                              ? "bg-[#fff5e7] text-[#8c1d40]"
                              : "bg-[#efe8df] text-[#8a7d75]"
                        }`}
                      >
                        {obtained ? "Unlocked" : badge.obtainableNow ? "Available" : "Coming Soon"}
                      </span>
                    </div>

                    <p className="mt-4 font-[Arial,sans-serif] text-[1rem] font-bold text-[#2c1116]">
                      {obtained ? badge.title : "Unknown badge"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                      {obtained ? badge.description : badge.silhouetteLabel}
                    </p>

                    <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[1rem] border border-[#eadfce] bg-[#2c1116] px-3 py-3 text-sm leading-5 text-[#fff4df] opacity-0 shadow-[0_12px_24px_rgba(44,17,22,0.18)] transition group-hover:opacity-100 group-focus-within:opacity-100">
                      {badge.unlockHint}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className={`${CARD_SURFACE} p-5 sm:p-6 lg:p-7`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div>
              <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                SparkyChain
              </p>
              <h2 className="mt-2 font-[Arial,sans-serif] text-[1.95rem] font-black uppercase tracking-[0.06em] text-[#2c1116]">
                SparkyChain Collection
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6f4a4e]">
                Convert pitchforks into SparkyCoins, spend coins to redeem mystery figurines, open
                your earned mystery boxes, and view your NFT collection on Polygon Amoy.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Chain
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[1.25rem] font-black text-[#2c1116]">
                    {polygonAmoyConfig.chainName}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    Chain ID {polygonAmoyConfig.chainId} with demo contracts deployed from the
                    backend admin wallet.
                  </p>
                </div>

                <div className="rounded-[1.35rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Wallet
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[1.25rem] font-black text-[#2c1116]">
                    {connectedWalletAddress ? shortenAddress(connectedWalletAddress) : "Not connected"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    Connect MetaMask to earn SparkyCoins, redeem figurines, and sync your collection.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.45rem] border border-[#eadfce] bg-[#fff9f1] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                      Contract status
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                      {chainStatus?.deployment
                        ? `SparkyCoin ${shortenAddress(chainStatus.deployment.sparkyCoinAddress)} and NFT ${shortenAddress(chainStatus.deployment.mysteryFigurineAddress)} are live.`
                        : "On-chain rewards aren't active yet. Deploy contracts to start minting."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={bootstrapContracts}
                    disabled={isBootstrapping}
                    className="inline-flex items-center justify-center rounded-full border border-[#e4c79f] bg-white px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#8c1d40] transition hover:-translate-y-0.5 hover:border-[#d6ab63] hover:bg-[#fff4df] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {chainStatus?.deployment
                      ? isBootstrapping
                        ? "Refreshing..."
                        : "Redeploy demo contracts"
                      : isBootstrapping
                        ? "Deploying..."
                        : "Bootstrap contracts"}
                  </button>
                </div>

                {chainStatus?.deployment ? (
                  <div className="mt-4 grid gap-2 text-xs text-[#6f4a4e] sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-[#eddcca] bg-white px-3 py-2">
                      <span className="font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                        Admin wallet
                      </span>
                      <p className="mt-1 font-mono text-[0.75rem] break-all text-[#2c1116]">
                        {chainStatus.deployment.adminAddress}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[#eddcca] bg-white px-3 py-2">
                      <span className="font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                        Deployed
                      </span>
                      <p className="mt-1 text-[#2c1116]">
                        {new Date(chainStatus.deployment.deployedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.45rem] border border-[#eadfce] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,233,0.9))] p-4">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Convert pitchforks
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    1 pitchfork converts into 1 SparkyCoin in your connected wallet.
                  </p>

                  <label className="mt-4 block text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Pitchfork amount
                  </label>
                  <input
                    inputMode="numeric"
                    value={convertAmount}
                    onChange={(event) => setConvertAmount(event.target.value.replace(/[^\d]/g, "") || "0")}
                    className="mt-2 w-full rounded-[1rem] border border-[#e1cfbc] bg-white px-4 py-3 text-base font-semibold text-[#2c1116] outline-none transition focus:border-[#8c1d40]"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={isConverting || !connectedWalletAddress}
                      className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isConverting ? "Converting..." : "Convert to SparkyCoins"}
                    </button>
                    <span className="inline-flex items-center rounded-full bg-[#fff0c9] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                      Balance {formatPitchforks(profile.pitchforkBalance)}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.45rem] border border-[#eadfce] bg-[linear-gradient(180deg,rgba(44,17,22,0.96),rgba(64,27,35,0.94))] p-4 text-white">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#ffc627]">
                    On-chain balance
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[1.8rem] font-black uppercase tracking-[0.05em] text-[#fff4df]">
                    {onChainSparkyCoins} SC
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/76">
                    Redeem a mystery Sparky figurine for {getRedeemCostLabel()} once the wallet
                    has enough balance.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleApproveRedemption}
                      disabled={isApproving || !connectedWalletAddress || !chainStatus?.deployment}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isApproving ? "Approving..." : "Approve 100 coins"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRedeemFigurine}
                      disabled={isRedeeming || !connectedWalletAddress || !approvedForRedeem}
                      className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-4 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#ffd34e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRedeeming ? "Redeeming..." : "Redeem figurine"}
                    </button>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-white/66">
                    {approvedForRedeem
                      ? "Allowance is ready. Redeeming will burn 100 SparkyCoins from your wallet."
                      : "Approval is required because the backend admin wallet burns the 100 SparkyCoins during redemption."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div className="rounded-[1.45rem] border border-[#eadfce] bg-white/88 p-4">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Mystery boxes
                  </p>
                  <p className="mt-2 font-[Arial,sans-serif] text-[1.8rem] font-black text-[#2c1116]">
                    {profile.mysteryBoxCount}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    Complete Student Success, Advising, or Explore ASU to earn a box, then open it
                    here to mint a figurine NFT.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenMysteryBox}
                    disabled={isOpeningBox || profile.mysteryBoxCount <= 0 || !connectedWalletAddress}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isOpeningBox ? "Opening..." : "Open mystery box"}
                  </button>
                </div>

                <div className="rounded-[1.45rem] border border-[#eadfce] bg-white/88 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                        Figurine collection
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                        {connectedWalletAddress
                          ? "NFTs currently detected in the connected wallet, with local reward metadata layered in for the demo."
                          : "Connect your MetaMask wallet to load your on-chain Sparky collection. Local figurines will still appear here as you earn them."}
                      </p>
                    </div>

                    {connectedWalletAddress ? (
                      <button
                        type="button"
                        onClick={() => void loadCollection(connectedWalletAddress)}
                        disabled={isRefreshingCollection}
                        className="inline-flex items-center justify-center rounded-full border border-[#e4c79f] bg-[#fff9f1] px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#8c1d40] transition hover:-translate-y-0.5 hover:border-[#d6ab63] hover:bg-[#fff4df] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRefreshingCollection ? "Refreshing..." : "Refresh collection"}
                      </button>
                    ) : null}
                  </div>

                  {displayedFigurines.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {displayedFigurines.map((figurine) => (
                        <div
                          key={figurine.tokenId}
                          className="rounded-[1.2rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdf9,#fff3de)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-[Arial,sans-serif] text-[1rem] font-bold text-[#2c1116]">
                                {figurine.name}
                              </p>
                              <p className="mt-1 text-sm text-[#6f4a4e]">
                                Token #{figurine.tokenId}
                              </p>
                            </div>
                            <span className="rounded-full bg-[#2c1116] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#fff4df]">
                              {figurine.rarity}
                            </span>
                          </div>

                          <div className="mt-4 rounded-[1rem] border border-dashed border-[#d7c4af] bg-white/76 px-3 py-3 text-sm leading-6 text-[#6f4a4e]">
                            {figurine.source === "mystery-box"
                              ? "Opened from a mystery Sparky box."
                              : `Redeemed for ${getRedeemCostLabel()}.`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[1.2rem] border border-dashed border-[#d7c4af] bg-[#fff9f1] px-4 py-6 text-sm leading-6 text-[#6f4a4e]">
                      No figurines yet. Complete a resource module to earn a mystery box, or convert
                      pitchforks into SparkyCoins and redeem your first Sparky figurine.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
