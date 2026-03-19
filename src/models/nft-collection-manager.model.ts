// ============================================================================
// NFT Collection Manager - Models & Types
// ============================================================================

export enum CollectionManagerTabEnum {
  OVERVIEW = "overview",
  MINT = "mint",
  MANAGE = "manage",
}

export type CollectionManagerMode = "manage" | "create";

// On-chain collection representation
export interface ManagedCollection {
  address: string;
  name: string;
  uri: string;
  numMinted: number;
  currentSize: number;
  updateAuthority: string;
  plugins: CollectionPluginInfo[];
  // Off-chain metadata (fetched from URI)
  offchainMetadata?: OffchainCollectionMetadata;
}

export interface OffchainCollectionMetadata {
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  external_url?: string;
  [key: string]: unknown;
}

export interface CollectionPluginInfo {
  type: string;
  authority?: { type: string; address?: string };
  data: Record<string, unknown>;
}

// Royalties config for creating/updating
export interface RoyaltiesConfig {
  basisPoints: number;
  creators: { address: string; percentage: number }[];
}

// Mint queue item
export interface MintItem {
  id: string;
  edition: number;
  name: string;
  metadataUri: string;
  status: "pending" | "minting" | "confirmed" | "failed";
  txSignature?: string;
  assetAddress?: string;
  error?: string;
}

// Batch mint progress
export interface MintProgress {
  total: number;
  completed: number;
  failed: number;
  status: "idle" | "minting" | "paused" | "complete" | "error";
  currentEdition?: number;
}

// Asset info for display
export interface AssetInfo {
  address: string;
  name: string;
  uri: string;
  owner: string;
  imageUrl?: string;
}

// Create collection form params
export interface CreateCollectionParams {
  name: string;
  symbol: string;
  description: string;
  externalUrl: string;
  imageUri: string;
  metadataUri?: string; // If provided, use directly instead of building metadata
  royalties?: RoyaltiesConfig;
}

// Plugin types supported in the UI
export type SupportedPluginType =
  | "Royalties"
  | "FreezeDelegate"
  | "PermanentFreezeDelegate"
  | "TransferDelegate"
  | "BurnDelegate"
  | "Attributes";
