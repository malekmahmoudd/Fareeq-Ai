# Repository maintenance — 8 October 2026

FareeqAI is one monorepo: website, shared backend, and Android/iOS client. Cleanup publishes outstanding mobile source, approved designs, current delivery routing and deployment notes alongside the existing backend. It does not create another backend or change the approved visual design.

## Cleanup

Removed unused Expo starter App/index entry files, unreferenced starter icon/splash assets, local editor/plugin settings and a redundant nested EAS ignore file. Expo Router remains the actual package entry point. Removed the obsolete Render blueprint and old raw evaluation log. Rejected design iterations and duplicate web-portrait source copies were archived locally outside the repository; approved references, runtime portraits, design tokens and font/template license notices remain.

Expanded ignore rules for Expo generated files, native build directories, APK/AAB/signing files, temporary logs and provider dashboard screenshots. Restored a safe deployment environment example; real credentials remain ignored. Updated root/component READMEs and added a documentation index separating current setup from historical evidence.

## Validation

Backend: 573 passed, 4 optional infrastructure skips; lint passed. Tests must run from backend so its pyproject.toml supplies asyncio mode; a first invocation from the repository root lacked that setting and failed async tests, then the documented component command passed.

Website: typecheck, contract/privacy/stream/proxy checks and production build passed. Lint: 0 errors, 19 existing warnings. Mobile: typecheck, lint and 14 tests passed. Pages delivery regression passed. Connected Android/iOS exports passed after cleanup; the safe EAS archive contains 57 files with the Router entry intact and unused starters absent. Publication snapshot secret scan found zero findings; changed Markdown links and approved asset checksums passed. Release/device gaps and dependency advisories remain in the existing reports; cleanup is not production sign-off.

Native guest, real streaming chat, history, Save, cross-guest isolation, browser Origin protection and logout revocation passed through the public origin; synthetic conversation cleanup passed. Database health is ok. Expo connected Android build b80a1b33-b592-49ab-b3ce-1cef8684e720 has finished and its APK is available on the linked build page. Physical-device verification remains pending.

Publication is checked against a fresh remote branch head, preserves prior history, and includes only reviewed repository content. No production .env, signing credentials, databases, downloaded dependencies or generated APK files are published.
