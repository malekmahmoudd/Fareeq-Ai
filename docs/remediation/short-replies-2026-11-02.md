# Short replies and removal of money calculators — 2 November 2026

The owner requested much shorter replies from every agent and confirmed removing
Zakat and savings circles entirely.

## Changes

- Replaced the shared 150–250-word target / 320-word ceiling with a 40–80-word
  default and 120-word ordinary-answer ceiling. Simple exchanges take one or two
  sentences. Avoid headings, recaps, repeated advice and automatic closing offers.
- Updated conflicting persona instructions. Harvey no longer repeats plans as a
  second next-actions list, and has a compact interview-preparation example.
- Explicit requests for detail or complete drafts, CVs, code and schedules can
  exceed the default. Preserve safety guidance, document citations and all
  requested days/items. Completion-token limits remain unchanged to avoid clipping.
- Incremented all ten agents' prompt versions. Web and native mobile use the same
  backend context builder; this policy needs no Android binary change.
- Removed the `/money` page, calculator component and exclusive calculation
  library, Plans shortcut, English/Arabic translations, savings-circle template,
  and Emma's dedicated Zakat/savings-circle instructions. General budgeting and
  savings advice remain available; this does not keyword-block user questions.
- Removed the obsolete calculator browser-rehearsal steps. Existing user data and
  historical conversations are untouched; the calculators never saved inputs.

## Verification

- Backend: 594 passed, 4 skipped; Ruff passed. Added 20 context regression cases
  covering every agent in ordinary and Arabic/spoken modes with verbose history.
- Corrected a pre-existing date-dependent test fixture: its old timestamp moved
  with the machine clock while its review date remained fixed in September.
- Frontend: typecheck, all five standard check scripts and production build pass.
  ESLint: 0 errors, 18 existing warnings. Removed only stale generated route types
  before rebuilding; the resulting route table no longer includes `/money`.
- Real Groq samples using the edited local prompts: Harvey 97 words (English),
  65 (Egyptian Arabic); Writing 55 words. An explicitly requested fourteen-day
  study plan completed in 163 words and included every day. All completed normally.
  See `short-replies-live-2026-11-02.json` for synthetic prompts and outputs.
- Initial samples exposed Harvey repeating next actions and exceeding the target;
  the persona/example adjustment above preceded the final recorded samples.
  Groq's per-minute quota interrupted an earlier run; no quota settings changed.

These are prompt instructions, not a deterministic output word-count filter.
Samples do not guarantee every future reply meets the target. Live hosted rollout
is not verified by these local tests or direct provider calls.

## Hosted deployment verification

After the owner redeployed commit `3b8b6d8` on DockHosting, a fresh native guest
session confirmed Harvey prompt version 14 and Writing version 15. Their live
streamed replies completed in 89 and 53 words, respectively. Both synthetic
incognito conversations were deleted afterward. This checks the same native
bearer authentication and shared chat API used by Android, without installing a
new APK. Previously verified public `/money` returns 404; the API/database were
healthy. See `short-replies-deployed-2026-11-02.json` for hosted evidence.
