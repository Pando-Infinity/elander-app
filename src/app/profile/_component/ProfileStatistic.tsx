"use client";

import React, { ComponentPropsWithoutRef, FC, Fragment, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { CopyIcon } from "@/components/icons";
import { useToast } from "@/stores/toast.store";
import { useAppStore } from "@/stores/app.store";
import { CommonUtils, FormatUtils } from "@/utils";
import { useUserStore } from "@/stores/user.store";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const ProfileStatistic: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...otherProps
}) => {
  const { setIsOpenConnectWallet } = useAppStore();
  const { walletAddress, tokenPriceFeeds, walletBalances, earnedReward } =
    useUserStore();
  const { success } = useToast();

  const totalBalancesByUsd = useMemo(() => {
    if (!walletBalances || !tokenPriceFeeds) return 0;
    return walletBalances.reduce((sum, current) => {
      const price =
        tokenPriceFeeds.find(
          (price) =>
            price.symbol === current.symbol && price.mint === current.mint
        )?.price || 0;

      return sum + current.amount * price;
    }, 0);
  }, [tokenPriceFeeds, walletBalances]);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);

    success("Copy wallet successfully", undefined, 3000);
  };

  return (
    <div
      className={twMerge(
        "h-fit",
        "flex flex-col gap-y-2",
        "p-[14px] sm:p-5 rounded-lg",
        "bg-[url('/images/background/img-bg-profile-statistic.png')] bg-cover bg-center bg-no-repeat",
        className
      )}
      {...otherProps}
    >
      <div className="flex items-center gap-x-4 justify-between">
        <p className="text-[32px] font-bold">
          ${FormatUtils.convertLargeNumber(totalBalancesByUsd)}
        </p>
        {walletAddress ? (
          <div className="flex items-center px-3 py-2 gap-x-1 bg-[#000000]/10 rounded">
            <p className="text-sm sm:text-base">
              {CommonUtils.truncateHash(walletAddress, 6, 6)}
            </p>

            <button
              className="w-5 h-5 center-root cursor-pointer"
              onClick={handleCopy}
            >
              <CopyIcon />
            </button>
          </div>
        ) : (
          <button
            className="bg-[#010101]/35 px-3 py-2 text-sm font-semibold rounded cursor-pointer"
            onClick={() => setIsOpenConnectWallet(true)}
          >
            Connect wallet
          </button>
        )}
      </div>

      <div className="w-full h-[1px] bg-white/20" />

      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <p className="text-white/70 leading-[28px]">E-Lander Points </p>
          <p className="text-2xl font-bold">
            {FormatUtils.formatNumber(earnedReward?.boostedPoint || 0)}
          </p>
        </div>
        {earnedReward?.avgBoostRate ? (
          <div className="pr-2 py-1 bg-[#010101]/35 flex items-center rounded-lg">
            <DotLottieReact
              src="/lottie-animation/Fire.json"
              loop
              autoplay
              className="w-10 h-5 -ml-1.5"
            />
            <p className="text-sm font-medium -ml-2">
              {earnedReward?.avgBoostRate || "0.0"}x
            </p>
          </div>
        ) : (
          <Fragment />
        )}
      </div>
    </div>
  );
};

export default ProfileStatistic;
