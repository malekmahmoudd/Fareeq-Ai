# Mobile design and architecture review — 6 October 2026

## Approved design follow-up

The later user-approved mobile design is saved in [mobile/design](../mobile/design/README.md). Its specification, portrait decisions and tokens supersede the initial visual-contract assumptions below, including Leo’s pink jacket, original comic Harvey, warm golden yellow, darker navy and navy selected-tab backgrounds. The backend integration findings below still apply.

## Direction

Build Android and iOS clients for the existing FareeqAI service. Preserve optional login, the same ten agents, agent isolation, shared context, saved work, document processing and usage limits. Keep FastAPI, Neon and Groq; no second agent runtime or mobile database service. The public web application remains independently deployable.

Reviewed the supplied `FareeqAi Landscape.png` and `FareeqAi mobile-app.png`, current live Home and Team at desktop/390px widths, the previously verified live chat, and the source for design tokens, character assets, navigation, message rendering, streaming and authentication. The generated images are design references, not executable layouts or feature specifications. `docs/architecture.md` contains historical demo-user/auth assumptions; current source and the public release report supersede those assumptions.

## Visual contract

Use the web application's Sunshine & Ink tokens: paper #fff7df, reading paper #fffcf2, yellow #ffda45, pink #ff438a, deep pink #cc1757, ink #151714 and navy #202d3b. Preserve 2px ink borders, modest rounded corners, hard offset shadows, illustrated teammates and restrained handwritten decoration. Use Inter for body text, Archivo Black for headings, Permanent Marker for the wordmark, Caveat sparingly and Noto Sans Arabic for Arabic. Bundle properly licensed font assets for mobile rather than depending on Next font loading.

The supplied mobile image is the primary chat composition reference: compact back/avatar/name/role/menu header, right-aligned user bubble, left-aligned assistant card, clear reply actions, optional follow-up action and a bottom composer. The landscape image informs tablet layouts and broader spacing.

Important differences from today's implementation:

- The image uses a pink user bubble; current MessageBubble uses pale yellow. Keep a distinct user-message token so the requested pink treatment can be applied deliberately without changing the website silently.
- The image shows a comic Harvey portrait while current shipped artwork is the existing generated Sunshine collection. Reuse the shipped character assets initially; do not invent a second set of teammates or change their names.
- The image's large floating avatar, sticker and numbered card work for a short example. Long text, code, tables and document citations must remain readable. Decoration must not overlap or cover content.
- Do not wrap every AI reply in the pictured interview plan. Render the actual answer; numbered badges belong to actual ordered lists. Stickers and follow-up suggestions must not fabricate backend output.
- Read receipts in the image are not evidence that the backend supplies delivery/read receipts. Use only truthful pending/sent/failed states.
- Listen and microphone artwork does not enable voice automatically. Voice/TTS are currently disabled in the production configuration; unavailable controls should be hidden or clearly unavailable.

Keep Home, Team, Memory, Goals and Plans as the primary destinations. Chat history is available from Home and within an agent; open conversations use a focused screen with the composer above keyboard and safe-area insets. Account, optional sign-in and language selection belong in a compact menu; the desktop links crowd the current 390px web header. English/Arabic, RTL, large text, screen-reader labels and reduced motion are part of the initial design, not later polish.

## Client approach

Recommended starting choice: Expo with React Native and TypeScript in a new `mobile/` directory inside this repository. This provides one Android/iOS client while retaining the team's React/TypeScript approach. It is a recommendation for implementation, not an already tested native build. [Expo documentation](https://docs.expo.dev/) describes its shared native project model.

