import React, { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const CommonInput: FC<CommonInputProps> = ({
  suffix,
  prefix,
  isError = false,
  isSuccess = false,
  className,
  wrapperClassName,
  ...otherProps
}) => {
  return (
    <div className={twMerge("relative", wrapperClassName)}>
      {prefix}
      <input
        className={twMerge(
          "text-xs sm:text-base",
          "p-2 sm:p-3 rounded ",
          "bg-[#2A2A2A] border outline-none",
          isError
            ? "border-[#F34E4E]/20 text-[#F34E4E]"
            : isSuccess
            ? "border-[#31E200]/30 text-[#31E200]"
            : "border-white/20 text-white",
          className
        )}
        {...otherProps}
      />
      {suffix}
    </div>
  );
};

export default CommonInput;

interface CommonInputProps extends ComponentPropsWithoutRef<"input"> {
  isError?: boolean;
  isSuccess?: boolean;
  suffix?: ReactNode;
  wrapperClassName?: string;
}
