import { create } from "zustand";

export interface AppState {
  isOpenConnectWallet: boolean;

  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) => void;
}

const useAppStore = create<AppState>()((set) => ({
  isOpenConnectWallet: false,
  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) =>
    set({ isOpenConnectWallet }),
}));

export { useAppStore };
