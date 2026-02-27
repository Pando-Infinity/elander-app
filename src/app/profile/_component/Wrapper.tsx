import React, {
  FC,
  Fragment,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { twMerge } from "tailwind-merge";

const Wrapper: FC<WrapperProps> = ({
  label,
  action,
  children,
  className,
  adornment,
  wrapperClassName,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge(
        "rounded-lg",
        "bg-[#141414]",
        "border border-white/20",
        "flex flex-col min-h-[310px]",
        wrapperClassName
      )}
      {...otherProps}
    >
      <div className="flex items-center justify-between bg-[#242424] rounded-t-lg pr-4">
        <div className="text-sm sm:text-base font-semibold py-2.5 pl-4 pr-7 bg-[#D9D9D9]/5 rounded-tl-lg relative">
          {label}
          <div
            className="w-6 h-full bg-[#242424] top-0 absolute right-0"
            style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
          />
        </div>
        <div className="text-xs text-white/40"> {adornment}</div>
      </div>
      <div
        className={twMerge(
          "p-4",
          "flex flex-wrap gap-5 min-h-[266px]",
          className
        )}
      >
        {children}
      </div>
      {action ? (
        <div className="flex items-center gap-x-2 mt-auto px-4 pb-6 pt-4">
          {action}
        </div>
      ) : (
        <Fragment />
      )}
    </div>
  );
};

export default Wrapper;

interface WrapperProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  adornment?: ReactNode;
  action?: ReactNode;
  wrapperClassName?: string;
}
