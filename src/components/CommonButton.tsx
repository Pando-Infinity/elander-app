"use client";

import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

const CommonButton: React.FC<CommonButtonProps> = ({
  variant = "primary",
  children,
  disabled,
  className,
  ...otherProps
}) => {
  const variantStyle = useMemo(() => {
    switch (variant) {
      case "primary":
        return "bg-[#F44319] hover:bg-[#F44319]/80 border border-[#F44319]/20 text-white";
      case "secondary":
        return "bg-[#2A2A2A] hover:bg-[#2A2A2A]/80 text-white font-semibold";
      default:
        return "";
    }
  }, [variant]);

  return (
    <button
      key={`${Date.now}`}
      className={twMerge(
        "font-medium",
        "py-2 px-4 rounded",
        "text-sm cursor-pointer",
        "focus-visible:outline-none",
        "flex items-center justify-center gap-x-2",
        disabled && "opacity-40 cursor-auto",
        variantStyle,
        className
      )}
      disabled={disabled}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default CommonButton;

export interface CommonButtonProps
  extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary";
}
