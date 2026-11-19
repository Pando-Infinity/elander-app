"use client";

import { useEffect } from "react";
import { BlockchainUtils } from "@/utils";
import { useToast } from "@/stores/toast.store";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";
import { getRpcCluster } from "@/utils/rpc-cluster";
import { resolveAccess } from "@/utils/access.utils";
import { userService } from "@/services/user-service";
import { useWallet } from "@solana/wallet-adapter-react";
import { useActiveEndpoint, useEffectiveRpcUrl } from "@/stores/network.store";

export const useAppInitialization = () => {
  const {
    walletAddress,
    walletBalances,
    logout,
    accessStatus,
    accessCheckId,
    setAccessStatus,
    recheckAccess,
  } = useUserStore();
  const { setIsDevnetCluster } = useAppStore();
  const { publicKey, disconnect } = useWallet();

  const activeEndpoint = useActiveEndpoint();
  const rpcUrl = useEffectiveRpcUrl();

  // Which cluster the active RPC serves. Built-in endpoints are known; a custom RPC is identified
  // by its genesis hash, so a mainnet RPC whose hostname happens to say "devnet" stays mainnet.
  useEffect(() => {
    if (activeEndpoint === "devnet" || activeEndpoint === "mainnet") {
      setIsDevnetCluster(activeEndpoint === "devnet");
      return;
    }

    let cancelled = false;
    setIsDevnetCluster(false);
    getRpcCluster(rpcUrl)
      .then((cluster) => {
        if (!cancelled) setIsDevnetCluster(cluster === "devnet");
      })
      .catch((error) => {
        console.error("Could not identify the custom RPC's cluster:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [activeEndpoint, rpcUrl, setIsDevnetCluster]);

  // The account was switched inside the wallet. The stored address and its signature belong to
  // the previous account, so the session ends and the user reconnects (and signs) with the new one.
  useEffect(() => {
    if (!publicKey || !walletAddress) return;
    if (publicKey.toBase58() === walletAddress) return;

    logout();
    disconnect().catch((error) => {
      console.error("Error disconnecting wallet:", error);
    });
    useToast.getState().message(
      "Wallet account changed",
      "Please connect your wallet again."
    );
  }, [publicKey, walletAddress, logout, disconnect]);

  useEffect(() => {
    if (!walletAddress) return;
    userService.getAllTokenBalances(walletAddress).catch(() => {});
  }, [walletAddress, activeEndpoint]);

  // Whether the wallet may use locked features: an Alchemist NFT held or staked, or a Seeker
  // Genesis Token. Stakes are only counted: `/profile` loads their metadata itself. A result
  // that arrives after the wallet or network changed is dropped. Runs again when accessCheckId
  // is bumped (Unlock's "Try again", or the effect below).
  useEffect(() => {
    if (!walletAddress) {
      setAccessStatus("idle");
      return;
    }

    let cancelled = false;
    setAccessStatus("checking");

    const checkAccess = async () => {
      const results = await Promise.allSettled([
        userService
          .getAllAlchemistNft(walletAddress)
          .then((nfts) => nfts.length > 0),
        userService.countStakeRecords(walletAddress),
        BlockchainUtils.checkWalletForSGT(walletAddress),
      ]);
      if (cancelled) return;

      const names = ["Alchemist NFT", "Alchemist stake", "Seeker Genesis Token"];
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`${names[i]} check failed:`, r.reason);
      });

      setAccessStatus(resolveAccess(...results));
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, activeEndpoint, accessCheckId, setAccessStatus]);

  // A failed check (RPC 429 or timeout) would otherwise lock the wallet out until a reload:
  // re-check when the user comes back to the tab or app. Coming back fires both focus and
  // visibilitychange, so only the first one re-checks.
  useEffect(() => {
    if (accessStatus !== "error") return;

    let rechecked = false;
    const onReturn = () => {
      if (rechecked || document.visibilityState !== "visible") return;
      rechecked = true;
      recheckAccess();
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [accessStatus, recheckAccess]);

  useEffect(() => {
    if (!walletAddress || !walletBalances) return;
    userService.getTokenPriceFeeds(walletBalances);
  }, [walletAddress, walletBalances]);
};
