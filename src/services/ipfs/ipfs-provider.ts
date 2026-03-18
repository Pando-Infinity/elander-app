import { IpfsProviderEnum } from "@/models/nft-generation.model";
import { PinataProvider } from "./pinata-provider";

export interface IpfsProvider {
  name: string;
  upload(file: Blob, filename: string): Promise<string>; // returns CID/hash
  testConnection(): Promise<boolean>;
  getIpfsUrl(hash: string): string; // returns full URL: gateway + /ipfs/ + hash
}

export function createIpfsProvider(
  type: IpfsProviderEnum,
  config: Record<string, string>
): IpfsProvider {
  switch (type) {
    case IpfsProviderEnum.PINATA:
      return new PinataProvider(config.jwt, config.gateway);
    default:
      throw new Error(`Unsupported IPFS provider: ${type}`);
  }
}
