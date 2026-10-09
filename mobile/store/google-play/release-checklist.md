# Android / Safari release readiness

Prepared version: 0.2.1, Android versionCode 4, package com.fareeqai.mobile.

## Prepared
- Approved Leo seamless artwork and Harvey portrait; original inside-app wordmark retained.
- Expo preview APK completed with existing signing credentials; production AAB completed.
- Account/workspace deletion and AI-reply reporting implemented.
- Public deletion instructions and Safari installation route implemented.
- 512×512 store icon prepared.

## Must finish before Play submission
- APK signing verified; production AAB signature verified and retained locally; keep signing credentials secure.
- Test the new APK on a real Android device: guest chat/streaming, optional signup/sign-in, resume/background, uploads, reporting, privacy, deletion, slow/offline transport and large text.
- Verify the deployed backend accepts reports and an authorized operator can review them.
- Publish a support email; verify data processing and backup retention; complete Data Safety, app access, content rating, audience and AI declarations accurately.
- Capture at least two genuine Android phone screenshots from the release. Do not substitute concept art or browser screenshots.
- Review the feature graphic and store listing.
- Owner creates/verifies Google Play developer account LAST. Register the app, enroll Play App Signing, upload the AAB to internal testing, then satisfy account-specific testing requirements. New personal accounts generally require 12 continuously opted-in testers for 14 days before applying for production access.
- Do not auto-submit or purchase any service.

## Safari
Visit https://fareeqai.pages.dev/install in Safari. Share → Add to Home Screen → enable Open as Web App if shown → Add. Verify the icon, standalone launch, chat and return from background on an actual iPhone/iPad. AI still needs internet. This is the web app; no iOS binary/App Store submission is involved.

## Build tracking
APK: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/fc003f90-873b-4fc6-a82e-208c5888facf
AAB: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/77168ced-78dd-43e5-9ab4-219fccbf0734

Official references:
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://support.google.com/googleplay/android-developer/answer/9866151
- https://support.apple.com/guide/iphone/iphea86e5236/ios

## Verified on 9 October 2026
- Backend: 574 passed, 4 skipped; Ruff passed.
- Mobile: 25 passed; lint and typecheck passed.
- Frontend: checks, typecheck and production build passed; lint has 19 warnings and no errors.
- Published source commit: 1b12af37abbbec81ff358939a153103d5148de52.
- Netlify deploy 6ac91d1555f264000762223d published. Live /install, /delete-account, /privacy and apple-icon.png returned 200. Manifest serves 192/512 PNG icons.
- APK signature verified, package com.fareeqai.mobile, version 0.2.1/code 4, min API 24, target API 36. Overlay and legacy broad-storage permissions absent.
- Live API health/database OK. Native guest authentication returned 200; disposable guest deletion returned 204; guest admin access blocked.
- Live reporting route still returned 404 at verification time. The source deployment failed during package downloads; host connection errors occurred in pip 25.0.1. A pinned installer upgrade with resumable downloads is being verified.
- New APK download: https://expo.dev/artifacts/eas/FFMTsfMHQJaH4HYhssIqMPGcMWJZZAHui_jdRQNgTRo.apk

- APK zip alignment and all 46 bundled 64-bit native library ELF alignments passed 16 KB checks.
- Production AAB completed: https://expo.dev/artifacts/eas/sMqE-gk7Ayr8NmnkNCink3l7-bKw-2nTbe0adpIfCMY.aab

- Production AAB signature verified with jarsigner; self-signed upload certificate matches Android signing workflow. Bundle acceptance still requires Play Console checks.

- Google bundletool 1.18.3 `validate` passed for the AAB. The APK contains pixel-identical copies of all three selected Leo/Harvey artwork assets (Android repackages their file bytes).
- Release files retained in ignored `mobile/releases/`; signing keys and credentials are not committed.
- Before store submission, assess the existing Expo dependency advisories documented in the mobile README; do not force incompatible React Native downgrades.
- The owner has not created the public support email yet; this remains required.

- Installer recovery fix published as 8544611ca8fdf0db87455d2976478c86f75aad3f. pip 26.2.1 was force-installed locally from the hash-pinned lock successfully. DockHosting redeploy is queued; the old backend remains healthy. Local Docker build was unavailable because its daemon is not running.
