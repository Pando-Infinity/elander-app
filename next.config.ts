import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    domains: ["ensofi-prod.s3.ap-southeast-1.amazonaws.com"],
  },
  productionBrowserSourceMaps: false,
  // These env vars are inlined into the client-side JS bundle at build time.
  // Do NOT add secrets here. DAPP_SERVICE_URL is intentionally excluded
  // (only used server-side in rewrites). If RPC_URL contains an API key,
  // consider proxying RPC calls through a Next.js API route instead.
  env: {
    NETWORK_MODE: process.env.NETWORK_MODE || "",
    WS_RPC: process.env.WS_RPC,
    RPC_URL: process.env.RPC_URL,
  },

  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/dapp-service/:path*",
        destination: `${process.env.DAPP_SERVICE_URL}/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
