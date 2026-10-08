# FareeqAI mobile design source

Approved direction saved on 6 October 2026 for Android and iOS. Start here when implementing the mobile UI. This folder records the user's decisions; it does not contain an implemented mobile application.

**Primary visual reference:** [approved mobile preview](references/approved-mobile-preview.png). This is the final Home / Team / Chat sample with navy selected tabs and Leo's pink jacket. Rejected iterations are archived outside the repository.

**Original user references:** [landscape](references/original-landscape.png) and [mobile chat](references/original-mobile-chat.png). Use these for comic framing and Harvey's original likeness.

**Implementation contract:** [design specification](specification.md), [design tokens](tokens.json), [portrait sources](portraits/README.md). The earlier [architecture review](../../docs/mobile-design-and-architecture-2026-10-06.md) covers backend integration. This approved specification supersedes that review's initial portrait and palette assumptions.

All images are copied into the repository; implementation must not depend on downloads or the Codex generated-image directory. `asset-manifest.json` records relative paths and SHA-256 checksums of the preserved image files. Approved reference sources are retained unmodified; web portrait sources live in frontend/public/art/sunshine. No production website assets or deployment settings were changed by saving this package.

## First working client

The first runnable client is in [../client](../client/README.md). Its actual phone-size screenshots and milestone checks are in [verification](verification/milestone-1.json). Standalone pink-jacket Leo and original-style Harvey portraits now exist in the client assets; the other teammates currently use copied web source artwork. Connected Android builds use the shared backend; physical-device verification remains pending.

## Android 0.2.0

Actual browser checks for Plans and source passages are saved as [Plans](verification/android-020-plans-web.png) and [Sources](verification/android-020-source-web.png). These are working-client web previews, not native APK screenshots. [Feature verification](../../docs/android-features-2026-10-08.md) separates browser/API checks from pending device acceptance.
