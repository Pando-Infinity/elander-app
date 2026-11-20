"use client";

import React from "react";
import { ImageAssets } from "public";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

const WalletItem: React.FC<WalletItemProps> = ({
  title,
  icon,
  className,
  ...otherProps
}) => {
  const image = handleGetWalletImageByName(title, icon);

  return (
    <button
      className={twMerge(
        "px-4 py-2",
        "rounded-lg",
        "bg-white/10 cursor-pointer",
        "text-sm text-neutral1 font-medium",
        "flex flex-row justify-between items-center gap-x-2",
        className
      )}
      {...otherProps}
    >
      <div className="flex flex-row gap-x-4 items-center">
        <div className="relative w-fit">
          <Image
            width={40}
            height={40}
            src={image}
            alt={title}
            className="rounded-full"
            // A wallet's own icon is not a bundled asset (normally a data: URI).
            unoptimized={typeof image === "string"}
          />

          {/* Only detected wallets are listed */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#19FB9B] absolute top-0 right-0" />
        </div>
        <span>{title === "Mobile Wallet Adapter" ? "Seeker" : title}</span>
      </div>
    </button>
  );
};

export default WalletItem;

interface WalletItemProps extends React.ComponentPropsWithoutRef<"button"> {
  title: string;
  /** The wallet's own icon (a data: URI), used when it has no bundled image. */
  icon: string;
}

/** The bundled image for a known wallet; otherwise `fallback` (the wallet's own icon), or "". */
export const handleGetWalletImageByName = (name: string, fallback = "") => {
  switch (name) {
    case "Phantom":
      return ImageAssets.PhantomWalletImage;
    case "Backpack":
      return ImageAssets.BackpackWalletImage;
    case "OKX Wallet":
      return ImageAssets.OkxWalletImage;
    case "Nightly":
      return ImageAssets.NightlyWalletImage;
    case "Bitget Wallet":
      return ImageAssets.BitgetWalletImage;
    case "Solflare":
      return ImageAssets.SolflareWalletImage;
    case "Gate Wallet":
      return ImageAssets.GateWalletImage;
    case "Jupiter":
      return ImageAssets.JupiterWalletImage;
    case "Ledger":
      return ImageAssets.LedgerWalletImage;
    case "Mobile Wallet Adapter":
      return ImageAssets.MobileWalletAdapterImage;
    case "Salmon":
      return ImageAssets.SalmonWalletImage;

    default:
      return fallback;
  }
};
