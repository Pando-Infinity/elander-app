"use client";

import React, { useEffect, useState } from "react";
import { PathConstant } from "@/const";
import { useRouter } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { useUserStore } from "@/stores/user.store";
import { userService } from "@/services/user-service";
import ProfileTabs, { ProfileTabsEnum } from "./_component/ProfileTabs";

import Staked from "./_component/Staked";
import Inventory from "./_component/Inventory";
import WalletBalances from "./_component/WalletBalances";
import ProfileStatistic from "./_component/ProfileStatistic";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

const Profile = () => {
  const router = useRouter();
  const analytics = useFirebaseAnalytics();
  const { walletAddress } = useUserStore();
  const [selectedTab, setSelectedTab] = useState(ProfileTabsEnum.Information);

  const handleGetNftInfo = async () => {
    if (!walletAddress) return;
    await userService.getAllAlchemistNft(walletAddress);
    await userService.getStakedNfts(walletAddress);
    await userService.getEarnedReward(walletAddress);
  };

  const handleBack = () => {
    const referrer = document.referrer;
    const currentDomain = window.location.origin;

    if (referrer && referrer.startsWith(currentDomain)) {
      router.back();
    } else {
      router.push(PathConstant.ROOT);
    }
  };

  useEffect(() => {
    handleGetNftInfo();
  }, [walletAddress]);

  useEffect(() => {
    analytics.logNavigationButtonAction(
      { screen_name: "profile" },
      "screen_view"
    );
  }, []);

  return (
    <div>
      <div className="py-4 flex items-center gap-x-5 sm:hidden">
        <button
          className="w-10 h-10 center-root bg-[#2A2A2A]"
          onClick={handleBack}
        >
          <ArrowIcon className="rotate-180" />
        </button>
        <p className="font-bold text-lg">Profile</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-x-8 justify-between gap-y-6">
        <div className="w-full flex flex-col gap-y-6 sm:gap-y-5">
          <ProfileTabs
            selectedTab={selectedTab}
            onSelectTab={(value) => setSelectedTab(value)}
          />

          <div className="sm:hidden flex flex-col gap-y-6">
            <ProfileStatistic />
            <WalletBalances />
          </div>

          <div className="flex flex-col gap-y-6 sm:gap-y-8">
            <Inventory />

            <Staked />
          </div>
        </div>
        <div className="sm:min-w-[417px] sm:w-[417px] hidden sm:flex flex-col gap-y-6">
          <ProfileStatistic />
          <WalletBalances />
        </div>
      </div>
    </div>
  );
};

export default Profile;
