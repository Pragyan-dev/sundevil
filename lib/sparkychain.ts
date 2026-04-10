import "server-only";

import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";

import {
  Contract,
  ContractFactory,
  JsonRpcProvider,
  Wallet,
  formatUnits,
  type InterfaceAbi,
} from "ethers";
import solc from "solc";

import {
  mysteryFigurineContractSource,
  sparkyCoinContractSource,
} from "@/lib/sparkychain-contracts";
import {
  mysteryFigurineAbi,
  polygonAmoyConfig,
  sparkyCoinAbi,
} from "@/lib/sparkychain-abis";
import { sparkyFigurineCatalog, SPARKYCOIN_REDEMPTION_COST } from "@/lib/rewards-data";
import type { FigurineSource, SparkyFigurineDefinition } from "@/lib/rewards-types";

type CompiledContract = {
  abi: InterfaceAbi;
  bytecode: string;
};

type CompiledContracts = {
  sparkyCoin: CompiledContract;
  mysteryFigurine: CompiledContract;
};

export type SparkyChainDeployment = {
  chainId: number;
  rpcUrl: string;
  adminAddress: string;
  sparkyCoinAddress: string;
  mysteryFigurineAddress: string;
  deployedAt: string;
};

export type SparkyChainCollectionItem = {
  tokenId: string;
  tokenUri: string;
  metadata: Record<string, unknown> | null;
};

const DEPLOYMENT_CACHE_PATH = path.join(
  process.cwd(),
  ".next",
  "cache",
  "sparkychain-deployment.json",
);

let compiledContractsPromise: Promise<CompiledContracts> | null = null;

function getRpcUrl() {
  return process.env.POLYGON_AMOY_RPC_URL?.trim() || polygonAmoyConfig.fallbackRpcUrl;
}

function getNormalizedPrivateKey() {
  const raw = process.env.METAMASK_PRIVATE_KEY?.trim();

  if (!raw) {
    throw new Error("Missing METAMASK_PRIVATE_KEY in the server environment.");
  }

  return raw.startsWith("0x") ? raw : `0x${raw}`;
}

function getProvider() {
  return new JsonRpcProvider(getRpcUrl(), polygonAmoyConfig.chainId);
}

function getAdminWallet() {
  return new Wallet(getNormalizedPrivateKey(), getProvider());
}

function ensureDeploymentCacheDir() {
  fs.mkdirSync(path.dirname(DEPLOYMENT_CACHE_PATH), { recursive: true });
}

export function readDeploymentCache(): SparkyChainDeployment | null {
  try {
    const raw = fs.readFileSync(DEPLOYMENT_CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SparkyChainDeployment>;

    if (
      typeof parsed.chainId === "number" &&
      typeof parsed.rpcUrl === "string" &&
      typeof parsed.adminAddress === "string" &&
      typeof parsed.sparkyCoinAddress === "string" &&
      typeof parsed.mysteryFigurineAddress === "string" &&
      typeof parsed.deployedAt === "string"
    ) {
      return parsed as SparkyChainDeployment;
    }
  } catch {}

  return null;
}

function writeDeploymentCache(deployment: SparkyChainDeployment) {
  ensureDeploymentCacheDir();
  fs.writeFileSync(DEPLOYMENT_CACHE_PATH, JSON.stringify(deployment, null, 2));
}

function findImports(importPath: string) {
  const candidatePaths = [
    path.join(process.cwd(), importPath),
    path.join(process.cwd(), "node_modules", importPath),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return {
        contents: fs.readFileSync(candidatePath, "utf8"),
      };
    }
  }

  return {
    error: `File not found: ${importPath}`,
  };
}

