"use client";

import { useAppStore } from "@/stores/app.store";
import { useActiveEndpoint } from "@/stores/network.store";
import { AccessStatus, useUserStore } from "@/stores/user.store";

/**
 * Where the connected wallet stands on locked features. On devnet (built-in, or a custom RPC whose
 * genesis hash is devnet's) everything is open for testing. On mainnet the wallet needs an
 * Alchemist NFT (held or staked) or a Seeker Genesis Token.
 *
 * This is a UI gate only: nothing on chain or in a backend enforces it.
 */
export const useAccessStatus = (): AccessStatus => {
  const activeEndpoint = useActiveEndpoint();
  const isDevnetCluster = useAppStore((s) => s.isDevnetCluster);
  const walletAddress = useUserStore((s) => s.walletAddress);
  const accessStatus = useUserStore((s) => s.accessStatus);

  // Built-in devnet is known synchronously; a custom RPC is resolved by its genesis hash.
  if (activeEndpoint === "devnet" || isDevnetCluster) return "unlocked";

  // A connected wallet whose check has not started yet (first paint, or just after a network
  // switch reset it) is about to be checked: report "checking" so the locked UI does not flash.
  if (walletAddress && accessStatus === "idle") return "checking";

  return accessStatus;
};

/** True when the connected wallet may use locked features. */
const useIsUnlocked = (): boolean => useAccessStatus() === "unlocked";

export default useIsUnlocked;
