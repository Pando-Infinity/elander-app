#!/bin/bash
# Manual deployment script for Elander Utility Frontend
# Builds Docker image locally and deploys container
# Usage: ./deploy-docker-local.sh
# Configuration is loaded from .env file

set -e

# ============================================
# Color definitions
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# Logging functions
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

# ============================================
# Usage information
# ============================================
show_usage() {
    cat << EOF
Manual Deployment Script for Elander Utility Frontend

Usage: ./deploy-docker-local.sh

Configuration:
  All settings are loaded from .env file
  Required variables in .env:
    NETWORK_MODE=
    DAPP_SERVICE_URL=
    RPC_URL=
    WS_RPC=
    PORT=
    NEXT_PUBLIC_SOLS_EXPLORER_URL=

    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

EOF
}

# ============================================
# Validation functions
# ============================================

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        log_error "Please install Docker first: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        log_error "Please start Docker and try again"
        exit 1
    fi
}

check_required_files() {
    local missing_files=()

    if [ ! -f "Dockerfile" ]; then
        missing_files+=("Dockerfile")
    fi

    if [ ! -f ".env" ]; then
        missing_files+=(".env")
    fi

    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        log_error "Please run this script from the elander-utility-frontend directory"
        exit 1
    fi
}

# ============================================
# Load configuration from .env
# ============================================
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_usage
    exit 0
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    log_error ".env file not found"
    exit 1
fi

# Load environment variables from .env
log_info "Loading configuration from .env file..."
set -a
source .env
set +a

# ============================================
# Tunable constants
# ============================================
IMAGE_NAME="elander-utility-frontend-local"
NETWORK_NAME="elander-utility-network"
KEEP_IMAGES=3          # timestamped image versions to keep per environment
HEALTH_CHECK_MAX=30    # max health-check poll attempts
HEALTH_CHECK_SLEEP=2   # seconds between polls  (total timeout = MAX × SLEEP)
BUILD_CACHE_LIMIT="2GB"
LOG_TAIL_SUMMARY=20    # log lines shown in deployment summary
LOG_TAIL_ERROR=50      # log lines shown on health-check failure / rollback
NODE_MEM=4096           # MB for Node.js heap during build

# Set deployment variables
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_TAG="${NETWORK_MODE}"
IMAGE_TAG_TIMESTAMP="${NETWORK_MODE}-${TIMESTAMP}"
CONTAINER_NAME="elander-utility-frontend-${NETWORK_MODE}"
BACKUP_CONTAINER_NAME="${CONTAINER_NAME}-backup"

# ============================================
# Display deployment information
# ============================================
log_info "🚀 Starting manual Docker deployment"
log_info "Environment: ${NETWORK_MODE}"
log_info "Port: ${PORT}"
log_info "Container: ${CONTAINER_NAME}"
log_info "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

# ============================================
# Pre-flight checks
# ============================================
log_step "Running pre-flight checks..."
check_docker
check_required_files
log_success "Pre-flight checks passed"
echo ""

# ============================================
# Build Docker image
# ============================================
log_step "Building Docker image..."
log_info "Tags: ${IMAGE_NAME}:${IMAGE_TAG}, ${IMAGE_NAME}:${IMAGE_TAG_TIMESTAMP}"

# Enable BuildKit for faster builds with cache mounts
export DOCKER_BUILDKIT=1

if docker build \
    --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
    --tag "${IMAGE_NAME}:${IMAGE_TAG_TIMESTAMP}" \
    --build-arg NODE_MEM=${NODE_MEM} \
    --network=host \
    --file Dockerfile \
    . ; then
    log_success "Docker image built successfully"
else
    log_error "Failed to build Docker image"
    log_error "Please check the build output above for details"
    exit 1
fi
echo ""

# Verify image was created
if ! docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Repository}}:{{.Tag}}" | grep -q "${IMAGE_NAME}:${IMAGE_TAG}"; then
    log_error "Image verification failed: ${IMAGE_NAME}:${IMAGE_TAG} not found"
    exit 1
