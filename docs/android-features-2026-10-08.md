# Android features and verification — 8 October 2026

App 0.2.0, Android version code 3, package com.fareeqai.mobile. The existing backend and database architecture are unchanged. The user intends direct APK distribution, with no App Store submission.

## Implemented

Goals now use /api/goals for creation, editing, priority/date changes, completion, pause/resume and deletion. Invalid calendar dates are rejected locally. Plans use /api/plans and step endpoints; assistant replies can become saved checklists, with progress, rename, complete/reopen and archive/restore.

Chat's plus button opens Files. The system picker accepts PDF, DOCX, text/Markdown and supported images, checks the 10 MB limit before upload, sends multipart data without overriding its boundary and removes only the picker's local cache copy. Processing is displayed truthfully; bounded polling checks completion, with manual refresh afterward. Ready files can be attached to a message (maximum five), shared with the user's teammates or deleted. Persisted attachment metadata survives chat reloads.

Assistant messages render Markdown headings, lists, emphasis, code blocks and tables with horizontal scrolling. Links permit HTTP(S), rejecting scripts, native intents, file/data URLs and URL credentials. HTML stays text; remote images are not fetched. Source buttons list passages retrieved for the reply, then fetch an ownership-protected passage inside the app. A retrieved passage is context, not proof of every answer claim.

The branded launcher, adaptive and monochrome icons and launch image reuse the existing F mark with approved navy, gold and pink. Cream launch background; approved portraits and comic decoration preserved.

## Reliability fixes

- Session-scoped lists and keyed chat state prevent a late response from the previous account appearing after a switch or 401.
- Requests abort on screen exit/background; writes are not automatically retried. An interrupted or uncertain save instructs the user to refresh before retrying.
- Opening Android's native file picker may background the app. Selection is allowed to return; background during actual transfer cancels upload. Unmount/account change cancels either stage before a later selection can send.
- Expected /users/me 401 during bootstrap no longer invalidates the refresh that is opening a new guest session. The previous workspace clears before guest creation; sign-out can return directly to usable guest access.
- Sign-in/sign-out clear credential form fields; recovery codes are restricted to the session that generated them.
- Chat scrolling follows the reply only when the reader is near the bottom. Composer is limited to the backend's 8,000-character cap.

## Checks performed

- Mobile typecheck and lint passed; 25 automated tests passed. Tests cover existing stream/deadline/build guards plus upload limits, attachment cap/readiness, picker lifecycle, calendar validation, Markdown/Arabic/code/table preservation, unsafe links, session bootstrap and private workspace clearing.
- Expo Doctor: 21/21 passed. Android and iOS JavaScript/assets exports passed; these do not constitute native release builds.
- At 412 x 915, the actual browser preview created a local goal containing Arabic, saved its date, marked it complete and rejected an invalid date. A deliberately seeded local mock conversation exercised formatted code/table/Arabic output, Make plan, persisted step progress, upload → ready → attach → chat and the authenticated D1 passage. Switching to a disposable local account hid the former Goals/Plans; logout returned to a fresh usable guest workspace.
- Public Pages API, using separate synthetic native guest sessions: goal create/update and unauthorized mutation 404; multipart text upload → ready; sharing toggle; cross-guest document 404; real Groq stream with persisted attachment; protected source text and cross-guest source 404; plan save/checklist progress, duplicate save returning the same plan, archive and cross-guest plan 404. Four created resources were deleted and both test sessions revoked. An earlier probe checked a non-existent goal GET endpoint (405); corrected to the actual PATCH route before this successful run, with its synthetic goal/session cleanup completed.
- Android SDK/API 37 emulator and Android Studio's bundled Java are now installed. Expo Go 57.0.9 installed and loaded the Android development bundle without recorded ReactNativeJS/AndroidRuntime errors. Native UI controls could not attach to the standalone emulator, so keyboard/back, native picker transfer and background/resume were not signed off. The browser checks do not replace these checks.
- npm advisories remain: 26 total, 8 moderate and 18 high, largely the existing Expo tooling graph. No unsafe force downgrade was applied.

## APK and archive

The first queued 0.2.0 build (7e486327-77b3-47b7-80b7-993c63908f13) was canceled before delivery when lifecycle issues were found during verification. Use the replacement build linked below, not that canceled build or the earlier 0.1.1 APK for these features.

Replacement build: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/c10bef9c-cda2-47e9-af8d-752c98486def

Successfully uploaded to Expo Free after the lifecycle/session corrections. Queue/build status must be checked on this page; this report does not claim the APK has finished. The existing signing key and preview profile are reused. No store submission or paid resource is involved.

Final inspected archive: 73 files. The staged GitHub publication snapshot was scanned with gitleaks (about 10 MB); no leaks were found. The feature commit is e4ca70fbef680df0fe72d2969c9c920ab2e6c690.

The archive includes the mobile client and approved tokens, excluding backend/frontend/deploy/Git history/private env/database/signing files. .env.example is a public development template. No production secret is uploaded to Expo.

## Device acceptance checklist

1. Install the replacement APK over the working older APK; check launcher icon and cold launch screen.
2. Enter as guest without reconnect/login; send English and Arabic text, reopen history and save a reply.
3. Create/edit/complete a goal, save a numbered reply as a plan, tick steps and reopen the app to check persistence.
4. Pick TXT/PDF/DOCX and supported images; wait for ready, attach, ask about the content and open Sources. Check failed/oversized files, share/private and deletion.
5. Check keyboard/back gestures, large text, landscape, moving to background and returning, interrupted network and explicit refresh before retrying.
6. Sign in to another account and sign out: old chats, drafts, goals, plans, files and recovery codes must not appear in the new guest workspace.

This is a tested feature increment, not mobile production sign-off. The user reported the preceding APK working; these additions need their own Android device checks.
