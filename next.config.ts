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
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  env: {
    NETWORK_MODE: process.env.NETWORK_MODE || "",
    DAPP_SERVICE_URL: process.env.DAPP_SERVICE_URL,
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
