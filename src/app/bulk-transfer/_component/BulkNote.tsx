import React, { ComponentPropsWithoutRef, FC } from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { PeopleIcon } from "@/components/icons";
import { PathConstant } from "@/const";

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
        <span className="text-[#F44319]">0.002 SOL</span> per token. Send
        one or multiple tokens to a single wallet. For large-scale distribution
        to many wallets, use{" "}
        <Link href={PathConstant.AIRDROP} className="text-[#F44319]">
          E-Lander Airdrop.
        </Link>
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
    </div>
  );
};

export default BulkNote;
