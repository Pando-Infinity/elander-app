/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "spl-token-0.4.1";

import {
  STEALTH_ADDRESS_DOMAIN,
  STEALTH_SIGNING_MESSAGE,
} from "@/const/app.const";

import { BlockchainUtils } from ".";
import { AppConstant, ApiConstant } from "@/const";
import { TokenTypeEnum } from "@/models/app.model";
import { PublicKey, Keypair } from "@solana/web3.js";
// @ts-expect-error -- @noble/hashes subpath exports resolve at runtime via extensionAlias
import { keccak_256 } from "@noble/hashes/sha3";
// @ts-expect-error -- @noble/hashes subpath exports resolve at runtime via extensionAlias
import { kmac256 as nobleKmac256 } from "@noble/hashes/sha3-addons";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

import * as nacl from "tweetnacl";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

export const getSolanaRpcEndpoint = (): string => {
  if (process.env.RPC_URL) return process.env.RPC_URL;

  let mode = "devnet";

  if (process.env.NETWORK_MODE === "devnet") {
    mode = "devnet";
  } else if (process.env.NETWORK_MODE === "testnet") {
    mode = "devnet";
  } else {
    mode = "mainnet-beta";
  }

  return web3.clusterApiUrl(mode as web3.Cluster);
};

export const getSolanaNativeTokenBalance = async (
  walletAddress: string,
  rpcUrl: string
) => {
  if (!walletAddress || !rpcUrl) return 0;

  try {
    const connection = new web3.Connection(rpcUrl, "confirmed");

    const address = new web3.PublicKey(walletAddress);
    const balance = await connection.getBalance(address);

    return balance / web3.LAMPORTS_PER_SOL;
  } catch (error) {
    return 0;
  }
};

export const getSvmSplTokenBalance = async (
  walletAddress: string,
  tokenContractAddress: string,
  tokenType: TokenTypeEnum | null,
  rpcUrl: string
) => {
  if (!walletAddress) return 0;

  try {
    const connection = new web3.Connection(rpcUrl, "confirmed");

    const pubKey = new web3.PublicKey(walletAddress);
    const mintPubKey = new web3.PublicKey(tokenContractAddress);

    if (tokenType === TokenTypeEnum.SPL_TOKEN) {
      const tokenAccount = await web3.PublicKey.findProgramAddressSync(
        [
          pubKey.toBuffer(),
          splToken.TOKEN_PROGRAM_ID.toBuffer(),
          mintPubKey.toBuffer(),
        ],
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const tokenAmountInfo = await connection.getTokenAccountBalance(
        tokenAccount[0] || tokenAccount,
        "confirmed"
      );
      const tokenAmount = tokenAmountInfo.value.uiAmount || 0;

      return tokenAmount;
    } else if (tokenType === TokenTypeEnum.SPL_TOKEN_2022) {
      const tokenAccount = await getAssociatedTokenAddressSync(
        mintPubKey,
        pubKey,
        true,
        TOKEN_2022_PROGRAM_ID
      );

      const tokenAmountInfo = await connection.getTokenAccountBalance(
        tokenAccount,
        "confirmed"
      );

      const tokenAmount = tokenAmountInfo.value.uiAmount || 0;

      return tokenAmount;
    } else {
      return 0;
    }
  } catch (error) {
    return 0;
  }
};

export const getParsedTransaction = async (signature: string) => {
  if (!signature) return;

  const rpcUrl = getSolanaRpcEndpoint();
  const solanaConnection = new web3.Connection(rpcUrl, "confirmed");

  const tx = await solanaConnection.getParsedTransaction(signature, {
    commitment: "confirmed",
  });

  return tx;
};

export const validateSolWalletAddress = (address: string): boolean => {
  try {
    const pubkey = new PublicKey(address);
    // Verify it's a valid 32-byte key (accepts both keypair and PDA addresses)
    return pubkey.toBytes().length === 32;
  } catch (error) {
    return false;
  }
};

let _connectionInstance: web3.Connection | null = null;

export const getConnection = (): web3.Connection => {
  if (_connectionInstance) return _connectionInstance;

  const rpc = process.env.RPC_URL || "";
  const wsEndpoint = process.env.WS_RPC;

  const config: web3.ConnectionConfig = {
    httpHeaders: {
      "User-Agent": "E-Lander",
      Origin: ApiConstant.APP_ORIGIN_URL,
    },
    wsEndpoint: wsEndpoint,
  };

  _connectionInstance = new web3.Connection(rpc, config);
  return _connectionInstance;
};

/**
 * NIST SP 800-185 compliant KMAC256 via @noble/hashes.
 *
 * WARNING: This produces different output than the previous custom
 * implementation which used HMAC-style ipad/opad with SHA3-256.
 * Existing stealth wallets derived with the old implementation can
 * be recovered using generateLegacyStealthWallet().
 */
function kmac256(
  key: Uint8Array,
  data: Uint8Array,
  _outputLength: number = 32
): Uint8Array {
  return nobleKmac256(key, data);
}

function generateMasterSeed(owner: string, signature: string): Uint8Array {
  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(STEALTH_SIGNING_MESSAGE),
    bs58.decode(signature),
    bs58.decode(owner)
  );

  if (!verified) throw new Error("Invalid signature to generate master seed");

  const masterSeed = keccak_256(Buffer.from(signature, "base64"));

  return masterSeed;
}

