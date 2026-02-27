import { useEffect, useRef } from "react";

interface UsePreventNavigationOptions {
  when: boolean;
  message?: string;
  onNavigationAttempt?: () => void;
}

/**
 * Custom hook to prevent user from refreshing, reloading or navigating away
 * @param when - Condition to activate prevention (e.g., when transferring)
 * @param message - Message displayed when user attempts to leave the page (used for confirm dialog)
 * @param onNavigationAttempt - Callback invoked when user attempts to navigate
 */
export const usePreventNavigation = ({
  when,
  message = "Operation is being processed. Are you sure you want to leave this page?",
  onNavigationAttempt,
}: UsePreventNavigationOptions) => {
  const messageRef = useRef(message);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";

      if (onNavigationAttempt) {
        onNavigationAttempt();
      }

      return "";
    };

    const handlePopState = (e: PopStateEvent) => {
      if (onNavigationAttempt) {
        onNavigationAttempt();
      }

      const shouldPrevent = !window.confirm(messageRef.current);

      if (shouldPrevent) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [when, onNavigationAttempt]);
};
