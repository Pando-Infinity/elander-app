"use client";

import React, { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import { GeneratedNft } from "@/models/nft-generation.model";

interface PreviewGridProps {
  nfts: GeneratedNft[];
}

const PreviewGrid: FC<PreviewGridProps> = ({ nfts }) => {
  const [expandedEdition, setExpandedEdition] = useState<number | null>(null);

  if (nfts.length === 0) return null;

  return (
    <div className="flex flex-col gap-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {nfts.map((nft) => {
          const isExpanded = expandedEdition === nft.edition;

          return (
            <div
              key={nft.edition}
              className={twMerge(
                "rounded border border-white/10 bg-white/5 overflow-hidden cursor-pointer transition-all",
                isExpanded && "col-span-2 sm:col-span-3"
              )}
              onClick={() =>
                setExpandedEdition(isExpanded ? null : nft.edition)
              }
            >
              <div className={twMerge("flex", isExpanded ? "flex-row gap-x-3" : "flex-col")}>
                {/* Image */}
                <img
                  src={URL.createObjectURL(nft.imageBlob)}
                  alt={nft.name}
                  className={twMerge(
                    "object-cover",
                    isExpanded
                      ? "w-40 h-40 sm:w-48 sm:h-48 rounded-l"
                      : "w-full aspect-square"
                  )}
                />

                {/* Info */}
                <div className="p-2 flex-1 overflow-hidden">
                  <p className="text-[10px] font-bold text-white truncate">
                    {nft.name}
                  </p>
                  <p
                    className={twMerge(
                      "text-[10px] font-semibold",
                      nft.rarityClass === "Common"
                        ? "text-white/60"
                        : nft.rarityClass === "Rare"
                          ? "text-blue-400"
                          : nft.rarityClass === "Epic"
                            ? "text-purple-400"
                            : "text-yellow-400"
                    )}
                  >
                    {nft.rarityClass}
                  </p>

                  {/* Trait attributes */}
                  <div className="mt-1 flex flex-col gap-y-0.5">
                    {nft.traits.map((trait) => (
                      <div
                        key={trait.traitType}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[8px] text-white/30">
                          {trait.traitType}
                        </span>
                        <span className="text-[8px] text-white/60">
                          {trait.traitName}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expanded: full metadata JSON */}
                  {isExpanded && (
                    <div className="mt-2 p-2 bg-black/30 rounded max-h-[200px] overflow-auto">
                      <p className="text-[8px] text-white/40 mb-1">
                        Metaplex Metadata:
                      </p>
                      <pre className="text-[8px] text-white/60 whitespace-pre-wrap break-all">
                        {JSON.stringify(nft.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviewGrid;
