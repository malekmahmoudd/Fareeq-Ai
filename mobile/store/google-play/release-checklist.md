# Android / Safari release readiness

Prepared version: 0.2.1, Android versionCode 5, package com.fareeqai.mobile. Both the store AAB and matching preview APK have completed with the latest dependency fixes.

## Prepared
- Approved Leo seamless artwork and Harvey portrait; original inside-app wordmark retained.
- Expo preview APK completed with existing signing credentials; production AAB completed.
- Account/workspace deletion and AI-reply reporting implemented.
- Public deletion instructions and Safari installation route implemented.
- 512×512 store icon prepared.
- Public support inbox confirmed by the owner on 21 October 2026: fareeqai.support@gmail.com.
- Google Play developer account creation, payment and verification confirmed by the owner on 16 October 2026.
- English store description and initial-release notes prepared in `listing.md` and `release-notes.md` on 10 October 2026.

## Must finish before Play submission
- APK signing verified; production AAB signature verified and retained locally; keep signing credentials secure.
- Test the new APK on a real Android device: guest chat/streaming, optional signup/sign-in, resume/background, uploads, reporting, privacy, deletion, slow/offline transport and large text.
- Verify the deployed backend accepts reports and an authorized operator can review them.
- Verify the support address appears in the live privacy notice and enter it in Play Console. Verify data processing and backup retention; complete Data Safety, app access, content rating, audience and AI declarations accurately.
- Owner explicitly approved using the seven existing promotional screenshots unchanged. Their source is the actual Expo mobile web preview with synthetic example content, not native-device captures. Preserve that provenance; see `creative-v1/approval.json`.
- Review the feature graphic and store listing.
- Developer account verification is complete per the owner. Register the app, enroll Play App Signing, upload the AAB to internal testing and satisfy the testing requirements shown in Play Console. See the official testing reference below.
- Do not auto-submit or purchase any service.

## Safari
The separate mobile experience is published at https://fareeqai.pages.dev/mobile/. The owner confirmed it is working after checking it. To install in Safari: Share → Add to Home Screen → enable Open as Web App if shown → Add. Complete the remaining checks for the icon, standalone launch and return from background on an actual iPhone/iPad. AI still needs internet. No iOS binary/App Store submission is involved; the main desktop website retains its existing design.

## Owner tasks still pending

- Test the updated release through a Play testing track on a real Android device. The existing promotional screenshot set is approved unchanged.
- Review the feature graphic and listing presentation before submission.

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
- At this verification date the support inbox was pending; resolved by owner confirmation on 21 October 2026 (see Prepared).

- Installer recovery fix published as 8544611ca8fdf0db87455d2976478c86f75aad3f. pip 26.2.1 was force-installed locally from the hash-pinned lock successfully. DockHosting redeploy is queued; the old backend remains healthy. Local Docker build was unavailable because its daemon is not running.


## 21 October 2026 verification update

- Live AI-reply report submission and repeat submission both returned 201; guest access to report review was blocked. Authorized operator review remains unverified at the owner’s request to continue without signing in.
- Dependency patches validated: backend lock audit zero; website runtime audit zero; remaining website/mobile build-tool findings assessed in `docs/play-release-verification-2026-10-21.md`.
- Fresh signed Android builds are required after the revised mobile dependency lock; the existing code 4 artifacts predate these updates.
- The support address is committed, but its live privacy notice and deployment of the backend security fixes still need confirmation after DockHosting completes its pending release.

## 22 October 2026 store-preparation update

