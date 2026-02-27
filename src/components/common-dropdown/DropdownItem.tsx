"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Item, DropdownMenuItemProps } from "@radix-ui/react-dropdown-menu";

const DropdownItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  ...otherProps
}) => {
  return (
    <Item
      className={twMerge(
        "cursor-pointer",
        "py-2 sm:py-3 px-3",
        "first:border-t-transparent",
        "border-t border-[#D7D9DD]/20",
        "focus-visible:outline-none",
        "text-white font-medium",
        "hover:bg-[#2A2A2A]/80",
        "first:rounded-t-lg last:rounded-b-lg",
        className
      )}
      {...otherProps}
    >
      {children}
    </Item>
  );
};

export default DropdownItem;
