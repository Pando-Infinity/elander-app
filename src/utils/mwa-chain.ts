import type { NetworkMode } from "@/models/app.model";

export type MwaChain = "solana:mainnet" | "solana:devnet";

/**
 * The chain Mobile Wallet Adapter authorizes on. networkMode counts every custom RPC as mainnet,
 * so a custom RPC whose genesis hash is devnet's counts as devnet here. null while a custom RPC's
 * cluster is still being looked up (isDevnetCluster null).
 */
export const getMwaChain = (
  networkMode: NetworkMode,
  isDevnetCluster: boolean | null
): MwaChain | null => {
  if (networkMode === "devnet" || isDevnetCluster) return "solana:devnet";
  return isDevnetCluster === null ? null : "solana:mainnet";
};
