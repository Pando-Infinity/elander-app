"use client";

import { ComponentPropsWithoutRef, FC, Fragment } from "react";
import { ThreeStarIcon } from "./icons";
import { twJoin, twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";

import CommonButton from "./CommonButton";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";
import { AppConstant } from "@/const";

const BuyNftUtility: FC<BuyNftUtilityProps> = ({
  className,
  wrapperClassName,
  ...otherProps
}) => {
  const analytics = useFirebaseAnalytics();
  const { isHolderNft, isSeekerWallet } = useUserStore();

  return !isHolderNft && !isSeekerWallet ? (
    <div
      className={twMerge(
        "bg-[#1B1B1B] rounded-lg w-full sm:w-[200px] border border-white/20",
        wrapperClassName
      )}
      {...otherProps}
    >
      <div
        className={twJoin(
          "p-4",
          " rounded-lg",
          "bg-[radial-gradient(73.08%_62.57%_at_50.15%_100%,rgba(244,67,25,0.3)_0%,rgba(244,67,25,0)_100%)]",
          className
        )}
      >
        <div className="flex items-center gap-x-2">
          <ThreeStarIcon />
          <p className="font-bold text-white/80">Utility</p>
        </div>
        <p className="text-xs font-medium text-white/60 mt-1 mb-4">
          Use E-lander utilities with an NFT as a digital key.
        </p>

        <CommonButton
          className="w-full"
          onClick={() => {
            window.open(AppConstant.MAGIC_EDEN_ALCHEMIST_URL, "_blank");
            analytics.logNavigationButtonAction(
              {
                button_name: "buy nft",
                url: AppConstant.MAGIC_EDEN_ALCHEMIST_URL,
              },
              "external_link_click"
            );
          }}
        >
          Buy NFT
        </CommonButton>
      </div>
    </div>
  ) : (
    <Fragment />
  );
};

export default BuyNftUtility;

interface BuyNftUtilityProps extends ComponentPropsWithoutRef<"div"> {
  wrapperClassName?: string;
}
