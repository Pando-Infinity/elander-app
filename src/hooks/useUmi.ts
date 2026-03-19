"use client";

import { useMemo } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useWallet } from "@solana/wallet-adapter-react";
import { getSolanaRpcEndpoint } from "@/utils/blockchain.utils";

const useUmi = () => {
  const wallet = useWallet();

  // Umi uses a builder pattern (.use()) — mutation is intentional during setup
  const umi = useMemo(() => {
    const base = createUmi(getSolanaRpcEndpoint()).use(mplCore());
    return wallet.publicKey
      ? base.use(walletAdapterIdentity(wallet))
      : base;
  }, [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return { umi, isReady: !!wallet.publicKey };
};

export default useUmi;
