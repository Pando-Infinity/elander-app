"use client";

import { PropsWithChildren, useEffect, useMemo } from "react";

import {
  registerMwa,
  createDefaultChainSelector,
  createDefaultAuthorizationCache,
  createDefaultWalletNotFoundHandler,
} from "@solana-mobile/wallet-standard-mobile";

import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";

import { LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import {
  useEffectiveRpcUrl,
  useNetworkMode,
} from "@/stores/network.store";
import { installUnloadGuard, isSolanaWebShell } from "@/utils/platform.utils";
import { MwaConfig, registerMwaInWebShell } from "@/utils/mwa-web-shell";

const isWebShell =
  typeof window !== "undefined" && isSolanaWebShell(navigator.userAgent);

// Before WalletProvider mounts, so the guard's capture listener runs before wallet-adapter's.
// Web shell only: in a browser, beforeunload keeps its normal meaning.
if (isWebShell) installUnloadGuard(window);

const SolanaProvider = ({ children }: PropsWithChildren) => {
  const endpoint = useEffectiveRpcUrl();
  const networkMode = useNetworkMode();

  const wallets = useMemo(
    () => [new LedgerWalletAdapter(), new BackpackWalletAdapter()],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const chain =
      networkMode === "mainnet" ? "solana:mainnet" : "solana:devnet";

    try {
      const config: MwaConfig = {
        appIdentity: {
          name: "E-Lander",
          uri: window.location.origin,
        },
        authorizationCache: createDefaultAuthorizationCache(),
        chains: [chain],
        chainSelector: createDefaultChainSelector(),
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      };
      // In the web shell, wallet requests arm the unload guard (see installUnloadGuard).
      if (isWebShell) registerMwaInWebShell(config);
      else registerMwa(config);

      console.log("✅ Mobile Wallet Adapter registered successfully");
    } catch (error) {
      console.error("❌ Error registering Mobile Wallet Adapter:", error);
    }
  }, [networkMode]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
