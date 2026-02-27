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

import { getSolanaRpcEndpoint } from "@/utils/blockchain.utils";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";

const SolanaProvider = ({ children }: PropsWithChildren) => {
  const endpoint = getSolanaRpcEndpoint();

  const wallets = useMemo(
    () => [new LedgerWalletAdapter(), new BackpackWalletAdapter()],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const networkMode = process.env.NETWORK_MODE;

    const chain =
      networkMode === "mainnet" ? "solana:mainnet" : "solana:devnet";

    try {
      registerMwa({
        appIdentity: {
          name: "E-Lander",
          uri: window.location.origin,
        },
        authorizationCache: createDefaultAuthorizationCache(),
        chains: [chain],
        chainSelector: createDefaultChainSelector(),
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      });

      console.log("✅ Mobile Wallet Adapter registered successfully");
    } catch (error) {
      console.error("❌ Error registering Mobile Wallet Adapter:", error);
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
