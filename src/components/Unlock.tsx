"use client";

import React, { ComponentPropsWithoutRef, FC, Fragment, useState } from "react";
import { LockIcon } from "./icons";
import { twMerge } from "tailwind-merge";
import { AppConstant } from "@/const";
import { useAccessStatus } from "@/hooks/useIsUnlocked";
import { useWindowSize } from "@/hooks/common-hooks";
import { useToast } from "@/stores/toast.store";
import { useUserStore } from "@/stores/user.store";
import CommonTooltip from "./CommonTooltip";

const ERROR_TEXT = "Couldn't verify access. Check your RPC connection and try again.";

// The one retry being watched; a new retry replaces it.
let stopWatchingRetry: (() => void) | undefined;

/**
 * Runs the access check again and tells the user if it fails again: this component unmounts
 * while the check runs, so the store is watched instead. Watching ends with that check, or
 * when the wallet or network changes before it starts.
 */
const retryAccessCheck = () => {
  stopWatchingRetry?.();
  // The bump itself is a store update with the old "error" still set: wait for "checking".
  let started = false;
  const unsubscribe = useUserStore.subscribe(({ accessStatus }) => {
    if (accessStatus === "checking") {
      started = true;
      return;
    }
    if (!started && accessStatus === "error") return;
    stopWatchingRetry?.();
    if (started && accessStatus === "error") {
      useToast.getState().error("Still couldn't verify access", ERROR_TEXT);
    }
  });
  stopWatchingRetry = () => {
    unsubscribe();
    stopWatchingRetry = undefined;
  };
  useUserStore.getState().recheckAccess();
};

const UnLock: FC<UnLockProps> = ({ sideOffset = 10, className }) => {
  const accessStatus = useAccessStatus();
  const { windowWidth } = useWindowSize();
  // Hidden while the check runs, so the button does not flash for a wallet that unlocks.
  const isLocked = accessStatus !== "unlocked" && accessStatus !== "checking";
  const isError = accessStatus === "error";
  const [isOpen, setIsOpen] = useState(false);

  // Unlock sits inside card links on the home page: keep its clicks from navigating.
  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    stop(e);
    // Desktop shows the tooltip on hover, so a click (or Enter from the keyboard) retries.
    if (isError && windowWidth > AppConstant.BREAK_POINTS.lg) {
      retryAccessCheck();
      return;
    }
    setIsOpen(!isOpen);
  };

  return isLocked ? (
    <CommonTooltip
      isOpen={isOpen}
      contentProps={{
        className: "w-[220px] z-[100]",
        onPointerDownOutside: () => setIsOpen(false),
        onClick: stop,
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
          aria-label={isError ? `Unlock. ${ERROR_TEXT}` : undefined}
          onClick={handleClick}
        >
          <LockIcon />
          Unlock
        </button>
      }
    >
      {isError ? (
        <>
          {ERROR_TEXT}{" "}
          <button
            type="button"
            className="text-accent font-semibold underline cursor-pointer"
            onClick={(e) => {
              stop(e);
              setIsOpen(false);
              retryAccessCheck();
            }}
          >
            Try again
          </button>
        </>
      ) : (
        "Requires an E-Lander Alchemist NFT (held or staked) or a Seeker Genesis Token."
      )}
    </CommonTooltip>
  ) : (
    <Fragment />
  );
};

export default UnLock;

interface UnLockProps extends ComponentPropsWithoutRef<"button"> {
  sideOffset?: number;
}
