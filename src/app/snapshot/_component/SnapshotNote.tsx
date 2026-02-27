import React, { ComponentPropsWithoutRef, FC } from "react";
import { twMerge } from "tailwind-merge";

const SnapshotNote: FC<ComponentPropsWithoutRef<"div">> = ({
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
        Generate mint lists or snapshots for Collections.
      </span>

      <div className="flex flex-col gap-y-2">
        <p className="text-[#F44319] font-bold text-xs">Collection Address</p>
        <span className="flex flex-col text-xs">
          <p className="font-bold text-white/80 leading-[20px]">
            Collection Key
          </p>
          <p className="font-medium text-white/60">
            Obtain all NFTs in a Metaplex Certified Collection using the key.
          </p>
        </span>
      </div>
    </div>
  );
};

export default SnapshotNote;