Capacitor is a credible alternative when maximum HTML/CSS reuse is the priority; it provides a native container for web UI. [Capacitor documentation](https://capacitorjs.com/docs). This Next frontend is request-rendered using connection(), cookies(), headers() and CSP nonces, so it cannot simply be copied into a static native bundle. A remote-web wrapper also retains network and browser wake dependencies. React Native better fits the requested phone interaction design, at the cost of recreating the UI components.

Reuse character artwork, design values, translated copy, API schemas and parsing rules. React DOM components, Tailwind CSS, Next routing, browser sessionStorage, service workers and browser file handling require mobile equivalents. Initially extract small platform-independent pieces only when used by both clients; avoid reorganizing the released web app as a prerequisite.

## Backend integration work

Use the existing REST endpoints and POST SSE chat protocol, preserving start/delta/end/error and trailing memory events. Verify streaming on both actual native platforms; browser fetch/getReader behavior is not sufficient evidence. Handle cancellation, lost connectivity and app background/resume, and reconcile saved conversation state without replaying a paid message automatically.

Current production authentication uses a Secure HttpOnly SameSite=Strict cookie under /api; guest/signup/login enforce the web Origin. A native client cannot assume browser cookie persistence or treat Origin as proof of identity. Before live native integration, define a revocable device-session transport using the existing device/epoch checks, with secure platform storage, explicit sign-out and guest promotion. Keep the browser cookie path and browser CSRF protections intact. Never ship provider keys, the database connection or signing secrets. No general X-User-Id bypass, wildcard origin allowance or auth-disabled production mode.

Both clients use the same database, but guest sessions are device-specific. Registered accounts can restore their saved work after sign-in; two anonymous installations do not automatically share a workspace. Native credentials must be bound to the correct account, expire safely and clear account-scoped drafts/caches on identity changes. Guest expiry remains the existing seven-day policy.

Uploads keep the current 10MB/file, allowed-type and account-isolation rules. Provide a native document/photo picker, cancellation, progress and accurate processing/error states. Preserve server OCR/keyword retrieval and source citation resolution. Avoid requesting camera/library permissions before the person chooses that action.

Free Blitz hosting sleeps. The current recovery relies on a real browser visit to a fixed /wake URL and returns to the web app. Native wake needs a separately verified return-to-app mechanism, or a clear bounded retry experience after browser wake; existing web redirects alone are not native completion. Validate cold wake on both platforms before a mobile release.

Web and mobile share the same global 100,000-token/day cap and guest admission limits. Adding a client does not create more hosting or provider capacity. Team fan-out, push, voice and TTS must respect actual backend feature configuration and quotas.

## Implementation sequence

1. Establish mobile project, pinned toolchain, tokens/fonts/artwork, navigation and mock-data screens. Begin with Home, Team and Harvey chat; compare the supplied concept at 390px plus small Android widths, large text and Arabic. No production identity changes are needed for this visual slice.
2. Implement and test the native session contract against local/staging backend. Cover guest bootstrap/promotion, expiration, device revocation and account isolation. Verify streaming and cold wake before production connection.
3. Connect agents, chat/history, documents/citations, memory, goals, plans and optional authentication in small verified slices. Preserve errors and quota states. Use a separate known QA workspace for live checks.
4. Verify on Android and iOS devices: keyboard, back gestures, rotation, safe areas, permissions, large replies, Arabic, background interruption, cold startup, upload failure and offline recovery. Build release artifacts and prepare distribution/privacy metadata only after those checks.

## Local tooling and distribution

This Mac currently has Node and Apple Command Line Tools, but `xcodebuild -version` fails because full Xcode is not the selected installation. No full Xcode.app or Android SDK was found at the standard locations checked; adb is not on PATH and java reports no runtime. Native build/simulator verification therefore requires toolchain setup. This is a checked local limitation, not a failed app build. No SDKs, paid services or account enrollments were installed or initiated during this review.

Hosting can retain the existing Free plans. App-store distribution is a separate decision: Apple's standard developer membership is $99/year and Google Play registration is $25 once, subject to eligibility and local terms. Personal iOS device testing with a free Apple account is available. Sources: [Apple Developer Program](https://developer.apple.com/programs/), [Google Play setup](https://support.google.com/googleplay/android-developer/answer/6112435). Do not enroll, enter payment details or imply store publication is free. Start with development/device testing while distribution is decided.

## Review outcome

The references and existing design are compatible. The first implementation milestone should be a visually faithful, interactive mobile Home/Team/chat slice with fixture data, followed by native authentication/streaming/wake verification using the existing backend. This review creates no mobile binary, changes no production behavior and does not claim native runtime verification.