export function generateStealthWallet(
  owner: string,
  signature: string
): Keypair {
  const masterSeed = generateMasterSeed(owner, signature);
  const addressIndex = AppConstant.STEALTH_WALLET_ADDRESS_INDEX;
  const domainBytes = new TextEncoder().encode(STEALTH_ADDRESS_DOMAIN);
  const indexBytes = new Uint8Array(4);
  new DataView(indexBytes.buffer).setUint32(0, addressIndex, false); // big-endian

  const input = new Uint8Array(domainBytes.length + indexBytes.length);
  input.set(domainBytes, 0);
  input.set(indexBytes, domainBytes.length);

  const addressSeed = kmac256(masterSeed, input, 32);

  const keypair = Keypair.fromSeed(addressSeed);

  return keypair;
}

/**
 * @deprecated Recover stealth wallets derived with the old non-NIST-compliant
 * KMAC256 implementation. Use generateStealthWallet() for new wallets.
 */
export function generateLegacyStealthWallet(
  owner: string,
  signature: string
): Keypair {
  const masterSeed = generateMasterSeed(owner, signature);
  const addressIndex = AppConstant.STEALTH_WALLET_ADDRESS_INDEX;
  const domainBytes = new TextEncoder().encode(STEALTH_ADDRESS_DOMAIN);
  const indexBytes = new Uint8Array(4);
  new DataView(indexBytes.buffer).setUint32(0, addressIndex, false);

  const input = new Uint8Array(domainBytes.length + indexBytes.length);
  input.set(domainBytes, 0);
  input.set(indexBytes, domainBytes.length);

  const addressSeed = legacyKmac256(masterSeed, input, 32);
  return Keypair.fromSeed(addressSeed);
}

/** @deprecated Legacy HMAC-SHA3-based KDF (not NIST KMAC256). */
function legacyKmac256(
  key: Uint8Array,
  data: Uint8Array,
  outputLength: number = 32
): Uint8Array {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { sha3_256: sha3Hash } = require("@noble/hashes/sha3");
  const blockSize = AppConstant.KMAC256_BLOCK_SIZE;

  const encodedKey = legacyEncodeString(key);
  const customization = new TextEncoder().encode("KMAC");
  const encodedCustomization = legacyEncodeString(customization);

  let paddedKey = encodedKey;
  if (encodedKey.length >= blockSize) {
    paddedKey = sha3Hash(encodedKey);
  }
  if (paddedKey.length < blockSize) {
    const temp = new Uint8Array(blockSize);
    temp.set(paddedKey);
    paddedKey = temp;
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }

  const innerInput = new Uint8Array(
    ipad.length + data.length + encodedCustomization.length
  );
  innerInput.set(ipad, 0);
  innerInput.set(data, ipad.length);
  innerInput.set(encodedCustomization, ipad.length + data.length);
  const innerHash = sha3Hash(innerInput);

  const outerInput = new Uint8Array(opad.length + innerHash.length);
  outerInput.set(opad, 0);
  outerInput.set(innerHash, opad.length);
  const result = sha3Hash(outerInput);

  return outputLength <= result.length ? result.slice(0, outputLength) : result;
}

function legacyEncodeString(input: Uint8Array): Uint8Array {
  const lengthBytes = new Uint8Array(4);
  new DataView(lengthBytes.buffer).setUint32(0, input.length, false);
  const result = new Uint8Array(lengthBytes.length + input.length);
  result.set(lengthBytes, 0);
  result.set(input, lengthBytes.length);
  return result;
}

