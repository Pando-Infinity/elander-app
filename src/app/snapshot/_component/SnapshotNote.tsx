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
        className
      )}
      {...otherProps}
    >
      <span className="text-xs font-medium text-white/60">
        Generate mint lists or snapshots for Editions and Collections.
      </span>

      <div className="flex flex-col gap-y-2">
        <p className="text-[#F44319] font-bold text-xs">Mints</p>

        <span className="flex flex-col text-xs">
          <p className="font-bold text-white/80 leading-[20px]">
            Candy Machine or Creator
          </p>
          <p className="font-medium text-white/60">
            Obtain all NFTs minted from the same same Candy Machine or by the
            same creator.
          </p>
        </span>

        <span className="flex flex-col text-xs">
          <p className="font-bold text-white/80 leading-[20px]">Edition</p>
          <p className="font-medium text-white/60">
            Obtain all NFTs minted from an Edition.
          </p>
        </span>

        <span className="flex flex-col text-xs">
          <p className="font-bold text-white/80 leading-[20px]">
            Collection Key
          </p>
          <p className="font-medium text-white/60">
            Obtain all NFTs in a Metaplex Certified Collection using the key.
          </p>
        </span>
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="text-[#F44319] font-bold text-xs">Collection Mints</p>

        <span className="flex flex-col text-xs font-medium text-white/60">
          <p className="leading-[20px]">
            You can obtain mint list filtered by traits using this feature.
            Requires a staked FFF or TFF.
          </p>
          <ul className="list-disc ml-4">
            <li>To airdrop NFTs to many wallets, use E-lander</li>
            <li>To distribute tokens to many wallets, use Airdrop.</li>
          </ul>
        </span>
      </div>
    </div>
  );
};

export default SnapshotNote;
