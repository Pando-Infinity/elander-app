"use client";

import React, { FC } from "react";
import { twMerge } from "tailwind-merge";
import { WizardStepEnum } from "@/models/nft-generation.model";

const STEPS: { step: WizardStepEnum; label: string; disabled?: boolean }[] = [
  { step: WizardStepEnum.UPLOAD_LAYERS, label: "Upload Layers" },
  { step: WizardStepEnum.CONFIGURE_COLLECTION, label: "Collection" },
  { step: WizardStepEnum.CONFIGURE_RARITY, label: "Rarity" },
  { step: WizardStepEnum.GENERATE, label: "Generate" },
  { step: WizardStepEnum.DOWNLOAD, label: "Download" },
  { step: WizardStepEnum.UPLOAD_IPFS, label: "IPFS Upload", disabled: true },
];

interface WizardStepperProps {
  currentStep: WizardStepEnum;
  onStepClick?: (step: WizardStepEnum) => void;
}

const WizardStepper: FC<WizardStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="flex items-center gap-x-1 w-full overflow-x-auto pb-2">
      {STEPS.map(({ step, label, disabled }, index) => {
        const isActive = currentStep === step && !disabled;
        const isCompleted = currentStep > step && !disabled;

        return (
          <React.Fragment key={step}>
            <button
              className={twMerge(
                "flex items-center gap-x-1.5 px-2 py-1.5 rounded-md whitespace-nowrap transition-colors",
                disabled
                  ? "bg-transparent text-white/15 cursor-not-allowed"
                  : isActive
                    ? "bg-[#F44319]/20 text-[#F44319]"
                    : isCompleted
                      ? "bg-white/10 text-white/80 cursor-pointer"
                      : "bg-transparent text-white/30",
                !disabled && !isCompleted && !isActive && "cursor-default"
              )}
              onClick={() => !disabled && isCompleted && onStepClick?.(step)}
              disabled={disabled || (!isCompleted && !isActive)}
            >
              <span
                className={twMerge(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  disabled
                    ? "bg-white/5 text-white/15"
                    : isActive
                      ? "bg-[#F44319] text-white"
                      : isCompleted
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/30"
                )}
              >
                {isCompleted ? "\u2713" : index + 1}
              </span>
              <span className="text-xs font-medium">{label}</span>
              {disabled && (
                <span className="text-[8px] text-white/20 italic">
                  Coming soon
                </span>
              )}
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={twMerge(
                  "h-[1px] flex-1 min-w-[8px]",
                  isCompleted ? "bg-white/20" : "bg-white/5"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WizardStepper;
