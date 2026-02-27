/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePathname } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/utils/firebase.config";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { BlockchainUtils } from "@/utils";

export interface UserPropertiesInterface {
  user_id_hashed?: string;
  country?: string;
  language?: string;
  sol_balance?: number;
}

// Common Params Interface
export interface CommonParamsInterface {
  screen_name?: string;
  success?: boolean;
  platform?: "web" | "seeker";
  error_code?: string;
  error_message?: string;
}

// Auth Event Params
export interface AuthParams {
  user_id_hashed?: string;
  success?: boolean;
  error_code?: string;
  error_message?: string;
}

export type AuthEventName = "auth_start" | "auth_success" | "auth_failure";

// Navigation & Button Event Params
export interface NavigationButtonParams {
  screen_name?: string;
  button_name?: string;
  url?: string;
}

export type NavigationButtonEventName =
  | "screen_view"
  | "button_click"
  | "external_link_click";

//Bulk transfer event params
export interface BulkTransferParams {
  sender_id_hashed?: string;
  receiver_id_hashed?: string;
  token_transfer_count?: number;
  total_amount?: number;
  success?: boolean;
  error_code?: string;
  error_message?: string;
}

// Airdrop event params
export interface AirdropParams {
  sender_id_hashed?: string;
  total_amount?: number;
  token?: string;
  total_addresses?: number;
  success?: boolean;
  error_code?: string;
  error_message?: string;
}

// Bulk Transfer Event Names
export type BulkTransferEventName =
  | "bulk_transfer_initiated"
  | "bulk_transfer_success"
  | "bulk_transfer_failure";

// Airdrop Event Names
export type AirdropEventName =
  | "airdrop_initiated"
  | "airdrop_success"
  | "airdrop_failure";

export const useFirebaseAnalytics = (
  customCommonParams?: Partial<
    Omit<CommonParamsInterface, "screen_name" | "platform">
  >
) => {
  const pathname = usePathname();
  const { walletBalances, walletAddress } = useUserStore();

  const [mergedUserProperties, setMergedUserProperties] =
    useState<UserPropertiesInterface>({
      country: "",
      language: "",
      sol_balance: 0,
    });

  const autoDetectedParams = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        platform: "web" as const,
        language: "en-US",
        country: undefined,
      };
    }

    // Detect if running in Seeker app (mobile WebView)
    // You can customize this detection based on your Seeker app's User-Agent or custom headers
    const userAgent = navigator.userAgent || "";
    const isSeeker =
      userAgent.includes("Seeker") || // Custom User-Agent for Seeker app
      (window as any).ReactNativeWebView !== undefined || // React Native WebView
      (window as any).isSeekerApp === true; // Custom flag set by Seeker app

    const platform = isSeeker ? ("seeker" as const) : ("web" as const);

    // Detect language from browser
    const language = navigator.language || "en-US";

    // Detect country from browser (if available via Intl API)
    let country: string | undefined;
    try {
      country = new Intl.Locale(language).region;
    } catch {
      country = undefined;
    }

    return {
      platform,
      language,
      country,
    };
  }, []);

  useEffect(() => {
    const fetchUserProperties = async () => {
      const userHashId = await BlockchainUtils.hashWalletAddressToUUID(
        walletAddress || ""
      );
      const solBalance =
        walletBalances?.find((item) => item.symbol === "SOL")?.amount || 0;
      setMergedUserProperties({
        user_id_hashed: userHashId,
        country: autoDetectedParams.country,
        language: autoDetectedParams.language,
        sol_balance: solBalance,
      });
    };
    fetchUserProperties();
  }, [walletAddress, walletBalances, autoDetectedParams]);

  const commonParams = useMemo(
    () => ({
      ...customCommonParams,
      platform: autoDetectedParams.platform,
      screen_name: pathname?.replaceAll("/", "") || "",
    }),
    [customCommonParams, autoDetectedParams.platform, pathname]
  );

  // Helper function to merge params with user properties and common params
  const mergeParams = useCallback(
    (eventParams: any) => {
      return {
        ...mergedUserProperties,
        ...commonParams,
        ...eventParams,
      };
    },
    [mergedUserProperties, commonParams]
  );

  const logAuthAction = useCallback(
    async (params: AuthParams, eventName: AuthEventName) => {
      try {
        if (analytics) {
          logEvent(analytics, eventName, mergeParams(params));
        }
      } catch (error) {
        console.warn(`Failed to log ${eventName}:`, error);
      }
    },
    [mergeParams]
  );

  // Navigation & Button Actions
  const logNavigationButtonAction = useCallback(
    async (
      params: NavigationButtonParams,
      eventName: NavigationButtonEventName
    ) => {
      try {
        if (analytics) {
          logEvent(analytics, eventName as string, mergeParams(params));
        }
      } catch (error) {
        console.warn(`Failed to log ${eventName}:`, error);
      }
    },
    [mergeParams]
  );

  // Bulk Transfer Actions
  const logBulkTransferAction = useCallback(
    async (params: BulkTransferParams, eventName: BulkTransferEventName) => {
      try {
        if (analytics) {
          logEvent(analytics, eventName, mergeParams(params));
        }
      } catch (error) {
        console.warn(`Failed to log ${eventName}:`, error);
      }
    },
    [mergeParams]
  );

  // Airdrop Actions
  const logAirdropAction = useCallback(
    async (params: AirdropParams, eventName: AirdropEventName) => {
      try {
        if (analytics) {
          logEvent(analytics, eventName, mergeParams(params));
        }
      } catch (error) {
        console.warn(`Failed to log ${eventName}:`, error);
      }
    },
    [mergeParams]
  );

  /**
   * Track custom events
   */
  const logCustomEvent = useCallback(
    async (params: Record<string, any>, eventName: string) => {
      try {
        if (analytics) {
          logEvent(analytics, eventName, mergeParams(params));
        }
      } catch (error) {
        console.warn("Failed to log custom event:", error);
      }
    },
    [mergeParams]
  );

  return {
    logAuthAction,
    logCustomEvent,
    logAirdropAction,
    logBulkTransferAction,
    logNavigationButtonAction,
    platform: autoDetectedParams.platform,
  };
};

export default useFirebaseAnalytics;
