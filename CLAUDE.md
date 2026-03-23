# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Elander is a Solana utility dApp frontend (Next.js 16 / React 19) providing airdrop, NFT collection generation, on-chain collection management (Metaplex Core), bulk token transfers, and NFT collection snapshots. It connects to a separate backend service via API proxy.

## Commands

```bash
pnpm dev          # Start dev server (webpack mode, http://localhost:3000)
pnpm build        # Production build (standalone output, webpack mode)
pnpm start        # Start production server
pnpm lint         # ESLint v9 flat config (Next.js core-web-vitals + typescript)
```

Package manager is **pnpm**. Node.js 22+ required. No test framework is configured.

## Environment

Copy `.env.example` to `.env`. Key variables:
- `NETWORK_MODE` — `devnet` or `mainnet` (controls RPC endpoints and on-chain addresses)
- `DAPP_SERVICE_URL` — Backend API base URL (proxied via Next.js rewrite at `/dapp-service/:path*`)
- `RPC_URL` / `WS_RPC` — Solana RPC and WebSocket endpoints
- `NEXT_PUBLIC_SOLS_EXPLORER_URL` — Block explorer base URL
- `NEXT_PUBLIC_FIREBASE_*` — Firebase analytics config (API key, auth domain, project ID, etc.)
- Non-`NEXT_PUBLIC_` env vars (`NETWORK_MODE`, `DAPP_SERVICE_URL`, `RPC_URL`, `WS_RPC`) are baked into the build via `next.config.ts` `env` block

## Architecture

### Routing (App Router)

Pages (display order): `/airdrop`, `/nft-collection-gen`, `/nft-collection-mgr`, `/bulk-transfer`, `/snapshot`, `/profile`, `/api/health`

Mobile bottom nav shows 3 primary items + "More" submenu (max 4 visible). Desktop sidebar shows all items.

Route constants in `src/const/path.const.ts`. Shared page layout components live in `src/app/_component/`.

### State Management — Zustand

- `useUserStore` — Wallet state, token balances, NFT data, price feeds, staking info
- `useAppStore` — UI state (connect wallet modal)
- `useToast` — Toast notification queue

All stores use localStorage persistence via zustand middleware.

### Providers

- `SolanaProvider` (`src/provider/SolanaProvider.tsx`) — Wallet adapter setup (Ledger, Backpack, mobile wallets)
- `AppInitializer` (`src/provider/AppInitializer.tsx`) — Renders nothing, calls `useAppInitialization()` hook from `AppProvider.tsx` to load user data on wallet connect (balances, NFTs, staking, price feeds)

### Services & API

- `src/services/config.ts` — apisauce HTTP client with Bearer token auth, base URL `/dapp-service/`
- `src/services/user-service.ts` — Token balances (SOL/SPL/SPL-2022), NFT metadata (Metaplex/IPFS), staked NFTs (Anchor), price feeds (GeckoTerminal), rewards
- `src/services/app-services/` — Backend API calls for airdrop/bulk-transfer operations
- `src/services/ipfs/` — IPFS upload providers (extensible interface, Pinata implementation). User provides their own API keys client-side.
- `src/services/ensofi_svm_nft_staking.*` — Anchor IDL and generated client for NFT staking program

### Feature Hooks

- `useBulkTransfer` — Builds multi-recipient token transfer transactions
- `useAirdrop` — Builds airdrop distribution transactions
- `useSnapshot` — Fetches NFT collection holder snapshots
- `useNftGeneration` — Client-side NFT collection generation (layer compositing, rarity mixing, ZIP export, IPFS upload)
- `useNftCollectionManager` — On-chain Metaplex Core collection management (create, update, mint, burn, plugins)
- `useUmi` — Creates memoized Umi instance with wallet adapter identity for Metaplex Core operations
- `useSolanaTransaction` — Generic transaction signing, sending, and confirmation polling

### NFT Collection Generation (`/nft-collection-gen`)

Client-side NFT art generator using a 6-step wizard: Upload Layers → Configure Collection → Configure Rarity → Generate & Preview → Download → IPFS Upload.

