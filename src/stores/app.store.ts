import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AppState {
  isOpenConnectWallet: boolean;

  setIsOpenConnectWallet: (isOpenConnectWallet: boolean) => void;
}

const init = {
  isOpenConnectWallet: false,
};

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...init,
      setIsOpenConnectWallet: (isOpenConnectWallet: boolean) =>
        set({ isOpenConnectWallet }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAppStore };
