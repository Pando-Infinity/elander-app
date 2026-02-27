import React, { ComponentPropsWithoutRef, FC } from "react";
import { ImageAssets } from "public";
import { twJoin, twMerge } from "tailwind-merge";
import Image from "next/image";

const NoRecordFound: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge("flex flex-col items-center gap-y-3", className)}
      {...otherProps}
    >
      <div
        className={twJoin(
          "w-[70px] h-[70px]",
          "center-root ",
          "rounded-full bg-[#101010]/20 border-[0.7px] border-[#CECECE]/20"
        )}
      >
        <Image
          src={ImageAssets.FileImage}
          alt="file image"
          width={43}
          height={34}
        />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm font-bold text-[#A7A7A7] leading-[28px]">
          No record found
        </p>
        <p className="text-xs text-[#656565]">Borem ipsum dolor sit </p>
      </div>
    </div>
  );
};

export default NoRecordFound;
