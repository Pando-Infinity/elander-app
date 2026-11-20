import {
  LocalSolanaMobileWalletAdapterWallet,
  registerMwa,
} from "@solana-mobile/wallet-standard-mobile";
import { guardWalletRequest, resetWalletRequests } from "@/utils/platform.utils";

export type MwaConfig = Parameters<typeof registerMwa>[0];

// Feature methods that can open the wallet (and so fire `beforeunload`).
const WALLET_REQUESTS = new Set([
  "connect",
  "signIn",
  "signMessage",
  "signTransaction",
  "signAndSendTransaction",
]);

type Method = (...args: unknown[]) => unknown;

const wrapMethod = (key: string, method: Method): Method => {
  if (WALLET_REQUESTS.has(key)) return guardWalletRequest(method);
  if (key === "disconnect") {
    return (...args) => {
      resetWalletRequests();
      return method(...args);
    };
  }
  return method;
};

/**
 * The MWA wallet, with every request that can open the wallet run under the unload guard, and
 * disconnect clearing requests MWA abandons.
 */
class UnloadGuardedMwaWallet extends LocalSolanaMobileWalletAdapterWallet {
  get features(): LocalSolanaMobileWalletAdapterWallet["features"] {
    const features = super.features as unknown as Record<string, Record<string, unknown>>;
    const guarded: Record<string, Record<string, unknown>> = {};
    for (const [name, feature] of Object.entries(features)) {
      guarded[name] = Object.fromEntries(
        Object.entries(feature).map(([key, value]) => [
          key,
          typeof value === "function" ? wrapMethod(key, value as Method) : value,
        ])
      );
    }
    return guarded as unknown as LocalSolanaMobileWalletAdapterWallet["features"];
  }
}

type WalletsApi = { register: (wallet: object) => () => void };

/** Wallet Standard registration (as `@wallet-standard/wallet`'s `registerWallet`). */
const registerWallet = (wallet: object) => {
  const callback = ({ register }: WalletsApi) => register(wallet);
  try {
    window.dispatchEvent(new CustomEvent("wallet-standard:register-wallet", { detail: callback }));
    window.addEventListener("wallet-standard:app-ready", (event) =>
      callback((event as CustomEvent<WalletsApi>).detail)
    );
  } catch (error) {
    console.error("MWA wallet could not be registered:", error);
  }
};

/**
 * `registerMwa` for the Solana Mobile web shell, where MWA is always the local wallet (the
 * same branch `registerMwa` takes for the web shell user agent). Call it once per page: see
 * `registerMwaOnce` in SolanaProvider.
 */
export const registerMwaInWebShell = (config: MwaConfig) => {
  if (!window.isSecureContext) {
    console.warn("MWA not registered: secure context required (https)");
    return;
  }
  registerWallet(new UnloadGuardedMwaWallet(config));
};
