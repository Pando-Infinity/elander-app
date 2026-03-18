import React, { ComponentPropsWithoutRef, FC } from "react";
import { twMerge } from "tailwind-merge";

const NftCollectionGenNote: FC<ComponentPropsWithoutRef<"div">> = ({
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
        Generate unique NFT collections with layered artwork.
        <br />
        Upload trait layers, configure rarity, and export ready-to-mint assets.
      </span>

      <div className="flex flex-col gap-y-2">
        <p className="text-[#F44319] font-bold text-xs">How it works</p>
        <span className="flex flex-col text-xs font-medium text-white/60">
          <ul className="list-disc ml-4">
            <li>Upload PNG layers organized by trait type and rarity pool</li>
            <li>Configure collection metadata (name, symbol, royalties)</li>
            <li>Set rarity classes with trait pool mixing rules</li>
            <li>Preview samples before generating the full collection</li>
            <li>Download as ZIP or upload directly to IPFS</li>
          </ul>
        </span>
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="text-[#F44319] font-bold text-xs">Layer naming</p>
        <span className="flex flex-col text-xs font-medium text-white/60">
          <p>
            Use <code className="text-white/80">Name#Weight.png</code> format
            to set trait rarity weights.
          </p>
          <p className="mt-1">
            Example: <code className="text-white/80">GoldenCrown#2.png</code>{" "}
            appears 2x more often than weight-1 traits.
          </p>
        </span>
      </div>
    </div>
  );
};

export default NftCollectionGenNote;
