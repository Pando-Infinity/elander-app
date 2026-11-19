#!/usr/bin/env bash
#
# Generate the webshell Android project for one environment into ./webshell (git-ignored).
#
#   ./scripts/configure.sh staging
#
# ./webshell is output: edit env/<env>.env and re-run, never patch it.
set -euo pipefail

ENV_NAME="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/env/$ENV_NAME.env"

if [[ -z "$ENV_NAME" || ! -f "$ENV_FILE" ]]; then
  echo "usage: $0 <environment>" >&2
  echo "available:" >&2
  for f in "$ROOT"/env/*.env; do echo "  - $(basename "$f" .env)" >&2; done
  exit 1
fi

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

KEYSTORE_PATH="$ROOT/$KEYSTORE_FILE"
# init would create a fresh keystore (a new signing identity) if this one were missing.
[[ -f "$KEYSTORE_PATH" ]] || { echo "keystore not found: $KEYSTORE_PATH (README, Signing key)" >&2; exit 1; }
command -v node >/dev/null || { echo "node/npx not found" >&2; exit 1; }

# init reads colors and the icon from the site's web manifest, so $HOST has to be reachable.
MANIFEST_URL="https://$HOST/manifest.json"
curl -fsS -o /dev/null --max-time 15 "$MANIFEST_URL" || { echo "cannot reach $MANIFEST_URL" >&2; exit 1; }

echo "configuring $ENV_NAME - url=https://$HOST/?platform=seeker package=$PACKAGE_ID"

rm -rf "$ROOT/webshell"
npx --yes "solana-mobile@${SOLANA_MOBILE_CLI_VERSION:-$(<"$ROOT/scripts/cli-version")}" --skip-version-check webshell init "$ROOT/webshell" \
  --manifest "$MANIFEST_URL" \
  --url "https://$HOST/?platform=seeker" \
  --application-id "$PACKAGE_ID" \
  --app-name "$APP_NAME" \
  --version-name "$APP_VERSION_NAME" \
  --version-code "$APP_VERSION_CODE" \
  --keystore-path "$KEYSTORE_PATH" \
  --keystore-alias "$KEYSTORE_ALIAS"

# CLI always insets the launcher foreground 18dp. /app-icons/icon-maskable-512x512.png already keeps
# the art inside the adaptive-icon safe zone, so that inset would shrink it twice.
# Inset 0dp; fail if the CLI renames these files so the fix cannot silently vanish.
RES="$ROOT/webshell/app/src/main/res"
FG_XML="$RES/drawable/ic_launcher_foreground.xml"
compgen -G "$RES/drawable-nodpi/ic_launcher_foreground_inner.*" >/dev/null && [[ -f "$FG_XML" ]] \
  || { echo "launcher icon files not found under $RES (CLI layout changed? update the inset fix)" >&2; exit 1; }
cat > "$FG_XML" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<inset xmlns:android="http://schemas.android.com/apk/res/android"
    android:drawable="@drawable/ic_launcher_foreground_inner"
    android:inset="0dp" />
XML

# The site scrolls inside [data-scroll-container], not the window, so the CLI's canScrollVertically(-1) always reports "at top"
# and pull-to-refresh steals the gesture. Add a JS bridge and patch MainActivity.kt; exact anchors, fail if the CLI changed.
MAIN_KT="$(find "$ROOT/webshell/app/src/main/java" -name MainActivity.kt)"
[[ -n "$MAIN_KT" ]] || { echo "MainActivity.kt not found (CLI layout changed? update the scroll patch)" >&2; exit 1; }
PKG="$(sed -n 's/^package \(.*\)$/\1/p' "$MAIN_KT")"
sed "s/PLACEHOLDER_PACKAGE/$PKG/" "$ROOT/scripts/patches/ScrollUpBridge.kt" > "$(dirname "$MAIN_KT")/ScrollUpBridge.kt"
python3 - "$MAIN_KT" <<'PY'
import sys
path = sys.argv[1]
src = open(path).read()
patches = [
    ("setOnChildScrollUpCallback { _, _ -> webView.canScrollVertically(-1) }",
     "setOnChildScrollUpCallback { _, _ -> webView.canScrollVertically(-1) || ScrollUpBridge.canScrollUp }"),
    ("settings.javaScriptEnabled = true\n",
     "settings.javaScriptEnabled = true\n                addJavascriptInterface(ScrollUpBridge, ScrollUpBridge.NAME)\n"),
    ("probeViewportAndMaybePatch(view, BuildConfig.DEBUG)\n",
     "probeViewportAndMaybePatch(view, BuildConfig.DEBUG)\n                            ScrollUpBridge.install(view)\n"),
]
for old, new in patches:
    if src.count(old) != 1:
        sys.exit("scroll patch anchor not found exactly once (CLI changed MainActivity.kt?): " + old.strip())
    src = src.replace(old, new)
open(path, "w").write(src)
PY

echo "configured $ENV_NAME. next: scripts/build.sh $ENV_NAME"
