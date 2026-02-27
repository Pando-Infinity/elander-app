import { ComponentPropsWithoutRef, FC } from "react";
import { ImageAssets } from "public";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

const BulkTransferError: FC<BulkTransferErrorProps> = ({
  className,
  errorMessage,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-y-5 items-center min-h-[256px]",
        className
      )}
      {...otherProps}
    >
      <Image src={ImageAssets.CloseCircleImage} alt="" width={70} height={70} />
      <div className="flex flex-col items-center gap-y-1 w-full">
        <p className="text-sm font-bold leading-[28px]">Error</p>
        <p className="text-xs text-[#8C8C8C] text-center">
          {errorMessage} <br />
          Please try again.
        </p>
      </div>
    </div>
  );
};

export default BulkTransferError;

interface BulkTransferErrorProps extends ComponentPropsWithoutRef<"div"> {
  errorMessage?: string;
}
