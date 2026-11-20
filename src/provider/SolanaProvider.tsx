"use client";

import { PropsWithChildren, useEffect, useMemo } from "react";

import {
  registerMwa,
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
import { useAppStore } from "@/stores/app.store";
import { installUnloadGuard, isSolanaWebShell } from "@/utils/platform.utils";
import { MwaConfig, registerMwaInWebShell } from "@/utils/mwa-web-shell";

const isWebShell =
  typeof window !== "undefined" && isSolanaWebShell(navigator.userAgent);

// Before WalletProvider mounts, so the guard's capture listener runs before wallet-adapter's.
// Web shell only: in a browser, beforeunload keeps its normal meaning.
if (isWebShell) installUnloadGuard(window);

type MwaChain = "solana:mainnet" | "solana:devnet";

/**
 * Kept on window, not in module variables, so a Fast Refresh of this module in dev does not
 * register MWA a second time. `chain` is what MWA authorizes on and follows the network; a
 * session authorized before a network switch keeps its chain, which is harmless here because
 * the app only asks MWA to sign and sends through its own RPC.
 */
const mwaState = (): { chain: MwaChain; registered: boolean } => {
  const w = window as typeof window & {
    __elanderMwa?: { chain: MwaChain; registered: boolean };
  };
  return (w.__elanderMwa ??= { chain: "solana:devnet", registered: false });
};

/**
 * Registers MWA once per page. It must never be registered again: on a wallet's unregister,
 * @solana/wallet-standard-wallet-adapter-react 1.1.x keeps the removed wallet in its list (its
 * filter is inverted), so two "Mobile Wallet Adapter" entries end up there. The wallet list
 * connects one, WalletProvider selects the other, and Connect hangs on "Connecting". A network
 * switch changes the chain through the chain selector instead.
 */
const registerMwaOnce = () => {
  const state = mwaState();
  if (state.registered) return;

  const config: MwaConfig = {
    appIdentity: {
      name: "E-Lander",
      uri: window.location.origin,
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ["solana:mainnet", "solana:devnet"],
    chainSelector: { select: async () => mwaState().chain },
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  };
  // In the web shell, wallet requests arm the unload guard (see installUnloadGuard).
  if (isWebShell) registerMwaInWebShell(config);
  else registerMwa(config);
  state.registered = true;
};

const SolanaProvider = ({ children }: PropsWithChildren) => {
  const endpoint = useEffectiveRpcUrl();
  const networkMode = useNetworkMode();
  // A custom RPC counts as mainnet in networkMode; its genesis hash may say devnet.
  const isDevnetCluster = useAppStore((s) => s.isDevnetCluster);

  const wallets = useMemo(
    () => [new LedgerWalletAdapter(), new BackpackWalletAdapter()],
    []
  );

  useEffect(() => {
    mwaState().chain =
      networkMode === "devnet" || isDevnetCluster ? "solana:devnet" : "solana:mainnet";
    try {
      registerMwaOnce();
    } catch (error) {
      console.error("❌ Error registering Mobile Wallet Adapter:", error);
    }
  }, [networkMode, isDevnetCluster]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
