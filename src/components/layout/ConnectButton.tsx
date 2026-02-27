import React, {
  FC,
  useRef,
  useState,
  useEffect,
  ComponentPropsWithoutRef,
} from "react";

import { CommonUtils } from "@/utils";
import { PathConstant } from "@/const";
import { useAppStore } from "@/stores/app.store";
import { twJoin, twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";
import { useWallet } from "@solana/wallet-adapter-react";
import { handleGetWalletImageByName } from "./WalletItem";
import { ChevronDownIcon, LogoutIcon, ProfileIcon } from "../icons";

import Link from "next/link";
import Image from "next/image";

const ConnectButton: FC<ComponentPropsWithoutRef<"button">> = ({
  className,
  ...otherProps
}) => {
  const { walletAddress, walletType, logout } = useUserStore();
  const { setIsOpenConnectWallet } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useWallet();

  const handleLogout = async () => {
    await disconnect();
    setIsOpen(false);
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return walletAddress && walletType ? (
    <div className="relative" ref={dropdownRef}>
      <button
        className={twMerge(
          "cursor-pointer",
          "py-2 px-3 bg-[#272727]",
          "flex items-center gap-x-2",
          "border border-white/20 rounded",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...otherProps}
      >
        <ChevronDownIcon
          className={twJoin(
            "w-6 h-6 duration-500",
            isOpen ? "-rotate-180" : ""
          )}
        />
        <p className="text-xs sm:text-sm leading-[24px] sm:leading-[30px] text-[#1A1A1A] font-medium text-white">
          {CommonUtils.truncateHash(walletAddress, 6, 4)}
        </p>
        <Image
          src={handleGetWalletImageByName(walletType)}
          alt=""
          width={24}
          height={24}
        />
      </button>

      {isOpen && (
        <div
          className={twJoin(
            "w-[184px] sm:w-[199px]",
            "flex flex-col gap-y-2",
            "absolute right-0 -bottom-4 rounded translate-y-[100%] duration-500 z-[100]",
            "p-3 bg-[#2A2A2A] border border-white/20 text-sm font-medium "
          )}
        >
          <Link
            href={PathConstant.PROFILE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-x-1.5 py-1 cursor-pointer"
          >
            <ProfileIcon />
            Profile
          </Link>

          <div className="h-[1px] w-full bg-[#575757]" />

          <button
            className="flex items-center gap-x-1.5 text-[#D01515] py-1 cursor-pointer"
            onClick={handleLogout}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      )}
    </div>
  ) : (
    <button
      className={twMerge(
        "cursor-pointer",
        "pr-2.5 pb-2 sm:pb-2.5",
        "w-[130px] h-[35px] sm:h-11 sm:w-[164px]",
        "bg-[url('/images/background/img-bg-button.png')]  bg-cover bg-center bg-no-repeat",
        className
      )}
      onClick={() => setIsOpenConnectWallet(true)}
      {...otherProps}
    >
      <p className="text-xs sm:text-base leading-[24px] sm:leading-[30px] text-[#1A1A1A] font-medium text-white">
        Connect Wallet
      </p>
    </button>
  );
};

export default ConnectButton;
