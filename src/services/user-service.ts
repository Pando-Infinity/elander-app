/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  TokenTypeEnum,
  StakedNftInterface,
  TokenPriceInterface,
  InventoryNftInterface,
  EarnedRewardInterface,
  WalletBalanceInterface,
  GeckoTerminalPriceResponse,
} from "@/models/app.model";

import {
  getTokenMetadata,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "spl-token-0.4.1";

import { ApiResponse } from "apisauce";
import { createDappServices } from "./config";
import { ApiConstant, AppConstant } from "@/const";
import { useUserStore } from "@/stores/user.store";
import { Metaplex } from "@metaplex-foundation/js";
import { BlockchainUtils, CommonUtils } from "@/utils";
import { Connection, PublicKey } from "@solana/web3.js";
import { convertIpfsToHttp, retry } from "@/utils/common.utils";
import { BaseResponseData } from "@/models/common.model";
import { EnsofiSvmNftStaking } from "./ensofi_svm_nft_staking";

import * as anchor from "@coral-xyz/anchor";

import solanaNftStakingJson from "./ensofi_svm_nft_staking.json";

const solanaStakingStr = JSON.stringify(solanaNftStakingJson);
const solanaStakingJsonObj = JSON.parse(solanaStakingStr);

class UserService {
  private _tokenRegistryCache: Map<string, any> | null = null;
  private _tokenRegistryCacheTime = 0;
  private static REGISTRY_TTL_MS = 5 * 60 * 1000; // 5 minutes

  async getAllTokenBalances(walletAddress: string) {
    const { setWalletBalances } = useUserStore.getState();
    const publicKey = new PublicKey(walletAddress);
    const allBalances = [];
    try {
      const connection = await BlockchainUtils.getConnection();
      const metaplex = Metaplex.make(connection);

      // get native balance
      const solBalance = await connection.getBalance(publicKey);
      allBalances.push({
        type: TokenTypeEnum.NATIVE_MINT,
        symbol: "SOL",
        name: "Solana",
        mint: AppConstant.SOL_NATIVE_MINT,
        amount: solBalance / AppConstant.SOL_LAMPORTS_PER_SOL,
        decimals: AppConstant.SOL_DECIMALS,
        logo: ApiConstant.SOL_LOGO_URL,
      });

      // get spl token balance
      const splTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const tokenRegistry = await this.loadTokenRegistry();
      const splTokenPromises = splTokenAccounts.value
        .filter(({ account }) => {
          const amount = account.data.parsed.info.tokenAmount.uiAmount;
          return amount && amount > 0;
        })
        .map(async ({ account, pubkey }) => {
          const parsedInfo = account.data.parsed.info;
          const tokenData = await this.getTokenMetadataFromMetaplex(
            parsedInfo.mint,
            metaplex,
            connection,
            tokenRegistry
          );
          return {
            type: TokenTypeEnum.SPL_TOKEN,
            symbol: tokenData.symbol,
            name: tokenData.name,
            mint: parsedInfo.mint,
            amount: parsedInfo.tokenAmount.uiAmount,
            decimals: parsedInfo.tokenAmount.decimals,
            tokenAccount: pubkey.toString(),
            logo: tokenData.logo,
          };
        });

      const splResults = await Promise.allSettled(splTokenPromises);
      for (const result of splResults) {
        if (result.status === "fulfilled") {
          allBalances.push(result.value);
        }
      }

      // get token 2022 balance
      const token2022Accounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_2022_PROGRAM_ID }
      );
      for (const { account, pubkey } of token2022Accounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = parsedInfo.tokenAmount.uiAmount;
        const decimals = parsedInfo.tokenAmount.decimals;

        if (amount && amount > 0) {
          const tokenData = await getTokenMetadata(
            connection,
            new PublicKey(mint)
          );

          let logo = "";

          if (tokenData?.uri) {
            const uriHttp = convertIpfsToHttp(tokenData?.uri);

            const response = await fetch(uriHttp);
            const data = await response.json();

            logo = convertIpfsToHttp(data.image);
          }

          allBalances.push({
            type: TokenTypeEnum.SPL_TOKEN_2022,
            symbol: tokenData?.symbol,
            name: tokenData?.name,
            mint: mint,
            amount: amount,
            decimals: decimals,
            tokenAccount: pubkey.toString(),
            logo: logo,
          });
        }
      }
      setWalletBalances(allBalances);
      return allBalances;
    } catch (error) {
      console.error("Error fetching balances:", error);
      setWalletBalances(null);
      throw error;
    }
  }

  async getTokenMetadataFromMetaplex(
    mintAddress: string,
    metaplex: Metaplex,
    connection: Connection,
    tokenRegistry: Map<string, any>
  ) {
    const tokenInfo = tokenRegistry.get(mintAddress);

    const tokenData = {
      name: tokenInfo?.name,
      symbol: tokenInfo?.symbol || mintAddress.slice(0, 4) + "...",
      logo: tokenInfo?.logoURI || tokenInfo?.logo || "",
      description: null,
    };

    try {
      const mintPublicKey = new PublicKey(mintAddress);

      const metadataAccount = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: mintPublicKey });

      const metadataAccountInfo = await connection.getAccountInfo(
        metadataAccount
      );

      if (metadataAccountInfo) {
        try {
          const metadata = await metaplex.nfts().findByMint({
            mintAddress: mintPublicKey,
          });

          tokenData.name = metadata.name || tokenData.name;
          tokenData.symbol = metadata.symbol || tokenData.symbol;

          if (metadata.json?.image) {
            tokenData.logo = metadata.json.image;
          } else if (metadata.uri && !tokenData.logo) {
            try {
              const response = await retry(
                async () => {
                  const res = await fetch(metadata.uri, {
                    signal: AbortSignal.timeout(
                      AppConstant.TOKEN_URI_FETCH_TIMEOUT
                    ),
                  });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  return res;
                },
                2000,
                2
              );

              const contentType = response.headers.get("content-type") || "";
              if (contentType.startsWith("image/")) {
                tokenData.logo = metadata.uri;
              } else {
                const json = await response.json();
                tokenData.logo = json.image || tokenData.logo;
              }
            } catch (e) {
              console.log(`Could not fetch URI metadata for ${mintAddress}`);
            }
          }
        } catch (metaError: any) {
          console.log(
            `Error parsing metadata for ${mintAddress}:`,
            metaError.message
          );
        }
      } else {
        console.log(`No metadata account found for ${mintAddress}`);
      }
    } catch (error: any) {
      console.log(`Error fetching metadata for ${mintAddress}:`, error.message);
    }

    return tokenData;
  }

  async loadTokenRegistry() {
    const now = Date.now();
    if (
      this._tokenRegistryCache &&
      now - this._tokenRegistryCacheTime < UserService.REGISTRY_TTL_MS
    ) {
      return this._tokenRegistryCache;
    }

    try {
      const response = await fetch(ApiConstant.SOLANA_TOKEN_LIST_URL);
      const data = await response.json();

      const registry = new Map();
      data.tokens.forEach((token: any) => {
        registry.set(token.address, token);
      });

      this._tokenRegistryCache = registry;
      this._tokenRegistryCacheTime = now;

      return registry;
    } catch (error) {
      console.error("Error loading token registry:", error);
      return this._tokenRegistryCache || new Map();
    }
  }

  async getTokenPriceFeedsByGecko(
    walletBalances: WalletBalanceInterface[]
  ): Promise<Map<string, TokenPriceInterface>> {
    const network = "solana";
    const priceMap = new Map<string, TokenPriceInterface>();

    const mintAddresses = walletBalances.map((balance) => balance.mint);

    if (mintAddresses.length === 0) {
      return priceMap;
    }

    try {
      const addressesParam = mintAddresses.join(",");

      const url = `${ApiConstant.GECKO_TERMINAL_API}/simple/networks/${network}/token_price/${addressesParam}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`GeckoTerminal API error: ${response.status}`);
      }

      const data: GeckoTerminalPriceResponse = await response.json();

      const tokenPrices = data.data.attributes.token_prices;

      Object.entries(tokenPrices).forEach(([mint, priceUsd]) => {
        const balance = walletBalances.find((b) => b.mint === mint);

        if (balance && priceUsd) {
          priceMap.set(mint, {
            mint: mint,
            symbol: balance.symbol,
            price: parseFloat(priceUsd),
            priceUsd: priceUsd,
          });
        }
      });

      return priceMap;
    } catch (error) {
      console.error("Error fetching token prices:", error);
      return priceMap;
    }
  }

  async getTokenPriceFeedsBatch(
    walletBalances: WalletBalanceInterface[],
    batchSize: number = AppConstant.GECKO_TERMINAL_BATCH_SIZE
  ): Promise<Map<string, TokenPriceInterface>> {
    const allPrices = new Map<string, TokenPriceInterface>();

    for (let i = 0; i < walletBalances.length; i += batchSize) {
      const batch = walletBalances.slice(i, i + batchSize);

      try {
        const batchPrices = await this.getTokenPriceFeedsByGecko(batch);

        batchPrices.forEach((value, key) => {
          allPrices.set(key, value);
        });

        if (i + batchSize < walletBalances.length) {
          await new Promise((resolve) => setTimeout(resolve, AppConstant.RATE_LIMIT_PAUSE_MS));
        }
      } catch (error) {
        console.error(`Error fetching batch ${i / batchSize + 1}:`, error);
      }
    }

    return allPrices;
  }

  async getTokenPriceFeeds(walletBalances: WalletBalanceInterface[]) {
    const { setTokenPriceFeeds } = useUserStore.getState();
    try {
      const prices = await this.getTokenPriceFeedsBatch(walletBalances);

      const balancesWithPrices = walletBalances.map((balance) => {
        const priceData = prices.get(balance.mint);

        return {
          symbol: balance.symbol,
          mint: balance.mint,
          price: priceData?.price || 0,
          priceUsd: priceData?.priceUsd || "0",
        };
      });

      setTokenPriceFeeds(balancesWithPrices);

      return balancesWithPrices;
    } catch (error) {
      console.error("Error getting wallet balances with prices:", error);
      setTokenPriceFeeds([]);
      throw error;
    }
  }

  async getAllAlchemistNft(walletAddress: string) {
    const { setAllAlchemistNft } = useUserStore.getState();
    const allNft: InventoryNftInterface[] = [];

    try {
      const rpcUrl = BlockchainUtils.getSolanaRpcEndpoint();

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "alchemist-nfts",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: AppConstant.DAS_API_PAGE_LIMIT,
            displayOptions: {
              showCollectionMetadata: true,
              showUnverifiedCollections: false,
            },
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("DAS API Error:", data.error);
        throw new Error(data.error.message);
      }

      const result = data.result;

      if (result?.items && result.items.length > 0) {
        for (const item of result.items) {
          const collectionGroup = item.grouping?.find(
            (g: any) => g.group_key === "collection"
          );

          if (
            collectionGroup?.group_value ===
            AppConstant.ALCHEMIST_COLLECTION_ADDRESS
          ) {
            let urlImage = "";
            if (item.content?.links?.image) {
              urlImage = item.content.links.image;
            } else if (item.content?.files?.[0]?.uri) {
              urlImage = item.content.files[0].uri.replace(
                ApiConstant.IPFS_PROTOCOL,
                ApiConstant.IPFS_GATEWAY_URL
              );
            }

            allNft.push({
              name: item.content?.metadata?.name || "",
              urlImage,
              mint: item.id,
              description: item.content?.metadata?.description || "",
              symbol: item.content?.metadata?.symbol || "",
            });
          }
        }
      }

      setAllAlchemistNft(allNft);
      return allNft;
    } catch (error) {
      console.error("Error fetching Alchemist NFTs:", error);
      setAllAlchemistNft([]);
      return [];
    }
  }

  async getStakedNfts(walletAddress: string) {
    const { setStakedNfts } = useUserStore.getState();
    const allNft: StakedNftInterface[] = [];

    try {
      if (!walletAddress) {
        return allNft;
      }

      const rpcUrl = BlockchainUtils.getSolanaRpcEndpoint();
      const connection = await BlockchainUtils.getConnection();
      const program = getProgram(new anchor.web3.Connection(rpcUrl));

      const staker = new PublicKey(walletAddress);
      const DISCRIMINATOR_BYTES = AppConstant.ANCHOR_DISCRIMINATOR_BYTES;

      const accounts = await connection.getParsedProgramAccounts(
        program.programId,
        {
          filters: [
            {
              memcmp: {
                offset: DISCRIMINATOR_BYTES,
                bytes: staker.toBase58(),
              },
            },
          ],
        }
      );

      if (accounts.length === 0) {
        setStakedNfts([]);
        return allNft;
      }

      const stakeRecords = accounts.map((account) => {
        return program.coder.accounts.decode(
          "stakeRecord",
          account.account.data as Buffer
        );
      });

      const mintAddresses = stakeRecords.map((record) =>
        record.nftMint.toBase58()
      );

      const BATCH_SIZE = AppConstant.RPC_BATCH_SIZE;
      const allAssets = [];

      for (let i = 0; i < mintAddresses.length; i += BATCH_SIZE) {
        const batch = mintAddresses.slice(i, i + BATCH_SIZE);

        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: `staked-nfts-batch-${i}`,
            method: "getAssetBatch",
            params: {
              ids: batch,
            },
          }),
        });

        const data = await response.json();

        if (data.error) {
          console.error("DAS API Error:", data.error);
          continue;
        }

        if (data.result) {
          allAssets.push(...data.result);
        }
      }

      for (let i = 0; i < stakeRecords.length; i++) {
        const stakeRecord = stakeRecords[i];
        const mintAddress = mintAddresses[i];
        const asset = allAssets.find((a: any) => a?.id === mintAddress);

        if (!asset) {
          console.log(`Asset not found for mint: ${mintAddress}`);
          continue;
        }

        try {
          let urlImage = "";
          if (asset.content?.links?.image) {
            urlImage = asset.content.links.image;
          } else if (asset.content?.files?.[0]?.uri) {
            urlImage = asset.content.files[0].uri.replace(
              ApiConstant.IPFS_PROTOCOL,
              ApiConstant.IPFS_GATEWAY_URL
            );
          } else if (asset.content?.json_uri) {
            try {
              const metadataResponse = await fetch(asset.content.json_uri);
              if (metadataResponse.ok) {
                const metadata = await metadataResponse.json();
                urlImage =
                  metadata?.image?.replace(
                    ApiConstant.IPFS_PROTOCOL,
                    ApiConstant.IPFS_GATEWAY_URL
                  ) || "";
              }
            } catch (e) {
              console.log(`Failed to fetch metadata for ${mintAddress}`);
            }
          }

          allNft.push({
            staker: stakeRecord.staker.toBase58(),
            name: asset.content?.metadata?.name || "",
            urlImage,
            mint: mintAddress,
            description: asset.content?.metadata?.description || "",
            symbol: asset.content?.metadata?.symbol || "",
            collectionAddress: stakeRecord.collection.toBase58(),
            stakedAt: String(new Date(stakeRecord.stakedAt.toNumber() * 1000)),
          });
        } catch (error) {
          console.log(`Error processing NFT ${mintAddress}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error("Error in handleGetStakedNfts:", error);
      setStakedNfts([]);
    }

    setStakedNfts(allNft);

    return allNft;
  }

  async getEarnedReward(walletAddress: string) {
    const { setEarnedReward } = useUserStore.getState();

    try {
      const collectionName = "Alchemist";
      const chain = "SOLANA";
      const response: ApiResponse<BaseResponseData<EarnedRewardInterface>> =
        await createDappServices().get(ApiConstant.GET_NFT_EARNED_REWARD, {
          collectionName,
          walletAddress,
          chain,
        });

      const responseData =
        CommonUtils.getDappServicesResponseData<EarnedRewardInterface>(
          response
        );

      if (responseData) {
        setEarnedReward(responseData);

        return responseData;
      } else {
        setEarnedReward(null);
        return undefined;
      }
    } catch (error) {
      console.log("error", error);
      setEarnedReward(null);

      return undefined;
    }
  }
}

// Export singleton instance
export const userService = new UserService();

export const getProgram = (connection: anchor.web3.Connection) => {
  return new anchor.Program<EnsofiSvmNftStaking>(solanaStakingJsonObj, {
    connection,
  });
};
