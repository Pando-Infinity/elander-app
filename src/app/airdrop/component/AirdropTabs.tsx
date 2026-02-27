import React, { ComponentPropsWithoutRef, FC } from "react";
import { twJoin, twMerge } from "tailwind-merge";

const AirdropTabs: FC<AirdropTabsProps> = ({ selectedTabs, onSelectTab }) => {
  return (
    <div
      className={twMerge(
        "bg-[#2A2A2A]",
        "p-1 rounded-lg",
        "flex items-center justify-between gap-x-3"
      )}
    >
      {Object.values(AirdropTabEnum).map((item) => (
        <button
          key={item}
          className={twJoin(
            "center-root w-full",
            "py-1.5 cursor-pointer rounded",
            "text-xs font-semibold leading-[24px]",
            item === selectedTabs
              ? "text-[#F44319] bg-[#F44319]/20 border border-[#F44319]/20 shadow-[4px_4px_24px_0px_#F4431940]"
              : "text-white/20"
          )}
          onClick={() => onSelectTab(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default AirdropTabs;

interface AirdropTabsProps extends ComponentPropsWithoutRef<"div"> {
  selectedTabs: AirdropTabEnum;

  onSelectTab: (selectedTabs: AirdropTabEnum) => void;
}

export enum AirdropTabEnum {
  UploadCSV = "Upload CSV",
  EnterList = "Enter List",
}
