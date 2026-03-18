import type { IpfsProvider } from "./ipfs-provider";

const PINATA_API_URL = "https://api.pinata.cloud";

export class PinataProvider implements IpfsProvider {
  name = "Pinata";
  private jwt: string;
  private gateway: string;

  constructor(jwt: string, gateway?: string) {
    this.jwt = jwt;
    this.gateway = gateway || "https://gateway.pinata.cloud";
  }

  async upload(file: Blob, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file, filename);

    const metadata = JSON.stringify({ name: filename });
    formData.append("pinataMetadata", metadata);

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${PINATA_API_URL}/data/testAuthentication`,
        {
          headers: {
            Authorization: `Bearer ${this.jwt}`,
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  getIpfsUrl(hash: string): string {
    return `${this.gateway}/ipfs/${hash}`;
  }
}
