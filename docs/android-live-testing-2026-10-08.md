# Connected Android testing — 8 October 2026

This report describes the initial 0.1.1 APK. The user subsequently reported it working. See [Android 0.2.0 features and checks](android-features-2026-10-08.md) for the next increment.

The Android preview profile uses https://fareeqai.pages.dev as its public API origin, sample mode disabled, dotenv loading disabled. Cloudflare routes to the existing DockHosting backend and Neon database. No backend credentials are included in Expo or the APK.

App 0.1.1, Android version code 2, package com.fareeqai.mobile. Existing Expo signing credentials are reused so this can update the design APK. The design-preview profile remains available with fixtures.

## Verification

- Mobile typecheck, lint, 14 tests and connected Android/iOS JavaScript/assets exports passed.
- EAS upload archive inspected: 68 files; backend, frontend, deploy, docs, private env files, databases and signing files excluded; required approved design tokens included.
- The live backend initially returned 404 for native guest access because the mobile routes were only local. Published six focused authentication/test files through the connected GitHub tool (shell GitHub login was unavailable), based on deployed d5a45ca. GitHub tree SHA matched the tested local tree exactly.
- Backend authentication change: 573 tests passed, 4 skipped; backend lint passed. Auth route sweep updated to recognize the three intentionally unauthenticated mobile entry routes, which have separate negative/disabled/audience tests.
- Backend commit: 277ad1001513a245333a8bac2260a64138b8afc4.
- User approved saving MOBILE_ENABLED=true and redeploying the existing Free service. Existing quotas, browser Origin checks and native/browser token audience separation retained. No schema change.
- DockHosting rollout twice failed during Pillow wheel download with SSL BrokenPipeError, before startup. Published 0fbd9c62e7b913170ca014c66735d2671476bb6f to retry dependency installation at most three times, keeping require-hashes/no-deps and pip check. Progress display disabled; no certificate or dependency integrity bypass.
- Backend rollout is now serving /api/health/detail with database ok and native /api/auth/mobile/guest with HTTP 200/signed_in=true through the public Pages origin. A separate native-style bearer probe also passed real Groq streaming, persisted history, saving, cross-guest isolation, Origin protection and logout revocation; the completed workflow took 7.83 seconds. Its synthetic conversation was deleted and both test sessions revoked. Physical-device checks remain pending.

## APK

Build: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/b80a1b33-b592-49ab-b3ce-1cef8684e720

Submitted on Expo Free with profile preview; status initially IN_QUEUE, subsequently FINISHED during repository cleanup (2026-10-08T14:30:04.877Z). The APK is available on the build page. This is a completed cloud-built APK, not a physical-device test. No paid upgrade or store submission requested.

Temporary deployment checkout, EAS inspection archive and probe script cleaned up at the user’s request. Cloud builds/deployment continue remotely; no local development server was stopped. The live native API workflow passed; physical-device verification remains pending.

## First Android test

Open the build page on Android once finished; download/install the APK, allowing installation from that browser if Android asks. Install over the design APK. Enter as a guest, open Harvey or Leo and send a short message; expect a real streamed reply. Save it into Memory, reopen the app and verify history. Optionally sign up to preserve the guest workspace or sign in to an existing account. An anonymous mobile workspace is separate from an anonymous website workspace; an existing account links both through optional sign-in.

Check keyboard, back navigation, background/resume during a reply, reopen history, logout, large text and English/Arabic. Goals/Plans are still samples; mobile uploads and Markdown/citations are unfinished. No mobile production sign-off claimed. Backend cold-start reliability and toolchain dependency advisories remain recorded work.
