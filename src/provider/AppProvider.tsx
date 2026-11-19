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
    setAccessStatus,
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

  // Balances, and whether the wallet may use locked features: an Alchemist NFT held or staked, or
  // a Seeker Genesis Token. A result that arrives after the wallet or network changed is dropped.
  useEffect(() => {
    if (!walletAddress) {
      setAccessStatus("idle");
      return;
    }

    let cancelled = false;
    setAccessStatus("checking");

    userService.getAllTokenBalances(walletAddress).catch(() => {});

    const checkAccess = async () => {
      const [heldNfts, staked, seeker] = await Promise.allSettled([
        userService.getAllAlchemistNft(walletAddress),
        userService.getStakedNfts(walletAddress),
        BlockchainUtils.checkWalletForSGT(walletAddress),
      ]);
      if (cancelled) return;

      if (seeker.status === "rejected") {
        console.error("Seeker Genesis Token check failed:", seeker.reason);
      }

      setAccessStatus(resolveAccess(heldNfts, staked, seeker));
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, activeEndpoint, setAccessStatus]);

  useEffect(() => {
    if (!walletAddress || !walletBalances) return;
    userService.getTokenPriceFeeds(walletBalances);
  }, [walletAddress, walletBalances]);
};
