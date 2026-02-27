import React, { ComponentPropsWithoutRef, FC } from "react";
import { twJoin, twMerge } from "tailwind-merge";

export enum ProfileTabsEnum {
  Information = "Information",
}

const ProfileTabs: FC<ProfileTabsInterface> = ({
  className,
  selectedTab,
  onSelectTab,
}) => {
  return (
    <div
      className={twMerge(
        "flex items-center gap-x-3 bg-[#2E2E2E] p-1 rounded",
        className
      )}
    >
      {Object.values(ProfileTabsEnum).map((item, index) => (
        <button
          key={index}
          className={twJoin(
            "px-3 py-2",
            "text-sm font-semibold",
            item === selectedTab
              ? "text-[#F44319] bg-[#F44319]/20 border border-[#F44319]/20 rounded shadow-[4px_4px_24px_0px_#F4431940]"
              : "text-white/20"
          )}
          onClick={() => onSelectTab(item)}
        >
          {item}
        </button>
      ))}
      <div></div>
    </div>
  );
};

export default ProfileTabs;

interface ProfileTabsInterface extends ComponentPropsWithoutRef<"div"> {
  selectedTab: ProfileTabsEnum;
  onSelectTab: (selectedTab: ProfileTabsEnum) => void;
}
