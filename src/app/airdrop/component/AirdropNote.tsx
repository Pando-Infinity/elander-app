import React, { ComponentPropsWithoutRef, FC } from "react";
import { twMerge } from "tailwind-merge";

const AirdropNote: FC<ComponentPropsWithoutRef<"div">> = ({
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
        Launch high-impact token airdrops in minutes.
        <br />
        Powered by on-chain snapshots for precise, transparent, and fair
        distribution.
      </span>

      <div className="flex flex-col gap-y-2">
        <p className="text-[#F44319] font-bold text-xs">What you can do</p>

        <span className="flex flex-col text-xs font-medium text-white/60">
          <ul className="list-disc ml-4">
            <li>Distribute tokens to qualified wallets at scale</li>
            <li>Use holder snapshots or upload your own wallet list</li>
            <li>Send equal amounts or customize every allocation</li>
          </ul>
        </span>
      </div>
    </div>
  );
};

export default AirdropNote;
