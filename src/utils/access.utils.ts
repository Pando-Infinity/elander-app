import type { AccessStatus } from "@/stores/user.store";

/**
 * Decides locked-feature access from the three checks. Any positive result unlocks, even if
 * another check failed. With nothing positive, a failed check means "error" (could not verify),
 * not "locked".
 */
export const resolveAccess = (
  heldNfts: PromiseSettledResult<unknown[]>,
  staked: PromiseSettledResult<{ stakeRecordCount: number }>,
  seeker: PromiseSettledResult<boolean>
): Exclude<AccessStatus, "idle" | "checking"> => {
  const isHolder =
    (heldNfts.status === "fulfilled" && heldNfts.value.length > 0) ||
    (staked.status === "fulfilled" && staked.value.stakeRecordCount > 0);
  const isSeeker = seeker.status === "fulfilled" && seeker.value === true;

  if (isHolder || isSeeker) return "unlocked";
  if ([heldNfts, staked, seeker].some((r) => r.status === "rejected")) {
    return "error";
  }
  return "locked";
};
