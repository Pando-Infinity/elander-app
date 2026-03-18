"use client";

import React, { FC, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { GeneratedNft, RarityPoolEnum } from "@/models/nft-generation.model";
import { ZIP_CHUNK_SIZE } from "@/const/nft-generation.const";
import PreviewGrid from "./PreviewGrid";

interface DownloadExportProps {
  generatedNfts: GeneratedNft[];
  collectionName: string;
  onDownloadAll: () => void;
  onDownloadChunk: (chunkIndex: number) => void;
}

const DownloadExport: FC<DownloadExportProps> = ({
  generatedNfts,
  collectionName,
  onDownloadAll,
  onDownloadChunk,
}) => {
  const totalNfts = generatedNfts.length;
  const isChunked = totalNfts > ZIP_CHUNK_SIZE;
  const totalChunks = Math.ceil(totalNfts / ZIP_CHUNK_SIZE);

  const rarityDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const nft of generatedNfts) {
      dist[nft.rarityClass] = (dist[nft.rarityClass] || 0) + 1;
    }
    return dist;
  }, [generatedNfts]);

  const sampleNfts = useMemo(() => {
    // Show up to 6 samples
    const step = Math.max(1, Math.floor(totalNfts / 6));
    return generatedNfts.filter((_, i) => i % step === 0).slice(0, 6);
  }, [generatedNfts, totalNfts]);

  if (totalNfts === 0) {
    return (
      <div className="flex flex-col items-center py-8">
        <p className="text-xs text-white/40">
          No NFTs generated yet. Go back to the Generate step.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Collection ready for download.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Total NFTs" value={totalNfts.toString()} />
        {Object.values(RarityPoolEnum).map((pool) => {
          const count = rarityDistribution[pool] || 0;
          if (count === 0) return null;
          return (
            <StatCard
              key={pool}
              label={pool}
              value={count.toString()}
            />
          );
        })}
      </div>

      {/* Sample preview */}
      <div className="flex flex-col gap-y-2">
        <p className="text-[10px] font-semibold text-white/40">
          Sample Preview
        </p>
        <PreviewGrid nfts={sampleNfts} />
      </div>

      {/* Download section */}
      <div className="h-[1px] w-full bg-white/10" />

      {isChunked ? (
        <div className="flex flex-col gap-y-3">
          <p className="text-[10px] text-white/40">
            Collection split into {totalChunks} ZIP files ({ZIP_CHUNK_SIZE} NFTs
            each)
          </p>

          <button
            onClick={onDownloadAll}
            className="w-full py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-[#F44319] to-[#F44319]/70 text-white hover:opacity-90"
          >
            Download All ({totalChunks} ZIPs)
          </button>

          <div className="flex flex-col gap-y-1">
            {Array.from({ length: totalChunks }, (_, i) => {
              const start = i * ZIP_CHUNK_SIZE + 1;
              const end = Math.min((i + 1) * ZIP_CHUNK_SIZE, totalNfts);
              return (
                <button
                  key={i}
                  onClick={() => onDownloadChunk(i)}
                  className="flex items-center justify-between px-3 py-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[10px] text-white/60">
                    {collectionName || "collection"}_{String(start).padStart(4, "0")}-
                    {String(end).padStart(4, "0")}.zip
                  </span>
                  <span className="text-[10px] text-[#F44319]">Download</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={onDownloadAll}
          className="w-full py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-[#F44319] to-[#F44319]/70 text-white hover:opacity-90"
        >
          Download ZIP ({totalNfts} NFTs)
        </button>
      )}
    </div>
  );
};

export default DownloadExport;

const StatCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    className={twMerge(
      "rounded bg-white/5 border border-white/10 p-3",
      "flex flex-col items-center gap-y-1"
    )}
  >
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-[10px] text-white/40">{label}</p>
  </div>
);
