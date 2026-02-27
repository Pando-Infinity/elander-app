export enum SolanaSupportedTokenEnum {
  USDC = "USDC",
  SOL = "SOL",
  BSOL = "BSOL",
  MSOL = "mSOL",
  JITOSOL = "JITOSOL",
  INF = "INF",
  USDT = "USDT",
  AI16Z = "ai16z",
  EDAS = "EDAS",
  JUPSOL = "JupSOL",
  BPSOL = "bpSOL",
  USDStar = "USD*",
}

export enum ConnectNotificationStatusEnum {
  Authenticated = "authenticated",
  LoggedOut = "loggedOut",
  Expired = "expired",
}

export enum SolanaWalletsEnum {
  Backpack = "Backpack",
  Phantom = "Phantom",
  Solflare = "Solflare",
  Bitget = "Bitget Wallet",
  Salmon = "Salmon",
  Nightly = "Nightly",
  Telegram = "Telegram",
  Jupiter = "Jupiter",
  GateWallet = "Gate Wallet",
  OkxWallet = "Okx Wallet",
}

export interface GetNonceResponseInterface {
  walletAddress: string;
  nonce: string;
}

export interface PostLoginResponseInterface {
  accessToken: string;
  refreshToken?: string;
}

export interface PriceFeedsResponseInterface {
  id: string;
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

export enum PriceFeedProviderName {
  Pyth = "PYTH",
  Switchboard = "SWITCHBOARD",
}

export interface Asset {
  id: string;
  isCollateralAsset: boolean;
  isLendAsset: boolean;
  name: string;
  network: string;
  priceFeedAccountAddress: string;
  priceFeedId: string;
  symbol: string;
  tokenAddress: string;
  decimals: number;
  priceFeedProvider: {
    id: string;
    name: PriceFeedProviderName;
    type: string;
    url: string;
  };
  tokenType: TokenTypeEnum | null;
  tokenAddressHex?: string;
}

export enum TokenTypeEnum {
  SPL_TOKEN = "spl-token",
  NATIVE_MINT = "native-mint",
  SPL_TOKEN_2022 = "spl-token-2022",
}

export interface PriceFeedInterface {
  price: number;
  priceFeedIf: string;
}

export type MoveCallTargetType = `${string}::${string}::${string}`;

export interface LoginDataInterface {
  walletAddress: string;
  selectedChain: string;
  walletType?: string;
  publicKey?: string;
  isConnectLedger?: boolean;
}

export interface WalletBalanceInterface {
  type: TokenTypeEnum;
  symbol: string;
  name: string;
  mint: string;
  amount: number;
  decimals: number;
  logo: string;
}

export interface TokenPriceInterface {
  mint: string;
  symbol: string;
  price: number;
  priceUsd: string;
}

export interface GeckoTerminalPriceResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      token_prices: {
        [key: string]: string;
      };
    };
  };
}

export interface InventoryNftInterface {
  name: string;
  urlImage: string;
  mint: string;
  description: string;
  symbol: string;
}

export interface StakedNftInterface {
  staker: string;
  name: string;
  urlImage: string;
  mint: string;
  description: string;
  symbol: string;
  collectionAddress: string;
  stakedAt: string;
}

export interface EarnedRewardInterface {
  totalPoint: number;
  boostedPoint: number;
  avgBoostRate: number;
}

export interface BulkTransferInterface extends WalletBalanceInterface {
  transferAmount: number;
}

export interface SnapshotStatsInterface {
  total: number;
  owner: number;
  collectionName?: string;
  collectionSymbol?: string;
}

export interface SnapshotDataInterface {
  collection: string;
  collectionName: string;
  totalHolders: number;
  uniqueHolders: number;
  holders: {
    nftAddress: string;
    ownerAddress: string;
    nftName: string;
    metadata: string;
  }[];
}
