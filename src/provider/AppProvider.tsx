"use client";

import { useEffect } from "react";
import { BlockchainUtils } from "@/utils";
import { useUserStore } from "@/stores/user.store";
import { userService } from "@/services/user-service";

/**
 * Hook that initializes app-wide data when a wallet connects.
 * Must be called inside SolanaProvider.
 */
export function useAppInitialization() {
  const {
    stakedNfts,
    walletAddress,
    walletBalances,
    allAlchemistNft,
    setIsHolderNft,
    setIsSeekerWallet,
  } = useUserStore();

  useEffect(() => {
    setIsHolderNft(stakedNfts.length > 0 || allAlchemistNft.length > 0);
  }, [stakedNfts, allAlchemistNft, setIsHolderNft]);

  useEffect(() => {
    if (!walletAddress) return;

    // These are independent — fetch in parallel
    Promise.all([
      userService.getAllTokenBalances(walletAddress),
      userService.getAllAlchemistNft(walletAddress),
      userService.getStakedNfts(walletAddress),
      BlockchainUtils.checkWalletForSGT(walletAddress).then(setIsSeekerWallet),
    ]);
  }, [walletAddress, setIsSeekerWallet]);

  useEffect(() => {
    if (!walletAddress || !walletBalances) return;

    userService.getTokenPriceFeeds(walletBalances);
  }, [walletAddress, walletBalances]);
}