- **Image compositing** runs in a Web Worker (`src/workers/nft-generation.worker.ts`) using `OffscreenCanvas` to avoid blocking the UI
- **Rarity system** uses trait pool mixing (ported from `../../solraffle/pitfall_nft_generation/`): 4 pools (Common/Rare/Epic/Legendary), each rarity class defines how many traits come from which pool
- **DNA uniqueness** via SHA1 hash (`@noble/hashes/legacy.js`) of trait combinations, with collision retry
- **Weighted selection** from filenames: `TraitName#Weight.png` (e.g., `GoldenCrown#2.png` = 2x probability)
- **Chunked ZIP download** for large collections (>100 NFTs split into separate ZIPs)
- **IPFS upload** is range-based (user selects which editions to upload). Two-phase: upload images → rebuild metadata with real gateway URIs (`gateway/ipfs/hash`) → upload metadata JSON
- Models in `src/models/nft-generation.model.ts`, utils in `src/utils/nft-generation.utils.ts`, constants in `src/const/nft-generation.const.ts`

### NFT Collection Manager (`/nft-collection-mgr`)

On-chain Metaplex Core NFT collection management via Umi SDK. Two top-level modes: **"Load & Manage"** (address input + tabs: Overview | Mint | Manage) and **"Create New"** (standalone create form). Authority check: compares connected wallet to collection's update authority — Mint and Manage tabs are disabled for non-authority wallets.

- **Umi integration** via `useUmi` hook — creates Umi instance with `walletAdapterIdentity` bridge to existing wallet adapter
- **Create**: Creates Core collection with optional Royalties plugin, compute budget prepended
- **Mint**: Batch mint NFTs one at a time with progress tracking and cancel support. Users paste metadata URIs (from NFT Generator IPFS upload results or manually)
- **Manage**: Update collection metadata, add/update/remove plugins (Royalties, FreezeDelegate, Attributes, etc.)
- **Burn**: Fetch-first pattern required by mpl-core — fetches asset then burns
- **Asset fetching**: DAS API (`getAssetsByGroup`) as primary method, GPA (`fetchAssetsByCollection`) as fallback — DAS is required for reliable asset loading on most RPCs (Helius, Triton, QuickNode)
- Packages: `@metaplex-foundation/umi-bundle-defaults`, `mpl-core`, `umi-signer-wallet-adapters`, `mpl-toolbox`
- Webpack aliases in `next.config.ts` resolve `@noble/hashes/sha3` → `@noble/hashes/sha3.js` and `@noble/hashes/sha256` → `@noble/hashes/sha2.js` for mpl-core compatibility with `@noble/hashes` v2
- Models in `src/models/nft-collection-manager.model.ts`, constants in `src/const/nft-collection-manager.const.ts`

### Key Conventions

- Path alias: `@/*` → `./src/*`
- UI: Tailwind CSS v4 + Radix UI primitives + `tailwind-merge` for class merging. See `DESIGN.md` for design system (aesthetic, typography, color, spacing, layout, motion rationale) and `BRANDING.md` for component-level patterns and visual reference
- Decimal math: use `decimal.js` (not native floats) for token amounts
- Two SPL Token versions coexist: `@solana/spl-token` (0.4.14) and `spl-token-0.4.1` (aliased older version)
- Blockchain utilities in `src/utils/blockchain.utils.tsx` (RPC resolution, stealth wallets, SGT token checks)
- CSV parsing with `papaparse` for bulk transfer input
- ZIP generation with `jszip` + `file-saver` for NFT collection export
- `@noble/hashes` v2 uses `.js` suffixed imports: `@noble/hashes/legacy.js` (sha1), `@noble/hashes/utils.js` (bytesToHex). This works because of a webpack `extensionAlias` config in `next.config.ts` that maps `.js` → `[.js, .ts, .tsx]`
- Firebase analytics with hashed wallet addresses for privacy
- PWA enabled in production (disabled in dev)
- `typescript.ignoreBuildErrors: true` in next.config — TypeScript errors won't block builds
- `reactStrictMode: false`

### Design System

Always read `DESIGN.md` before making any visual or UI decisions. All font choices, colors, spacing, and aesthetic direction are defined there. Do not deviate without explicit user approval. In QA mode, flag any code that doesn't match `DESIGN.md`. Use Tailwind `@theme` token classes (`bg-surface-card`, `text-accent`) — never hardcode hex values for mapped colors.

### Deployment

Docker-based (see `DEPLOYMENT_MANUAL.md`). Standalone Next.js output, multi-stage Dockerfile, health checks at `/api/health`, auto-rollback on failure. Deploy script: `./scripts/deploy-docker-local.sh`.
