import {
  StakedNftInterface,
  TokenPriceInterface,
  InventoryNftInterface,
  WalletBalanceInterface,
  EarnedRewardInterface,
} from "@/models/app.model";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Whether the connected wallet may use locked features (Alchemist NFT held or staked, or a Seeker
// Genesis Token). "error" means a check failed and nothing found so far unlocks.
export type AccessStatus = "idle" | "checking" | "unlocked" | "locked" | "error";

export interface UserState {
  walletAddress: string | null;
  walletType: string | null;
  walletBalances: WalletBalanceInterface[] | null;
  tokenPriceFeeds: TokenPriceInterface[];
  allAlchemistNft: InventoryNftInterface[];
  stakedNfts: StakedNftInterface[];
  earnedReward: EarnedRewardInterface | null;
  connectSignature: string | null;
  accessStatus: AccessStatus;

  setWalletAddress: (walletAddress: string | null) => void;
  setWalletType: (walletType: string | null) => void;
  setWalletBalances: (walletBalances: WalletBalanceInterface[] | null) => void;
  setTokenPriceFeeds: (tokenPriceFeeds: TokenPriceInterface[]) => void;
  setAllAlchemistNft: (allAlchemistNft: InventoryNftInterface[]) => void;
  setStakedNfts: (stakedNfts: StakedNftInterface[]) => void;
  setEarnedReward: (earnedReward: EarnedRewardInterface | null) => void;
  setConnectSignature: (connectSignature: string | null) => void;
  setAccessStatus: (accessStatus: AccessStatus) => void;

  resetUserData: () => void;
  logout: () => void;
}

const init = {
  walletAddress: null,
  walletType: null,
  walletBalances: null,
  tokenPriceFeeds: [],
  allAlchemistNft: [],
  stakedNfts: [],
  earnedReward: null,
  connectSignature: null,
  accessStatus: "idle" as AccessStatus,
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

      setEarnedReward: (earnedReward) => {
        set({ earnedReward });
      },
      setConnectSignature: (connectSignature) => {
        set({ connectSignature });
      },
      setAccessStatus: (accessStatus) => {
        set({ accessStatus });
      },

      resetUserData: () => {
        set((state) => ({
          walletBalances: null,
          tokenPriceFeeds: [],
          allAlchemistNft: [],
          stakedNfts: [],
          earnedReward: null,
          accessStatus: "idle",
          // preserve wallet identity
          walletAddress: state.walletAddress,
          walletType: state.walletType,
          connectSignature: state.connectSignature,
        }));
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
      // Access is re-checked on every load, never trusted from storage.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ accessStatus, ...rest }) => rest,
      // v1 drops the access flags v0 stored (isHolderNft, isSeekerWallet).
      version: 1,
      migrate: (persisted) => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          isHolderNft,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          isSeekerWallet,
          ...rest
        } = (persisted ?? {}) as Record<string, unknown>;
        return rest as unknown as UserState;
      },
    }
  )
);

export { useUserStore };
