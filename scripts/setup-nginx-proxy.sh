#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we need sudo
# Try to detect if we have write permission to nginx directories
SUDO=""
if [ "$EUID" -ne 0 ]; then
    # Not root, check if we can write to /etc/nginx
    if [ ! -w "/etc/nginx" ]; then
        # No write permission, try with sudo
        if command -v sudo &> /dev/null; then
            SUDO="sudo"
            log_info "Using sudo for nginx configuration"
        else
            log_warning "No write permission to /etc/nginx and sudo not available"
        fi
    else
        log_info "Have write permission to /etc/nginx, no sudo needed"
    fi
fi

log_info "🚀 Setting up Nginx reverse proxy for Elander Utility Frontend"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    log_step "Installing Nginx..."
    $SUDO apt update
    $SUDO apt install nginx -y
else
    log_info "Nginx is already installed"
fi

# Get parameters: NETWORK_MODE, DOMAIN, PORT
NETWORK_MODE=${1:-"dev"}
DOMAIN=${2:-"_"}
PORT=${3:-"3001"}

log_info "Environment: ${NETWORK_MODE}"
log_info "Domain: ${DOMAIN} → localhost:${PORT}"

# Detect nginx config directory structure
if [ -d "/etc/nginx/sites-available" ]; then
    # Ubuntu/Debian style
    NGINX_CONFIG_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
    USE_SYMLINK=true
    log_info "Detected Ubuntu/Debian nginx structure"
elif [ -d "/etc/nginx/conf.d" ]; then
    # Amazon Linux/RHEL/CentOS style
    NGINX_CONFIG_DIR="/etc/nginx/conf.d"
    USE_SYMLINK=false
    log_info "Detected Amazon Linux/RHEL nginx structure"
else
    log_error "Cannot find nginx config directory"
    exit 1
fi

CONFIG_FILE="${NGINX_CONFIG_DIR}/elander-utility-frontend-${NETWORK_MODE}.conf"

# Check if config file already exists
if [ -f "${CONFIG_FILE}" ]; then
    log_warning "Config file already exists: ${CONFIG_FILE}"
    log_warning "Skipping config file creation to avoid overwriting existing configuration"
    SKIP_CONFIG_CREATION=true
else
    SKIP_CONFIG_CREATION=false
fi

# Create nginx config for specific environment
if [ "$SKIP_CONFIG_CREATION" = false ]; then
    log_step "Creating Nginx reverse proxy configuration for ${NETWORK_MODE}..."
    $SUDO tee ${CONFIG_FILE} > /dev/null <<EOF
# Elander Utility Frontend - ${NETWORK_MODE} environment
server {
    listen 80;
    server_name ${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/elander-utility-frontend-${NETWORK_MODE}-access.log;
    error_log /var/log/nginx/elander-utility-frontend-${NETWORK_MODE}-error.log;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
fi

# Enable site (Ubuntu/Debian only, uses symlink)
if [ "$USE_SYMLINK" = true ]; then
    log_step "Enabling site configuration..."
    $SUDO ln -sf ${CONFIG_FILE} ${NGINX_ENABLED_DIR}/

    # Remove default nginx site if exists
    if [ -f ${NGINX_ENABLED_DIR}/default ]; then
        log_warning "Removing default nginx site..."
        $SUDO rm ${NGINX_ENABLED_DIR}/default
    fi
else
    log_info "Config file created directly in conf.d (no symlink needed)"
fi

# Test nginx configuration
log_step "Testing Nginx configuration..."
$SUDO nginx -t

# Reload nginx
log_step "Reloading Nginx..."
$SUDO systemctl reload nginx

log_info "✅ Nginx reverse proxy setup completed for ${NETWORK_MODE}!"
log_info ""
log_info "Configuration:"
log_info "   Environment: ${NETWORK_MODE}"
log_info "   Domain: ${DOMAIN}"
log_info "   Port: ${PORT}"
log_info "   Config file: ${CONFIG_FILE}"
log_info ""
log_info "Next steps:"
log_info "1. Make sure DNS points to this server:"
log_info "   ${DOMAIN} → $(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
log_info ""
log_info "2. Setup SSL certificate (optional but recommended):"
log_info "   ${SUDO} apt install certbot python3-certbot-nginx -y"
log_info "   ${SUDO} certbot --nginx -d ${DOMAIN}"
log_info ""
log_info "3. Test your setup:"
log_info "   curl http://${DOMAIN}"
