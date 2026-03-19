/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useCallback } from "react";
import {
  createCollection as mplCreateCollection,
  fetchCollection as mplFetchCollection,
  fetchAssetsByCollection,
  updateCollection as mplUpdateCollection,
  addCollectionPlugin as mplAddCollectionPlugin,
  updateCollectionPlugin as mplUpdateCollectionPlugin,
  removeCollectionPlugin as mplRemoveCollectionPlugin,
  create as mplCreateAsset,
  fetchAsset,
  burn as mplBurnAsset,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import useUmi from "./useUmi";
import { useToast } from "@/stores/toast.store";
import { getSolanaRpcEndpoint } from "@/utils/blockchain.utils";
import {
  ManagedCollection,
  CollectionPluginInfo,
  AssetInfo,
  MintItem,
  MintProgress,
  CreateCollectionParams,
  RoyaltiesConfig,
  SupportedPluginType,
} from "@/models/nft-collection-manager.model";
import {
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
  MINT_BATCH_DELAY_MS,
} from "@/const/nft-collection-manager.const";

const useNftCollectionManager = () => {
  const { umi, isReady } = useUmi();
  const toast = useToast();

  // State
  const [collectionAddress, setCollectionAddress] = useState<string | null>(
    null
  );
  const [collection, setCollection] = useState<ManagedCollection | null>(null);
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [mintItems, setMintItems] = useState<MintItem[]>([]);
  const [mintProgress, setMintProgress] = useState<MintProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    status: "idle",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTxPending, setIsTxPending] = useState(false);

  const cancelledRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────────

  const withComputeBudget = (instruction: any) => {
    return setComputeUnitLimit(umi, { units: DEFAULT_COMPUTE_UNITS })
      .add(
        setComputeUnitPrice(umi, {
          microLamports: DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
        })
      )
      .add(instruction);
  };

  const extractPlugins = (raw: any): CollectionPluginInfo[] => {
    const plugins: CollectionPluginInfo[] = [];
    // mpl-core fetched collections have plugin fields directly on the object
    const pluginTypes = [
      "royalties",
      "freezeDelegate",
      "permanentFreezeDelegate",
      "transferDelegate",
      "burnDelegate",
      "attributes",
      "updateDelegate",
    ];
    for (const pType of pluginTypes) {
      if (raw[pType]) {
        const plugin = raw[pType];
        plugins.push({
          type: pType.charAt(0).toUpperCase() + pType.slice(1),
          authority: plugin.authority,
          data: plugin,
        });
      }
    }
    return plugins;
  };

  const fetchOffchainMetadata = async (uri: string) => {
    try {
      const res = await fetch(uri);
      if (res.ok) return await res.json();
    } catch {
      // silently fail — offchain metadata is optional
    }
    return undefined;
  };

  // Fetch collection assets: DAS API first, GPA fallback
  const fetchCollectionAssets = async (
    umiInstance: typeof umi,
    collectionAddr: string
  ): Promise<AssetInfo[]> => {
    // Try DAS API (getAssetsByGroup) — works on Helius, Triton, QuickNode
    try {
      const rpcUrl = getSolanaRpcEndpoint();
      const dasResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "get-assets",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: collectionAddr,
            page: 1,
            limit: 1000,
          },
        }),
      });

      if (dasResponse.ok) {
        const dasResult = await dasResponse.json();
        if (dasResult.result?.items && dasResult.result.items.length > 0) {
          return dasResult.result.items.map((item: any) => ({
            address: item.id,
            name: item.content?.metadata?.name || item.id.slice(0, 8),
            uri: item.content?.json_uri || "",
            owner: item.ownership?.owner || "",
            imageUrl: item.content?.links?.image || item.content?.files?.[0]?.uri || undefined,
          }));
        }
      }
    } catch {
      // DAS not supported on this RPC — try GPA fallback
    }

    // GPA fallback (fetchAssetsByCollection from mpl-core)
    try {
      const pk = publicKey(collectionAddr);
      const fetchedAssets = await fetchAssetsByCollection(umiInstance, pk);
      return fetchedAssets.map((a: any) => ({
        address: a.publicKey.toString(),
        name: a.name,
        uri: a.uri,
        owner: a.owner.toString(),
      }));
    } catch {
      // GPA also failed — return empty
      return [];
    }
  };

  // ── Create Collection ─────────────────────────────────────────────

  const createCollection = useCallback(
    async (params: CreateCollectionParams): Promise<string | null> => {
      if (!isReady) {
        toast.error("Connect wallet first");
        return null;
      }

      setIsTxPending(true);
      try {
        // Build metadata URI
        let metadataUri = params.metadataUri;
        if (!metadataUri) {
          // Build a simple collection metadata JSON and use it as a data URI
          // In production, users should upload to IPFS first
          const metadata: Record<string, unknown> = {
            name: params.name,
            symbol: params.symbol,
            description: params.description,
            image: params.imageUri || "",
            external_url: params.externalUrl || "",
          };
          // Encode as data URI for simplicity (user can also provide an IPFS URI)
          metadataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
        }

        const collectionSigner = generateSigner(umi);

        // Build plugins array
        const plugins: any[] = [];
        if (params.royalties && params.royalties.creators.length > 0) {
          plugins.push({
            type: "Royalties",
            basisPoints: params.royalties.basisPoints,
            creators: params.royalties.creators.map((c) => ({
              address: publicKey(c.address),
              percentage: c.percentage,
            })),
            ruleSet: ruleSet("None"),
          });
        }

        const builder = mplCreateCollection(umi, {
          collection: collectionSigner,
          name: params.name,
          uri: metadataUri,
          ...(plugins.length > 0 ? { plugins } : {}),
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);

        const sig = base58.deserialize(result.signature)[0];
        const address = collectionSigner.publicKey.toString();

        toast.transactionSuccess(sig);
        setCollectionAddress(address);

        // Auto-load the new collection
        await loadCollection(address);

        return address;
      } catch (error: any) {
        const msg = error?.message || "Failed to create collection";
        toast.error("Create Collection Failed", msg);
        return null;
      } finally {
        setIsTxPending(false);
      }
    },
    [umi, isReady]
  );

  // ── Load Collection ───────────────────────────────────────────────

  const loadCollection = useCallback(
    async (address: string) => {
      setIsLoading(true);
      setCollectionAddress(address);
      try {
        const pk = publicKey(address);
        const raw = await mplFetchCollection(umi, pk);

        const plugins = extractPlugins(raw);
        const offchainMetadata = await fetchOffchainMetadata(raw.uri);

        const managed: ManagedCollection = {
          address,
          name: raw.name,
          uri: raw.uri,
          numMinted: raw.numMinted,
          currentSize: raw.currentSize,
          updateAuthority: raw.updateAuthority.toString(),
          plugins,
          offchainMetadata,
        };

        setCollection(managed);

        // Fetch assets — try DAS API first (works on Helius/Triton/QuickNode),
        // fall back to GPA query (fetchAssetsByCollection)
        const fetchedAssets = await fetchCollectionAssets(umi, address);
        setAssets(fetchedAssets);
      } catch (error: any) {
        toast.error(
          "Failed to load collection",
          error?.message || "Invalid address or collection not found"
        );
        setCollection(null);
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    },
    [umi]
  );

  // ── Update Collection ─────────────────────────────────────────────

  const updateCollection = useCallback(
    async (params: { name?: string; uri?: string }) => {
      if (!isReady || !collectionAddress) {
        toast.error("Connect wallet and load a collection first");
        return;
      }

      setIsTxPending(true);
      try {
        const builder = mplUpdateCollection(umi, {
          collection: publicKey(collectionAddress),
          ...(params.name !== undefined ? { name: params.name } : {}),
          ...(params.uri !== undefined ? { uri: params.uri } : {}),
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);
        const sig = base58.deserialize(result.signature)[0];
        toast.transactionSuccess(sig);

        // Refresh
        await loadCollection(collectionAddress);
      } catch (error: any) {
        toast.error(
          "Update Collection Failed",
          error?.message || "Transaction failed"
        );
      } finally {
        setIsTxPending(false);
      }
    },
    [umi, isReady, collectionAddress]
  );

  // ── Plugin Management ─────────────────────────────────────────────

  const addPlugin = useCallback(
    async (plugin: any) => {
      if (!isReady || !collectionAddress) return;

      setIsTxPending(true);
      try {
        const builder = mplAddCollectionPlugin(umi, {
          collection: publicKey(collectionAddress),
          plugin,
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);
        const sig = base58.deserialize(result.signature)[0];
        toast.transactionSuccess(sig);
        await loadCollection(collectionAddress);
      } catch (error: any) {
        toast.error("Add Plugin Failed", error?.message || "Transaction failed");
      } finally {
        setIsTxPending(false);
      }
    },
    [umi, isReady, collectionAddress]
  );

  const updatePlugin = useCallback(
    async (plugin: any) => {
      if (!isReady || !collectionAddress) return;

      setIsTxPending(true);
      try {
        const builder = mplUpdateCollectionPlugin(umi, {
          collection: publicKey(collectionAddress),
          plugin,
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);
        const sig = base58.deserialize(result.signature)[0];
        toast.transactionSuccess(sig);
        await loadCollection(collectionAddress);
      } catch (error: any) {
        toast.error(
          "Update Plugin Failed",
          error?.message || "Transaction failed"
        );
      } finally {
        setIsTxPending(false);
      }
    },
    [umi, isReady, collectionAddress]
  );

  const removePlugin = useCallback(
    async (pluginType: SupportedPluginType) => {
      if (!isReady || !collectionAddress) return;

      setIsTxPending(true);
      try {
        const builder = mplRemoveCollectionPlugin(umi, {
          collection: publicKey(collectionAddress),
          plugin: { type: pluginType },
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);
        const sig = base58.deserialize(result.signature)[0];
        toast.transactionSuccess(sig);
        await loadCollection(collectionAddress);
      } catch (error: any) {
        toast.error(
          "Remove Plugin Failed",
          error?.message || "Transaction failed"
        );
      } finally {
        setIsTxPending(false);
      }
    },
    [umi, isReady, collectionAddress]
  );

  // ── Batch Mint ────────────────────────────────────────────────────

  const setMintQueue = useCallback((items: MintItem[]) => {
    setMintItems(items);
    setMintProgress({
      total: items.length,
      completed: 0,
      failed: 0,
      status: "idle",
    });
  }, []);

  const mintBatch = useCallback(async () => {
    if (!isReady || !collectionAddress || mintItems.length === 0) {
      toast.error("Connect wallet, load a collection, and add items to mint");
      return;
    }

    cancelledRef.current = false;
    const total = mintItems.filter((i) => i.status === "pending").length;
    setMintProgress({ total, completed: 0, failed: 0, status: "minting" });

    let completed = 0;
    let failed = 0;

    for (let i = 0; i < mintItems.length; i++) {
      if (cancelledRef.current) {
        setMintProgress((prev) => ({ ...prev, status: "paused" }));
        return;
      }

      const item = mintItems[i];
      if (item.status !== "pending") continue;

      // Update status to minting
      setMintItems((prev) =>
        prev.map((m, idx) => (idx === i ? { ...m, status: "minting" } : m))
      );
      setMintProgress((prev) => ({
        ...prev,
        currentEdition: item.edition,
      }));

      try {
        const assetSigner = generateSigner(umi);

        const builder = mplCreateAsset(umi, {
          asset: assetSigner,
          collection: publicKey(collectionAddress),
          name: item.name,
          uri: item.metadataUri,
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);
        const sig = base58.deserialize(result.signature)[0];

        completed++;
        setMintItems((prev) =>
          prev.map((m, idx) =>
            idx === i
              ? {
                  ...m,
                  status: "confirmed",
                  txSignature: sig,
                  assetAddress: assetSigner.publicKey.toString(),
                }
              : m
          )
        );
        setMintProgress((prev) => ({ ...prev, completed }));
      } catch (error: any) {
        failed++;
        setMintItems((prev) =>
          prev.map((m, idx) =>
            idx === i
              ? {
                  ...m,
                  status: "failed",
                  error: error?.message || "Mint failed",
                }
              : m
          )
        );
        setMintProgress((prev) => ({ ...prev, failed }));
      }

      // Small delay between mints to avoid rate limiting
      if (i < mintItems.length - 1) {
        await new Promise((r) => setTimeout(r, MINT_BATCH_DELAY_MS));
      }
    }

    setMintProgress((prev) => ({
      ...prev,
      status: failed === total ? "error" : "complete",
    }));

    if (completed > 0) {
      toast.success(
        "Minting Complete",
        `${completed} NFTs minted${failed > 0 ? `, ${failed} failed` : ""}`
      );
      // Refresh assets
      await loadCollection(collectionAddress);
    }
  }, [umi, isReady, collectionAddress, mintItems]);

  const cancelMint = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  // ── Burn Asset ────────────────────────────────────────────────────

  const burnAsset = useCallback(
    async (assetAddress: string) => {
      if (!isReady) {
        toast.error("Connect wallet first");
        return;
      }

      setIsTxPending(true);
      try {
        const asset = await fetchAsset(umi, publicKey(assetAddress));

        const builder = mplBurnAsset(umi, {
          asset,
          ...(collectionAddress
            ? { collection: publicKey(collectionAddress) }
            : {}),
        });

        const result = await withComputeBudget(builder).sendAndConfirm(umi);
        const sig = base58.deserialize(result.signature)[0];
        toast.transactionSuccess(sig);

        // Remove from local assets list
        setAssets((prev) => prev.filter((a) => a.address !== assetAddress));
      } catch (error: any) {
        toast.error(
          "Burn Asset Failed",
          error?.message || "Transaction failed"
        );
      } finally {
        setIsTxPending(false);
      }
    },
    [umi, isReady, collectionAddress]
  );

  return {
    // State
    collectionAddress,
    collection,
    assets,
    mintItems,
    mintProgress,
    isLoading,
    isTxPending,
    isReady,
    // Collection operations
    createCollection,
    loadCollection,
    updateCollection,
    // Plugin operations
    addPlugin,
    updatePlugin,
    removePlugin,
    // Mint operations
    setMintQueue,
    mintBatch,
    cancelMint,
    // Asset operations
    burnAsset,
  };
};

export default useNftCollectionManager;
