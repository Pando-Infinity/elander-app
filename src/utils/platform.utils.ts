const PLATFORM_KEY = "elander:platform";

/**
 * Whether this session was launched from the Seeker Android app. The TWA in `twa/` opens
 * `/?platform=seeker`; client-side navigation drops the query, so the flag is kept in
 * sessionStorage for the rest of the session.
 */
export const isSeekerLaunch = (): boolean => {
  if (typeof window === "undefined") return false;
  const fromQuery = new URLSearchParams(window.location.search).get("platform") === "seeker";
  try {
    if (fromQuery) sessionStorage.setItem(PLATFORM_KEY, "seeker");
    return fromQuery || sessionStorage.getItem(PLATFORM_KEY) === "seeker";
  } catch {
    // Storage can be blocked (private mode, site data disabled).
    return fromQuery;
  }
};
