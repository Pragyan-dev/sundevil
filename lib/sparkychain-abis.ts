export const polygonAmoyConfig = {
  chainId: 80002,
  chainHex: "0x13882",
  chainName: "Polygon Amoy",
  fallbackRpcUrl: "https://rpc-amoy.polygon.technology",
  blockExplorerUrl: "https://amoy.polygonscan.com",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
} as const;

export const sparkyCoinAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function mintTo(address to, uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
] as const;

export const mysteryFigurineAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function mintTo(address to, string tokenUri) returns (uint256)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
] as const;