async function compileContracts() {
  if (!compiledContractsPromise) {
    compiledContractsPromise = Promise.resolve().then(() => {
      const input = {
        language: "Solidity",
        sources: {
          "SparkyCoin.sol": { content: sparkyCoinContractSource },
          "MysterySparkyFigurine.sol": { content: mysteryFigurineContractSource },
        },
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode"],
            },
          },
        },
      };

      const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports })) as {
        contracts?: Record<
          string,
          Record<string, { abi: InterfaceAbi; evm: { bytecode: { object: string } } }>
        >;
        errors?: Array<{ severity: string; formattedMessage: string }>;
      };

      const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];
      if (errors.length) {
        throw new Error(errors.map((entry) => entry.formattedMessage).join("\n\n"));
      }

      const sparkyCoin = output.contracts?.["SparkyCoin.sol"]?.SparkyCoin;
      const mysteryFigurine = output.contracts?.["MysterySparkyFigurine.sol"]?.MysterySparkyFigurine;

      if (!sparkyCoin || !mysteryFigurine) {
        throw new Error("Failed to compile SparkyChain contracts.");
      }

      return {
        sparkyCoin: {
          abi: sparkyCoin.abi,
          bytecode: `0x${sparkyCoin.evm.bytecode.object}`,
        },
        mysteryFigurine: {
          abi: mysteryFigurine.abi,
          bytecode: `0x${mysteryFigurine.evm.bytecode.object}`,
        },
      };
    });
  }

  return compiledContractsPromise;
}

export async function ensureSparkyChainDeployment() {
  const cached = readDeploymentCache();
  if (cached) {
    return cached;
  }

  const contracts = await compileContracts();
  const adminWallet = getAdminWallet();

  const sparkyCoinFactory = new ContractFactory(
    contracts.sparkyCoin.abi,
    contracts.sparkyCoin.bytecode,
    adminWallet,
  );
  const sparkyCoin = await sparkyCoinFactory.deploy(adminWallet.address);
  await sparkyCoin.waitForDeployment();

  const mysteryFigurineFactory = new ContractFactory(
    contracts.mysteryFigurine.abi,
    contracts.mysteryFigurine.bytecode,
    adminWallet,
  );
  const mysteryFigurine = await mysteryFigurineFactory.deploy(adminWallet.address);
  await mysteryFigurine.waitForDeployment();

  const deployment: SparkyChainDeployment = {
    chainId: polygonAmoyConfig.chainId,
    rpcUrl: getRpcUrl(),
    adminAddress: adminWallet.address,
    sparkyCoinAddress: await sparkyCoin.getAddress(),
    mysteryFigurineAddress: await mysteryFigurine.getAddress(),
    deployedAt: new Date().toISOString(),
  };

  writeDeploymentCache(deployment);
  return deployment;
}

async function getContractInstances() {
  const deployment = await ensureSparkyChainDeployment();
  const provider = getProvider();
  const adminWallet = getAdminWallet();

  return {
    deployment,
    provider,
    adminWallet,
    sparkyCoinAdmin: new Contract(deployment.sparkyCoinAddress, sparkyCoinAbi, adminWallet),
    mysteryFigurineAdmin: new Contract(
      deployment.mysteryFigurineAddress,
      mysteryFigurineAbi,
      adminWallet,
    ),
    sparkyCoinRead: new Contract(deployment.sparkyCoinAddress, sparkyCoinAbi, provider),
    mysteryFigurineRead: new Contract(deployment.mysteryFigurineAddress, mysteryFigurineAbi, provider),
  };
}