fi

IMAGE_SIZE=$(docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Size}}")
log_info "Image size: ${IMAGE_SIZE}"
echo ""

# ============================================
# Pre-deployment setup
# ============================================
log_step "Preparing for deployment..."

# Create network if not exists
if ! docker network inspect "${NETWORK_NAME}" &> /dev/null; then
    log_info "Creating Docker network: ${NETWORK_NAME}"
    docker network create "${NETWORK_NAME}"
else
    log_info "Docker network already exists: ${NETWORK_NAME}"
fi

# Check if container exists and backup if needed
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_info "Existing container found: ${CONTAINER_NAME}"

    # Get the current image for potential rollback
    CURRENT_IMAGE=$(docker inspect --format='{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "")

    if [ -n "$CURRENT_IMAGE" ]; then
        log_info "Current image: ${CURRENT_IMAGE}"

        # Stop the container
        log_info "Stopping container..."
        docker stop "${CONTAINER_NAME}" &> /dev/null || true

        # Rename to backup
        log_info "Renaming to backup: ${BACKUP_CONTAINER_NAME}"
        docker rename "${CONTAINER_NAME}" "${BACKUP_CONTAINER_NAME}" &> /dev/null || true
    fi
else
    log_info "No existing container found (first deployment)"
    CURRENT_IMAGE=""
fi
echo ""

# ============================================
# Deploy new container
# ============================================
log_step "Deploying new container..."
log_info "Container name: ${CONTAINER_NAME}"
log_info "Port mapping: ${PORT}:3000"
log_info "Network: ${NETWORK_NAME}"

if docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    -p "${PORT}:3000" \
    -e NETWORK_MODE="${NETWORK_MODE}" \
    --network "${NETWORK_NAME}" \
    --label "com.elander-utility.app=frontend" \
    --label "com.elander-utility.environment=${NETWORK_MODE}" \
    --label "com.elander-utility.deployed-by=manual" \
    --label "com.elander-utility.deployed-at=${TIMESTAMP}" \
    "${IMAGE_NAME}:${IMAGE_TAG}"; then
    log_success "Container started successfully"
else
    log_error "Failed to start container"

    # Rollback: restore backup if exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${BACKUP_CONTAINER_NAME}$"; then
        log_warning "Attempting rollback..."
        docker rename "${BACKUP_CONTAINER_NAME}" "${CONTAINER_NAME}" &> /dev/null || true
        docker start "${CONTAINER_NAME}" &> /dev/null || true
        log_error "Rolled back to previous version"
    fi

    exit 1
fi
echo ""

# ============================================
# Health check
# ============================================
log_step "Performing health check..."
log_info "Waiting for container to be healthy (timeout: $((HEALTH_CHECK_MAX * HEALTH_CHECK_SLEEP)) seconds)..."

MAX_ATTEMPTS=${HEALTH_CHECK_MAX}
ATTEMPT=0
HEALTH_CHECK_PASSED=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    # Check if container is still running
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_error "Container stopped unexpectedly!"
        echo ""
        log_error "Container logs:"
        docker logs "${CONTAINER_NAME}" --tail ${LOG_TAIL_ERROR}
        HEALTH_CHECK_PASSED=false
        break
    fi

    # Try to access the health endpoint
    if curl -f -s -o /dev/null "http://localhost:${PORT}/api/health" 2>/dev/null || \
       docker exec "${CONTAINER_NAME}" wget -q -O- "http://localhost:3000/api/health" &> /dev/null; then
        echo ""
        log_success "Container is healthy!"
        HEALTH_CHECK_PASSED=true
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep ${HEALTH_CHECK_SLEEP}

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo ""
        log_error "Health check failed after ${MAX_ATTEMPTS} attempts"
        log_error "Container logs:"
        docker logs "${CONTAINER_NAME}" --tail ${LOG_TAIL_ERROR}
        HEALTH_CHECK_PASSED=false
    fi
done

# ============================================
# Handle health check result
# ============================================
if [ "$HEALTH_CHECK_PASSED" = false ]; then
    log_error "Deployment failed!"
    echo ""
    log_step "Rolling back to previous version..."

    # Stop and remove failed container
    docker stop "${CONTAINER_NAME}" &> /dev/null || true
    docker rm "${CONTAINER_NAME}" &> /dev/null || true

    # Restore backup if exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${BACKUP_CONTAINER_NAME}$"; then
        docker rename "${BACKUP_CONTAINER_NAME}" "${CONTAINER_NAME}" &> /dev/null || true
        docker start "${CONTAINER_NAME}" &> /dev/null || true
        log_success "Rolled back to previous version"

        # Verify rollback
        if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            log_info "Previous version is running"
        fi
    else
        log_warning "No backup container available for rollback"
    fi

    exit 1
fi
echo ""

# ============================================
# Cleanup backup container
# ============================================
log_step "Cleaning up backup container..."
if docker ps -a --format '{{.Names}}' | grep -q "^${BACKUP_CONTAINER_NAME}$"; then
    docker rm "${BACKUP_CONTAINER_NAME}" &> /dev/null || true
    log_info "Backup container removed"
fi

# ============================================
# Cleanup old images and Docker resources
# ============================================
log_step "Cleaning up Docker resources to save disk space..."
log_info "Keeping last ${KEEP_IMAGES} versions..."

# Get all images for this environment, sorted by creation date (newest first)
OLD_IMAGES=$(docker images "${IMAGE_NAME}" --format "{{.ID}} {{.Tag}}" | \
    grep "${NETWORK_MODE}-" | \
    tail -n +$((KEEP_IMAGES + 1)) | \
    awk '{print $1}')

if [ -n "$OLD_IMAGES" ]; then
    CLEANUP_COUNT=0
    for img in $OLD_IMAGES; do
        if docker rmi "$img" &> /dev/null; then
            CLEANUP_COUNT=$((CLEANUP_COUNT + 1))
        fi
    done

    if [ $CLEANUP_COUNT -gt 0 ]; then
        log_info "Removed ${CLEANUP_COUNT} old image(s)"
    fi
else
    log_info "No old images to clean up"
fi

# Prune dangling images
log_info "Pruning dangling images..."
docker image prune -f &> /dev/null || true

# Prune build cache (keep recent cache for faster rebuilds)
log_info "Pruning Docker build cache..."
docker builder prune -f --keep-storage ${BUILD_CACHE_LIMIT} &> /dev/null || true

# Show disk space saved
log_info "Cleaning up unused containers and networks..."
docker container prune -f &> /dev/null || true
docker network prune -f &> /dev/null || true

DISK_USAGE=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}" | tail -n +2)
log_success "Docker cleanup completed!"
echo ""
log_info "Current Docker disk usage:"
echo "${DISK_USAGE}"
echo ""

# ============================================
# Display deployment summary
# ============================================
log_success "✅ Deployment completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "📦 Container: ${CONTAINER_NAME}"
log_info "🐳 Image: ${IMAGE_NAME}:${IMAGE_TAG}"
log_info "🔧 Port: ${PORT}"
log_info "⏰ Deployed at: ${TIMESTAMP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================
# Show container status
# ============================================
log_step "Container status:"
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# ============================================
# Show recent logs
# ============================================
log_step "Recent logs:"
docker logs "${CONTAINER_NAME}" --tail ${LOG_TAIL_SUMMARY}
echo ""

# ============================================
# Show useful commands
# ============================================
log_info "Useful commands:"
echo "  📊 View logs:        docker logs -f ${CONTAINER_NAME}"
echo "  🔍 Check status:     docker ps --filter name=${CONTAINER_NAME}"
echo "  🛑 Stop container:   docker stop ${CONTAINER_NAME}"
echo "  ♻️  Restart:          docker restart ${CONTAINER_NAME}"
echo "  🔧 Shell access:     docker exec -it ${CONTAINER_NAME} sh"
echo ""
log_success "🎉 Deployment complete!"
