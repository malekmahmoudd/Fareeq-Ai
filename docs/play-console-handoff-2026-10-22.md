# FareeqAI Play Console handoff — 22 October 2026

## Current result

All 10 App Content declarations are actioned, including completed IARC, Data Safety, 18+ target audience and reviewer access. Android build 5 is uploaded, processed and retained as internal-testing draft **0.2.1 (5)**, with zero blocking validation errors. No rollout, production application or app review request was submitted. The owner subsequently confirmed a successful Android-device functional test with no serious problems; the installed version/build and individual checklist cases were not specified. Required closed-test recruitment/run remains deferred. See **Current status — direct browser completion** below for exact evidence; earlier checkpoints are historical.

## Initial checkpoint (superseded by current result)

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
- Matching code 5 preview APK completed on 22 October: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/b2cac88f-8cac-4fbf-bfbd-0030e7fec16e . Download: https://expo.dev/artifacts/eas/2x1QYe7uhLJxhx3fqTnueXQ-ZqLwT-yFT-fA36zW_TE.apk . Ignored local copy: `mobile/releases/fareeqai-0.2.1-code5.apk`; SHA-256 `3b6e8de7ed9ffda295232b33cd546f747d9a2f09f457a500ae4546b401c4a251`. Official Android build-tools 36.0.0 apksigner verified the v2 signature and certificate matching the AAB. aapt2 confirms package/version/code and min/target APIs 24/36. ZIP integrity, zipalign 16 KB page checks and all 46 64-bit ELF alignments passed. Physical-device installation testing remains pending.

## Earlier checklist (use current completion below)

1. **Review access:** guest access covers the main experience; optional account functions exist. Explain the guest path and account creation accurately. Do not claim protected account features need no authentication or invent review credentials. Existing operator credentials must never be published.
2. **Content rating:** finish IARC based on actual app behavior. AI-generated content is online content; there is no native user-to-user social exchange. Do not claim a final age rating until IARC issues it.
3. **Target audience:** confirm the intended age group, consistent with the professional/technical audience and final rating. Superseded by the confirmed 18+ save recorded below.
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

The original local browser control became unavailable. The owner then connected TinyFish, approved Google sign-in and saved the browser profile, and authorized at most $2 of existing credits with no purchases/top-ups. A content-form run was stopped after it reported steps beyond the configured bound, to protect that spending ceiling. It returned no completion report, so its edits must not be assumed saved. A separate read-only verification reported five declarations still needing attention: Content ratings (Edit), Target audience, Data safety, Financial features and Health apps (Start). No rating or release was confirmed. No admin/operator credentials were used.

Subsequent short runs confirmed **Financial features saved** with `Financial advice` selected for Emma's educational guidance, and **Health apps saved** with `Activity and fitness` only. The health form showed no regional requirements and confirmed `Change saved. Send for review in Publishing overview.` No medical device or diagnosis was declared. These two declarations are no longer pending; no review request was sent. The original cancelled run's other changes remain unverified.

### Remaining automation limitations verified later on 22 October

- The rating overview has an incomplete/in-progress draft with Edit and Start new questionnaire controls. Direct navigation to the questionnaire can show a blank category form; this does not establish that the saved draft was discarded. Resume through Edit.
- A later editing run reported a saved `invited friends only = Yes` answer. This is **incorrect for FareeqAI**, which has no user-to-user chat or friends list. A correction attempt did not reach/verify the questionnaire answer. Before any final rating submission, set user-to-user interaction to No, any applicable friends-only feature answer to No, and online AI-generated text content to Yes. No final rating was issued. Do not treat the saved draft as certified accurate.
- At that earlier checkpoint, content rating, target audience and Data Safety were incomplete; see the later verified update below. No additional forms should be assumed completed from a partially executed run.
- The upload attempt reached internal-testing draft release ID `4701173333119666010`, but **no bundle was uploaded**. TinyFish could initiate the Expo AAB download but could not transfer it into Play Console's file chooser. This is a limitation of this automation interface, not a general claim that Playwright cannot upload files.
- The draft's release name was empty and the upload area still said `Drop app bundles here to upload`. The user can upload the verified local `mobile/releases/fareeqai-0.2.1-code5.aab`, verify package/code, enter `0.2.1 (5)` and the prepared notes, then Save as draft. No rollout, testing release or production release was completed.