function createFigurineSvg(figurine: SparkyFigurineDefinition) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" role="img" aria-label="${figurine.name}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${figurine.accentFrom}" />
          <stop offset="100%" stop-color="${figurine.accentTo}" />
        </linearGradient>
      </defs>
      <rect width="420" height="420" rx="42" fill="#f7f2eb" />
      <rect x="22" y="22" width="376" height="376" rx="34" fill="url(#bg)" opacity="0.14" />
      <rect x="44" y="44" width="332" height="332" rx="32" fill="#2c1116" />
      <circle cx="210" cy="160" r="84" fill="url(#bg)" />
      <circle cx="178" cy="147" r="12" fill="#2c1116" />
      <circle cx="242" cy="147" r="12" fill="#2c1116" />
      <path d="M168 198c20 18 64 18 84 0" fill="none" stroke="#2c1116" stroke-width="14" stroke-linecap="round" />
      <rect x="112" y="262" width="196" height="64" rx="20" fill="#f7f2eb" opacity="0.96" />
      <text x="210" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#8c1d40">${figurine.glyph}</text>
      <text x="210" y="354" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#f7f2eb">${figurine.rarity}</text>
    </svg>
  `.trim();
}

function createTokenUri(figurine: SparkyFigurineDefinition, source: FigurineSource) {
  const image = `data:image/svg+xml;base64,${Buffer.from(createFigurineSvg(figurine)).toString("base64")}`;
  const metadata = {
    name: figurine.name,
    description: `${figurine.vibe} Minted through the SunDevilConnect SparkyChain demo on Polygon Amoy.`,
    image,
    attributes: [
      { trait_type: "Rarity", value: figurine.rarity },
      { trait_type: "Source", value: source === "mystery-box" ? "Mystery Box" : "Coin Redemption" },
      { trait_type: "Series", value: "SparkyChain Demo" },
    ],
  };

  return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;
}

function parseDataUriJson(uri: string) {
  if (!uri.startsWith("data:application/json;base64,")) {
    return null;
  }

  try {
    const encoded = uri.slice("data:application/json;base64,".length);
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickRandomFigurine() {
  return sparkyFigurineCatalog[Math.floor(Math.random() * sparkyFigurineCatalog.length)];
}

export async function getSparkyChainStatus() {
  const deployment = readDeploymentCache();

  return {
    chain: polygonAmoyConfig,
    deployment,
    rpcUrl: getRpcUrl(),
  };
}

export async function mintSparkyCoinsToWallet(walletAddress: string, amount: number) {
  const { sparkyCoinAdmin } = await getContractInstances();
  const tokenAmount = BigInt(amount) * BigInt(10) ** BigInt(18);
  const tx = await sparkyCoinAdmin.mintTo(walletAddress, tokenAmount);
  await tx.wait();
  return {
    txHash: tx.hash,
    tokenAmount: tokenAmount.toString(),
    tokenAmountFormatted: formatUnits(tokenAmount, 18),
  };
}

export async function mintMysteryFigurineToWallet(
  walletAddress: string,
  source: FigurineSource,
) {
  const { mysteryFigurineAdmin } = await getContractInstances();
  const figurine = pickRandomFigurine();
  const tokenUri = createTokenUri(figurine, source);
  const staticCallTokenId = await mysteryFigurineAdmin.mintTo.staticCall(walletAddress, tokenUri);
  const tx = await mysteryFigurineAdmin.mintTo(walletAddress, tokenUri);
  await tx.wait();

  return {
    txHash: tx.hash,
    tokenId: staticCallTokenId.toString(),
    tokenUri,
    figurine,
  };
}

export async function redeemFigurineWithSparkyCoins(walletAddress: string) {
  const { deployment, sparkyCoinAdmin, sparkyCoinRead } = await getContractInstances();
  const requiredAmount =
    BigInt(SPARKYCOIN_REDEMPTION_COST) * BigInt(10) ** BigInt(18);
  const balance = (await sparkyCoinRead.balanceOf(walletAddress)) as bigint;
  const allowance = (await sparkyCoinRead.allowance(walletAddress, deployment.adminAddress)) as bigint;

  if (balance < requiredAmount) {
    throw new Error("Not enough SparkyCoins in the connected wallet.");
  }

  if (allowance < requiredAmount) {
    throw new Error("Approve 100 SparkyCoins before redeeming a figurine.");
  }

  const burnTx = await sparkyCoinAdmin.burnFrom(walletAddress, requiredAmount);
  await burnTx.wait();
  const minted = await mintMysteryFigurineToWallet(walletAddress, "sparkycoin-redemption");

  return {
    burnTxHash: burnTx.hash,
    ...minted,
  };
}

export async function readWalletCollection(walletAddress: string) {
  const { deployment, sparkyCoinRead, mysteryFigurineRead } = await getContractInstances();
  const coinBalance = (await sparkyCoinRead.balanceOf(walletAddress)) as bigint;
  const allowance = (await sparkyCoinRead.allowance(walletAddress, deployment.adminAddress)) as bigint;
  const tokenIds = ((await mysteryFigurineRead.tokensOfOwner(walletAddress)) as bigint[]).map((item) =>
    item.toString(),
  );

  const collection: SparkyChainCollectionItem[] = [];
  for (const tokenId of tokenIds) {
    const tokenUri = (await mysteryFigurineRead.tokenURI(tokenId)) as string;
    collection.push({
      tokenId,
      tokenUri,
      metadata: parseDataUriJson(tokenUri),
    });
  }

  return {
    deployment,
    walletAddress,
    adminAddress: deployment.adminAddress,
    sparkyCoinBalance: coinBalance.toString(),
    sparkyCoinBalanceFormatted: formatUnits(coinBalance, 18),
    redeemAllowance: allowance.toString(),
    redeemAllowanceFormatted: formatUnits(allowance, 18),
    collection,
  };
}
