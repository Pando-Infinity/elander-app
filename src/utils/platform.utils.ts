const PLATFORM_KEY = "elander:platform";

/** The Solana Mobile WebView shell (the Seeker app in `twa/`) puts this in its user agent. */
export const isSolanaWebShell = (userAgent: string): boolean =>
  userAgent.includes("Solana Mobile Web Shell");

/**
 * Whether this session was launched from the Seeker Android app. The app in `twa/` opens
 * `/?platform=seeker`; client-side navigation drops the query, so the flag is kept in
 * sessionStorage for the rest of the session. The web shell's user agent counts too.
 */
export const isSeekerLaunch = (): boolean => {
  if (typeof window === "undefined") return false;
  const fromQuery = new URLSearchParams(window.location.search).get("platform") === "seeker";
  const fromApp = fromQuery || isSolanaWebShell(navigator.userAgent);
  try {
    if (fromQuery) sessionStorage.setItem(PLATFORM_KEY, "seeker");
    return fromApp || sessionStorage.getItem(PLATFORM_KEY) === "seeker";
  } catch {
    // Storage can be blocked (private mode, site data disabled).
    return fromApp;
  }
};

/**
 * wallet-adapter-react treats the web shell's WebView as desktop and arms a `beforeunload`
 * listener; MWA opens the wallet with `location.assign`, which fires it, and the provider then
 * stays "unloading" and drops every later wallet error and disconnect (Connect hangs after the
 * wallet sheet is closed). A capture listener on the window runs first and hides the event.
 * It also hides it from usePreventNavigation, whose leave-page warning would otherwise show each
 * time MWA opens the wallet mid-transfer.
 */
export const installUnloadGuard = (target: Window): (() => void) => {
  const stop = (e: Event) => e.stopImmediatePropagation();
  target.addEventListener("beforeunload", stop, { capture: true });
  return () => target.removeEventListener("beforeunload", stop, { capture: true });
};
