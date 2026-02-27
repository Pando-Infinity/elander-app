# DEPLOYMENT_MANUAL - Elander Utility Frontend

Manual deployment script for Elander Utility Frontend (Next.js). Build and deploy Docker image locally on EC2 without GitHub Actions.

## Deployment Steps

### Step 1: Prepare `.env` file

Create `.env` at the project root:

**Devnet:**
```bash
NETWORK_MODE=devnet
PORT=3001
DAPP_SERVICE_URL=https://service.edas.ensofi.xyz/
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

**Mainnet:**
```bash
NETWORK_MODE=mainnet
PORT=3001
DAPP_SERVICE_URL=https://service.elander.xyz/
RPC_URL=https://api.mainnet-beta.solana.com/
WS_RPC=wss://api.mainnet-beta.solana.com/
NEXT_PUBLIC_SOLS_EXPLORER_URL=https://solscan.io

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

**Important:** `DAPP_SERVICE_URL`, `RPC_URL`, `WS_RPC`, and `NEXT_PUBLIC_*` vars are baked into the build at image creation time. Changing them requires rebuilding the image.

### Step 2: Pull latest code

```bash
git pull
```

### Step 3: Deploy

```bash
./scripts/deploy-docker-local.sh
```

Done! The script will automatically:
- Build Docker image with Next.js standalone output
- Deploy into container `elander-utility-frontend-devnet` (or `elander-utility-frontend-mainnet`)
- Health check `/api/health` and rollback on failure
- Clean up old images (keeps last 3 versions)

**Note:** Next.js build takes 5–10 minutes.

---

## Common Commands

```bash
# View logs
docker logs -f elander-utility-frontend-devnet

# Check status
docker ps --filter name=elander-utility-frontend-devnet
curl http://localhost:3001/api/health

# Restart
docker restart elander-utility-frontend-devnet

# Shell access
docker exec -it elander-utility-frontend-devnet sh
```

## Setup Nginx Reverse Proxy

```bash
# Usage: ./scripts/setup-nginx-proxy.sh NETWORK_MODE DOMAIN PORT
./scripts/setup-nginx-proxy.sh devnet dev.app.e-lander.xyz 3001
```

Then optionally set up SSL:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d dev.app.e-lander.xyz
```

## Troubleshooting

### Error: "ENOSPC: no space left on device"
```bash
docker system prune -af
docker builder prune -af
df -h
```

### Error: "Health check failed"
```bash
docker logs elander-utility-frontend-devnet --tail 50
curl http://localhost:3001/api/health
# Script will automatically rollback to previous version
```

### Error: "Next.js build failed"
```bash
# Check build output directly
docker build --progress=plain -t test-build .

# Clear build cache and retry
docker builder prune -af
./scripts/deploy-docker-local.sh
```

## Manual Rollback

```bash
docker stop elander-utility-frontend-devnet
docker rm elander-utility-frontend-devnet
docker images elander-utility-frontend-local  # list available versions

docker run -d \
  --name elander-utility-frontend-devnet \
  --restart unless-stopped \
  -p 3001:3000 \
  -e NETWORK_MODE=devnet \
  --network elander-utility-network \
  elander-utility-frontend-local:devnet-TIMESTAMP
```
