# FareeqAI mobile client

Expo SDK 57 / React Native 0.86 client for the existing FareeqAI backend. App 0.2.1, Android version code 4, package `com.fareeqai.mobile`. Android is distributed as a signed APK; no App Store submission is planned.

## What works

- Approved cream, warm gold, pink and navy design, comic borders, portraits and selected navy tabs.
- Guest entry, optional signup/sign-in and two-factor step. Registered accounts share the web workspace; anonymous devices have separate workspaces.
- Streamed chat, saved history, Memory, Save/Unsave and Copy.
- Goals: create/edit, priorities, optional target dates, complete/reopen, pause/resume and delete.
- Plans: save an assistant checklist with “Make plan,” tick steps, rename, complete/reopen, archive/restore and delete.
- Files: system picker, 10 MB validation, processing/ready/failed states, up to five attachments, team sharing and deletion. Supported formats: PDF, DOCX, TXT, Markdown, PNG, JPEG and WebP. Only extracted text is stored by the backend.
- Replies: headings, lists, emphasis, code blocks, horizontally scrollable tables and HTTP(S) links. Retrieved sources open authenticated passages inside the app. Arbitrary HTML is rendered as text; remote images are not loaded.
- Account/workspace deletion, privacy notice and in-app AI reply reporting. Reporting requires the updated backend and an authorized operator review process.
- Branded launcher/adaptive/themed icon and cream launch screen, using the existing F mark and approved colors.

## Run locally

Node 22.13+ is required (verified with 22.23.3).

```sh
cd mobile/client
npm ci
npm run web -- --port 8082
```

In another terminal from the repository root:

```sh
backend/.venv/bin/python mobile/client/tools/run-local-backend.py
```

Copy `.env.example` to ignored `.env.local`. The local API is `http://localhost:8083`. The runner uses isolated `backend/mobile-dev.db`, a private signing secret in ignored `backend/.env.mobile`, and deterministic mock replies. `--live-ai` reads only the provider key from ignored `deploy/.env`; it never copies production database credentials or prints the key.

For Android emulator development, use `http://10.0.2.2:8083`; for a physical development phone, use the Mac's LAN address and start the local backend with `--host 0.0.0.0`. These are development URLs, never release configuration. Restart Expo after changing public environment variables. Unset the API URL or explicitly enable sample mode for the labeled design fixture preview.

The Mac now has an Android SDK/emulator and Android Studio's bundled Java runtime. Expo Go 57 loaded the Android bundle on the API 37 emulator. Full native UI checks and the new APK's icon/splash still require verification. iOS simulator execution has not been verified.

## Build an Android APK

The existing Expo project is `@malekmahmoudd/fareeqai-mobile`, ID `594c923a-e7c3-425d-89b7-11e2c3b919ba`. Reuse its Android signing credentials so updates install over the earlier APK.

```sh
npx eas-cli@latest build:inspect --platform android --profile preview --stage archive --output /tmp/fareeqai-android-archive
npx eas-cli@latest build --platform android --profile preview --non-interactive --freeze-credentials
```

`preview` builds an installable APK using `https://fareeqai.pages.dev`, sample mode false and dotenv loading disabled. The public origin forwards API requests to the current backend; a hosting migration does not require a new APK. `design-preview` builds fixtures with no backend. The `production` profile builds the Google Play AAB with the same connected backend configuration. See `../store/google-play/release-checklist.md` before submission.

Inspect the archive before uploading. Repository `.easignore` includes only the client and approved design tokens. Backend, frontend, deploy, Git history, private env files, databases and signing keys must be absent. `.env.example` is a public development template. Public build variables must never contain a database/signing secret or provider key. The pre-install guard rejects insecure/development API origins and public credential variables. Use the Free queue; do not choose a paid upgrade.

## Reliability and privacy

Ordinary requests have a 30-second deadline, including response reads; streaming and uploads have 120-second deadlines. Mutations are not automatically replayed. If interrupted, refresh the server list or conversation before retrying. File processing polling is bounded to two minutes; Refresh checks longer-running jobs later.

Backgrounding interrupts a chat stream or active upload. Opening Android's own file picker is allowed to finish. Returning reloads an existing conversation without resending it. Account changes/401 responses clear workspace data and invalidate late responses. Native tokens use SecureStore and the mobile audience; the browser preview uses HttpOnly cookies. Sign-out returns to a fresh guest workspace without exposing the previous account's data. Recovery codes are visible only in the session that generated them.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run export:web
npm run export:native
```

Current pass: typecheck/lint, 25 automated tests and Expo Doctor 21/21 passed. Android/iOS JavaScript exports passed. Phone-width browser checks covered real local Goals/Plans, Markdown/Arabic text, upload/attachment/source passages, account switching and guest recovery. The public API also passed goals, document ingestion/sharing, real AI streaming with attachments, source authorization, plan progress/idempotence and cross-guest isolation; synthetic resources were deleted and sessions revoked.

The earlier APK was reported working by the user. The new 0.2.1 APK and AAB are separate release candidates; native keyboard/back, weak connection recovery, file picking and launch artwork need device checks. npm reports 26 transitive advisories (8 moderate, 18 high); no force downgrade or clean dependency-audit claim is made. See the [0.2.0 verification report](../../docs/android-features-2026-10-08.md).

## Design sources

[Approved design](../design/README.md) and tokens remain the source of truth. Launch/export scripts synchronize approved tokens into `src/tokens.json`. Portraits are bundled locally. `assets/brand/mark.svg` is the editable F mark; PNGs supply native icon/splash inputs. Font notices and template license are retained.

## Safari home-screen app

The public web app provides installation instructions at https://fareeqai.pages.dev/install. In Safari on iPhone/iPad, use Share → Add to Home Screen and enable Open as Web App if shown. This uses the website and shared backend; AI requests require internet. The in-app wordmark is unchanged. Actual iPhone standalone behavior remains a device verification step.

## Separate Safari release

Run `npm run export:safari` to assemble the public Cloudflare upload package at
`deploy/dist/safari-pages`. The separate client lives at
https://fareeqai.pages.dev/mobile/ and uses the same backend and cookie session
as the website. Safari Share → Add to Home Screen installs this mobile design.
It requires internet for AI; it is not an offline or native iOS build.
