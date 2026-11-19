import { create } from "zustand";

export interface AppState {
  isOpenConnectWallet: boolean;
  // True when the active RPC serves devnet (built-in devnet, or a custom RPC whose genesis hash is
  // devnet's). Locked features are open on devnet for testing.
  isDevnetCluster: boolean;

  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) => void;
  setIsDevnetCluster: (isDevnetCluster: boolean) => void;
}

const init = {
  isOpenConnectWallet: false,
  isDevnetCluster: false,
};

const useAppStore = create<AppState>()((set) => ({
  ...init,
  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) =>
    set({ isOpenConnectWallet }),
  setIsDevnetCluster: (isDevnetCluster: boolean) => set({ isDevnetCluster }),
}));

export { useAppStore };