## Historical declaration checkpoint — 22 October, 05:30 UTC (superseded below)

- **Target audience saved: 18 and over only.** Run `ebee345a-2699-4caf-b3f3-c78913a6fdec` confirmed “Change saved. Send for review in Publishing overview.” This is an audience selection, not an issued IARC rating.
- **Data Safety not submitted.** Owner confirmed successful CSV import. Subsequent automation reached Data usage and handling, where Name and Email still showed “Not started”; it did not reach Preview or final save. Its assertion that imported purposes were populated conflicts with that state and is not accepted as proof. The reported 15-type count listed only 14 names, omitting Other personal info, so verify all 15 against the JSON worksheet.
- **Account-method correction still needed:** the automation reported all three username options checked. Keep “Username and password” and “Username, password and other authentication”; clear “Username and other authentication” (FareeqAI has no passwordless account login). Account deletion URL and partial-deletion privacy URL were entered, but final persistence remains unverified.
- **Content rating not submitted or issued.** Latest run `e6e2b378-89b4-492a-a1fc-0d954aedbf85` did not reach Summary. Its report conflicts internally and describes Online content = No despite instructions requiring Yes. Do not certify the draft as accurate. Correct downloaded mature content = No, user-to-user interaction = No, online generated text = Yes; then review its text-content branches and all validation before saving. There is no friends list, public social exchange, mature image/video generation, purchasing, gambling or rewards.
- Conservative online-text review: possible violence, sexuality, offensive language and drug references are not the app's focus; any applicable references are text only. These are coverage assumptions for general-purpose generated text, not verified outputs or a completed content-safety audit. Use actual question wording and distinguish bundled content from online content.
- The owner authorized $3 more after the original $2 cap. Completed usage totals **$4.848** ($1.84 earlier + $3.008 additional); wallet balance $6.152, automatic reload unconfigured, no purchase/top-up. Configured step limits were overshot, so further metered attempts stopped with about $0.15 of authorization remaining. Do not infer the remaining wallet balance is permission to spend it.
- No review request, release publication or AAB upload occurred. No application design/code changed during this declaration work.

### Resume safely

1. In the regular Console browser, confirm the imported Data Safety handling answers are present. If sections remain Not started, re-import the prepared CSV into that same active form, inspect one section, and complete all required sections using the JSON worksheet. Do not claim an import alone proves a submitted declaration.
2. Correct account methods as above; verify https://fareeqai.pages.dev/delete-account and https://fareeqai.pages.dev/privacy; inspect the full preview and save the declaration. Do not claim all data automatically expires within 90 days or independent security certification.
3. Review the IARC draft from the beginning, correcting the parent answers before completing online-content questions. Reach Summary and save; record actual issued regional ratings only after Console displays them.


## Current status — direct browser completion on 22 October 2026

This supersedes the earlier unfinished-state records. No further TinyFish credits were used; direct local browser control became available again.

### Completed declarations

