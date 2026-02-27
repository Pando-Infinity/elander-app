import React, { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const CollectionItem: FC<CollectionItemProps> = ({
  label,
  value,
  className,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge("flex items-center justify-between", className)}
      {...otherProps}
    >
      <p className="text-[#747475] text-xs">{label}</p>

      <span className="text-xs font-semibold text-white/60">{value}</span>
    </div>
  );
};

export default CollectionItem;

interface CollectionItemProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  value: ReactNode;
}
