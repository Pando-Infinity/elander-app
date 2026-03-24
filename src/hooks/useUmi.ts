/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useMemo } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffectiveRpcUrl } from "@/stores/network.store";

const useUmi = () => {
  const wallet = useWallet();
  const rpcUrl = useEffectiveRpcUrl();

  // Umi uses a builder pattern (.use()) — mutation is intentional during setup
  const umi = useMemo(() => {
    const base = createUmi(rpcUrl).use(mplCore());
    return wallet.publicKey ? base.use(walletAdapterIdentity(wallet)) : base;
  }, [
    rpcUrl,
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ]);

  return { umi, isReady: !!wallet.publicKey };
};

export default useUmi;
