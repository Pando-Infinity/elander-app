"use client";

import React, { Fragment, useEffect } from "react";
import { BlockchainUtils } from "@/utils";
import { useUserStore } from "@/stores/user.store";
import { userService } from "@/services/user-service";

const AppProvider = () => {
  const {
    stakedNfts,
    walletAddress,
    walletBalances,
    allAlchemistNft,
    setIsHolderNft,
    setIsSeekerWallet,
  } = useUserStore();

  const handleGetBalances = async () => {
    if (!walletAddress) return;
    await userService.getAllTokenBalances(walletAddress);
  };

  const handleGetTokenPriceFeeds = async () => {
    if (!walletBalances) return;
    await userService.getTokenPriceFeeds(walletBalances);
  };

  const handleGetNftInfo = async () => {
    if (!walletAddress) return;
    await userService.getAllAlchemistNft(walletAddress);
    await userService.getStakedNfts(walletAddress);
  };

  const checkSeekerWallet = async () => {
    if (!walletAddress) return;
    const result = await BlockchainUtils.checkWalletForSGT(walletAddress);

    setIsSeekerWallet(result);
  };

  useEffect(() => {
    const isHolder = stakedNfts.length > 0 || allAlchemistNft.length > 0;

    setIsHolderNft(isHolder);
  }, [stakedNfts, allAlchemistNft]);

  useEffect(() => {
    handleGetBalances();
    handleGetNftInfo();
    checkSeekerWallet();
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress || !walletBalances) return;

    handleGetTokenPriceFeeds();
  }, [walletAddress, walletBalances]);

  return <Fragment />;
};

export default AppProvider;
