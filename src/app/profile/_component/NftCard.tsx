/* eslint-disable @next/next/no-img-element */
import React, { ComponentPropsWithoutRef, FC } from "react";
import { twMerge } from "tailwind-merge";

const NftCard: FC<NftCardProps> = ({
  name,
  urlImage,
  className,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center",
        "h-fit rounded-lg overflow-hidden",
        "bg-white/10 border border-white/20",
        className
      )}
      {...otherProps}
    >
      <img
        src={urlImage}
        alt="nft"
        width={66}
        height={66}
        className="w-[64px] h-[64px] sm:h-[78px] sm:w-[78px]"
      />

      <p className="py-[2px] text-xs sm:text-sm">
        {name?.slice(name.indexOf("#")) || "-"}
      </p>
    </div>
  );
};

export default NftCard;

interface NftCardProps extends ComponentPropsWithoutRef<"div"> {
  urlImage: string;
  name: string;
}
