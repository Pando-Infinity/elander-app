import { create } from "zustand";

export interface AppState {
  isOpenConnectWallet: boolean;
  // True when the active RPC serves devnet (built-in devnet, or a custom RPC whose genesis hash is
  // devnet's). Locked features are open on devnet for testing. null while a custom RPC's cluster
  // is being looked up (treated as not devnet).
  isDevnetCluster: boolean | null;

  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) => void;
  setIsDevnetCluster: (isDevnetCluster: boolean | null) => void;
}

const init = {
  isOpenConnectWallet: false,
  isDevnetCluster: null as boolean | null,
};

const useAppStore = create<AppState>()((set) => ({
  ...init,
  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) =>
    set({ isOpenConnectWallet }),
  setIsDevnetCluster: (isDevnetCluster) => set({ isDevnetCluster }),
}));

export { useAppStore };
