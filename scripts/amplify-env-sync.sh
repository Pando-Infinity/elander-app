#!/bin/bash
# Sync environment variables from a local .env file to AWS Amplify Hosting.
# Reads the .env file, merges with Amplify-required vars, and calls aws amplify update-app.
#
# Usage:
#   ./scripts/amplify-env-sync.sh [OPTIONS]
#
# Options:
#   --app-id <id>       Amplify App ID (overrides AMPLIFY_APP_ID env var or .amplify-config)
#   --env-file <path>   Path to .env file (default: .env)
#   --branch <name>     Branch to trigger redeploy after sync (optional)
#   --dry-run           Print what would be set without calling AWS
#   -h, --help          Show this help message

set -e

# ============================================
# Color definitions
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_step()    { echo -e "${BLUE}[STEP]${NC} $1"; }
log_success() { echo -e "${CYAN}[SUCCESS]${NC} $1"; }

# ============================================
# Defaults
# ============================================
ENV_FILE=".env"
AMPLIFY_APP_ID=""
TRIGGER_BRANCH=""
DRY_RUN=false
CONFIG_FILE=".amplify-config"

# ============================================
# Parse arguments
# ============================================
while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-id)   AMPLIFY_APP_ID="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --branch)   TRIGGER_BRANCH="$2"; shift 2 ;;
    --dry-run)  DRY_RUN=true; shift ;;
    -h|--help)
      sed -n '/^# Usage:/,/^[^#]/{ /^[^#]/d; s/^# \{0,3\}//; p }' "$0"
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

# ============================================
# Resolve App ID
# Priority: --app-id flag > AMPLIFY_APP_ID env var > .amplify-config file
# ============================================
if [ -z "$AMPLIFY_APP_ID" ] && [ -f "$CONFIG_FILE" ]; then
  AMPLIFY_APP_ID=$(grep -E '^AMPLIFY_APP_ID=' "$CONFIG_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "$AMPLIFY_APP_ID" ]; then
  log_error "Amplify App ID not found."
  log_error "Provide it via one of:"
  log_error "  --app-id <id>"
  log_error "  AMPLIFY_APP_ID=<id> in environment"
  log_error "  AMPLIFY_APP_ID=<id> in .amplify-config"
  exit 1
fi

# ============================================
# Pre-flight checks
# ============================================
if ! command -v aws &> /dev/null; then
  log_error "AWS CLI is not installed."
  log_error "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
  log_error "AWS CLI is not authenticated. Run: aws configure"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  log_error ".env file not found: $ENV_FILE"
  exit 1
fi

# ============================================
# Parse .env using two parallel indexed arrays
# (bash 3.2 compatible — no declare -A needed)
# ============================================
# Skip: blank lines, comments (#), PORT (Amplify manages its own port)
KEYS=()
VALS=()

# Helper: check if key already exists in KEYS, update value if so
upsert_var() {
  local k="$1" v="$2"
  local i
  for i in "${!KEYS[@]}"; do
    if [ "${KEYS[$i]}" = "$k" ]; then
      VALS[$i]="$v"
      return
    fi
  done
  KEYS+=("$k")
  VALS+=("$v")
}

while IFS= read -r line || [ -n "$line" ]; do
  # strip leading/trailing whitespace
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"

  # skip comments and blank lines
  [[ -z "$line" || "$line" == \#* ]] && continue

  # must contain =
  [[ "$line" != *=* ]] && continue

  key="${line%%=*}"
  val="${line#*=}"

  # strip surrounding quotes from value
  val="${val%\"}"
  val="${val#\"}"
  val="${val%\'}"
  val="${val#\'}"

  # skip PORT — Amplify manages it internally
  [ "$key" = "PORT" ] && continue

  upsert_var "$key" "$val"
done < "$ENV_FILE"

# ============================================
# Inject Amplify-required variables
# ============================================
upsert_var "AMPLIFY_BUILD" "true"
upsert_var "NODE_OPTIONS" "--max-old-space-size=4096"

# ============================================
# Build JSON payload
# Use JSON for safety — handles special chars, spaces, URLs with commas
# ============================================
log_step "Building environment variable payload..."

JSON_PAYLOAD="{"
FIRST=true
for i in "${!KEYS[@]}"; do
  k="${KEYS[$i]}"
  v="${VALS[$i]}"
  # JSON-escape backslashes then double quotes
  v="${v//\\/\\\\}"
  v="${v//\"/\\\"}"

  if [ "$FIRST" = true ]; then
    JSON_PAYLOAD+="\"$k\":\"$v\""
    FIRST=false
  else
    JSON_PAYLOAD+=",\"$k\":\"$v\""
  fi
done
JSON_PAYLOAD+="}"

# ============================================
# Display summary
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "App ID    : ${AMPLIFY_APP_ID}"
log_info "Env file  : ${ENV_FILE}"
log_info "Dry run   : ${DRY_RUN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_step "Variables to sync (${#KEYS[@]} total):"

# Sort display by key name
for i in $(
  for j in "${!KEYS[@]}"; do echo "$j ${KEYS[$j]}"; done \
  | sort -k2 \
  | awk '{print $1}'
); do
  k="${KEYS[$i]}"
  v="${VALS[$i]}"
  if echo "$k" | grep -qiE '(KEY|SECRET|TOKEN|PASSWORD|MEASUREMENT)'; then
    echo "  ${k}=${v:0:6}****"
  else
    echo "  ${k}=${v}"
  fi
done
echo ""

# ============================================
# Dry run exit
# ============================================
if [ "$DRY_RUN" = true ]; then
  log_warning "DRY RUN — no changes made to Amplify."
  exit 0
fi

# ============================================
# Push to Amplify
# ============================================
log_step "Updating Amplify environment variables..."

if aws amplify update-app \
  --app-id "$AMPLIFY_APP_ID" \
  --environment-variables "$JSON_PAYLOAD" \
  --output json > /dev/null; then
  log_success "Environment variables synced successfully!"
else
  log_error "Failed to update Amplify environment variables."
  log_error "Check your AWS permissions: amplify:UpdateApp"
  exit 1
fi

# ============================================
# Optional: trigger redeploy
# ============================================
if [ -n "$TRIGGER_BRANCH" ]; then
  echo ""
  log_step "Triggering redeploy on branch: ${TRIGGER_BRANCH}..."
  JOB_ID=$(aws amplify start-job \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name "$TRIGGER_BRANCH" \
    --job-type RELEASE \
    --output json \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['jobSummary']['jobId'])" 2>/dev/null || echo "")

  if [ -n "$JOB_ID" ]; then
    log_success "Build triggered! Job ID: ${JOB_ID}"
    log_info "Monitor at: https://console.aws.amazon.com/amplify/home#/${AMPLIFY_APP_ID}/${TRIGGER_BRANCH}/${JOB_ID}"
  else
    log_warning "Redeploy trigger failed. Trigger manually from the Amplify Console."
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Done! Env vars from '${ENV_FILE}' synced to Amplify app '${AMPLIFY_APP_ID}'."
log_warning "NOTE: Changes take effect on the next build. Redeploy the app to apply them."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