export const checkWalletForSGT = async (
  walletAddress: string
): Promise<boolean> => {
  try {
    const connection = BlockchainUtils.getConnection();

    const response = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      {
        programId: TOKEN_2022_PROGRAM_ID,
      }
    );

    const allTokenAccounts = response.value;

    if (allTokenAccounts.length === 0) {
      console.log("No Token-2022 accounts found for this wallet.");
      return false;
    }

    // Extract mint addresses from token accounts
    const mintPubkeys = allTokenAccounts
      .map((accountInfo) => {
        try {
          if (accountInfo?.account?.data?.parsed?.info?.mint) {
            return new PublicKey(accountInfo.account.data.parsed.info.mint);
          } else {
            console.log("No mint found for account:", accountInfo);
            return null;
          }
        } catch (error) {
          return null;
        }
      })
      .filter((mintPubkey) => mintPubkey !== null);

    // Fetch all mint account data in batches to avoid RPC limits
    const BATCH_SIZE = AppConstant.RPC_BATCH_SIZE;
    const mintAccountInfos = [];

    for (let i = 0; i < mintPubkeys.length; i += BATCH_SIZE) {
      const batch = mintPubkeys.slice(i, i + BATCH_SIZE);

      const batchResults = await connection.getMultipleAccountsInfo(batch);
      mintAccountInfos.push(...batchResults);
    }

    for (let i = 0; i < mintAccountInfos.length; i++) {
      const mintInfo = mintAccountInfos[i];
      if (mintInfo) {
        const mintPubkey = mintPubkeys[i];

        try {
          // Unpack the raw mint account data
          const mint = splToken.unpackMint(
            mintPubkey,
            mintInfo,
            TOKEN_2022_PROGRAM_ID
          );
          const mintAuthority = mint.mintAuthority?.toBase58();

          const hasCorrectMintAuthority =
            mintAuthority === AppConstant.SGT_MINT_AUTHORITY;

          // Check for correct SGT Metadata
          const metadataPointer = splToken.getMetadataPointerState(mint);
          const hasCorrectMetadata =
            metadataPointer &&
            metadataPointer.authority?.toBase58() ===
              AppConstant.SGT_MINT_AUTHORITY &&
            metadataPointer.metadataAddress?.toBase58() ===
              AppConstant.SGT_METADATA_ADDRESS;

          // Check for correct SGT Group Member
          const tokenGroupMemberState = splToken.getTokenGroupMemberState(mint);
          const hasCorrectGroupMember =
            tokenGroupMemberState &&
            tokenGroupMemberState.group?.toBase58() ===
              AppConstant.SGT_GROUP_MINT_ADDRESS;

          // If all extensions match and mint authority is correct, then it is an SGT
          if (
            hasCorrectMintAuthority &&
            hasCorrectMetadata &&
            hasCorrectGroupMember
          ) {
            console.log(
              `\nVERIFIED SGT FOUND: Wallet holds a verified SGT (${mint.address.toBase58()}).`
            );
            return true;
          }
        } catch (mintError: any) {
          // Skip this mint if we can't unpack it
          console.log(
            `Warning: Could not unpack mint ${mintPubkey.toBase58()}: ${
              mintError.message
            }`
          );
          continue;
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

export function hashWalletAddressToUUID(walletAddress: string): string {
  if (!walletAddress) {
    return "";
  }

  const normalizedAddress = walletAddress.trim();

  function simpleHash(str: string, seed: number = 0): number {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;

    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  const hash1 = simpleHash(normalizedAddress, 0)
    .toString(16)
    .padStart(8, "0")
    .substring(0, 8);
  const hash2 = simpleHash(normalizedAddress, 1)
    .toString(16)
    .padStart(8, "0")
    .substring(0, 4);
  const hash3 = simpleHash(normalizedAddress, 2)
    .toString(16)
    .padStart(8, "0")
    .substring(0, 4);
  const hash4 = simpleHash(normalizedAddress, 3)
    .toString(16)
    .padStart(8, "0")
    .substring(0, 4);
  const hash5 = simpleHash(normalizedAddress, 4)
    .toString(16)
    .padStart(12, "0")
    .substring(0, 12);

  return `${hash1}-${hash2}-${hash3}-${hash4}-${hash5}`;
}
