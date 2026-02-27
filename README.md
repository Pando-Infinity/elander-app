# Elander - Solana Utility dApp

A Next.js frontend for the Elander utility platform on Solana — providing tools for bulk token transfers, NFT collection snapshots, and token airdrops.

## Features

- **Bulk Transfer** — Send tokens to multiple wallets in a single transaction
- **Snapshot Collection** — Capture a list of NFT holders from any collection instantly
- **Airdrop** — Distribute tokens to multiple addresses efficiently

## Tech Stack

- [Next.js 16](https://nextjs.org) + React 19
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) — multi-wallet support
- [Anchor](https://www.anchor-lang.com/) — Solana program client
- [Firebase](https://firebase.google.com/) — analytics
- Tailwind CSS v4
- Zustand — state management

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file at the project root:

```bash
NETWORK_MODE=devnet                          # devnet | mainnet
PORT=3001
DAPP_SERVICE_URL=
RPC_URL=https://api.devnet.solana.com/
WS_RPC=wss://api-devnet.helius-rpc.com/v0/transactions/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLS_EXPLORER_URL=https://solscan.io

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Deployment

### Docker (recommended)

See [DEPLOYMENT_MANUAL.md](./DEPLOYMENT_MANUAL.md) for full instructions.

Quick deploy:

```bash
# 1. Create .env with your configuration
# 2. Run the deploy script
./scripts/deploy-docker-local.sh
```

The script builds a Docker image with Next.js standalone output, deploys to a container with health checks, and auto-rolls back on failure.

### Health Check

```bash
curl http://localhost:3001/api/health
```
