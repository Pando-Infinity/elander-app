"use client";

import { useEffect } from "react";
import {
  SearchIcon,
  SocialIcon,
  DiamondIcon,
  EssentialIcon,
  ImageIcon,
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
          <h1 className="text-lg sm:text-2xl font-bold">Utility Hub</h1>
          <CommonInput
            className="pr-8 sm:pr-9"
            placeholder="Search"
            suffix={
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2" />
            }
          />
        </div>

        <div className="h-[1px] w-full bg-surface-divider" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <BuyNftUtility wrapperClassName="sm:hidden" />

          <UtilityCard
            icon={<SocialIcon className="w-8 h-8" />}
            href={PathConstant.AIRDROP}
            label={"Airdrop"}
            description={
              "Launch targeted token airdrops with transparent, on-chain distribution."
            }
          />
          <UtilityCard
            icon={<ImageIcon className="w-8 h-8" />}
            href={PathConstant.NFT_COLLECTION_GEN}
            label={"NFT Generator"}
            description={
              "Generate unique NFT collections with layered artwork, rarity controls, and IPFS upload."
            }
          />
          <UtilityCard
            icon={<ImageIcon className="w-8 h-8" />}
            href={PathConstant.NFT_COLLECTION_MGR}
            label={"Collection Manager"}
            description={
              "Create and manage on-chain Metaplex Core NFT collections — mint, update, and configure plugins."
            }
          />
          <UtilityCard
            icon={<DiamondIcon className="w-8 h-8" />}
            href={PathConstant.BULK}
            label={"Bulk Transfer"}
            description={
              "Move tokens to one or many wallets with speed and control."
            }
          />
          <UtilityCard
            icon={<EssentialIcon className="w-8 h-8" />}
            href={PathConstant.SNAPSHOT}
            label={"Snapshot Collection"}
            description={
              "Generate accurate NFT holder snapshots from any collection in seconds."
            }
          />
        </div>
      </div>
    </div>
  );
}
