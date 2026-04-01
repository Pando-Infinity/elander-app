# DEPLOYMENT_MANUAL - Elander Utility Frontend

Two deployment methods are supported:

- **[AWS Amplify](#aws-amplify-deployment)** — Recommended for new deployments. Managed hosting with CI/CD, automatic SSL, and global CDN.
- **[Docker (EC2)](#docker-ec2-deployment)** — Self-hosted on EC2. Full control, requires manual ops.

---

# AWS Amplify Deployment

## Prerequisites

### 1. Install AWS CLI

**macOS (Homebrew):**
```bash
brew install awscli
aws --version   # aws-cli/2.x.x
```

**macOS (official installer):**
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:** Download and run the MSI from https://awscli.amazonaws.com/AWSCLIV2.msi

### 2. Configure AWS CLI credentials

```bash
aws configure
```

You will be prompted for:
```
AWS Access Key ID:     <your-access-key>
AWS Secret Access Key: <your-secret-key>
Default region:        ap-southeast-1       # or your preferred region
Default output format: json
```

Get credentials from: **AWS Console → IAM → Users → your user → Security credentials → Create access key**

Verify authentication:
```bash
aws sts get-caller-identity
```

### 3. Required IAM Permissions

Your AWS user/role needs at minimum:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:GetApp",
        "amplify:UpdateApp",
        "amplify:ListApps",
        "amplify:StartJob",
        "amplify:GetJob",
        "amplify:ListJobs"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Step 1: Create Amplify App

### Option A — Connect via AWS Console (recommended for first setup)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create new app"**
3. Choose **GitHub** (or GitLab/Bitbucket) → Authenticate → Select the `elander-app` repo
4. Select branch: `main` (mainnet) or `dev` (devnet)
5. Framework is auto-detected as **Next.js - SSR**
6. Click **"Save and deploy"** — the first build will fail (env vars not set yet, that's fine)

### Option B — Create via AWS CLI

```bash
aws amplify create-app \
  --name "elander-app" \
  --platform WEB_COMPUTE \
  --region ap-southeast-1

# Connect a branch
aws amplify create-branch \
  --app-id <YOUR_APP_ID> \
  --branch-name main \
  --framework "Next.js - SSR" \
  --stage PRODUCTION
```

---

## Step 2: Get Your App ID

```bash
# List all Amplify apps
aws amplify list-apps --query 'apps[*].[appId,name]' --output table
```

Or find it in: **Amplify Console → your app → App settings → General → App ARN**
(format: `arn:aws:amplify:<region>:<account>:apps/<APP_ID>`)

---

## Step 3: Configure Local App ID

```bash
cp .amplify-config.example .amplify-config
```

Edit `.amplify-config`:
```bash
AMPLIFY_APP_ID=your-app-id-here   # e.g. d1abc23def456
```

`.amplify-config` is gitignored — never commit it.

---

## Step 4: Set Environment Variables

Create your `.env` from the appropriate template:

**Devnet:**
```bash
NETWORK_MODE=devnet
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

> **Note:** `PORT` is not needed — Amplify manages its own port. All env vars are baked into the build at compile time. Changing them requires a redeploy.

Sync to Amplify:
```bash
# Dry run first — verify what will be set
./scripts/amplify-env-sync.sh --dry-run

# Push env vars to Amplify
./scripts/amplify-env-sync.sh

# Push and immediately trigger a build
./scripts/amplify-env-sync.sh --branch main
```

For a devnet branch using a separate env file:
```bash
./scripts/amplify-env-sync.sh --env-file .env.dev --branch dev
```

---

## Step 5: Configure Build Settings in Console

In **Amplify Console → your app → Hosting → Build settings**:

| Setting | Value |
|---|---|
| Build spec | `amplify.yml` (auto-detected from repo root) |
| Node.js version | `22` |

To set Node.js version, go to **Build settings → Edit** and add:
```yaml
# or set via console package manager settings
```
Or add to `amplify.yml` preBuild:
```yaml
- nvm install 22 && nvm use 22
```

---

## Step 6: Custom Domain (Optional)

```bash
# Add a custom domain
aws amplify create-domain-association \
  --app-id <YOUR_APP_ID> \
  --domain-name e-lander.xyz \
  --sub-domain-settings '[
    {"prefix":"","branchName":"main"},
    {"prefix":"dev","branchName":"dev"}
  ]'
```

Or via Console: **Amplify → App → Hosting → Custom domains → Add domain**

Amplify provisions SSL automatically via ACM.

---

## Ongoing Deployments

After initial setup, every push to the connected branch triggers an automatic build and deploy.

To manually trigger a build:
```bash
aws amplify start-job \
  --app-id <YOUR_APP_ID> \
  --branch-name main \
  --job-type RELEASE
```

To check build status:
```bash
aws amplify list-jobs \
  --app-id <YOUR_APP_ID> \
  --branch-name main \
  --query 'jobSummaries[0].{status:status,id:jobId,time:startTime}' \
  --output table
```

---

## Multi-Environment Branch Setup

| Branch | Environment | Domain |
|---|---|---|
| `main` | Mainnet | `app.e-lander.xyz` |
| `dev` | Devnet | `dev.app.e-lander.xyz` |

Set different env vars per branch in:
**Amplify Console → App settings → Environment variables → Branch-specific overrides**

Or sync each branch separately:
```bash
# Sync mainnet env to main branch
./scripts/amplify-env-sync.sh --env-file .env --branch main

# Sync devnet env to dev branch
./scripts/amplify-env-sync.sh --env-file .env.dev --branch dev
```

---

## Troubleshooting

### Build fails: "Cannot find module" / pnpm not found
Ensure the `amplify.yml` preBuild includes `corepack enable pnpm`. Check that `amplify.yml` exists at the repo root.

### Build fails: JavaScript heap out of memory
`NODE_OPTIONS=--max-old-space-size=4096` is auto-injected by the sync script. Verify it's set in Amplify Console → Environment variables.

### "AMPLIFY_BUILD is not set" / `output: standalone` error
The sync script automatically sets `AMPLIFY_BUILD=true`. Verify it appears in environment variables and trigger a fresh build.

### Env vars changed but app still uses old values
Env vars are baked at build time. You must trigger a full redeploy after updating them:
```bash
./scripts/amplify-env-sync.sh --branch main
```

### `/dapp-service/*` returns 404
The Next.js rewrite in `next.config.ts` proxies this path to `DAPP_SERVICE_URL`. Verify `DAPP_SERVICE_URL` is set correctly in Amplify env vars and the backend is reachable from Amplify's compute.

---

# Docker (EC2) Deployment

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
