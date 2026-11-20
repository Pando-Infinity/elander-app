# twa

Android app that ships the E-Lander web app to Solana Seeker (dApp Store / sideload). It holds no
product code: the app is a WebView that opens the website full screen, so a web deploy is an app
update.

Generated with the Solana Mobile WebView shell (`npx solana-mobile webshell`). No CI/CD: builds
are made locally. `twa/` holds no JS/TS, so the Next.js build, lint and typecheck never pick it
up, and it is left out of the Docker context (`.dockerignore`).

## Why not a TWA

A Trusted Web Activity (Bubblewrap) renders the site in Chrome, and Chrome's Local Network Access
blocks the page from reaching the wallet over the local socket, so Mobile Wallet Adapter hangs.
The webshell renders the site in the app's own WebView and handles wallet intents natively
([docs](https://docs.solanamobile.com/recipes/general/publishing-a-web-app)). No Digital Asset
Links are needed: the `xyz.e_lander.beta.twa` entry in `public/.well-known/assetlinks.json` is
only there for an earlier TWA build.

## Environments

| Env | Opens | Package id | Name |
| --- | --- | --- | --- |
| `staging` | `https://www.beta.e-lander.xyz/?platform=seeker` | `xyz.e_lander.app.dev` | E-Lander dev |
| `production` | `https://app.e-lander.xyz/?platform=seeker` | `xyz.elander.app` | E-Lander |

Each env has its own package id and keystore, so both apps can be installed side by side.

Links to another host open in the system browser; `solana-wallet:` links open the wallet.

## What the site does in the app

- The `Solana Mobile Web Shell` user agent marks the session as the Seeker app
  (`src/utils/platform.utils.ts`); analytics report `platform: "seeker"`. `?platform=seeker` in the
  start URL is not trusted for that, since the link can be opened in any browser.
- `src/provider/SolanaProvider.tsx` installs a `beforeunload` guard in the web shell only.
  wallet-adapter-react treats the WebView as desktop and stays "unloading" after any
  `beforeunload` (MWA opening the wallet with `location.assign`, or a reload cancelled at a
  leave-page warning), which drops every later wallet error and disconnect. The guard hides the
  event from it and runs the app's own handlers (`addBeforeUnloadListener`) itself, except while
  a wallet request is in flight (`src/utils/mwa-web-shell.ts`).
- `@solana-mobile/wallet-standard-mobile` is 0.7.x: it handles Local Network Access itself and
  rejects a pending request when the wallet closes the session.

## Layout

```
env/<env>.env                    # per-environment config, the file you edit
scripts/configure.sh             # generates ./webshell for that env (webshell init)
scripts/build.sh                 # webshell build + checks the signing fingerprint
scripts/cli-version              # pinned solana-mobile CLI version
scripts/patches/ScrollUpBridge.kt
webshell/                        # generated Android project, git-ignored: regenerate, never patch
```

Colors and the launcher icon come from the site's `/manifest.json` at generation time: `#000000`
and `/app-icons/icon-maskable-512x512.png`, whose art already sits inside the adaptive-icon safe
zone. `configure.sh` resets the CLI's 18dp launcher-foreground inset to 0dp, otherwise the icon
would be shrunk twice. It also patches `MainActivity.kt` with `scripts/patches/ScrollUpBridge.kt`:
the site scrolls inside `[data-scroll-container]`, not the window, so without it pull-to-refresh
fires whenever the finger pulls down, even mid-page (touches on the fixed header ask
`[data-scroll-container]` directly).

## Requirements

Node (for `npx`), `curl`, `python3`, JDK 17 as `JAVA_HOME`, Android SDK as `ANDROID_HOME` with
platform 37 and build-tools. The CLI version is pinned in `scripts/cli-version` (the version
these scripts were verified with); `SOLANA_MOBILE_CLI_VERSION` overrides it.

## Signing key

One keystore per environment in `twa/` (`elander-<env>.keystore`), never committed, backed up with
its password outside the repo. Losing it means installed apps can no longer be updated.
`configure.sh` refuses to run without it, because `webshell init` would silently create a new key.

```bash
cd twa
keytool -genkeypair -keystore elander-staging.keystore -alias elander-staging \
  -keyalg RSA -keysize 2048 -validity 20000 \
  -dname "cn=E-Lander, ou=E-Lander, o=Pando, c=US"
keytool -list -v -keystore elander-staging.keystore -alias elander-staging | grep "SHA256:"
```

For production, replace `staging` with `production` in both commands.

Copy the fingerprint into `SHA256_FINGERPRINT` in `env/<env>.env`; `configure.sh` refuses to run
while it is empty. Pass no `-storepass`, so it never lands in shell history.

## Configure and build

The site must be deployed first: `configure.sh` reads `https://$HOST/manifest.json` and its icons.

```bash
cd twa
read -rs SOLANA_MOBILE_KEYSTORE_PASSWORD; export SOLANA_MOBILE_KEYSTORE_PASSWORD   # key password = same
export ANDROID_HOME=... JAVA_HOME=...
./scripts/configure.sh staging
./scripts/build.sh staging [output-dir]
```

The APK is `webshell/app/build/outputs/apk/release/app-release.apk` (copied to `output-dir` when
given). `build.sh` fails when its signing fingerprint differs from `SHA256_FINGERPRINT`, or when
`webshell/` was configured for another env or an older version/URL (re-run `configure.sh`). There is no `.aab`: the webshell builds an APK only.

## Install on a Seeker

```bash
adb install -r app-release.apk
```

## Known limits

- Splash is the Android 12 splash: the maskable icon on the manifest's background color.
- The app draws edge to edge inside system-bar padding; the bars follow the system theme.
- While the wallet is open for a request, the `beforeunload` guard also hides the leave-page
  warning of an airdrop or bulk transfer. Between requests the warning shows as in a browser.
- `minSdk` is 28; the APK carries arm64-v8a, armeabi-v7a, x86 and x86_64 libs.

## Release checklist

1. The website is deployed with its manifest and icons.
2. The keystore exists and is backed up.
3. Bump `APP_VERSION_NAME` and `APP_VERSION_CODE` in `env/<env>.env`.
4. `scripts/configure.sh <env>`, then `scripts/build.sh <env>`.
5. Install, open, connect a wallet, sign the connect message, close the wallet sheet once
   without approving and check Connect still works afterwards.