- Build 5 finished on EAS from source `e7b4acbaf763fb81740b21b26b61eeea3eca7564`; downloaded as ignored `mobile/releases/fareeqai-0.2.1-code5.aab`.
- Google bundletool 1.18.3 validation passed. Package, version code, min/target SDK and restricted permission inventory checked. Cryptographic signature and all 1,413 signed application-entry hashes verified; certificate matches the previous release. All 46 bundled 64-bit native libraries pass 16 KB ELF alignment checks. Play has not accepted this bundle yet: upload remains pending.
- Store listing saved in Console and marked Ready to send for review: app icon, name, short/full descriptions, seven approved phone screenshots and feature graphic. No review or public release submitted.
- Public support email, HTTPS website, Productivity category, privacy-policy URL, no-ads and no-advertising-ID declarations saved. Government-app declaration saved as No.
- IARC terms accepted with the owner's explicit action-time approval. Rating questionnaire remains unfinished; no rating issued. Partial answers are drafts, not certified completed declarations.
- At that checkpoint these three forms were incomplete; see the later declaration update below. Financial features (`Financial advice`) and health (`Activity and fitness`) were subsequently saved using the owner-authorized TinyFish session. Sign-in-details answers still need verification; a later overview no longer listed them among items requiring attention. No rating or release has been confirmed.
- After the owner reported a successful DockHosting deployment, fresh `/api/health` and `/api/legal/privacy` checks returned 200, database OK, and the public support email present in the live notice. Privacy-notice deployment is verified. Installed runtime dependency versions are not exposed by these endpoints.
- Closed testing still needs the account-specific requirement shown by Console: at least 12 opted-in testers continuously for 14 days. No testers were enrolled and no testing release was published.
- Detailed handoff and artifact checksum: `docs/play-console-handoff-2026-10-22.md`.
- Matching code 5 APK completed and downloaded. Official apksigner verified its signature/certificate, matching the AAB; aapt2 confirms code 5 and API 24/36. APK ZIP integrity, 16 KB ZIP alignment and all 46 64-bit ELF alignment checks passed. The updated APK still needs physical-device testing.


## Latest declaration update — 22 October 2026

- Target audience **18 and over** saved and confirmed by Console.
- Owner confirmed the Data Safety CSV imported, but a subsequent run still found handling sections Not started. Preview/final save remain pending. Clear the incorrectly selected passwordless “Username and other authentication” method; retain password and password-plus-2FA methods. Verify all 15 types against the prepared JSON, including Other personal info.
- IARC remains incomplete; latest automation reported contradictory/incorrect online-content answers. Review the draft before submission; no rating has been issued.
- Prepared CSV and JSON are tracked with the worksheet. No changes sent for review. Metered attempts stopped within the owner’s $5 total limit; see detailed handoff for evidence and exact corrections.


## Current completion — direct browser verification, 22 October 2026

- Data Safety imported with corrected current schema, all 15 handling sections Completed, full Preview reviewed, final Save confirmed.
- IARC completed and saved: Brazil 14+, ESRB Teen, PEGI Parental guidance, Germany/rest-of-world/Russia/South Korea 12+. Target audience remains 18+.
- Financial declaration completed through final Documentation/Save; no supporting documents requested. App Content has no pending declarations.
- App access corrected to restricted Yes for optional account settings, with owner-authorized dedicated ordinary reviewer credentials and guest instructions saved. Password login verified, no 2FA, no personal data/admin privileges; credential file is ignored and private.
- Code 5 AAB uploaded and accepted in internal draft **0.2.1 (5)**, with release notes. Play validation has zero blocking errors and two warnings (no testers; optional deobfuscation file). No release published or review request sent.
- Owner deferred actual-phone testing, 12-person/14-day closed test, production-access application and production submission. Internal rollout is also still a draft. Operator report review remains unverified per earlier owner instruction.
- Updated detailed evidence and private-file handling in `docs/play-console-handoff-2026-10-22.md`.


## Owner device-test confirmation — 22 October 2026

- Owner tested the app on a real Android device and reported it works well with no serious problems: functional smoke test passed per owner report.
- Device/build identifiers and per-scenario results were not specified; do not claim independently verified code 5 installation or exhaustive edge-case testing.
- Closed testing still requires track rollout and 12 willing testers continuously opted in for 14 days, followed by production-access application and review. No rollout or enrollment occurred from this update.
