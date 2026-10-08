# Mobile backend integration — 6 October 2026

Milestone 2 connects mobile/client to the existing FastAPI application locally, using an isolated SQLite development database and real Groq replies. Production hosting, Neon and configuration are unchanged. No mobile binary was built, signed, installed or published. Native access remains disabled by default (MOBILE_ENABLED=false).

## Changes

Automatic guest entry and optional email signup/sign-in support the existing authenticator/recovery-code second step. Guest signup preserves the workspace. Native tokens include a separate signed audience and live in SecureStore; web previews keep HttpOnly cookies. Neither credential type authenticates the other audience. Native authentication rejects browser Origin/Fetch Metadata requests and reuses existing device rows, account epochs, rate limits and credential locks. Expired or revoked devices are rejected. No schema migration is required.

The client uses existing conversation list/detail, chat streaming and pin/unpin APIs. Reply saving persists in Memory. Account transitions and protected-request 401 clear cached conversations/drafts. In-flight sends are disabled; leaving chat aborts the request. Provider/network failures are visible. Known server conversations reload after failures without automatically replaying a mutation. Release builds reject HTTP API origins.

The development runner uses a separate local database and signing secret. It optionally reads only the existing Groq provider key from ignored deployment configuration. No production credential is copied into the client.

## Verification

Backend lint passed. Full suite: 573 passed, 4 skipped, including all four native-auth integration tests covering audience/origin separation, revocation, promotion/login/2FA, streaming/history/pinning and cross-workspace isolation. Existing browser-auth, accounts, guest and concurrent-recovery tests passed.

Mobile typecheck/lint and seven reducer/SSE tests passed. Expo Doctor passed 21/21. Web/iOS/Android JS/assets exported successfully. These are not native-device or signed-binary checks.

At 390×844, the browser preview entered without login, received real Groq replies with Harvey and Leo, streamed a follow-up, preserved conversations on reload, and kept a saved reply in Memory after reload. Home drafts carried into a new server conversation. Viewport/scroll width both measured 390, with no horizontal overflow. Screenshots: mobile/design/verification/live-chat-390.png and live-memory-390.png.

FareeqAI SSE uses data-only JSON with a type discriminator. Parser tests cover that contract, split framing/CRLF, Unicode content, malformed data and bounded buffering.

## Next work

Verify SecureStore, native streaming, revocation, keyboard/back gestures, background/resume, account transitions and connection loss on Android/iOS development builds. Add uploads/citations, Markdown rendering, Goals/Plans and free-host cold-wake recovery. Review recorded Expo toolchain dependency advisories. Then enable the mobile flag and point a verified release build at the existing HTTPS backend. Do not distribute bundles configured with local URLs.

No paid hosting, card, store enrollment or EAS subscription was introduced. Setup instructions are in mobile/client/README.md.
