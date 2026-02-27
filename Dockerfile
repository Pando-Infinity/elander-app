# syntax=docker/dockerfile:1.4
# Multi-stage Dockerfile for Next.js App
# Optimized for fast builds with BuildKit cache mounts

# Global build args (available to all FROM instructions)
ARG NODE_VERSION=22

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:${NODE_VERSION}-alpine AS deps

# Install build dependencies for native modules (usb, node-gyp)
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    linux-headers \
    eudev-dev \
    libusb-dev

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.yarn/cache \
    --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/root/.cache/pnpm \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --prefer-offline; \
  elif [ -f package-lock.json ]; then npm ci --prefer-offline; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ============================================
# Stage 2: Builder
# ============================================
FROM node:${NODE_VERSION}-alpine AS builder

# Override at build time: --build-arg NODE_MEM=4096
ARG NODE_MEM=4096
ENV NODE_OPTIONS="--max-old-space-size=${NODE_MEM}"

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with cache mount for faster incremental builds
# Next.js will automatically load variables from .env file
RUN --mount=type=cache,target=/app/.next/cache \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner

# Stage-local args (ARGs reset per stage; re-declare to use in RUN/ENV/EXPOSE)
ARG UID=1001
ARG GID=1001
ARG APP_PORT=3000

# Install runtime dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    libusb

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid ${GID} nodejs && \
    adduser --system --uid ${UID} nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Set correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE ${APP_PORT}

ENV PORT=${APP_PORT}
ENV HOSTNAME="0.0.0.0"

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start Next.js
CMD ["node", "server.js"]
