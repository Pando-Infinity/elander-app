import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "spl-token-0.4.1";
import { decodeSeekerGenesisTokenMint } from "@solana-mobile/skr-genesis-token";

// A token account (Token and Token-2022 alike) starts with its mint and holds its amount as a
// u64 at byte 64. Extensions only ever follow the 165 base bytes.
const TOKEN_ACCOUNT_LENGTH = 165;
const TOKEN_ACCOUNT_AMOUNT_OFFSET = 64;
// Most addresses one `getMultipleAccounts` request accepts.
export const MINTS_PER_BATCH = 100;

export type SeekerCheckConnection = Pick<
  Connection,
  "getTokenAccountsByOwner" | "getMultipleAccountsInfo"
>;

/**
 * Returns true when `owner` holds at least one Seeker Genesis Token (SGT).
 *
 * Mirrors bye.fun's mainnet holder check: the owner's Token-2022 accounts are read as raw bytes
 * (not `jsonParsed`, which some RPCs such as Helius leave unparsed for an account whose mint is
 * closed), empty accounts are dropped, and each distinct mint is decoded with Solana Mobile's
 * `decodeSeekerGenesisTokenMint`. Closed mints and mints not owned by Token-2022 are skipped.
 *
 * Throws on an RPC failure so the caller can tell "not a Seeker" from "could not check".
 */
export const hasSeekerGenesisToken = async (
  connection: SeekerCheckConnection,
  owner: PublicKey
): Promise<boolean> => {
  const { value: tokenAccounts } = await connection.getTokenAccountsByOwner(
    owner,
    { programId: TOKEN_2022_PROGRAM_ID },
    "confirmed"
  );

  const heldMints = new Set<string>();
  for (const { account } of tokenAccounts) {
    const data = account.data;
    if (data.length < TOKEN_ACCOUNT_LENGTH) continue;
    if (data.readBigUInt64LE(TOKEN_ACCOUNT_AMOUNT_OFFSET) === BigInt(0)) continue;
    heldMints.add(new PublicKey(data.subarray(0, 32)).toBase58());
  }

  const mints = [...heldMints].map((mint) => new PublicKey(mint));

  for (let i = 0; i < mints.length; i += MINTS_PER_BATCH) {
    const batch = mints.slice(i, i + MINTS_PER_BATCH);
    const mintAccounts = await connection.getMultipleAccountsInfo(
      batch,
      "confirmed"
    );

    const found = mintAccounts.some(
      (account) =>
        // A closed mint comes back null and is skipped.
        !!account &&
        account.owner.equals(TOKEN_2022_PROGRAM_ID) &&
        decodeSeekerGenesisTokenMint(new Uint8Array(account.data)) !== null
    );
    if (found) return true;
  }

  return false;
};
