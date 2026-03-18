// ============================================================================
// NFT Collection Generation - Models & Types
// ============================================================================

export enum RarityPoolEnum {
  COMMON = "Common",
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary",
}

export enum GenerationStatusEnum {
  IDLE = "IDLE",
  GENERATING = "GENERATING",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR",
  CANCELLED = "CANCELLED",
}

export enum WizardStepEnum {
  UPLOAD_LAYERS = 0,
  CONFIGURE_COLLECTION = 1,
  CONFIGURE_RARITY = 2,
  GENERATE = 3,
  DOWNLOAD = 4,
  UPLOAD_IPFS = 5,
}

export enum IpfsProviderEnum {
  PINATA = "pinata",
}

// A single trait image asset uploaded by the user
export interface TraitAsset {
  id: string;
  name: string;
  file: File;
  imageBitmap: ImageBitmap;
  weight: number;
  traitType: string;
  rarityPool: RarityPoolEnum;
}

// A trait type (layer) definition
export interface TraitTypeConfig {
  id: string;
  name: string;
  order: number;
  assets: TraitAsset[];
}

// Rarity class configuration
export interface RarityClassConfig {
  name: RarityPoolEnum;
  supply: number;
  traitMix: Record<RarityPoolEnum, number>; // { Common: 4, Rare: 3 } = 4 from Common pool + 3 from Rare pool
}

// Collection-level configuration
export interface CollectionConfig {
  name: string;
  symbol: string;
  description: string;
  externalUrl: string;
  sellerFeeBasisPoints: number;
  canvasWidth: number;
  canvasHeight: number;
  creators: CreatorEntry[];
}

export interface CreatorEntry {
  address: string;
  share: number;
}

// Selected trait for a single layer of a generated NFT
export interface SelectedTrait {
  traitType: string;
  traitName: string;
  assetId: string;
  rarityPool: RarityPoolEnum;
}

// A single generated NFT
export interface GeneratedNft {
  edition: number;
  dna: string;
  rarityClass: RarityPoolEnum;
  name: string;
  traits: SelectedTrait[];
  imageBlob: Blob;
  metadata: MetaplexMetadata;
}

// Metaplex-standard metadata
export interface MetaplexMetadata {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  external_url: string;
  attributes: MetaplexAttribute[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
    creators: { address: string; share: number }[];
  };
}

export interface MetaplexAttribute {
  trait_type: string;
  value: string;
}

// Generation progress
export interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  status: GenerationStatusEnum;
  currentEdition?: number;
}

// IPFS upload progress
export interface IpfsUploadProgress {
  total: number;
  completed: number;
  phase: "idle" | "images" | "metadata" | "done";
  error?: string;
}

// Per-NFT IPFS upload result
export interface IpfsUploadResult {
  edition: number;
  imageHash: string;
  imageUrl: string;      // gateway + /ipfs/ + imageHash
  metadataHash?: string;
  metadataUrl?: string;  // gateway + /ipfs/ + metadataHash
}

// Worker message types
export interface WorkerGenerateMessage {
  type: "generate";
  edition: number;
  layers: ImageBitmap[];
  canvasWidth: number;
  canvasHeight: number;
}

export interface WorkerResultMessage {
  type: "result";
  edition: number;
  imageBlob: Blob;
}

export interface WorkerErrorMessage {
  type: "error";
  edition: number;
  error: string;
}

export type WorkerMessage =
  | WorkerGenerateMessage
  | WorkerResultMessage
  | WorkerErrorMessage;
