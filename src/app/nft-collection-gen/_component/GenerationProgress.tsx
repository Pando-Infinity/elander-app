"use client";

import React, { FC } from "react";
import { twMerge } from "tailwind-merge";
import {
  GenerationProgress as GenerationProgressType,
  GenerationStatusEnum,
} from "@/models/nft-generation.model";

interface GenerationProgressProps {
  progress: GenerationProgressType;
  onCancel: () => void;
}

const GenerationProgress: FC<GenerationProgressProps> = ({
  progress,
  onCancel,
}) => {
  const percent =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const isGenerating = progress.status === GenerationStatusEnum.GENERATING;

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/80">
          {isGenerating
            ? "Generating..."
            : progress.status === GenerationStatusEnum.COMPLETE
              ? "Generation Complete"
              : progress.status === GenerationStatusEnum.CANCELLED
                ? "Generation Cancelled"
                : progress.status === GenerationStatusEnum.ERROR
                  ? "Generation Error"
                  : "Ready"}
        </p>
        {isGenerating && (
          <button
            onClick={onCancel}
            className="px-2 py-1 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={twMerge(
            "h-full rounded-full transition-all duration-300",
            progress.status === GenerationStatusEnum.COMPLETE
              ? "bg-green-500"
              : progress.status === GenerationStatusEnum.ERROR
                ? "bg-red-500"
                : "bg-[#F44319]"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>
          {progress.completed} / {progress.total} NFTs
        </span>
        <span>{percent}%</span>
      </div>
    </div>
  );
};

export default GenerationProgress;
