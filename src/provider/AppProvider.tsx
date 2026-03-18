"use client";

import { useEffect } from "react";
import { BlockchainUtils } from "@/utils";
import { useUserStore } from "@/stores/user.store";
import { userService } from "@/services/user-service";

export const useAppInitialization = () => {
  const {
    stakedNfts,
    walletAddress,
    walletBalances,
    allAlchemistNft,
    setIsHolderNft,
    setIsSeekerWallet,
  } = useUserStore();

  useEffect(() => {
    const isHolder = stakedNfts.length > 0 || allAlchemistNft.length > 0;
    setIsHolderNft(isHolder);
  }, [stakedNfts, allAlchemistNft, setIsHolderNft]);

  useEffect(() => {
    if (!walletAddress) return;

    userService.getAllTokenBalances(walletAddress);
    userService.getAllAlchemistNft(walletAddress);
    userService.getStakedNfts(walletAddress);
    BlockchainUtils.checkWalletForSGT(walletAddress).then(setIsSeekerWallet);
  }, [walletAddress, setIsSeekerWallet]);

  useEffect(() => {
    if (!walletAddress || !walletBalances) return;
    userService.getTokenPriceFeeds(walletBalances);
  }, [walletAddress, walletBalances]);
};
