#!/usr/bin/env bash
#
# Build the signed release APK for one environment (run configure.sh first) and check it is
# signed with the key env/<env>.env expects.
#
#   export SOLANA_MOBILE_KEYSTORE_PASSWORD=...   # key password defaults to the same value
#   ./scripts/build.sh staging [output-dir]
#
# Needs ANDROID_HOME (SDK with platform 37 + build-tools) and JAVA_HOME (JDK 17).
set -euo pipefail

ENV_NAME="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/env/$ENV_NAME.env"
[[ -n "$ENV_NAME" && -f "$ENV_FILE" ]] || { echo "usage: $0 <environment> [output-dir]" >&2; exit 1; }
[[ -d "$ROOT/webshell" ]] || { echo "run scripts/configure.sh $ENV_NAME first" >&2; exit 1; }
: "${ANDROID_HOME:?set ANDROID_HOME}" "${JAVA_HOME:?set JAVA_HOME}"
: "${SOLANA_MOBILE_KEYSTORE_PASSWORD:?set SOLANA_MOBILE_KEYSTORE_PASSWORD}"

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

# configure.sh may have been run for another env; building that would ship the wrong app.
grep -q "\"packageId\": \"$PACKAGE_ID\"" "$ROOT/webshell/twa-manifest.json" \
  || { echo "webshell/ was not configured for $ENV_NAME - run scripts/configure.sh $ENV_NAME" >&2; exit 1; }
# Version and URL are baked in at configure time; a bump in env/<env>.env needs a re-configure.
for LINE in "SOLANA_MOBILE_URL=https://$HOST/?platform=seeker" \
            "SOLANA_MOBILE_VERSION_CODE=$APP_VERSION_CODE" "SOLANA_MOBILE_VERSION_NAME=$APP_VERSION_NAME"; do
  grep -qxF "$LINE" "$ROOT/webshell/gradle.properties" \
    || { echo "webshell/ is out of date ($LINE) - run scripts/configure.sh $ENV_NAME" >&2; exit 1; }
done

npx --yes "solana-mobile@${SOLANA_MOBILE_CLI_VERSION:-$(<"$ROOT/scripts/cli-version")}" --skip-version-check webshell build "$ROOT/webshell"

APK="$ROOT/webshell/app/build/outputs/apk/release/app-release.apk"
[[ -f "$APK" ]] || { echo "APK not produced: $APK" >&2; exit 1; }

APKSIGNER=$(ls -d "$ANDROID_HOME"/build-tools/*/apksigner | sort -V | tail -1)
GOT=$("$APKSIGNER" verify --print-certs "$APK" | sed -n 's/.*certificate SHA-256 digest: //p' | head -1 | tr a-f A-F)
WANT=$(echo "$SHA256_FINGERPRINT" | tr -d ':' | tr a-f A-F)
[[ "$GOT" == "$WANT" ]] || { echo "APK signed with SHA-256 $GOT, expected $WANT" >&2; exit 1; }

OUT="${2:-}"
if [[ -n "$OUT" ]]; then mkdir -p "$OUT" && cp "$APK" "$OUT/app-release.apk" && APK="$OUT/app-release.apk"; fi
echo "built $APK (signing fingerprint matches env/$ENV_NAME.env)"
