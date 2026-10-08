# Android build preparation — 7 October 2026

The user paused backend migration after reporting a 24-hour card-verification hold and requested Android development meanwhile. No Northflank service, alternate hosting resource or production routing change was performed in this pass. No scheduled action was requested or created.

Continued the existing Expo SDK 57 client and approved mobile design, using the same backend contract. Added Android package/version, keyboard/back configuration, disabled Android backups and separate APK design/connected profiles plus a production AAB profile. The design APK profile uses labeled fixtures, with no live backend dependency. Cloud-build guards reject accidentally embedding local URLs or backend secrets. Archive exclusions preserve existing repository/client ignore rules.

Network operations now expire after 30 seconds (ordinary requests) or 120 seconds (whole chat turn), including body reads. Deadline/caller cancellation aborts the transport and never retries a mutation. Android/background lifecycle handling aborts active chat requests and refreshes known conversations on foreground return without resending.

Validation: mobile typecheck and lint passed; 14 tests passed, including stuck transport, cancellation, successful cleanup, build-origin/credential checks and existing SSE/workspace cases. Android Hermes/asset export succeeded with the API URL empty and dotenv disabled. No Android SDK, adb or Java runtime was found. Four SDK-compatible patch updates resolved Expo Doctor's version mismatch; Doctor now passes 21/21. npm reports 25 remaining transitive advisories (7 moderate, 18 high).

The user created an Expo account and completed browser login for the CLI. Linked `@malekmahmoudd/fareeqai-mobile`, project ID 594c923a-e7c3-425d-89b7-11e2c3b919ba. EAS archive inspection revealed the repository root is used; root `.easignore` was added and verified with a 68-file archive excluding Git history, private env files/databases/keys, backend, deploy, frontend and docs. Approved tokens and client assets remain included. Remote Android signing-key generation succeeded and the first APK build was submitted: https://expo.dev/accounts/malekmahmoudd/projects/fareeqai-mobile/builds/e041137e-84ba-4025-a413-f8a57557ad9f . Current status is IN_QUEUE; no completed binary or native device verification is claimed yet. No paid build upgrade or store enrollment was selected.

Android native generation also passed locally. Generated manifest verifies com.fareeqai.mobile, backup disabled, predictive back enabled and adjustResize keyboard layout. Generated native files remain ignored; no hand edits were made. Expo warned that expo-system-ui is needed to enforce userInterfaceStyle on Android; adding it and reviewing launcher art/permissions remain follow-up polish before release. Prebuild changed launch scripts as documented; these were restored to the existing Expo development-server commands. See mobile/client/README.md for build commands and device checklist.

## Completed build and Mac preview

EAS now reports FINISHED for e041137e-84ba-4025-a413-f8a57557ad9f, completed 2026-10-07T18:46:52.284Z, with an APK artifact available. This supersedes the queue status above; native device verification remains pending. On the user's request to test on Mac, started the browser preview at http://localhost:8082 with explicit sample mode and dotenv disabled; verified Home and its sample-workspace label loaded. Android Studio, Expo Orbit, adb and the standard Android SDK directory were not found. Testing the actual APK on this Mac requires an Android emulator setup.

Sources consulted before SDK/native configuration changes:

- https://docs.expo.dev/versions/v57.0.0/
- https://docs.expo.dev/versions/v57.0.0/config/app/
- https://docs.expo.dev/build-reference/apk/
- https://docs.expo.dev/build-reference/easignore/
- https://docs.expo.dev/build-reference/npm-hooks/
- https://docs.expo.dev/eas/environment-variables/
- https://reactnative.dev/docs/appstate
