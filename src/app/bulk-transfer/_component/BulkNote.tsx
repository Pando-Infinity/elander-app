import React, { ComponentPropsWithoutRef, FC } from "react";
import { twMerge } from "tailwind-merge";
import { PeopleIcon, ThreePeopleIcon } from "@/components/icons";

const BulkNote: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge(
        "p-4 sm:p-6 rounded-lg",
        "flex flex-col gap-y-5",
        "bg-[#2A2A2A] border border-white/20",
        className,
      )}
      {...otherProps}
    >
      <span className="text-xs font-medium text-white/60">
        Fast, flexible transfers at just{" "}
        <span className="text-[#F44319]">0.002 SOL</span> per transaction. Send
        one or multiple tokens to a single wallet. For large-scale distribution
        to many wallets, use 
        <span className="text-[#F44319]">E-lander.</span>
      </span>

      <div className="flex items-start gap-x-3">
        <PeopleIcon className="text-[#F44319]" />
        <div className="flex flex-col gap-y-1">
          <p className="text-xs font-bold text-[#F44319]">Send to One:</p>
          <p className="text-xs font-medium text-white/60">
            Move multiple assets to one wallet in a single action
          </p>
        </div>
      </div>

      <div className="flex items-start gap-x-3">
        <ThreePeopleIcon className="text-[#F44319]" />
        <div className="flex flex-col gap-y-1">
          <p className="text-xs font-bold text-[#F44319]">Send to Many:</p>
          <p className="text-xs font-medium text-white/60">
            Deliver assets to multiple wallets with a streamlined flow
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkNote;
