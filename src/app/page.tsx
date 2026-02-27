"use client";

import { useEffect } from "react";
import {
  SearchIcon,
  SocialIcon,
  DiamondIcon,
  EssentialIcon,
} from "@/components/icons";
import { PathConstant } from "@/const";

import CommonInput from "@/components/CommonInput";
import UtilityCard from "./_component/UtilityCard";
import Introduction from "./_component/Introduction";
import BuyNftUtility from "@/components/BuyNftUtility";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

export default function Home() {
  const analytics = useFirebaseAnalytics();

  useEffect(() => {
    analytics.logNavigationButtonAction({ screen_name: "home" }, "screen_view");
  }, []);

  return (
    <div className="flex flex-col gap-y-6 sm:gap-y-8">
      <Introduction />

      <div className="flex flex-col gap-y-4 sm:gap-y-6">
        <div className="flex items-end justify-between">
          <p className="text-lg sm:text-2xl font-bold">Utility</p>
          <CommonInput
            className="pr-8 sm:pr-9"
            placeholder="Search"
            suffix={
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2" />
            }
          />
        </div>

        <div className="h-[1px] w-full bg-[#3A3A3A]" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <BuyNftUtility wrapperClassName="sm:hidden" />

          <UtilityCard
            icon={<DiamondIcon className="w-8 h-8" />}
            href={PathConstant.BULK}
            label={"Bulk Transfer"}
            description={"Send tokens to multiple wallets in a single transaction."}
          />
          <UtilityCard
            icon={<EssentialIcon className="w-8 h-8" />}
            href={PathConstant.SNAPSHOT}
            label={"Snapshot Collection"}
            description={"Capture a list of NFT holders from any collection instantly."}
          />
          <UtilityCard
            icon={<SocialIcon className="w-8 h-8" />}
            href={PathConstant.AIRDROP}
            label={"Airdrop"}
            description={"Distribute tokens to multiple addresses efficiently."}
          />
        </div>
      </div>
    </div>
  );
}
