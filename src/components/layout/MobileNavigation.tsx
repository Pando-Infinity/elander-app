/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ComponentPropsWithoutRef, FC } from "react";

import { PathConstant } from "@/const";
import { usePathname } from "next/navigation";
import { twJoin, twMerge } from "tailwind-merge";
import { DiamondIcon, EssentialIcon, HomeIcon, SocialIcon } from "../icons";

import Link from "next/link";

const MobileNavigation = () => {
  return (
    <div
      className={twMerge(
        "px-4 py-5 sm:hidden",
        "w-full bg-[#151515]",
        "fixed bottom-0 left-0 z-[50]",
        "flex items-center justify-between",
        "shadow-[0px_-40px_60px_0px_#F4431933]"
      )}
    >
      <MobileNavigationItem href={PathConstant.ROOT} icon={<HomeIcon />}>
        Home
      </MobileNavigationItem>

      <MobileNavigationItem href={PathConstant.BULK} icon={<DiamondIcon />}>
        Bulk
      </MobileNavigationItem>

      <MobileNavigationItem
        href={PathConstant.SNAPSHOT}
        icon={<EssentialIcon />}
      >
        Snapshot
      </MobileNavigationItem>

      <MobileNavigationItem href={PathConstant.AIRDROP} icon={<SocialIcon />}>
        Airdrop
      </MobileNavigationItem>
    </div>
  );
};

export default MobileNavigation;

const MobileNavigationItem: FC<MobileNavigationItemInterface> = ({
  href,
  icon,
  children,
  className,
  isActive = false,
}) => {
  const pathname = usePathname();

  const active = isActive || pathname === href;

  return (
    <Link
      className={twMerge(
        "flex flex-col gap-y-2 items-center",
        active ? "text-[#F44319]" : "text-white/50",
        className
      )}
      href={href}
    >
      {icon}
      <div
        className={twJoin(
          "text-sm font-semibold",
          active ? "text-gradient" : "text-white/50"
        )}
      >
        {children}
      </div>
    </Link>
  );
};

interface MobileNavigationItemInterface
  extends ComponentPropsWithoutRef<"div"> {
  href: string;
  isActive?: boolean;
  icon: any;
}
