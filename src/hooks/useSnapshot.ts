/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SnapshotDataInterface,
  SnapshotStatsInterface,
} from "@/models/app.model";
import { BlockchainUtils } from "@/utils";
import { wait } from "@/utils/common.utils";
import { ApiConstant, AppConstant } from "@/const";

interface SolanaRpcParams {
  groupKey: string;
  groupValue: string;
  page: number;
  limit: number;
}

interface NFTGrouping {
  group_key: string;
  collection_metadata?: {
    name?: string;
  };
}

interface NFTContent {
  metadata?: {
    name?: string;
    symbol?: string;
  };
}

interface NFTAsset {
  grouping?: NFTGrouping[];
  content?: NFTContent;
}

interface MagicEdenCollection {
  contract: string;
  collectionId: string;
}

interface CollectionHolderStats {
  totalSupply?: number;
  uniqueHolders?: number;
}

const useSnapshot = () => {
  const fetchNFTAssets = async (
    rpc: string,
    collectionAddress: string
  ): Promise<NFTAsset | null> => {
    try {
      const response = await fetch(rpc, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "my-request-id",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: collectionAddress,
            page: 1,
            limit: 1,
          } as SolanaRpcParams,
        }),
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status}`);
      }

      const { result } = await response.json();
      return result.items?.[0] || null;
    } catch (error) {
      console.error("Error fetching NFT assets:", error);
      return null;
    }
  };

  const extractCollectionMetadata = (
    nft: NFTAsset
  ): {
    collectionName: string;
    collectionSymbol: string;
  } => {
    const collectionGrouping = nft.grouping?.find(
      (g) => g.group_key === "collection"
    );

    const collectionName =
      collectionGrouping?.collection_metadata?.name ||
      nft.content?.metadata?.name?.replace(/#\d+/g, "").trim() ||
      "";

    const collectionSymbol = nft.content?.metadata?.symbol || "";

    return { collectionName, collectionSymbol };
  };

  const searchMagicEdenCollection = async (
    searchPattern: string,
    collectionAddress: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(ApiConstant.MAGIC_EDEN_SEARCH_API, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...ApiConstant.MAGIC_EDEN_HEADERS,
        },
        body: JSON.stringify({
          pattern: searchPattern,
          chains: ["solana"],
          limit: AppConstant.MAGIC_EDEN_SEARCH_LIMIT,
          offset: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Magic Eden search failed: ${response.status}`);
      }

      const data = await response.json();
      const collection = data.collectionsV2?.find(
        (item: MagicEdenCollection) =>
          String(item.contract) === collectionAddress
      );

      return collection?.collectionId || null;
    } catch (error) {
      console.error("Error searching Magic Eden collection:", error);
      return null;
    }
  };

  const fetchHolderStats = async (
    collectionId: string
  ): Promise<{ total: number; owner: number }> => {
    try {
      const response = await fetch(
        `${ApiConstant.MAGIC_EDEN_HOLDER_STATS_BASE}/${collectionId}`,
        {
          headers: {
            accept: "application/json",
            ...ApiConstant.MAGIC_EDEN_HEADERS,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Holder stats request failed: ${response.status}`);
      }

      const data = await response.json();
      const result: CollectionHolderStats = data.results || {};

      return {
        total: result.totalSupply || 0,
        owner: result.uniqueHolders || 0,
      };
    } catch (error) {
      console.error("Error fetching holder stats:", error);
      return { total: 0, owner: 0 };
    }
  };

  const getCollectionInfo = async (
    collectionAddress: string
  ): Promise<SnapshotStatsInterface | null> => {
    try {
      const rpc = BlockchainUtils.getSolanaRpcEndpoint();

      const firstNFT = await fetchNFTAssets(rpc, collectionAddress);
      if (!firstNFT) {
        return null;
      }

      const { collectionName, collectionSymbol } =
        extractCollectionMetadata(firstNFT);

      let snapshotData: SnapshotStatsInterface = {
        total: 0,
        owner: 0,
        collectionName,
        collectionSymbol,
      };

      const searchPattern = collectionName || collectionSymbol;
      if (!searchPattern) {
        return snapshotData;
      }

      const collectionId = await searchMagicEdenCollection(
        searchPattern,
        collectionAddress
      );

      if (!collectionId) {
        return snapshotData;
      }

      const holderStats = await fetchHolderStats(collectionId);
      snapshotData = {
        ...snapshotData,
        ...holderStats,
      };

      return snapshotData;
    } catch (error) {
      console.error("Error getting collection info:", error);
      return null;
    }
  };

  const snapshotByCollection = async (collectionAddress: string) => {
    let page = 1;
    const allAssets: any[] = [];
    let hasMorePages = true;
    let collectionName = "";

    try {
      const rpc = BlockchainUtils.getSolanaRpcEndpoint();
      while (hasMorePages) {
        const response = await fetch(rpc, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "nft-snapshot",
            method: "getAssetsByGroup",
            params: {
              groupKey: "collection",
              groupValue: collectionAddress,
              page: page,
              limit: AppConstant.DAS_API_PAGE_LIMIT,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { result, error } = await response.json();

        if (error) {
          throw new Error(`API error: ${error.message}`);
        }

        const holders = result.items.map((item: any) => ({
          nftAddress: item?.id || "",
          ownerAddress: item?.ownership?.owner || "",
          nftName: item.content?.metadata?.name || "Unknown",
          metadata: JSON.stringify({
            ...item.content?.metadata,
            uri: item.content?.json_uri || "",
            nftImage: item.content?.files[0].uri || "",
          }),
        }));

        if (!collectionName && result.items.length > 0) {
          collectionName =
            result.items[0]?.content?.metadata?.name?.split(/\s+/)[0];
        }

        allAssets.push(...holders);

        if (result.items.length < AppConstant.DAS_API_PAGE_LIMIT) {
          hasMorePages = false;
        } else {
          page++;
          await wait(AppConstant.SNAPSHOT_PAGE_WAIT_MS);
        }
      }

      const resultData = {
        collection: collectionAddress,
        collectionName: collectionName,
        totalHolders: allAssets.length,
        uniqueHolders: [...new Set(allAssets.map((item) => item.ownerAddress))]
          .length,
        holders: allAssets,
      };

      return resultData as SnapshotDataInterface;
    } catch (error: any) {
      console.error("❌ Error during collection snapshot:", error.message);
      throw error;
    }
  };

  return {
    getCollectionInfo,
    snapshotByCollection,
  };
};

export default useSnapshot;
