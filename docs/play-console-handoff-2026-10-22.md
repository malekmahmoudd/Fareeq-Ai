# FareeqAI Play Console handoff — 22 October 2026

## Completed and verified

- App: FareeqAI, package `com.fareeqai.mobile`, Console app ID `4976299166303475649`, default language en-GB.
- Default listing is **Ready to send for review**, not publicly released. Saved the existing 512×512 icon, seven owner-approved promotional screenshots in their approved order, 1024×500 feature graphic, short description and full description. No design assets were changed.
- Category: Productivity. Public email: `fareeqai.support@gmail.com`. Website: `https://fareeqai.pages.dev`. Privacy-policy link: `https://fareeqai.pages.dev/privacy`.
- Saved declarations: contains ads = No; uses advertising ID = No; developed by/on behalf of government = No.
- Owner approved accepting IARC Terms of Use, and the checkbox was accepted. Contact/category entered; the questionnaire was only partially answered when browser control became unavailable. No final rating was saved or issued. Review partial answers before submission: answers concerning possible mature generated text were conservative possibilities, not verified samples or a content-safety audit.
- No bundle uploaded to Play, no testers enrolled, no review request and no public release submitted.

## Updated Android bundle

- Version `0.2.1`, Android code `5`; source `e7b4acbaf763fb81740b21b26b61eeea3eca7564`.
- EAS build: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/eaecc715-fb0f-4a1b-9bb6-f3a84dca886d
- Artifact: https://expo.dev/artifacts/eas/yWFsAZPKKePESkYwHFqbZMCrytzsK_KPdSFbdiWPUEo.aab
- Local ignored artifact: `mobile/releases/fareeqai-0.2.1-code5.aab`.
- SHA-256: `4c2b8ed12c3fdb5a6de5d97d2752be7c3282c6a9594a13a2e6210ee7b62e1523`.
- Bundletool 1.18.3 validate passed; manifest: package `com.fareeqai.mobile`, min API 24, target API 36, code 5.
- ZIP integrity passed; signature over the manifest verified with OpenSSL CMS; all 1,413 signed entry hashes verified and no unsigned application entries found. Upload certificate SHA-256 `483461b1193b430a974e6821d4bb7283dd0db8ec91790ea859b09765417a2350` matches code 4.
- All 46 arm64/x86_64 libraries passed ELF PT_LOAD alignment >=16 KB. This is not a replacement for Google Play acceptance or installation testing.
- Permissions: INTERNET, VIBRATE, USE_BIOMETRIC, USE_FINGERPRINT and app-specific DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION. No AD_ID, camera, microphone, location or broad-storage permissions.
- Mobile lint, typecheck and all 25 tests passed before this build was queued. The old code 4 APK/AAB are historical artifacts, not evidence of the new fixes.
- Matching code 5 preview APK requested on 22 October for direct physical-device testing: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/b2cac88f-8cac-4fbf-bfbd-0030e7fec16e . Completion, download and signature verification must be checked before calling this APK ready.

## Forms to finish when Console controls are available

1. **Review access:** guest access covers the main experience; optional account functions exist. Explain the guest path and account creation accurately. Do not claim protected account features need no authentication or invent review credentials. Existing operator credentials must never be published.
2. **Content rating:** finish IARC based on actual app behavior. AI-generated content is online content; there is no native user-to-user social exchange. Do not claim a final age rating until IARC issues it.
3. **Target audience:** confirm the intended age group, consistent with the professional/technical audience and final rating. No audience answer was saved.
4. **Data Safety:** use `mobile/store/google-play/data-safety.md`; verify processing terms and retention before certifying. Relevant chat/document content goes to the AI provider. Do not claim no collection or no sharing automatically. Deletion URL: `https://fareeqai.pages.dev/delete-account`.
5. **Financial features:** Emma offers educational budgeting, saving/debt trade-off and money guidance. Inspect the Financial advice/other support-service definitions rather than declaring no features just because no transactions occur.
6. **Health:** Maddie creates exercise routines, workout progression and habit plans. Inspect Activity and Fitness scope; it is non-medical coaching, not a diagnostic or medical-device app.
7. Upload **code 5** to internal testing, enter the prepared release notes, and complete Play's validation. Do not upload the older code 4 under the claim that it contains the new security updates.
8. Complete actual-device testing; then configure closed testing using real, owner-supplied tester accounts. Console explicitly requires 12 testers opted in continuously for 14 days before applying for production access.

The owner confirmed on 22 October that the 12 tester addresses are not available yet. Recruit willing participants; do not create dummy accounts, invent addresses, or mark the closed test completed. Internal testing can be prepared independently of recruitment.

## Backend and privacy gate

Initially on 22 October, direct `/api/health` returned 200 with status/database OK, but `/api/legal/privacy` did not include the public support email. Later that day the owner reported the DockHosting deployment successful. A fresh check then returned 200 for both endpoints, with the API/database healthy and `fareeqai.support@gmail.com` present in the live notice. The privacy-notice deployment gate is resolved. These public endpoints do not independently expose the installed dependency lock or prove every security patch is live.

Authorized operator review remains unverified because the owner instructed continuing without signing in. Do not silently mark that test passed.

## UI evidence

Local screenshots: `docs/remediation/play-listing-complete-2026-10-21.jpg` and `docs/remediation/play-iarc-terms-2026-10-21.jpg`. These record earlier UI state and are not live Console snapshots for 22 October.

Browser control is unavailable in this session. Plugin discovery found no suitable Console integration; unrelated Google plugins were not installed. No new account access or permissions were granted.
