"use client";

import React, { ComponentPropsWithoutRef, FC, useEffect } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";
import { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";

import Header from "./Header";
import CommonDialog from "../CommonDialog";
import ConnectButton from "./ConnectButton";
import SolanaWalletList from "./SolanaWalletList";
import MobileNavigation from "./MobileNavigation";
import DesktopNavigation from "./DesktopNavigation";

const MainLayout: FC<MainLayoutInterface> = ({ children, className }) => {
  const { wallets, select } = useWallet();
  const { walletType } = useUserStore();
  const { isOpenConnectWallet, setIsOpenConnectWallet } = useAppStore();

  useEffect(() => {
    if (!walletType) return;
    const walletAdapterStorage = localStorage
      .getItem("walletName")
      ?.replace(/"/g, "") as WalletName;

    const solanaProvider = walletType as WalletName;

    const walletName = walletAdapterStorage || solanaProvider;

    const selectedWallet = wallets.find(
      (wallet) => wallet?.adapter?.name == walletName
    );
    if (walletName && selectedWallet) {
      select(walletName);
      selectedWallet.adapter.connect();
    } else {
      console.error("Unsupported wallet");

      return;
    }
  }, [wallets, walletType]);

  return (
    <div
      className={twJoin(
        "flex",
        "font-sans",
        "bg-cover bg-no-repeat",
        "h-screen w-screen overflow-hidden",
        "bg-[url('/images/background/img-bg-mobile.avif')] sm:bg-[url('/images/background/img-bg-desktop.jpg')]"
      )}
    >
      <Header />
      <DesktopNavigation />
      <div className="flex flex-col w-full h-full overflow-hidden w-screen">
        <div className="sm:flex justify-end py-5 border-b border-[#3A3A3A] hidden sm:px-[46px] flex-shrink-0">
          <ConnectButton />
        </div>
        <div
          className={twMerge(
            "overflow-y-auto flex-1 relative w-full pt-20 pb-[112px] sm:py-8 px-4 sm:px-[46px]",
            className
          )}
        >
          {children}
        </div>
      </div>

      <MobileNavigation />

      <CommonDialog
        isOpen={isOpenConnectWallet}
        onClose={() => setIsOpenConnectWallet(false)}
        dialogTitle="Connect Wallet"
        contentClassName="max-h-[65vh] sm:max-h-[85vh]"
      >
        <SolanaWalletList onClose={() => setIsOpenConnectWallet(false)} />
      </CommonDialog>
    </div>
  );
};

export default MainLayout;

interface MainLayoutInterface extends ComponentPropsWithoutRef<"div"> {
  wrapperLayoutClassName?: string;
}
