/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty } from "lodash";
import { ApiResponse } from "apisauce";
import { BaseResponseData, ResponseDataList } from "@/models/common.model";
import { ApiConstant } from "@/const";

import crypto from "crypto";

export const uuid = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .replace(/-/g, "");
};

export const checkEmailFormat = (email: string): boolean => {
  const regexEmail =
    /^(([^<>()[\]\\.,;:\s@\\"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.length && !regexEmail.test(email)) return false;
  else return true;
};

export const snakeToCamelCase = (str: string): string => {
  if (str.includes("_") || str.includes("-"))
    return str
      .toLowerCase()
      .replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace("-", "").replace("_", "")
      );

  return str;
};

export const isUndefinedOrNull = (value: any) => {
  return value === null || value === undefined;
};

export const truncateHash = (
  address?: string,
  startLength = 5,
  endLength = 5
) => {
  if (!address) return "";
  return `${address.substring(0, startLength)}...${address.substring(
    address.length - endLength
  )}`;
};

export const deepEqual = (value1: any, value2: any) => {
  if (value1 === value2) return true;

  if (
    value1 === null ||
    value2 === null ||
    typeof value1 != "object" ||
    typeof value2 != "object"
  )
    return false;

  const value1Keys = Object.keys(value1);
  const value2Keys = Object.keys(value2);

  if (value1Keys.length !== value2Keys.length) return false;

  for (const key of value1Keys) {
    if (!value2Keys.includes(key) || !deepEqual(value1[key], value2[key]))
      return false;
  }

  return true;
};

export const getTransactionHashInfoLink = (transactionHash: string) => {
  const solanaParams =
    process.env.NETWORK_MODE !== "mainnet"
      ? `?cluster=${process.env.NETWORK_MODE}`
      : "";
  return `${process.env.NEXT_PUBLIC_SOLS_EXPLORER_URL}/tx/${transactionHash}/${solanaParams}`;
};

export const getDappServicesResponseData = <T>(
  response: ApiResponse<BaseResponseData<T>>
): T | undefined => {
  const status = response?.status;
  const data = response?.data;

  if (!status || !data) return undefined;

  if (status >= 400 && status <= 500) return undefined;

  const statusCode = data.statusCode;

  if (statusCode >= 200 && statusCode <= 300) {
    return response.data?.data;
  } else {
    return undefined;
  }
};

export const getDappServicesResponseListData = (
  response: ApiResponse<ResponseDataList<any>>
) => {
  const status = response?.status;
  const data = response?.data;

  if (!status || !data) return undefined;

  if (status >= 400 && status <= 500) return undefined;

  const statusCode = data.statusCode;

  if (statusCode >= 200 && statusCode <= 300) {
    return response.data?.data;
  } else {
    return undefined;
  }
};

export const roundUp = (val: number, precision: number = 2): number => {
  return Math.ceil(val * Math.pow(10, precision)) / Math.pow(10, precision);
};

export function addSubdomain(url?: string, subdomain?: string) {
  if (!url || !subdomain) return;
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  const urlObj = new URL(url);
  const hostParts = urlObj.hostname.split(".");

  if (hostParts.length > 1) {
    if (hostParts.length === 2) {
      hostParts.unshift(subdomain);
    } else {
      hostParts.splice(1, 0, subdomain);
    }
    urlObj.hostname = hostParts.join(".");
  }

  return urlObj.toString();
}

export const isMobile =
  typeof window !== "undefined" &&
  !isEmpty(
    window?.navigator?.userAgent.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );

export const convertFloatToBps = (interest: number) => {
  return Math.floor((interest / 100) * 10000);
};

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Original function
 * @link https://github.com/franckLdx/ts-retry/blob/master/src/retry/retry.ts
 * @param fn
 * @param delay
 * @param maxRetries
 */
export async function retry<T>(
  fn: () => Promise<T>,
  delay: number,
  maxRetries: number
): Promise<T> {
  return await recall(fn, delay, 0, maxRetries);
}

async function recall<T>(
  fn: () => T,
  delay: number,
  retries: number,
  maxRetries: number
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > maxRetries) {
      throw err;
    }
    await wait(delay);
  }

  return await recall(fn, delay, retries + 1, maxRetries);
}

export const toHexString = (bytes: any) =>
  bytes.reduce(
    (str: any, byte: any) => str + byte.toString(16).padStart(2, "0"),
    ""
  );

export const hashTo32Byte = (input: string): Buffer => {
  return crypto.createHash("sha256").update(input).digest();
};

export const convertIpfsToHttp = (ipfsUrl: string) => {
  if (!ipfsUrl) return "";

  if (ipfsUrl.startsWith("http")) return ipfsUrl;

  if (ipfsUrl.startsWith(ApiConstant.IPFS_PROTOCOL)) {
    const hash = ipfsUrl.replace(ApiConstant.IPFS_PROTOCOL, "");
    return `${ApiConstant.IPFS_GATEWAY_URL}${hash}`;
  }

  if (ipfsUrl.startsWith("Qm") || ipfsUrl.startsWith("bafy")) {
    return `${ApiConstant.IPFS_GATEWAY_URL}${ipfsUrl}`;
  }

  return ipfsUrl;
};
