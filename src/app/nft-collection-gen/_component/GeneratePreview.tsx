"use client";

import React, { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  GeneratedNft,
  GenerationProgress as GenerationProgressType,
  GenerationStatusEnum,
} from "@/models/nft-generation.model";
import PreviewGrid from "./PreviewGrid";
import GenerationProgress from "./GenerationProgress";

interface GeneratePreviewProps {
  previewCount: number;
  minPreviewCount: number;
  previewNfts: GeneratedNft[];
  progress: GenerationProgressType;
  validationErrors: string[];
  totalSupply: number;
  onPreviewCountChange: (count: number) => void;
  onGeneratePreview: () => Promise<GeneratedNft[]>;
  onGenerateCollection: () => Promise<void>;
  onCancelGeneration: () => void;
}

const GeneratePreview: FC<GeneratePreviewProps> = ({
  previewCount,
  minPreviewCount,
  previewNfts,
  progress,
  validationErrors,
  totalSupply,
  onPreviewCountChange,
  onGeneratePreview,
  onGenerateCollection,
  onCancelGeneration,
}) => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const isGenerating = progress.status === GenerationStatusEnum.GENERATING;
  const isComplete = progress.status === GenerationStatusEnum.COMPLETE;
  const hasErrors = validationErrors.length > 0;

  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      await onGeneratePreview();
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Preview samples before generating the full collection.
      </p>

      {/* Validation errors */}
      {hasErrors && (
        <div className="rounded bg-red-500/10 border border-red-500/20 p-3">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-[10px] text-red-400">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Preview count config */}
      <div className="flex items-center gap-x-3">
        <label className="text-[10px] font-semibold text-white/60">
          Preview count (min {minPreviewCount}):
        </label>
        <input
          type="number"
          min={minPreviewCount}
          value={previewCount}
          onChange={(e) =>
            onPreviewCountChange(
              Math.max(minPreviewCount, parseInt(e.target.value, 10) || 1)
            )
          }
          className={twMerge(
            "w-16 px-2 py-1.5 rounded text-xs text-center",
            "bg-[#2A2A2A] border border-white/20 text-white",
            "outline-none focus:border-[#F44319]/40"
          )}
        />
        <button
          onClick={handlePreview}
          disabled={hasErrors || isPreviewLoading || isGenerating}
          className={twMerge(
            "px-3 py-1.5 rounded text-xs font-semibold",
            hasErrors || isPreviewLoading || isGenerating
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-[#F44319] text-white hover:bg-[#F44319]/80"
          )}
        >
          {isPreviewLoading ? "Generating..." : "Generate Preview"}
        </button>
      </div>

      {/* Preview grid */}
      {previewNfts.length > 0 && <PreviewGrid nfts={previewNfts} />}

      {/* Separator */}
      {previewNfts.length > 0 && (
        <div className="h-[1px] w-full bg-white/10 my-2" />
      )}

      {/* Full generation */}
      {isGenerating ? (
        <GenerationProgress
          progress={progress}
          onCancel={onCancelGeneration}
        />
      ) : (
        <div className="flex flex-col gap-y-2">
          <button
            onClick={onGenerateCollection}
            disabled={hasErrors || isComplete || totalSupply === 0}
            className={twMerge(
              "w-full py-3 rounded-lg text-sm font-bold",
              hasErrors || isComplete || totalSupply === 0
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-[#F44319] to-[#F44319]/70 text-white hover:opacity-90"
            )}
          >
            {isComplete
              ? `Generated ${progress.completed} NFTs`
              : `Generate Full Collection (${totalSupply} NFTs)`}
          </button>
        </div>
      )}

      {/* Post-generation status */}
      {(isComplete ||
        progress.status === GenerationStatusEnum.CANCELLED ||
        progress.status === GenerationStatusEnum.ERROR) && (
        <GenerationProgress
          progress={progress}
          onCancel={onCancelGeneration}
        />
      )}
    </div>
  );
};

export default GeneratePreview;
