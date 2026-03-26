import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clusterApiUrl } from "@solana/web3.js";
import { invalidateConnection } from "@/utils/connection-cache";
import { useUserStore } from "@/stores/user.store";
import { NetworkMode } from "@/models/app.model";

export interface NetworkState {
  // "mainnet" | "devnet" | a custom RPC URL string
  activeEndpoint: string;
  savedCustomRpcs: string[];

  setActiveEndpoint: (endpoint: string) => void;
  addCustomRpc: (url: string) => void;
  removeCustomRpc: (url: string) => void;
}

const init = {
  activeEndpoint: "devnet",
  savedCustomRpcs: [] as string[],
};

/** Derives the actual RPC URL to connect to */
export const getEffectiveRpcUrl = (state: NetworkState): string => {
  if (state.activeEndpoint === "mainnet") {
    return process.env.RPC_URL || clusterApiUrl("mainnet-beta");
  }
  if (state.activeEndpoint === "devnet") {
    return clusterApiUrl("devnet");
  }
  // custom URL
  return state.activeEndpoint;
};

/** Derives mainnet | devnet — custom RPCs are treated as mainnet for explorer/MWA */
export const getNetworkMode = (state: NetworkState): NetworkMode => {
  if (state.activeEndpoint === "devnet") return "devnet";
  return "mainnet";
};

/** Label shown in the button */
export const getEndpointLabel = (endpoint: string): string => {
  if (endpoint === "mainnet") return "Mainnet";
  if (endpoint === "devnet") return "Devnet";
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "Custom RPC";
  }
};

const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      ...init,

      setActiveEndpoint: (endpoint: string) => {
        if (endpoint === get().activeEndpoint) return;
        invalidateConnection();
        useUserStore.getState().resetUserData();
        set({ activeEndpoint: endpoint });
      },

      addCustomRpc: (url: string) => {
        const trimmed = url.trim();
        if (!trimmed) return;
        try {
          new URL(trimmed);
        } catch {
          return;
        }
        const current = get();
        if (trimmed === current.activeEndpoint) return;
        const alreadySaved = current.savedCustomRpcs.includes(trimmed);
        invalidateConnection();
        useUserStore.getState().resetUserData();
        set({
          activeEndpoint: trimmed,
          savedCustomRpcs: alreadySaved
            ? current.savedCustomRpcs
            : [...current.savedCustomRpcs, trimmed],
        });
      },

      removeCustomRpc: (url: string) => {
        const current = get();
        const updated = current.savedCustomRpcs.filter((r) => r !== url);
        const wasActive = current.activeEndpoint === url;
        if (wasActive) invalidateConnection();
        set({
          savedCustomRpcs: updated,
          ...(wasActive ? { activeEndpoint: "mainnet" } : {}),
        });
        if (wasActive) useUserStore.getState().resetUserData();
      },
    }),
    {
      name: "network-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useEffectiveRpcUrl = () => useNetworkStore(getEffectiveRpcUrl);
export const useNetworkMode = () => useNetworkStore(getNetworkMode);
export const useActiveEndpoint = () => useNetworkStore((s) => s.activeEndpoint);

export { useNetworkStore };
