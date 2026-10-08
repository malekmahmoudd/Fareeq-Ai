# FareeqAI mobile client

## Android preparation — 7 October 2026

Android identity is `com.fareeqai.mobile`, version code 2 (app 0.1.1). Predictive back is enabled, keyboard layout uses resize and Android data backup is disabled. The approved artwork, colors and navigation remain unchanged.

`eas.json` provides `design-preview` (installable APK with labeled sample replies and no backend), `preview` (APK with a verified HTTPS backend) and `production` (Play Store AAB). APKs can be installed directly; an AAB cannot. The client is linked to `@malekmahmoudd/fareeqai-mobile` (EAS project 594c923a-e7c3-425d-89b7-11e2c3b919ba). The first design APK completed. A separate connected preview APK has finished; see `docs/android-live-testing-2026-10-08.md`.

Create/sign in to a free Expo account, then from this directory:

```sh
npx eas-cli@latest login
npx eas-cli@latest build:configure --platform android
npx eas-cli@latest build:inspect --platform android --profile design-preview --stage archive --output /tmp/fareeqai-android-archive
npx eas-cli@latest build --platform android --profile design-preview
```

Review the archive before uploading: it must contain the mobile client and approved tokens required by `tools/sync-design.cjs`, and exclude backend/deployment env files, databases, signing keys, backups and unrelated applications. EAS uses the repository root `.easignore`; this preserves repository exclusions and limits the upload to the mobile client and design tokens. The cleaned inspected archive contains 57 files with no backend/deployment/frontend/docs directories, Git history or private env/database/signing files. Do not choose a paid build upgrade if the account's free quota is unavailable. Keep the Android signing key secure for future updates. No store enrollment is needed for an APK.

The preview profile explicitly uses `EXPO_PUBLIC_API_URL=https://fareeqai.pages.dev`, `EXPO_PUBLIC_SAMPLE_MODE=false` and `EXPO_NO_DOTENV=1`. The stable public address routes to the current backend, so a provider migration does not require a new APK. Production still requires its own verified public URL. The cloud pre-install check rejects absent, HTTP, development or credential-bearing origins and public credential variables. Never set a provider API key or database/signing secret in Expo. The design profile explicitly enables `EXPO_PUBLIC_SAMPLE_MODE=true`, disables dotenv loading and requires an empty backend URL; connected builds reject sample mode.

Ordinary API operations have a 30-second deadline, including body reads; chat turns have a 120-second deadline. Timeouts abort transport and show an error without replaying mutations. Moving chat to the background aborts an active reply; resuming reloads an existing server conversation without resending. These lifecycle changes still need real Android testing.

Verified in this pass: typecheck, lint, 14 automated regressions and Android JavaScript/assets export. After upgrading four SDK-compatible Expo patches, Expo Doctor passes 21/21. npm still reports 25 transitive advisories (7 moderate, 18 high); this is not a clean dependency audit. Java, Android SDK and adb remain unavailable locally. An exported bundle is not an APK, and no native device test has passed yet.

First device checklist: guest entry; optional sign-in/promotion; history and saved reply persistence; keyboard and predictive back; background during streaming; reopening saved history; unavailable backend and timeout; logout/revocation; large text; and English/Arabic layout. Uploads, Markdown/citations, Goals/Plans, branded launcher artwork and remaining dependency advisories still need work before release.

Visual foundation and local backend integration, 6 October 2026. Expo SDK 57, React Native 0.86, TypeScript and Expo Router. This is a native client project with a web preview, separate from the released Next.js application.

## Run locally

Requires Node 22.13+ (checked locally with 22.23.3).

```sh
cd mobile/client
npm ci
npm run web
```

For a physical development device, run `npm start` and use the compatible Expo Go/development client on the same network. `npm run ios` and `npm run android` need the appropriate local simulator/emulator toolchain. Full Xcode, Android SDK and a Java runtime were not available during this pass. Do not interpret JavaScript bundle export as a signed native binary or a device test. No EAS account, paid build service or store enrollment is required for this web preview.

The development server used for the verified preview is http://localhost:8082. It is local, not a public deployment; a phone cannot use that localhost address to reach this Mac.

## Implemented

