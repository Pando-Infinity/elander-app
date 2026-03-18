/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  TraitAsset,
  TraitTypeConfig,
  RarityClassConfig,
  RarityPoolEnum,
  CollectionConfig,
  GeneratedNft,
  GenerationProgress,
  GenerationStatusEnum,
  IpfsUploadProgress,
  IpfsUploadResult,
  WorkerResultMessage,
  WorkerErrorMessage,
} from "@/models/nft-generation.model";
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_SELLER_FEE_BASIS_POINTS,
  DEFAULT_PREVIEW_COUNT,
  GENERATION_BATCH_SIZE,
  ZIP_CHUNK_SIZE,
  SUPPORTED_IMAGE_TYPES,
  IPFS_UPLOAD_BATCH_SIZE,
} from "@/const/nft-generation.const";
import {
  parseTraitFilename,
  selectTraitsForEdition,
  buildMetaplexMetadata,
  validateGenerationConfig,
  estimateMaxUniqueCombinations,
} from "@/utils/nft-generation.utils";
import type { IpfsProvider } from "@/services/ipfs/ipfs-provider";

let idCounter = 0;
function generateId(): string {
  return `${Date.now()}-${++idCounter}`;
}

const useNftGeneration = () => {
  // -- Trait types --
  const [traitTypes, setTraitTypes] = useState<TraitTypeConfig[]>([]);

  // -- Collection config --
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig>({
    name: "",
    symbol: "",
    description: "",
    externalUrl: "",
    sellerFeeBasisPoints: DEFAULT_SELLER_FEE_BASIS_POINTS,
    canvasWidth: DEFAULT_CANVAS_WIDTH,
    canvasHeight: DEFAULT_CANVAS_HEIGHT,
    creators: [],
  });

  // -- Rarity classes --
  const [rarityClasses, setRarityClasses] = useState<RarityClassConfig[]>([
    {
      name: RarityPoolEnum.COMMON,
      supply: 0,
      traitMix: {
        [RarityPoolEnum.COMMON]: 0,
        [RarityPoolEnum.RARE]: 0,
        [RarityPoolEnum.EPIC]: 0,
        [RarityPoolEnum.LEGENDARY]: 0,
      },
    },
  ]);

  // -- Preview --
  const [previewCount, setPreviewCount] = useState(DEFAULT_PREVIEW_COUNT);
  const [previewNfts, setPreviewNfts] = useState<GeneratedNft[]>([]);

  // -- Generation --
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    status: GenerationStatusEnum.IDLE,
  });
  const [generatedNfts, setGeneratedNfts] = useState<GeneratedNft[]>([]);
  const cancelledRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);

  // -- IPFS --
  const [ipfsUploadProgress, setIpfsUploadProgress] =
    useState<IpfsUploadProgress>({
      total: 0,
      completed: 0,
      phase: "idle",
    });

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // =========================================================================
  // Trait type management
  // =========================================================================

  const addTraitType = useCallback(
    (name: string) => {
      setTraitTypes((prev) => [
        ...prev,
        {
          id: generateId(),
          name,
          order: prev.length,
          assets: [],
        },
      ]);
    },
    []
  );

  const removeTraitType = useCallback((id: string) => {
    setTraitTypes((prev) =>
      prev
        .filter((tt) => tt.id !== id)
        .map((tt, idx) => ({ ...tt, order: idx }))
    );
  }, []);

  const renameTraitType = useCallback((id: string, name: string) => {
    setTraitTypes((prev) =>
      prev.map((tt) => (tt.id === id ? { ...tt, name } : tt))
    );
  }, []);

  const reorderTraitTypes = useCallback((orderedIds: string[]) => {
    setTraitTypes((prev) => {
      const map = new Map(prev.map((tt) => [tt.id, tt]));
      return orderedIds
        .map((id, idx) => {
          const tt = map.get(id);
          return tt ? { ...tt, order: idx } : null;
        })
        .filter(Boolean) as TraitTypeConfig[];
    });
  }, []);

  const uploadAssetsForTraitType = useCallback(
    async (
      traitTypeId: string,
      files: File[],
      rarityPool: RarityPoolEnum
    ) => {
      const newAssets: TraitAsset[] = [];

      for (const file of files) {
        if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) continue;

        const { name, weight } = parseTraitFilename(file.name);
        const imageBitmap = await createImageBitmap(file);

        newAssets.push({
          id: generateId(),
          name,
          file,
          imageBitmap,
          weight,
          traitType: traitTypeId,
          rarityPool,
        });
      }

      setTraitTypes((prev) =>
        prev.map((tt) =>
          tt.id === traitTypeId
            ? { ...tt, assets: [...tt.assets, ...newAssets] }
            : tt
        )
      );
    },
    []
  );

  const removeAsset = useCallback(
    (traitTypeId: string, assetId: string) => {
      setTraitTypes((prev) =>
        prev.map((tt) =>
          tt.id === traitTypeId
            ? { ...tt, assets: tt.assets.filter((a) => a.id !== assetId) }
            : tt
        )
      );
    },
    []
  );

  const updateAssetWeight = useCallback(
    (traitTypeId: string, assetId: string, weight: number) => {
      setTraitTypes((prev) =>
        prev.map((tt) =>
          tt.id === traitTypeId
            ? {
                ...tt,
                assets: tt.assets.map((a) =>
                  a.id === assetId ? { ...a, weight: Math.max(1, weight) } : a
                ),
              }
            : tt
        )
      );
    },
    []
  );

  // =========================================================================
  // Computed values
  // =========================================================================

  const totalSupply = rarityClasses.reduce((sum, rc) => sum + rc.supply, 0);

  const validationErrors = validateGenerationConfig(traitTypes, rarityClasses);

  const minPreviewCount = Math.max(rarityClasses.length, 1);

  // =========================================================================
  // Image compositing via Worker
  // =========================================================================

  const compositeImage = useCallback(
    (
      edition: number,
      layerBitmaps: ImageBitmap[]
    ): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL("../workers/nft-generation.worker.ts", import.meta.url)
          );
        }

        const handler = (e: MessageEvent) => {
          const msg = e.data as WorkerResultMessage | WorkerErrorMessage;
          if (msg.edition !== edition) return;

          workerRef.current?.removeEventListener("message", handler);

          if (msg.type === "result") {
            resolve(msg.imageBlob);
          } else {
            reject(new Error(msg.error));
          }
        };

        workerRef.current.addEventListener("message", handler);
        workerRef.current.postMessage({
          type: "generate",
          edition,
          layers: layerBitmaps,
          canvasWidth: collectionConfig.canvasWidth,
          canvasHeight: collectionConfig.canvasHeight,
        });
      });
    },
    [collectionConfig.canvasWidth, collectionConfig.canvasHeight]
  );

  // =========================================================================
  // Generate a single NFT
  // =========================================================================

  const generateSingleNft = useCallback(
    async (
      edition: number,
      rarityClass: RarityClassConfig,
      existingDnas: Set<string>
    ): Promise<GeneratedNft | null> => {
      const result = selectTraitsForEdition(
        traitTypes,
        rarityClass,
        existingDnas
      );
      if (!result) return null;

      const { traits, dna } = result;

      // Gather ImageBitmaps in layer order
      const sortedTraitTypes = [...traitTypes].sort(
        (a, b) => a.order - b.order
      );
      const layerBitmaps: ImageBitmap[] = [];

      for (const tt of sortedTraitTypes) {
        const selectedTrait = traits.find((t) => t.traitType === tt.name);
        if (!selectedTrait) continue;

        const asset = tt.assets.find((a) => a.id === selectedTrait.assetId);
        if (!asset) continue;

        layerBitmaps.push(asset.imageBitmap);
      }

      const imageBlob = await compositeImage(edition, layerBitmaps);

      const nft: GeneratedNft = {
        edition,
        dna,
        rarityClass: rarityClass.name,
        name: `${collectionConfig.name || "NFT"} #${edition}`,
        traits,
        imageBlob,
        metadata: {} as any,
      };

      nft.metadata = buildMetaplexMetadata(
        nft,
        collectionConfig,
        `images/${edition}.png`
      );

      return nft;
    },
    [traitTypes, collectionConfig, compositeImage]
  );

  // =========================================================================
  // Preview generation
  // =========================================================================

  const generatePreview = useCallback(async () => {
    const count = Math.max(previewCount, minPreviewCount);
    const dnaSet = new Set<string>();
    const nfts: GeneratedNft[] = [];

    // Ensure at least 1 per rarity class
    let edition = 1;
    for (const rc of rarityClasses) {
      const nft = await generateSingleNft(edition, rc, dnaSet);
      if (nft) {
        dnaSet.add(nft.dna);
        nfts.push(nft);
        edition++;
      }
    }

    // Fill remaining with random rarity classes proportional to supply
    const remaining = count - nfts.length;
    for (let i = 0; i < remaining; i++) {
      // Weighted random rarity class selection by supply
      const totalSup = rarityClasses.reduce((s, rc) => s + rc.supply, 0);
      let rand = Math.random() * totalSup;
      let selectedClass = rarityClasses[0];
      for (const rc of rarityClasses) {
        rand -= rc.supply;
        if (rand < 0) {
          selectedClass = rc;
          break;
        }
      }

      const nft = await generateSingleNft(edition, selectedClass, dnaSet);
      if (nft) {
        dnaSet.add(nft.dna);
        nfts.push(nft);
        edition++;
      }
    }

    setPreviewNfts(nfts);
    return nfts;
  }, [previewCount, minPreviewCount, rarityClasses, generateSingleNft]);

  // =========================================================================
  // Full collection generation
  // =========================================================================

  const generateCollection = useCallback(async () => {
    cancelledRef.current = false;

    const total = totalSupply;
    setProgress({
      total,
      completed: 0,
      failed: 0,
      status: GenerationStatusEnum.GENERATING,
    });

    const dnaSet = new Set<string>();
    const allNfts: GeneratedNft[] = [];

    // Build generation queue: edition numbers shuffled
    const editions: number[] = [];
    for (let i = 1; i <= total; i++) editions.push(i);
    // Shuffle
    for (let i = editions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [editions[i], editions[j]] = [editions[j], editions[i]];
    }

    let editionIdx = 0;

    for (const rc of rarityClasses) {
      for (let generated = 0; generated < rc.supply; ) {
        if (cancelledRef.current) {
          setProgress((p) => ({
            ...p,
            status: GenerationStatusEnum.CANCELLED,
          }));
          setGeneratedNfts(allNfts);
          return;
        }

        // Process a batch
        const batchSize = Math.min(
          GENERATION_BATCH_SIZE,
          rc.supply - generated
        );
        const batchPromises: Promise<GeneratedNft | null>[] = [];

        for (let b = 0; b < batchSize; b++) {
          const edition = editions[editionIdx + b];
          batchPromises.push(generateSingleNft(edition, rc, dnaSet));
        }

        const results = await Promise.all(batchPromises);

        for (const nft of results) {
          if (nft) {
            dnaSet.add(nft.dna);
            allNfts.push(nft);
            generated++;
          }
        }

        editionIdx += batchSize;

        setProgress((p) => ({
          ...p,
          completed: allNfts.length,
          currentEdition: allNfts[allNfts.length - 1]?.edition,
        }));

        // Yield to UI
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    setGeneratedNfts(allNfts);
    setProgress((p) => ({
      ...p,
      completed: allNfts.length,
      status: GenerationStatusEnum.COMPLETE,
    }));
  }, [totalSupply, rarityClasses, generateSingleNft]);

  const cancelGeneration = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  // =========================================================================
  // ZIP Download (chunked for large collections)
  // =========================================================================

  const buildZipChunk = useCallback(
    async (
      nfts: GeneratedNft[],
      includeCollectionMeta: boolean
    ): Promise<Blob> => {
      const zip = new JSZip();
      const imagesFolder = zip.folder("images")!;
      const metadataFolder = zip.folder("metadata")!;

      for (const nft of nfts) {
        imagesFolder.file(`${nft.edition}.png`, nft.imageBlob);
        metadataFolder.file(
          `${nft.edition}.json`,
          JSON.stringify(nft.metadata, null, 2)
        );
      }

      if (includeCollectionMeta) {
        // _metadata.json (all NFTs in this chunk)
        const allMetadata = nfts.map((n) => n.metadata);
        metadataFolder.file(
          "_metadata.json",
          JSON.stringify(allMetadata, null, 2)
        );

        // collection.json
        const collectionMeta = {
          name: collectionConfig.name,
          symbol: collectionConfig.symbol,
          description: collectionConfig.description,
          external_url: collectionConfig.externalUrl,
          seller_fee_basis_points: collectionConfig.sellerFeeBasisPoints,
          attributes: [],
          properties: {
            creators: collectionConfig.creators,
            category: "image",
          },
        };
        metadataFolder.file(
          "collection.json",
          JSON.stringify(collectionMeta, null, 2)
        );
      }

      return zip.generateAsync({ type: "blob" });
    },
    [collectionConfig]
  );

  const downloadAsZip = useCallback(async () => {
    const nfts = generatedNfts;
    if (nfts.length === 0) return;

    const name = collectionConfig.name || "collection";

    if (nfts.length <= ZIP_CHUNK_SIZE) {
      const blob = await buildZipChunk(nfts, true);
      saveAs(blob, `${name}.zip`);
    } else {
      // Chunked download
      const sortedNfts = [...nfts].sort((a, b) => a.edition - b.edition);
      const totalChunks = Math.ceil(sortedNfts.length / ZIP_CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * ZIP_CHUNK_SIZE;
        const end = Math.min(start + ZIP_CHUNK_SIZE, sortedNfts.length);
        const chunk = sortedNfts.slice(start, end);
        const isFirst = i === 0;

        const blob = await buildZipChunk(chunk, isFirst);
        const startNum = String(start + 1).padStart(4, "0");
        const endNum = String(end).padStart(4, "0");
        saveAs(blob, `${name}_${startNum}-${endNum}.zip`);

        // Small delay between downloads to avoid browser blocking
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }, [generatedNfts, collectionConfig.name, buildZipChunk]);

  const downloadChunk = useCallback(
    async (chunkIndex: number) => {
      const nfts = [...generatedNfts].sort((a, b) => a.edition - b.edition);
      const start = chunkIndex * ZIP_CHUNK_SIZE;
      const end = Math.min(start + ZIP_CHUNK_SIZE, nfts.length);
      const chunk = nfts.slice(start, end);

      if (chunk.length === 0) return;

      const name = collectionConfig.name || "collection";
      const blob = await buildZipChunk(chunk, chunkIndex === 0);
      const startNum = String(start + 1).padStart(4, "0");
      const endNum = String(end).padStart(4, "0");
      saveAs(blob, `${name}_${startNum}-${endNum}.zip`);
    },
    [generatedNfts, collectionConfig.name, buildZipChunk]
  );

  // =========================================================================
  // IPFS Upload (range-based, two-phase)
  // =========================================================================

  const [ipfsResults, setIpfsResults] = useState<IpfsUploadResult[]>([]);

  /**
   * Upload a range of NFTs to IPFS in two phases:
   * Phase 1: Upload images → get image hashes
   * Phase 2: Rebuild metadata with real image URI (gateway/ipfs/hash) → upload metadata JSON
   *
   * @param provider - IPFS provider instance
   * @param startEdition - first edition to upload (inclusive)
   * @param endEdition - last edition to upload (inclusive)
   */
  const uploadToIpfs = useCallback(
    async (
      provider: IpfsProvider,
      startEdition: number,
      endEdition: number
    ) => {
      const nftsToUpload = generatedNfts.filter(
        (nft) => nft.edition >= startEdition && nft.edition <= endEdition
      );
      if (nftsToUpload.length === 0) return;

      const totalSteps = nftsToUpload.length * 2;

      // ---- Phase 1: Upload images ----
      setIpfsUploadProgress({
        total: totalSteps,
        completed: 0,
        phase: "images",
      });

      const imageHashes: Map<number, string> = new Map();

      for (let i = 0; i < nftsToUpload.length; i += IPFS_UPLOAD_BATCH_SIZE) {
        const batch = nftsToUpload.slice(i, i + IPFS_UPLOAD_BATCH_SIZE);
        const uploads = batch.map(async (nft) => {
          const hash = await provider.upload(
            nft.imageBlob,
            `${nft.edition}.png`
          );
          imageHashes.set(nft.edition, hash);
        });

        await Promise.all(uploads);
        setIpfsUploadProgress((p) => ({
          ...p,
          completed: imageHashes.size,
        }));
      }

      // ---- Phase 2: Build metadata with real image URI and upload ----
      setIpfsUploadProgress((p) => ({ ...p, phase: "metadata" }));

      const batchResults: IpfsUploadResult[] = [];
      let metadataUploaded = 0;

      for (let i = 0; i < nftsToUpload.length; i += IPFS_UPLOAD_BATCH_SIZE) {
        const batch = nftsToUpload.slice(i, i + IPFS_UPLOAD_BATCH_SIZE);
        const uploads = batch.map(async (nft) => {
          const imageHash = imageHashes.get(nft.edition)!;
          const imageUrl = provider.getIpfsUrl(imageHash);

          // Rebuild metadata with the real gateway image URL
          const metadata = buildMetaplexMetadata(nft, collectionConfig, imageUrl);

          // Also set the files URI to ipfs:// protocol for on-chain compatibility
          metadata.properties.files = [
            { uri: imageUrl, type: "image/png" },
          ];

          const metadataBlob = new Blob(
            [JSON.stringify(metadata, null, 2)],
            { type: "application/json" }
          );

          const metadataHash = await provider.upload(
            metadataBlob,
            `${nft.edition}.json`
          );
          const metadataUrl = provider.getIpfsUrl(metadataHash);

          metadataUploaded++;

          batchResults.push({
            edition: nft.edition,
            imageHash,
            imageUrl,
            metadataHash,
            metadataUrl,
          });
        });

        await Promise.all(uploads);
        setIpfsUploadProgress((p) => ({
          ...p,
          completed: nftsToUpload.length + metadataUploaded,
        }));
      }

      // Merge new results with existing ones (allow re-uploading ranges)
      setIpfsResults((prev) => {
        const map = new Map(prev.map((r) => [r.edition, r]));
        for (const r of batchResults) {
          map.set(r.edition, r);
        }
        return Array.from(map.values()).sort(
          (a, b) => a.edition - b.edition
        );
      });

      setIpfsUploadProgress({
        total: totalSteps,
        completed: totalSteps,
        phase: "done",
      });
    },
    [generatedNfts, collectionConfig]
  );

  // =========================================================================
  // Return
  // =========================================================================

  return {
    // Trait types
    traitTypes,
    addTraitType,
    removeTraitType,
    renameTraitType,
    reorderTraitTypes,
    uploadAssetsForTraitType,
    removeAsset,
    updateAssetWeight,

    // Config
    collectionConfig,
    setCollectionConfig,
    rarityClasses,
    setRarityClasses,

    // Preview
    previewCount,
    setPreviewCount,
    previewNfts,
    generatePreview,
    minPreviewCount,

    // Generation
    generateCollection,
    cancelGeneration,
    progress,
    generatedNfts,

    // Export
    downloadAsZip,
    downloadChunk,

    // IPFS
    uploadToIpfs,
    ipfsUploadProgress,
    ipfsResults,

    // Computed
    totalSupply,
    validationErrors,
  };
};

export default useNftGeneration;
