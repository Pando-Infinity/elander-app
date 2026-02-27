"use client";

import React, { ComponentPropsWithoutRef, FC, Fragment, useState } from "react";
import { LockIcon } from "./icons";
import { twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";
import CommonTooltip from "./CommonTooltip";

const UnLock: FC<UnLockProps> = ({ sideOffset = 10, className }) => {
  const { isHolderNft, isSeekerWallet } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return !isHolderNft && !isSeekerWallet ? (
    <CommonTooltip
      isOpen={isOpen}
      contentProps={{
        className: "w-[175px] z-[100]",
        onPointerDownOutside: () => setIsOpen(false),
        sideOffset: sideOffset,
      }}
      trigger={
        <button
          className={twMerge(
            "py-1.5 px-2 cursor-pointer",
            "text-[#312E2D] font-semibold text-xs",
            "flex items-center gap-x-2 bg-[#FFD800] rounded-lg",
            className
          )}
          onClick={handleClick}
        >
          <LockIcon />
          Unlock
        </button>
      }
    >
      No staked E-Lander or nft holder found!
    </CommonTooltip>
  ) : (
    <Fragment />
  );
};

export default UnLock;

interface UnLockProps extends ComponentPropsWithoutRef<"button"> {
  sideOffset?: number;
}
