"use client";

import React, { FC, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { AssetInfo } from "@/models/nft-collection-manager.model";

interface AssetCardProps {
  asset: AssetInfo;
  isTxPending: boolean;
  onBurn: (address: string) => Promise<void>;
}

const AssetCard: FC<AssetCardProps> = ({ asset, isTxPending, onBurn }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    asset.imageUrl ?? null
  );
  const [showConfirmBurn, setShowConfirmBurn] = useState(false);

  useEffect(() => {
    // Skip fetch if DAS already provided the image URL
    if (asset.imageUrl || imageUrl) return;

    let cancelled = false;
    if (asset.uri) {
      fetch(asset.uri)
        .then((r) => r.json())
        .then((meta) => {
          if (!cancelled && meta.image) setImageUrl(meta.image);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [asset.uri, asset.imageUrl, imageUrl]);

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="aspect-square bg-black/20 relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 flex flex-col gap-y-1">
        <p className="text-[10px] font-semibold text-white truncate">
          {asset.name}
        </p>
        <p className="text-[8px] text-white/40 truncate">{asset.address}</p>

        {!showConfirmBurn ? (
          <button
            onClick={() => setShowConfirmBurn(true)}
            disabled={isTxPending}
            className={twMerge(
              "mt-1 px-2 py-1 rounded text-[10px] font-semibold",
              isTxPending
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            )}
          >
            Burn
          </button>
        ) : (
          <div className="mt-1 flex items-center gap-x-1">
            <button
              onClick={async () => {
                await onBurn(asset.address);
                setShowConfirmBurn(false);
              }}
              disabled={isTxPending}
              className="flex-1 px-2 py-1 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              {isTxPending ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => setShowConfirmBurn(false)}
              className="px-2 py-1 rounded text-[10px] font-semibold bg-white/5 text-white/40 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
