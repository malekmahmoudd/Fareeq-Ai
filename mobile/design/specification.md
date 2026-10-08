# Approved mobile visual specification

## Authority and scope

The final approved image is `references/approved-mobile-preview.png` (concept v07). It governs the visual direction. The original landscape/mobile images govern Harvey's portrait and the comic framing treatment. Earlier iterations are archived locally outside this repository. The approved illustrations and original references remain here.

Build one Android/iOS experience using the existing backend, database, agents, account isolation and quotas. Keep optional login and guest access. Start with Home, Team and agent chat, then extend the same visual language to Memory, Goals, Plans and Account. This design package alone does not establish native runtime readiness.

## Palette

- Warm cream paper and slightly lighter reading surfaces remain the dominant backgrounds.
- Yellow is bright, luminous, warm golden yellow: avoid greenish fluorescent/highlighter yellow, flat mustard, or orange. Gentle golden shade/highlight variation is acceptable in artwork; UI labels and outlines stay crisp.
- Navy is the very dark ink navy in the original landscape's selected Chats panel. Use #0B2436 as the initial implementation token, with #071B2A for deeper shading. These are intended implementation values, not a claim of exact pixel sampling from a generated image.
- Pink remains the accent for the wordmark underline, main Home send action, user message bubbles and Leo's jacket. Pink and yellow remain dominant accent colors; navy communicates selection.
- Existing blue secondary text should resolve to the dark navy token, not medium royal blue or dusty blue. Do not introduce pale-blue cards.

## Selection states

Selected primary navigation items use a compact solid navy rounded rectangle behind both icon and label. Icon and label use cream/white. Keep it inside the tab's own slot, with comfortable padding; it must not fill the entire tab bar. Unselected items use ink icons/text on cream. Exactly one primary destination is selected. Include semantic selected state for accessibility; color alone is insufficient.

The approved sample shows selected Home on the Home screen and selected Team on the Team screen. Apply this treatment to Memory, Goals and Plans when selected. Other selectable controls may use the same treatment where it clarifies a mutually exclusive selection, but ordinary cards and action buttons do not all become navy. Disabled, pressed and focused states must remain distinguishable.

## Portrait decisions

- Leo retains his recognizable wavy dark hair, light stubble, relaxed hand-against-cheek pose and detailed editorial illustration style. He wears a rose-pink jacket over a cream T-shirt, with a subtly warmer smile and shading. The final Home hero and Team thumbnail show the approved appearance.
- Harvey uses the original AI-generated comic portrait from the user's two references: swept-back dark hair, glasses, full neatly trimmed beard and a yellow circular background. The more realistic dark-skinned web Harvey portrait is not the mobile selection.
- Preserve the other teammates' appearance in the approved sample. Avoid reverting the entire cast to the rejected simplistic cartoon style. Keep character identity consistent across hero art, Team cards, chat headers and reply avatars.
- The approved preview contains some portraits only as rendered thumbnails. Those embedded portraits are saved as visual references; they are not separately exported full-resolution portrait assets. The web originals are also preserved for source material. Any new standalone exports should be checked against the approved image before being adopted.

## Comic framing

Use bold near-black outlines, modest corner radii and small hard offset shadows. Add the original landscape's yellow halftone dots, ink plants/leaves, small city skyline silhouettes and occasional tilted caption placards at screen edges. Decorative framing belongs inside the application, rather than only outside the phone mockup.

Keep decoration outside text, controls, safe areas and keyboard-sensitive regions. The image is a visual direction, not permission to obscure content at small widths. Reduce decorations on small screens, large text or reading-heavy views as needed. Mark artwork decorative for screen readers. Do not bake slogans, labels or UI copy into reusable portraits.

## Screen composition

Home: compact Fareeq AI wordmark/profile header; warm golden Leo hero with the pink jacket; direct Message Leo composer; recent chats; front-desk teammates; five-item bottom navigation.

Team: clear title; illustrated cards with yellow name tabs, role labels and ink outlines; Leo plus all nine specialists from the existing API. The sample shows a subset, not a reduced agent inventory. Scroll to the remaining agents while keeping navigation accessible.

Chat: back/avatar/name/role/menu header; pink user bubbles; outlined cream assistant replies; compact Save/Copy/More actions; optional follow-up; fixed composer with attachment action and golden send control. Preserve readable long replies, code, tables and document source links. Focused chat does not need the global tab bar. Composer respects the keyboard and bottom safe area.

Use truthful pending/sent/failed states; no fabricated read receipts. Voice/TTS remain governed by the actual backend feature configuration. Mock stickers, ordered lists and follow-up suggestions must not fabricate model response structure or force every answer into the pictured interview template.

## Typography and access

Use the web's Inter body, Archivo Black headings, Permanent Marker wordmark, sparse Caveat handwritten accents and Noto Sans Arabic. Bundle licensed font files when implementing the client. Support Arabic/RTL, large text, reduced motion, contrast, screen-reader names and platform touch targets. Android and iOS share the design but use their real status bars, safe areas and navigation behaviors; the mock phone frame is presentation artwork.

## Architecture boundary

The design changes do not alter backend services or require new hosting. Native device authentication, streaming, uploads, background/resume and free-host wake-up need the compatibility work documented in the architecture review. Do not weaken browser session protections or put provider/database/signing credentials into the app. Registered accounts can share server work across clients; anonymous installations remain separate guests.
