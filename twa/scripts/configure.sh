#!/usr/bin/env bash
#
# Render twa-manifest.json for one environment and regenerate the Android project.
#
#   ./scripts/configure.sh staging
#   ./scripts/configure.sh production
#
# Everything under app/ plus the gradle files are generated output — this script is the only
# supported way to produce them. Edit env/<env>.env or twa-manifest.template.json instead.
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

command -v bubblewrap >/dev/null || { echo "bubblewrap not found — npm i -g @bubblewrap/cli" >&2; exit 1; }

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

for VAR in HOST PACKAGE_ID APP_NAME LAUNCHER_NAME APP_VERSION_NAME APP_VERSION_CODE KEYSTORE_FILE KEYSTORE_ALIAS; do
  [[ -n "${!VAR:-}" ]] || { echo "$VAR is not set in $ENV_FILE" >&2; exit 1; }
done
[[ "$APP_VERSION_CODE" =~ ^[0-9]+$ ]] || { echo "APP_VERSION_CODE must be a whole number" >&2; exit 1; }
# Values are substituted into JSON by sed; keep them free of characters that would break either.
for VAR in APP_NAME LAUNCHER_NAME; do
  [[ "${!VAR}" != *[\\\"\&\#]* ]] || { echo "$VAR must not contain \\, \", & or #" >&2; exit 1; }
done

: "${ASSET_ORIGIN:=https://$HOST}"
KEYSTORE_PATH="$ROOT/$KEYSTORE_FILE"

# bubblewrap reads the web manifest and every icon over the network while generating, so they
# have to be reachable. Fail here rather than halfway through generation.
for ASSET in manifest.json app-icons/icon-512x512.png app-icons/icon-maskable-512x512.png; do
  if ! curl -fsS -o /dev/null --max-time 15 "$ASSET_ORIGIN/$ASSET"; then
    echo "cannot reach $ASSET_ORIGIN/$ASSET" >&2
    echo "deploy it first, or serve this repo's web app locally on :3000 and run:" >&2
    echo "  ASSET_ORIGIN=http://localhost:3000 ./scripts/configure.sh $ENV_NAME" >&2
    exit 1
  fi
done

echo "configuring $ENV_NAME — host=$HOST package=$PACKAGE_ID assets=$ASSET_ORIGIN"

# fingerprints is a JSON array in the manifest. Rendering it from the env file keeps it from
# being wiped on the next configure run — `bubblewrap fingerprint add` writes to the generated
# twa-manifest.json, which this script overwrites.
FINGERPRINTS_JSON="[]"
if [[ -n "${SHA256_FINGERPRINT:-}" ]]; then
  FINGERPRINTS_JSON=$(FPS="$SHA256_FINGERPRINT" ENV_NAME="$ENV_NAME" node -e '
    const fps = process.env.FPS.split(",").map(s => s.trim()).filter(Boolean);
    for (const fp of fps) {
      if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i.test(fp)) {
        console.error(`invalid SHA-256 fingerprint: ${fp}`);
        console.error("expected 32 colon-separated hex bytes, as printed by keytool -list -v");
        process.exit(1);
      }
    }
    process.stdout.write(JSON.stringify(fps.map((value, i) => ({
      name: fps.length > 1 ? `${process.env.ENV_NAME}-${i + 1}` : process.env.ENV_NAME,
      value,
    }))));
  ') || exit 1
fi

sed \
  -e "s#__HOST__#$HOST#g" \
  -e "s#__PACKAGE_ID__#$PACKAGE_ID#g" \
  -e "s#__APP_NAME__#$APP_NAME#g" \
  -e "s#__LAUNCHER_NAME__#$LAUNCHER_NAME#g" \
  -e "s#__APP_VERSION_NAME__#$APP_VERSION_NAME#g" \
  -e "s#__APP_VERSION_CODE__#$APP_VERSION_CODE#g" \
  -e "s#__KEYSTORE_PATH__#$KEYSTORE_PATH#g" \
  -e "s#__KEYSTORE_ALIAS__#$KEYSTORE_ALIAS#g" \
  -e "s#__ASSET_ORIGIN__#$ASSET_ORIGIN#g" \
  -e "s#__FINGERPRINTS__#$FINGERPRINTS_JSON#g" \
  "$ROOT/twa-manifest.template.json" > "$ROOT/twa-manifest.json"

# --skipVersionUpgrade keeps bubblewrap from mutating the version — env/<env>.env owns it.
(cd "$ROOT" && bubblewrap update --skipVersionUpgrade)

# Chrome 152+ rejects the splash hand-off unless the app holds a grant on its own splash URI, and
# a blank window shows before the page instead (android-browser-helper#623). Grant it in
# LauncherActivity before the library sends the image. The folder and file name are the library's.
LAUNCHER="$ROOT/app/src/main/java/${PACKAGE_ID//.//}/LauncherActivity.java"
GRANT=$(cat <<'JAVA'
        try {
            android.net.Uri splashUri = androidx.core.content.FileProvider.getUriForFile(this,
                    com.google.androidbrowserhelper.trusted.LauncherActivityMetadata
                            .parse(this).fileProviderAuthority,
                    new java.io.File(new java.io.File(getFilesDir(), "twa_splash"),
                            "splash_image.png"));
            grantUriPermission(getPackageName(), splashUri,
                    android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                            | android.content.Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        } catch (RuntimeException e) {
            android.util.Log.w("SplashGrant", "Could not grant the splash image URI", e);
        }
JAVA
)
GRANT="$GRANT" perl -0pi -e '
  my $n = s/^(        super\.onCreate\(savedInstanceState\);)$/$ENV{GRANT}\n$1/m;
  die "LauncherActivity.java changed shape; cannot add the splash URI grant\n" unless $n == 1;
' "$LAUNCHER"

# ASSET_ORIGIN is only where the icons and manifest were *read from* at generation time. The
# shipped app must resolve its web manifest from the host it actually opens, so rewrite the
# one generated string that carries it. twa-manifest.json is left as rendered, so re-running
# `bubblewrap update` stays idempotent and the checksum below stays valid.
if [[ "$ASSET_ORIGIN" != "https://$HOST" ]]; then
  echo "rewriting generated web_manifest_url from $ASSET_ORIGIN to https://$HOST"
  FROM="$ASSET_ORIGIN" TO="https://$HOST" perl -pi -e 's/\Q$ENV{FROM}\E/$ENV{TO}/g' "$ROOT/app/build.gradle"
fi

# bubblewrap compares this checksum on `build` to detect an out-of-date project.
node -e "const c=require('crypto'),f=require('fs');f.writeFileSync('$ROOT/manifest-checksum.txt',c.createHash('sha1').update(f.readFileSync('$ROOT/twa-manifest.json')).digest('hex'))"

# Digital asset links: without a matching assetlinks.json on $HOST the app falls back to a
# Custom Tab with a visible URL bar. The site serves public/.well-known/assetlinks.json.
ASSETLINKS="$ROOT/assetlinks.$ENV_NAME.json"
if [[ "$FINGERPRINTS_JSON" != "[]" ]]; then
  (cd "$ROOT" && bubblewrap fingerprint generateAssetLinks --output="$ASSETLINKS" >/dev/null)
  echo "wrote twa/$(basename "$ASSETLINKS") — make sure its entry is in public/.well-known/assetlinks.json"
else
  rm -f "$ASSETLINKS"
  echo "note: SHA256_FINGERPRINT is empty in $ENV_FILE — no assetlinks.json generated."
  echo "      the app will show a URL bar until $HOST serves matching asset links."
fi

echo
echo "configured for $ENV_NAME. next:"
echo "  ./gradlew assembleDebug   # debug-key-signed apk: shows a URL bar (asset links fail)"
echo "  bubblewrap build          # signed apk + aab using $KEYSTORE_FILE"