- Home with pink-jacket Leo, recent conversations, direct composer and front-desk agents.
- All ten teammates and agent routes, preserving backend agent IDs.
- Cream/golden-yellow/pink/ink design; navy selected tabs; decorative ink leaves, halftone dots and skyline accents.
- Focused agent chat, workspace drafts, streamed replies, persisted history, Save/Unsave and Copy.
- Server-backed saved replies in Memory and optional signup/sign-in with second-step authentication. Goals/Plans remain pending.
- Bundled fonts, safe-area handling, keyboard-aware composer and selected/disabled accessibility states.

## Data and integration boundary

With EXPO_PUBLIC_API_URL configured, guest access starts automatically. Conversations and saved replies use the existing backend. Signup promotes the guest workspace in place. Signing into another account or signing out clears cached conversations and drafts; protected-route 401 clears cached workspace data. Mutations are never automatically replayed after connection failure. Streaming errors are visible and known server conversations reload after a failed turn.

Native guest/login/signup endpoints use a separately signed mobile audience and the existing device/account/credential-lock/quota logic. Browser cookies and mobile bearer tokens cannot authenticate the other audience. Browser Origin protection stays in place. Native tokens live in SecureStore; the web preview uses HttpOnly cookies and never localStorage tokens. No database migration is needed. Release builds require HTTPS.

**Connected Android testing is being deployed, not signed off for release.** Native access defaults to disabled in code; `MOBILE_ENABLED=true` was approved for the existing DockHosting service. See the live testing report for rollout verification. Native credential management beyond login/signup and device logout/revocation is not supported yet. Goals, Plans, uploads, Markdown/citations and cold-wake recovery remain mobile work. No backend/provider secret belongs in this client. See [integration verification](../../docs/mobile-integration-2026-10-06.md).

## Design and assets

The approved source lives in [../design](../design/README.md). Launch/export scripts synchronize `src/tokens.json` from that approved source, avoiding a repository-wide package-manager change just to share a JSON file. The client uses local portrait assets; it does not load runtime artwork from a Codex folder or downloads directory.

Leo and Harvey were exported as separate images with the built-in image generation tool, using the approved preview/original Harvey reference. Their likeness should still be reviewed at actual native size. Other teammates currently reuse existing web artwork; their separate mockup-matching exports remain visual polish work. The saved concept is a reference, not a screenshot of this running client. Actual browser screenshots are in `../design/verification/`.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run export:web
npm run export:native
```

Verification: typecheck/lint passed; seven workspace/SSE regressions passed; Expo Doctor 21/21 passed. Web, iOS and Android JavaScript/asset exports passed. Browser checked Home/Team, sending, saving into Memory, history and selected tabs at phone widths. Native keyboard, back gestures, permissions, background/resume, RTL and physical-device behavior are still pending.

Dependency note: the initial installation reported 29 advisories. A patched `decode-uri-component` 0.5.0 override removed the router decoding advisory; export and navigation checks passed with it. The current audit retains 26 transitive findings involving braces, node-forge and old uuid in the Expo/Metro/config toolchain. Latest upstream braces/node-forge releases still appear in those advisory ranges; npm's proposed force fix downgrades Expo to an incompatible SDK. These are recorded, not suppressed, and require review before release. SDK-compatible reanimated/worklets versions are explicitly installed. No claim of a clean dependency audit or mobile production sign-off is made.

## Local backend integration setup

From the repository root, in a separate terminal:

```sh
backend/.venv/bin/python mobile/client/tools/run-local-backend.py
```

Default replies use the mock provider. Add --live-ai to use Groq; the runner reads only its key from ignored deploy/.env, never prints it or copies production database credentials. The isolated development database is backend/mobile-dev.db. A persistent signing secret is created in ignored backend/.env.mobile with mode 0600. Backend dependencies must already be installed as described in the root README.

In mobile/client, copy .env.example to .env.local, then run npm run web -- --port 8082. EXPO_PUBLIC_API_URL is the backend origin without /api; it contains no secret. Restart Expo after changing it. Unset it to return to the labeled fixture preview.

For a physical development phone on a trusted network, use the computer's LAN address for the API URL and start this backend with --host 0.0.0.0. This path has not been device-tested. Do not distribute exports configured with local development URLs. SecureStore, native streaming, account switching, revocation, keyboard, back gestures and background/resume need physical-device verification before mobile release.
