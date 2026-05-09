/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  ComponentPropsWithoutRef,
  FC,
  useState,
  useRef,
  useEffect,
} from "react";

import { PathConstant, FeatureFlags } from "@/const";
import { usePathname } from "next/navigation";
import { twJoin, twMerge } from "tailwind-merge";
import {
  DiamondIcon,
  EssentialIcon,
  HomeIcon,
  SocialIcon,
  ImageIcon,
} from "../icons";

import Link from "next/link";

const PRIMARY_ITEMS = FeatureFlags.HIDE_V11_TOOLS
  ? [
      { href: PathConstant.ROOT, icon: <HomeIcon />, label: "Home" },
      { href: PathConstant.AIRDROP, icon: <SocialIcon />, label: "Airdrop" },
      { href: PathConstant.BULK, icon: <DiamondIcon />, label: "Bulk Transfer" },
      { href: PathConstant.SNAPSHOT, icon: <EssentialIcon />, label: "Snapshot" },
    ]
  : [
      { href: PathConstant.ROOT, icon: <HomeIcon />, label: "Home" },
      { href: PathConstant.AIRDROP, icon: <SocialIcon />, label: "Airdrop" },
      { href: PathConstant.NFT_COLLECTION_GEN, icon: <ImageIcon />, label: "NFT Gen" },
    ];

const MORE_ITEMS = FeatureFlags.HIDE_V11_TOOLS
  ? []
  : [
      { href: PathConstant.NFT_COLLECTION_MGR, icon: <ImageIcon />, label: "Col Mgr" },
      { href: PathConstant.BULK, icon: <DiamondIcon />, label: "Bulk Transfer" },
      { href: PathConstant.SNAPSHOT, icon: <EssentialIcon />, label: "Snapshot" },
    ];

const MobileNavigation = () => {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close submenu on route change
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  // Close submenu on outside click
  useEffect(() => {
    if (!showMore) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMore]);

  const isMoreActive = MORE_ITEMS.some((item) => pathname === item.href);

  return (
    <div ref={menuRef}>
      {/* Submenu popover */}
      {showMore && (
        <div
          className={twMerge(
            "fixed bottom-[72px] right-3 z-[51]",
            "rounded-xl bg-surface-dropdown border border-white/10",
            "shadow-[0px_-8px_30px_0px_rgba(0,0,0,0.5)]",
            "py-2 px-1 flex flex-col gap-y-1 min-w-[140px]"
          )}
        >
          {MORE_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  "flex items-center gap-x-3 px-3 py-2.5 rounded-lg",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-white/50 hover:bg-white/5"
                )}
              >
                {item.icon}
                <span
                  className={twJoin(
                    "text-sm font-semibold",
                    active ? "text-gradient" : "text-white/50"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom bar */}
      <div
        className={twMerge(
          "px-4 py-5 sm:hidden",
          "w-full bg-surface-nav",
          "fixed bottom-0 left-0 z-[50]",
          "flex items-center justify-between",
          "shadow-[0px_-40px_60px_0px_#F4431933]"
        )}
      >
        {PRIMARY_ITEMS.map((item) => (
          <MobileNavigationItem
            key={item.href}
            href={item.href}
            icon={item.icon}
          >
            {item.label}
          </MobileNavigationItem>
        ))}

        {/* More button — hidden when no overflow items */}
        {MORE_ITEMS.length > 0 && (
          <button
            onClick={() => setShowMore((v) => !v)}
            className={twMerge(
              "flex flex-col gap-y-2 items-center",
              isMoreActive || showMore ? "text-accent" : "text-white/50"
            )}
          >
            <MoreIcon />
            <div
              className={twJoin(
                "text-sm font-semibold",
                isMoreActive || showMore ? "text-gradient" : "text-white/50"
              )}
            >
              More
            </div>
          </button>
        )}
      </div>
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
        active ? "text-accent" : "text-white/50",
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

const MoreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
