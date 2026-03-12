import { create } from "zustand";

export interface AppState {
  isOpenConnectWallet: boolean;

  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) => void;
}

const init = {
  isOpenConnectWallet: false,
};

const useAppStore = create<AppState>()((set) => ({
  ...init,
  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) =>
    set({ isOpenConnectWallet }),
}));

export { useAppStore };
