# twa

Trusted Web Activity (TWA) wrapper that ships the E-Lander web app as an installable Android app,
for Solana Seeker (dApp Store / sideload) and Play. It holds no product code: the app opens the
website full screen, so a web deploy is an app update.

Generated with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap). No CI/CD: builds are
made locally on macOS. `twa/` holds no JS/TS, so the Next.js build, lint and typecheck never
pick it up, and it is left out of the Docker context (`.dockerignore`).

## Environments

| Env | Opens | Package id | Name |
| --- | --- | --- | --- |
| `staging` | `https://www.beta.e-lander.xyz` | `xyz.e_lander.app.dev` | E-Lander dev |

Production gets its own `env/production.env`, package id and keystore when it ships.

`xyz.e_lander.beta.twa` is an earlier build signed with a key this repo does not have. Its entry
stays in `public/.well-known/assetlinks.json` so installed copies keep verifying; do not reuse
the id.

## Layout

```
env/<env>.env              # per-environment config, the file you edit
twa-manifest.template.json # shared manifest; __PLACEHOLDERS__ filled from env/<env>.env
scripts/configure.sh       # renders twa-manifest.json and regenerates the Android project
```

Everything else (`app/`, gradle files, `twa-manifest.json`, `manifest-checksum.txt`) is generated
and git-ignored. Regenerate it; do not patch it.

Colors follow the app: status bar and splash `#0A0A0A` (the page background), navigation bar
`#151515` like the bottom nav. Icons come from the website, with `/manifest.json`: the launcher
icon is `/app-icons/icon-512x512.png`, and `/app-icons/icon-maskable-512x512.png` is the same art
scaled down on `#0A0A0A`, inside the safe zone Android crops adaptive icons to. Until that file is
deployed, configure against the local dev server (below).

Chrome keeps the splash over the page until it paints, but only if it accepts the image. Since
Chrome 152 it checks that the sending app holds a grant on the image's URI, and an app never
holds one on its own FileProvider, so it always refused: a blank window showed for up to a second
before the page ([android-browser-helper#623](https://github.com/GoogleChrome/android-browser-helper/issues/623)).
`configure.sh` adds a self-grant on `twa_splash/splash_image.png` to the generated
`LauncherActivity`. Those names are the library's: if it renames them the grant silently stops
working, and logcat shows `SplashScreenStrategy: Failed to transfer splash image.` again.

The app opens `/?platform=seeker` (`startUrl` in `twa-manifest.template.json`). The site keeps
that flag for the session (`src/utils/platform.utils.ts`) and reports `platform: "seeker"` in
analytics.

## Requirements

JDK 17, Android SDK, `npm i -g @bubblewrap/cli`. `local.properties` in `twa/` (git-ignored):

```
sdk.dir=/Users/<you>/Library/Android/sdk
```

## Signing key

Created once by hand per environment, in `twa/`, never committed, backed up with its password
outside the repo. Losing it means the installed app can no longer be updated.

```bash
cd twa
keytool -genkeypair -keystore elander-staging.keystore -alias elander-staging \
  -keyalg RSA -keysize 2048 -validity 20000 \
  -dname "cn=E-Lander, ou=E-Lander, o=Pando, c=US"
```

It asks for the store password twice. Pass no `-storepass`, so it never lands in shell history.
`bubblewrap build` later asks for the store and key password: give the same value twice.

Fingerprint:

```bash
keytool -list -v -keystore elander-staging.keystore -alias elander-staging | grep "SHA256:"
```

Copy it into `SHA256_FINGERPRINT` in `env/staging.env`.

## Configure and build

```bash
cd twa
./scripts/configure.sh staging
bubblewrap build          # app-release-signed.apk (Seeker / sideload) + app-release-bundle.aab (Play)
```

`ASSET_ORIGIN` overrides where the manifest and icons are read from at generation time, for
assets not deployed yet. The app still opens `HOST`:

```bash
ASSET_ORIGIN=http://localhost:3000 ./scripts/configure.sh staging
```

A value set in `env/<env>.env` wins over the shell, so leave it commented out there.

`./gradlew assembleDebug` also works, but it signs with the local debug key, so asset links fail
and the app shows a URL bar.

## Digital Asset Links

Without them the app shows a URL bar. The site serves the static
`public/.well-known/assetlinks.json`, one entry per package. `configure.sh` writes the entry for
the configured environment to `twa/assetlinks.<env>.json`; add it to the public file next to the
existing ones and deploy.

## Install on a Seeker

```bash
adb devices                                 # USB debugging on
adb install -r app-release-signed.apk
```

Check that no URL bar shows. One means asset link verification failed.

## Release checklist

1. The website is deployed and serves an `assetlinks.json` entry matching the package and key.
2. The keystore exists and is backed up.
3. Bump `APP_VERSION_NAME` and `APP_VERSION_CODE` in `env/<env>.env`.
4. `./scripts/configure.sh <env>`, then `bubblewrap build`.
5. Install and confirm there is no URL bar.
