"use client";

import { useActiveEndpoint } from "@/stores/network.store";
import { useUserStore } from "@/stores/user.store";

const isDevnetEndpoint = (endpoint: string): boolean => {
  if (endpoint === "devnet") return true;
  // Custom RPC URLs containing "devnet" are treated as devnet
  try {
    return new URL(endpoint).hostname.includes("devnet");
  } catch {
    return false;
  }
};

/**
 * Returns true if the user has access to locked features.
 * On devnet (built-in or custom devnet RPC): always unlocked (for testing).
 * On mainnet: requires NFT holder or SGT seeker wallet.
 */
const useIsUnlocked = (): boolean => {
  const activeEndpoint = useActiveEndpoint();
  const { isHolderNft, isSeekerWallet } = useUserStore();

  if (isDevnetEndpoint(activeEndpoint)) return true;
  return isHolderNft || isSeekerWallet;
};

export default useIsUnlocked;
