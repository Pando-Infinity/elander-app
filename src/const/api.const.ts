export const HEADER_DEFAULT = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "69420",
};

export const BASE_SOURCE = "/dapp-service/";

export const TIMEOUT = 30000;

// HTTP Status
export const STT_OK = 200;
export const STT_CREATED = 201;
export const STT_BAD_REQUEST = 400;
export const STT_UNAUTHORIZED = 401;
export const STT_FORBIDDEN = 403;
export const STT_NOT_FOUND = 404;
export const STT_INTERNAL_SERVER = 500;
export const STT_NOT_MODIFIED = 304;

// API Path
export const GECKO_TERMINAL_API = "https://api.geckoterminal.com/api/v2";

const BASE_NFT_ACCOUNT = "/edas-account/api/edas-nft";

export const GET_NFT_EARNED_REWARD = `${BASE_NFT_ACCOUNT}/earned-reward`;

// App origin
export const APP_ORIGIN_URL = "https://e-lander.xyz/";

// IPFS
export const IPFS_PROTOCOL = "ipfs://";
export const IPFS_GATEWAY_URL = "https://ipfs.io/ipfs/";

// Solana token metadata
export const SOLANA_TOKEN_LIST_URL =
  "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json";
export const SOL_LOGO_URL =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

// Magic Eden
export const MAGIC_EDEN_BASE_URL = "https://api-mainnet.magiceden.io";
export const MAGIC_EDEN_SEARCH_API = `${MAGIC_EDEN_BASE_URL}/v4/search/search`;
export const MAGIC_EDEN_HOLDER_STATS_BASE = `${MAGIC_EDEN_BASE_URL}/rpc/getCollectionHolderStats`;
export const MAGIC_EDEN_HEADERS = {
  origin: "https://magiceden.io",
  referer: "https://magiceden.io/",
};
