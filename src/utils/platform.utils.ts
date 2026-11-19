/**
 * The Solana Mobile WebView shell (the Seeker app in `twa/`) puts this in its user agent. Only the
 * user agent counts: the app also opens `/?platform=seeker`, but that query can be shared to any
 * browser.
 */
export const isSolanaWebShell = (userAgent: string): boolean =>
  userAgent.includes("Solana Mobile Web Shell");

// Wallet requests in flight; the app's unload handlers are skipped while this is above zero.
let walletRequests = 0;
// Bumped by resetWalletRequests: requests from before it no longer count down.
let requestGeneration = 0;
// The app's own beforeunload handlers, run by the guard instead of the window (web shell only).
const appUnloadHandlers = new Set<(event: BeforeUnloadEvent) => void>();
let guardInstalled = false;

/**
 * wallet-adapter-react treats the web shell's WebView as desktop and arms a `beforeunload`
 * listener that marks the provider "unloading" for good: from then on it drops every wallet error
 * and disconnect (Connect hangs after the wallet sheet is closed). MWA opens the wallet with
 * `location.assign`, which fires that event, and so would a reload the user cancels at a
 * leave-page warning. A capture listener on the window runs first and hides every
 * `beforeunload` from it. The app's own handlers (`addBeforeUnloadListener`) are run by the
 * guard instead, except while a wallet request is in flight (`guardWalletRequest`), so MWA
 * opening the wallet mid-transfer does not ask to leave the page.
 */
export const installUnloadGuard = (target: Window): (() => void) => {
  const guard = (event: Event) => {
    event.stopImmediatePropagation();
    if (walletRequests > 0) return;
    appUnloadHandlers.forEach((handler) => handler(event as BeforeUnloadEvent));
  };
  target.addEventListener("beforeunload", guard, { capture: true });
  guardInstalled = true;
  return () => {
    target.removeEventListener("beforeunload", guard, { capture: true });
    guardInstalled = false;
  };
};

/**
 * Adds an app `beforeunload` handler (leave-page warnings). Use this rather than
 * `window.addEventListener`: in the web shell the unload guard hides the event from the window,
 * so the handler is run by the guard.
 */
export const addBeforeUnloadListener = (
  handler: (event: BeforeUnloadEvent) => void
): (() => void) => {
  if (guardInstalled) {
    appUnloadHandlers.add(handler);
    return () => appUnloadHandlers.delete(handler);
  }
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
};

/**
 * Wraps a wallet request so app unload handlers are skipped from the call until its promise
 * settles; MWA opens the wallet (`location.assign`) somewhere in between.
 */
export const guardWalletRequest =
  <A extends unknown[], R>(request: (...args: A) => R) =>
  (...args: A): R => {
    const generation = requestGeneration;
    const done = () => {
      if (generation === requestGeneration) walletRequests--;
    };
    walletRequests++;
    let result: R;
    try {
      result = request(...args);
    } catch (error) {
      done();
      throw error;
    }
    if (result instanceof Promise) result.then(done, done);
    else done();
    return result;
  };

/**
 * Forgets every request in flight. MWA leaves a request pending forever when the wallet is
 * disconnected during it, which would otherwise keep the leave-page warnings off for good.
 */
export const resetWalletRequests = () => {
  walletRequests = 0;
  requestGeneration++;
};
