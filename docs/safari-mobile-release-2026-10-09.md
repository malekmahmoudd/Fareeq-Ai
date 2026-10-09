# Separate Safari mobile release — 2026-10-09

## Published surfaces

- Main website: https://fareeqai.pages.dev/ — original website design retained.
- Separate mobile client: https://fareeqai.pages.dev/mobile/ — the existing Expo
  app's Android-style screens, approved Leo hero, portraits and navy tabs.
- Both clients use the existing `/api` proxy and backend. Web authentication
  uses the same HttpOnly session; no signing secret or provider key is exported.
- Safari installation: open the mobile address, then Share → Add to Home Screen
  → Open as Web App if offered → Add. Manifest start URL and scope are `/mobile/`.
  Live AI needs internet; this is a web app, not a native App Store release.

## Only changes to the main website

1. Sign in, create account and sign out moved into the account-avatar disclosure.
   Guest and registered-account options follow the existing auth capabilities.
   Escape closes it and returns focus; outside clicks dismiss it. Logout failures
   stay visible rather than silently losing the current workspace.
2. The root layout stays LTR for both interface languages. Arabic translations,
   fonts, natural message/input direction and typography remain. Navigation,
   arrows and artwork no longer mirror when switching languages.

No homepage artwork, hero composition, cards, desktop colors or mobile website
layout was redesigned. No native Android/iOS screen was changed in this release.

## Implementation and reproduction

`npm run export:safari --prefix mobile/client` produces the public package at
`deploy/dist/safari-pages`. The web-only dynamic Expo config adds the `/mobile`
base path; normal native builds retain their existing configuration. Deployment
is a manual zip upload to the existing Cloudflare Free Pages project.

Mobile extensionless screen routes always request the mobile shell from Pages
assets. This handles Pages' root fallback returning HTTP 200 for unknown paths.
Missing asset requests remain 404 instead of receiving HTML as JavaScript.
Other website routes still go to Netlify; API routing and credential isolation
are preserved. Preview URLs redirect to the canonical origin.

## Verification completed

- Frontend typecheck, production build and existing checks/tests passed.
- Frontend lint: 19 warnings, no errors (existing warning count).
- Mobile typecheck/lint passed; 25 tests passed; production Safari export passed.
- Pages regression passed, including deep links, missing assets, canonical
  origins, credential isolation, secure cookies, streaming and error redaction.
- Live mobile client loaded at phone width 390px with no horizontal overflow.
- Live guest chat produced an AI reply through the existing backend.
- Reloading its direct conversation URL restored that conversation and reply.
- Live main website retained its original hero; account actions appeared only
  after opening the avatar. Arabic used `lang=ar`, `dir=ltr`, the same navigation
  sequence and an unmirrored hero. Original English preference was restored.
- A disposable local registered account verified sign-out in the menu, Escape
  dismissal and a fresh guest workspace after logout.
- Installation manifest and apple-touch-icon references point to `/mobile/`.
- The public package contained 86 files and no environment files, databases,
  signing keys or native binaries. Largest public asset was about 3.1MB.

## Limits and follow-up

Actual iPhone Safari Home Screen installation and keyboard/safe-area behavior
still need a physical iPhone check. The browser verification used the in-app
browser at phone dimensions, not an iPhone simulator. Command-line requests
received Cloudflare HTTP 403, including the unchanged root and health endpoint;
live browser navigation and AI chat worked, so these were not treated as app
failures or bypassed.

Google Play verification, support email, actual Android screenshots and final
store declarations remain separate release tasks. This change does not claim
Google Play publication or full production sign-off.
