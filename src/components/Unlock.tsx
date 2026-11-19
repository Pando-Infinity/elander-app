"use client";

import React, { ComponentPropsWithoutRef, FC, Fragment, useState } from "react";
import { LockIcon } from "./icons";
import { twMerge } from "tailwind-merge";
import { useAccessStatus } from "@/hooks/useIsUnlocked";
import CommonTooltip from "./CommonTooltip";

const UnLock: FC<UnLockProps> = ({ sideOffset = 10, className }) => {
  const accessStatus = useAccessStatus();
  // Hidden while the check runs, so the button does not flash for a wallet that unlocks.
  const isLocked = accessStatus !== "unlocked" && accessStatus !== "checking";
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return isLocked ? (
    <CommonTooltip
      isOpen={isOpen}
      contentProps={{
        className: "w-[220px] z-[100]",
        onPointerDownOutside: () => setIsOpen(false),
        sideOffset: sideOffset,
      }}
      trigger={
        <button
          className={twMerge(
            "py-2 px-3 cursor-pointer",
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
      {accessStatus === "error"
        ? "Couldn't verify access. Check your RPC connection and try again."
        : "Requires an E-Lander Alchemist NFT (held or staked) or a Seeker Genesis Token."}
    </CommonTooltip>
  ) : (
    <Fragment />
  );
};

export default UnLock;

interface UnLockProps extends ComponentPropsWithoutRef<"button"> {
  sideOffset?: number;
}