- **Data Safety saved.** Direct import of the prior file failed with `Response missing for PSL_SUPPORTED_ACCOUNT_CREATION_METHODS`; the earlier user/automation success report did not establish successful application. Added 20 current account/deletion schema rows to the old Google sample (783 data rows total), using the upstream Fastlane helper schema, and imported through the browser file chooser. Google confirmed upload validation and **Answers imported from CSV**. All 15 handling sections showed **Completed**. Full expanded Preview matched collection, optionality and purposes, zero sharing under the processor exemption, encrypted transfer, account deletion and partial-deletion links. Save confirmed **Change saved. Send for review in Publishing overview.**
- **Content Rating completed and saved.** Corrected downloaded mature content = No; user-to-user content exchange = No; online AI text = Yes. Incidental text references to violence, sexuality, offensive language and drugs disclosed conservatively, without generated mature imagery, sales or purchasing. Google returned **IARC status Completed**, submitted 22 October 2026, 08:41 Cairo time. Certificate ID displayed `-`; do not invent one.
- Regional ratings displayed: Brazil **14+**; North America **Teen**; Europe **Parental guidance**; Germany **12+**; rest of world, Russia and South Korea **12+**. These are regional content ratings; the intended target audience remains **18+**.
- **Financial features final save completed.** Financial advice remains selected; Documentation said no additional documents required. Earlier automation had saved only a draft/partial state. Final Save now confirmed.
- App Content now explicitly says **You've caught up with everything**, with **10 actioned declarations** and no items needing attention.
- **Review access corrected and saved.** Previous No-restrictions answer was inaccurate for optional account-only security/settings. Owner expressly requested creating a dedicated ordinary review account. Created through the normal native signup API using the support Gmail plus-address; verified password login and 2FA disabled. Saved its credentials and guest/account instructions in Google Play, marked restricted access Yes. Optional Google/trusted-partner device feedback switch disabled. No operator/admin credentials supplied. Private local record: `deploy/.env.play-review.json`, git-ignored, mode 0600; never commit, print or include it in screenshots/release notes. Reviewer account contains no personal content and has normal user privileges only.

### Android release draft accepted

- Verified **code 5 / version 0.2.1 AAB uploaded and processed by Google Play**, with native debug symbols attached. API 24+, target 36. Existing upload-signing configuration accepted; no new signing agreement was presented.
- Internal track ID `4701173333119666010`, draft release `1`, name **0.2.1 (5)**. English release notes saved. Navigated to Preview and confirm, which persists the prepared release.
- Play release validation: **no blocking errors**, **two warnings**: no testers configured; no deobfuscation file. Tester configuration remains owner-deferred. Generated Android Gradle uses minification false by default and there is no enable-minification override in the checked build config; a Java mapping file is not produced for that mode. Native debug symbols are separately attached.
- Estimated new-install download **43.7 MB**. This estimate is not a device test.
- **Save and publish was not clicked.** Release remains draft, not rolled out to internal/closed/production users. No app review request or production application submitted.

### Deliberately deferred by owner

Real Android phone testing, recruitment/enrollment of 12 willing closed testers, the continuous 14-day test, production-access application and production submission. Do not mark these complete. Existing operator report-review test remains unverified under the owner's prior instruction to continue without signing in; a new ordinary review account does not verify operator authorization.

### Local proof

- `docs/remediation/play-content-all-complete-2026-10-22.png`
- `docs/remediation/play-data-safety-saved-2026-10-22.png`
- `docs/remediation/play-rating-completed-2026-10-22.png`
- `docs/remediation/play-review-access-saved-2026-10-22.png`
- `docs/remediation/play-build5-validation-2026-10-22.png`
- `docs/remediation/play-build5-uploaded-2026-10-22.png`
- `docs/remediation/play-build5-draft-saved-2026-10-22.png`

Screenshots are ignored local verification aids. No website/mobile design or application code changed in this session.


## Owner Android-device test report — 22 October 2026

The owner reported: “i tested the application on an android device, it works good, no serious problems”. Record the owner-performed functional smoke test as passed. The device model, installed version/code, distribution source and individual scenarios were not supplied; this does not independently verify every edge-case checklist item, code 5 installation, operator report review, or the Google Play closed-testing requirement.

The remaining release path is closed-test track setup/rollout, at least 12 willing testers continuously opted in for 14 days, then production-access application and review submission. No Console changes, testing enrollment or rollout were made in response to this report.
