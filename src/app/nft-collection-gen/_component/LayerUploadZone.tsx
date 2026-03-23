"use client";

import React, { FC, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { RarityPoolEnum, TraitAsset } from "@/models/nft-generation.model";
import { SUPPORTED_IMAGE_TYPES } from "@/const/nft-generation.const";

interface LayerUploadZoneProps {
  assets: TraitAsset[];
  selectedPool: RarityPoolEnum;
  onSelectedPoolChange: (pool: RarityPoolEnum) => void;
  onUpload: (files: File[]) => void;
  onRemoveAsset: (assetId: string) => void;
  onUpdateWeight: (assetId: string, weight: number) => void;
}

const LayerUploadZone: FC<LayerUploadZoneProps> = ({
  assets,
  selectedPool,
  onSelectedPoolChange,
  onUpload,
  onRemoveAsset,
  onUpdateWeight,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filteredAssets = assets.filter((a) => a.rarityPool === selectedPool);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) =>
      SUPPORTED_IMAGE_TYPES.includes(f.type)
    );
    if (validFiles.length > 0) onUpload(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-y-2">
      {/* Pool selector */}
      <div className="flex items-center gap-x-2">
        {Object.values(RarityPoolEnum).map((pool) => {
          const count = assets.filter((a) => a.rarityPool === pool).length;
          return (
            <button
              key={pool}
              className={twMerge(
                "px-2 py-1 rounded text-[10px] font-semibold transition-colors",
                selectedPool === pool
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
              )}
              onClick={() => onSelectedPoolChange(pool)}
            >
              {pool} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Drop zone */}
      <div
        className={twMerge(
          "min-h-[100px] w-full rounded",
          "flex flex-col gap-y-3 items-center justify-center",
          "bg-surface-input border border-dashed cursor-pointer p-3",
          isDragging ? "border-accent/60 bg-accent/5" : "border-white/20"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <p className="text-[10px] font-bold leading-[16px] text-white/60">
          Drop images here or click to upload
        </p>
        <p className="text-[10px] text-white/20">
          PNG only &bull; Use Name#Weight.png for rarity
        </p>
      </div>

      {/* Asset thumbnails */}
      {filteredAssets.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="relative group rounded bg-white/5 border border-white/10 overflow-hidden"
            >
              <img
                src={URL.createObjectURL(asset.file)}
                alt={asset.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 flex items-center justify-between">
                <span className="text-[8px] text-white/80 truncate">
                  {asset.name}
                </span>
                <input
                  type="number"
                  min={1}
                  value={asset.weight}
                  onChange={(e) =>
                    onUpdateWeight(asset.id, parseInt(e.target.value, 10) || 1)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 text-[8px] text-center bg-white/10 text-white rounded border-none outline-none"
                />
              </div>
              <button
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 text-white text-[8px] hidden group-hover:flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAsset(asset.id);
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerUploadZone;
