"use client";

import { useNetworkMode } from "@/stores/network.store";
import { useUserStore } from "@/stores/user.store";

/**
 * Returns true if the user has access to locked features.
 * On devnet: always unlocked (for testing).
 * On mainnet: requires NFT holder or SGT seeker wallet.
 */
const useIsUnlocked = (): boolean => {
  const networkMode = useNetworkMode();
  const { isHolderNft, isSeekerWallet } = useUserStore();

  if (networkMode === "devnet") return true;
  return isHolderNft || isSeekerWallet;
};

export default useIsUnlocked;
