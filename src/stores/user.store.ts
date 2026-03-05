import {
  StakedNftInterface,
  TokenPriceInterface,
  InventoryNftInterface,
  WalletBalanceInterface,
  EarnedRewardInterface,
} from "@/models/app.model";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserState {
  walletAddress: string | null;
  walletType: string | null;
  walletBalances: WalletBalanceInterface[] | null;
  tokenPriceFeeds: TokenPriceInterface[];
  allAlchemistNft: InventoryNftInterface[];
  stakedNfts: StakedNftInterface[];
  isHolderNft: boolean;
  earnedReward: EarnedRewardInterface | null;
  connectSignature: string | null;
  isSeekerWallet: boolean;

  setWalletAddress: (walletAddress: string | null) => void;
  setWalletType: (walletType: string | null) => void;
  setWalletBalances: (walletBalances: WalletBalanceInterface[] | null) => void;
  setTokenPriceFeeds: (tokenPriceFeeds: TokenPriceInterface[]) => void;
  setAllAlchemistNft: (allAlchemistNft: InventoryNftInterface[]) => void;
  setStakedNfts: (stakedNfts: StakedNftInterface[]) => void;
  setIsHolderNft: (isHolderNft: boolean) => void;
  setEarnedReward: (earnedReward: EarnedRewardInterface | null) => void;
  setConnectSignature: (connectSignature: string | null) => void;
  setIsSeekerWallet: (isSeekerWallet: boolean) => void;

  logout: () => void;
}

const init = {
  walletAddress: null,
  walletType: null,
  walletBalances: null,
  tokenPriceFeeds: [],
  allAlchemistNft: [],
  stakedNfts: [],
  isHolderNft: true,
  earnedReward: null,
  connectSignature: null,
  isSeekerWallet: false,
};

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...init,
      setWalletAddress: (walletAddress: string | null) =>
        set({ walletAddress }),
      setWalletType: (walletType: string | null) => set({ walletType }),
      setWalletBalances: (walletBalances) => {
        set({ walletBalances });
      },
      setTokenPriceFeeds: (tokenPriceFeeds) => {
        set({ tokenPriceFeeds });
      },
      setAllAlchemistNft: (allAlchemistNft) => {
        set({ allAlchemistNft });
      },
      setStakedNfts: (stakedNfts) => {
        set({ stakedNfts });
      },

      setIsHolderNft: (isHolderNft) => {
        set({ isHolderNft });
      },

      setEarnedReward: (earnedReward) => {
        set({ earnedReward });
      },
      setConnectSignature: (connectSignature) => {
        set({ connectSignature });
      },
      setIsSeekerWallet: (isSeekerWallet) => {
        set({ isSeekerWallet });
      },

      logout: () => {
        set({
          ...init,
        });
      },
    }),

    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { connectSignature, ...rest } = state;
        return rest;
      },
    }
  )
);

export { useUserStore };
