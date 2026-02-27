export const KEY_TOKEN = "token";
export const COOKIE_EXPIRED_DATE = 7;
export const KEY_API_RESPONSE = "api-response";

export const NOT_HAVE_VALUE_LABEL = "- -";
export const NOT_AVAILABLE_VALUE = "N/A";

export const DEBOUNCE_TIME_IN_MILLISECOND = 100;
export const DELAY_TIME_REFRESH_BALANCE = 3000;
export const DELAY_TIME_REFRESH_TOKEN_PRICE_FEED = 120000;

export const SIZE_PAGINATION_DEFAULT = 5;
export const DEFAULT_PAGINATION = {
  page: 1,
  size: SIZE_PAGINATION_DEFAULT,
};
export const SORT_DIRECTION = {
  asc: 1,
  desc: -1,
};

export const BREAK_POINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
};

export const ALCHEMIST_COLLECTION_ADDRESS =
  "5dx7to2HPCj5WcgneSQCtNrRkTteh6jYx3VT9D3ZKMFY";

export const USER_REJECTED_MESSAGE = "User Rejected";

export const TRANSFER_FEE = 0.001;
export const BULK_TRANSFER_RENT_FEE = 0.0021;
export const PRIORITY_FEE = 0.0005;

export const STEALTH_SIGNING_MESSAGE =
  "E-Lander - Do NOT sign this message unless you are using E-Lander";

export const STEALTH_ADDRESS_DOMAIN = "E_LANDER_MASTER_VIEWING_KEY_SEED";

export const SGT_MINT_AUTHORITY =
  "GT2zuHVaZQYZSyQMgJPLzvkmyztfyXg2NJunqFp4p3A4";
export const SGT_METADATA_ADDRESS =
  "GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te";
export const SGT_GROUP_MINT_ADDRESS =
  "GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te";

// Solana token
export const SOL_NATIVE_MINT = "So11111111111111111111111111111111111111112";
export const SOL_DECIMALS = 9;
export const SOL_LAMPORTS_PER_SOL = 1_000_000_000;

// Blockchain
export const RPC_BATCH_SIZE = 100;
export const ANCHOR_DISCRIMINATOR_BYTES = 8;
export const KMAC256_BLOCK_SIZE = 136;
export const STEALTH_WALLET_ADDRESS_INDEX = 0;

// DAS / Magic Eden pagination
export const DAS_API_PAGE_LIMIT = 1000;
export const MAGIC_EDEN_SEARCH_LIMIT = 50;
export const GECKO_TERMINAL_BATCH_SIZE = 30;

// Timeouts & delays (ms)
export const TOKEN_URI_FETCH_TIMEOUT = 5000;
export const RATE_LIMIT_PAUSE_MS = 500;
export const SNAPSHOT_PAGE_WAIT_MS = 300;

// UI
export const WINDOW_INITIAL_WIDTH = 5000;

// External links
export const ELANDER_WEBSITE_URL = "https://e-lander.xyz";
export const MAGIC_EDEN_ALCHEMIST_URL =
  "https://magiceden.io/marketplace/elander_alchemist";
export const ELANDER_STAKE_ALCHEMIST_URL =
  "https://e-lander.xyz/stake?collection=Alchemist";
export const ELANDER_X_URL = "https://x.com/elander_nft";
