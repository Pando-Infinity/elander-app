import { Connection } from "@solana/web3.js";

export type RpcCluster = "mainnet" | "devnet" | "testnet" | "unknown";

// Genesis hashes identify a cluster regardless of the RPC provider's hostname.
const GENESIS_HASH_TO_CLUSTER: Record<string, RpcCluster> = {
  "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d": "mainnet",
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG: "devnet",
  "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY": "testnet",
};

// An RPC that does not answer in time is treated as a failed lookup (so not devnet: locked).
const GENESIS_LOOKUP_TIMEOUT_MS = 8000;

const clusterCache = new Map<string, Promise<RpcCluster>>();

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Genesis hash lookup timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

/**
 * Resolves which cluster an RPC URL serves by asking for its genesis hash. Cached per URL; a
 * failed or timed-out lookup is dropped from the cache so the next call tries again.
 */
export const getRpcCluster = (rpcUrl: string): Promise<RpcCluster> => {
  const cached = clusterCache.get(rpcUrl);
  if (cached) return cached;

  const lookup = withTimeout(
    new Connection(rpcUrl, "confirmed").getGenesisHash(),
    GENESIS_LOOKUP_TIMEOUT_MS
  ).then((hash) => GENESIS_HASH_TO_CLUSTER[hash] ?? "unknown");

  lookup.catch(() => {
    if (clusterCache.get(rpcUrl) === lookup) clusterCache.delete(rpcUrl);
  });

  clusterCache.set(rpcUrl, lookup);
  return lookup;
};
