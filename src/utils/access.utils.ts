import type { AccessStatus } from "@/stores/user.store";

/**
 * Decides locked-feature access from the three checks: an Alchemist NFT held, Alchemist stake
 * records, a Seeker Genesis Token. Any positive result unlocks, even if another check failed.
 * With nothing positive, a failed check means "error" (could not verify), not "locked".
 */
export const resolveAccess = (
  holdsNft: PromiseSettledResult<boolean>,
  stakeRecordCount: PromiseSettledResult<number>,
  holdsSeekerToken: PromiseSettledResult<boolean>
): Exclude<AccessStatus, "idle" | "checking"> => {
  const checks = [holdsNft, stakeRecordCount, holdsSeekerToken];
  const unlocked =
    (holdsNft.status === "fulfilled" && holdsNft.value) ||
    (stakeRecordCount.status === "fulfilled" && stakeRecordCount.value > 0) ||
    (holdsSeekerToken.status === "fulfilled" && holdsSeekerToken.value);

  if (unlocked) return "unlocked";
  if (checks.some((r) => r.status === "rejected")) return "error";
  return "locked";
};
