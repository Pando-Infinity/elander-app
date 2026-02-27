/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { ComponentPropsWithoutRef, FC } from "react";

import {
  XIcon,
  ImageIcon,
  AirdropIcon,
  ProfileIcon,
  TelegramIcon,
  TransferIcon,
  HomeLineIcon,
} from "../icons";

import { PathConstant, AppConstant } from "@/const";
import { usePathname } from "next/navigation";
import { LogoTextImage } from "public/images";
import { twJoin, twMerge } from "tailwind-merge";

import Link from "next/link";
import Image from "next/image";
import BuyNftUtility from "../BuyNftUtility";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

const DesktopNavigation = () => {
  const analytics = useFirebaseAnalytics();

  return (
    <div
      className={twMerge(
        "px-5 py-8 relative",
        "bg-[#222222] border-r border-[#3A3A3A]",
        "hidden sm:flex flex-col gap-y-6 h-full",
        "min-w-[240px] w-[240px] min-h-screen h-screen"
      )}
    >
      <Link href={PathConstant.ROOT}>
        <Image src={LogoTextImage} alt="logo" width={154} height={23} />
      </Link>
      <div className="flex flex-col gap-y-5">
        <DesktopNavigationItem href={PathConstant.ROOT} icon={<HomeLineIcon />}>
          Home
        </DesktopNavigationItem>
        <DesktopNavigationItem href={PathConstant.BULK} icon={<TransferIcon />}>
          Bulk Transfer
        </DesktopNavigationItem>
        <DesktopNavigationItem
          href={PathConstant.SNAPSHOT}
          icon={<ImageIcon />}
        >
          Snapshort
        </DesktopNavigationItem>
        <DesktopNavigationItem
          href={PathConstant.AIRDROP}
          icon={<AirdropIcon />}
        >
          Airdrop
        </DesktopNavigationItem>
      </div>

      <div className="h-[1px] w-full bg-[#3A3A3A]" />

      <DesktopNavigationItem href={PathConstant.PROFILE} icon={<ProfileIcon />}>
        Profile
      </DesktopNavigationItem>

      <div className="flex flex-col gap-y-8 absolute left-5 bottom-8">
        <BuyNftUtility />
        <div className="flex items-center gap-x-4">
          {/* <Link
            href=""
            target="_blank"
            className="w-8 h-8 rounded-full border border-white/17 bg-white/12 center-root"
            onClick={() => {
              analytics.logNavigationButtonAction(
                {
                  button_name: "telegram",
                  url: "",
                },
                "external_link_click"
              );
            }}
          >
            <TelegramIcon />
          </Link> */}

          <Link
            href={AppConstant.ELANDER_X_URL}
            target="_blank"
            className="w-8 h-8 rounded-full border border-white/17 bg-white/12 center-root"
            onClick={() => {
              analytics.logNavigationButtonAction(
                {
                  button_name: "X",
                  url: AppConstant.ELANDER_X_URL,
                },
                "external_link_click"
              );
            }}
          >
            <XIcon />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigation;

const DesktopNavigationItem: FC<DesktopNavigationItemInterface> = ({
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
        "rounded",
        "p-[1px]",
        active ? "text-white" : "text-[#737373]",
        active
          ? "bg-[linear-gradient(275.7deg,rgba(244,67,25,0)_-53.55%,rgba(244,67,25,0.1)_73.4%,rgba(244,67,25,0.7)_112.36%)]"
          : "bg-transparent",
        className
      )}
      href={href}
    >
      <div
        className={twJoin(
          "rounded",
          active ? "bg-[#2b2b2b]" : "bg-transparent"
        )}
      >
        <div
          className={twMerge(
            "rounded",
            "px-2 py-3 relative",
            "flex gap-x-2 items-center",
            active
              ? "bg-[linear-gradient(90deg,rgba(244,67,25,0.2)_0%,rgba(244,67,25,0)_36.53%)]"
              : "bg-transparent"
          )}
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

          {active && (
            <div className="h-9 w-[6px] bg-[#F44319] absolute top-1/2 -translate-y-1/2 -left-6 rounded-r-lg navigation-shadow" />
          )}
        </div>
      </div>
    </Link>
  );
};

interface DesktopNavigationItemInterface
  extends ComponentPropsWithoutRef<"div"> {
  href: string;
  isActive?: boolean;
  icon: any;
}
