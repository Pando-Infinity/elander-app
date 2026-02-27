/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useMemo,
  useState,
  Fragment,
  useEffect,
  useContext,
} from "react";
import ReactDOM from "react-dom";

import { ImageAssets } from "public";
import { AppConstant } from "@/const";
import { twJoin } from "tailwind-merge";
import { BlockchainUtils } from "@/utils";
import { wait } from "@/utils/common.utils";
import { useUserStore } from "@/stores/user.store";
import { useWallet, Wallet, WalletContext } from "@solana/wallet-adapter-react";

import bs58 from "bs58";
import Image from "next/image";
import WalletItem from "./WalletItem";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

const SolanaWalletList: React.FC<SolanaWalletListProps> = ({ onClose }) => {
  const analytics = useFirebaseAnalytics();
  const walletContext = useContext(WalletContext);
  const { wallets, wallet: walletAdapter, connected } = useWallet();
  const { setWalletAddress, setWalletType, setConnectSignature } =
    useUserStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>();

  const walletListDisplay = useMemo(() => {
    const installedWalletMap = new Map(
      wallets.map((wallet) => [wallet.adapter.name as string, wallet])
    );

    const uniqueWallets = new Set<{
      name: string;
      wallet: Wallet | null;
    }>();

    const hasMobileWalletAdapter = installedWalletMap.has(
      "Mobile Wallet Adapter"
    );

    walletList.forEach((name: string) => {
      if (name === "Mobile Wallet Adapter" && !hasMobileWalletAdapter) {
        return;
      }

      const wallet = installedWalletMap.get(name);
      if (wallet) {
        uniqueWallets.add({
          name: name,
          wallet: wallet,
        });
      } else {
        uniqueWallets.add({ name: name, wallet: null });
      }
    });

    return Array.from(uniqueWallets);
  }, [wallets]);

  const handleGetSolanaAddress = async (wallet: Wallet) => {
    try {
      const account = await wallet?.adapter.publicKey;

      return account?.toString() || "";
    } catch (error) {
      console.error("Error getting solana address:", error);
      return "";
    }
  };

  const handleConnect = async (wallet: Wallet | null) => {
    if (isConnecting || !wallet) return;
    setIsConnecting(true);

    try {
      await walletContext.select(wallet.adapter.name);
      await wallet.adapter.connect();

      await wait(2000);

      setSelectedWallet(wallet);
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      setSelectedWallet(undefined);
      setIsConnecting(false);
    }
  };

  const handleSignMessage = async (wallet: Wallet, address: string) => {
    const userHashId = await BlockchainUtils.hashWalletAddressToUUID(address);

    try {
      const adapter = wallet.adapter;

      const encodedMessage = new TextEncoder().encode(
        AppConstant.STEALTH_SIGNING_MESSAGE
      );

      const signature = await (adapter as any).signMessage(encodedMessage);

      const encodeSignature = bs58.encode(signature);

      if (encodeSignature) {
        setWalletAddress(address);
        setConnectSignature(encodeSignature);

        analytics.logAuthAction(
          {
            user_id_hashed: userHashId,
            success: true,
          },
          "auth_success"
        );

        if (wallet.adapter.name) {
          setWalletType(wallet.adapter.name);
        }

        setIsConnecting(false);
        onClose();
        return;
      }
    } catch (error: any) {
      console.log("error", error);
      analytics.logAuthAction(
        {
          user_id_hashed: userHashId,
          success: false,
          error_message: error.message,
        },
        "auth_failure"
      );
      wallet.adapter.disconnect();
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (
      connected &&
      walletAdapter &&
      selectedWallet &&
      walletAdapter.adapter.name === selectedWallet.adapter.name
    ) {
      (async () => {
        try {
          const address = await handleGetSolanaAddress(selectedWallet);
          if (address) {
            const userHashId = await BlockchainUtils.hashWalletAddressToUUID(
              address
            );
            analytics.logAuthAction(
              {
                user_id_hashed: userHashId,
              },
              "auth_start"
            );

            await handleSignMessage(selectedWallet, address);
          } else {
            throw new Error("Failed to get wallet address");
          }
        } catch (error: any) {
          console.error("Error in signing phase:", error);
        }
      })();
    }
  }, [connected, walletAdapter, selectedWallet]);

  return (
    <>
      <div className={twJoin("w-full", "flex flex-col gap-y-4")}>
        {walletListDisplay?.map((wallet, index) => (
          <WalletItem
            isInstalled={
              wallet?.wallet?.readyState === "Installed" ||
              wallet?.wallet?.adapter.name === "Ledger"
            }
            key={index}
            title={wallet?.name}
            onClick={() => {
              handleConnect(wallet.wallet);
            }}
          />
        ))}
      </div>

      {isConnecting ? (
        <>
          {ReactDOM.createPortal(
            <div
              className={twJoin(
                "z-[10000]",
                "w-screen h-screen",
                "fixed top-0 left-0",
                "bg-black opacity-75",
                "flex flex-col gap-y-3 items-center justify-center"
              )}
            >
              <div className="animate-bounce">
                <Image
                  src={ImageAssets.LogoImage}
                  alt=""
                  width={32}
                  height={32}
                />
              </div>
              <div className="flex items-end font-bold">
                <span>Connecting</span>
                <span className="ml-1 flex space-x-1 mb-[6px]">
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>,
            document.body
          )}
        </>
      ) : (
        <Fragment />
      )}
    </>
  );
};

export default SolanaWalletList;

interface SolanaWalletListProps {
  onClose: () => void;
}

const walletList = [
  "Mobile Wallet Adapter",
  "Phantom",
  "Backpack",
  "OKX Wallet",
  "Nightly",
  "Bitget Wallet",
  "Solflare",
  "Gate Wallet",
  "Jupiter",
  "Ledger",
];
