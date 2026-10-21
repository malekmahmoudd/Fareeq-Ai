# Play release checks — 21 October 2026

Scope: live support contact and reply reports; dependency security review. Main website and mobile screen designs are unchanged.

## Live checks

- Direct production API guest authentication and streaming chat returned 200. A new isolated guest workspace received the reply `Hello.` to a non-sensitive release-test prompt.
- Reporting that assistant message returned 201 with `received: true`; repeating the report also returned 201. Guest access to the operator report-review endpoint returned 404, as intended.
- Test conversation: `150120dc-5e40-43e1-9805-46a6af3fc0c8`; message: `148970cf-da73-4781-8d9d-1ef88c75a433`. It is retained temporarily for operator verification and follows normal guest expiry. No real user workspace was changed. No session tokens are stored in this report.
- Authorized operator review remains UNVERIFIED. No operator session was available; the owner instructed continuing without sign-in. Local automated coverage verifies authorized review, ownership, validation and idempotence.
- Support email is committed in the privacy source, but the live API still serves the previous notice. DockHosting shows the current production deployment `65da970` and a new deployment pending with no build output. Do not call the new notice or security patches live until the host completes deployment and checks pass.
- Command-line access to the Cloudflare frontend API returned 403. The direct backend checks above do not substitute for the full browser proxy journey.

## Dependencies before and after remediation

| Surface | Before | After | Disposition |
| --- | --- | --- | --- |
| Backend locked runtime | 13 advisories in 3 packages | 0 | Updated certifi, Pillow and pypdf; hash-pinned lock retained. Deployment still required. |
| Website runtime | 2 high findings | 0 | sharp 0.35.5 and source-map-js 1.2.2; runtime audit clear. |
| Website full dependency tree | 11 findings | 7 high findings | Remaining findings all propagate from the existing unpatched braces build-tool advisory. Existing dependency gate passes and excludes affected tools from standalone server output. |
| Mobile full dependency tree | 21 findings | 18 high findings | Compatible SDK 57 patch updates removed 3 moderate findings from the xcode/uuid chain. Remaining findings propagate from two build-tool advisories below. |

Backend changes: certifi 2026.7.22 → 2026.10.19, Pillow 12.3.0 → 13.0.0, pypdf 6.19.0 → 6.20.1. Pillow's supported range was raised deliberately to include the patched major release; OCR/document regressions passed with it. PyPI release SHA-256 hashes were used for the three updated lock blocks; unrelated backend versions were retained. The complete test environment matches the lock.

Website build tooling: pin postcss-selector-parser 7.1.6 through npm overrides to remove its CPU-exhaustion advisory without replacing Tailwind or changing design source. Production build and existing behavior checks pass. Mobile uses compatible patch updates including Expo 57.0.31; no forced SDK or React Native downgrade was used.

### Remaining build-tool risks

- [braces stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): latest available braces is 3.0.3 and remains affected. Used by Metro/globbing and website build/lint tooling. No user-supplied glob patterns are passed to these build tools. The standalone website dependency check excludes the affected build chain.
- [node-forge signature verification](https://github.com/advisories/GHSA-86w9-cpqp-85rv): latest available node-forge is 1.4.0 and remains affected. Reached through Expo CLI/code-signing tooling. FareeqAI does not ship Expo Updates or perform node-forge signature verification in its mobile UI. Build tools remain a supply-chain risk; use trusted builds and retain these findings for upstream patch review.
- Android production source-map review inspected 1,491 module sources: no braces, micromatch, node-forge, Metro file-map or xcode modules were present. One Expo CLI source is its Metro `metro-require/require.js` loader; this is not the vulnerable glob or certificate-verification code. This evidence describes the freshly exported source, not a blanket claim that npm's production-dependency classification is clean.
- npm `--omit=dev` still counts Expo CLI transitives because Expo declares them under runtime dependencies. Do not relabel this as a zero-advisory mobile npm audit.

These remaining advisories are assessed as build-tool risks, not demonstrated Android runtime vulnerabilities. No unconditional security sign-off is given. Recheck for upstream fixes before the Play build is submitted.

## Validation

- Backend: 574 passed, 4 skipped; Ruff passed. Includes document/OCR, lock consistency, privacy and reply reporting.
- Backend pip-audit: zero known advisories in the revised lock. Hash-required dependency-file validation passed.
- Mobile: typecheck, lint and all 25 tests passed; Android and iOS production exports passed.
- Android additional source-map export passed for module provenance analysis.
- Website: typecheck, behavior checks, production build and dependency gate passed; lint has 19 existing warnings and zero errors.

## Remaining release gates

1. DockHosting must deploy the new privacy notice and revised backend lock; verify the public support email afterward.
2. An authorized operator must retrieve and review a live report before Play submission.
3. Generate replacement signed APK/AAB artifacts from the revised mobile lock, then complete physical-device testing. The previously prepared 0.2.1/code 4 artifacts predate this remediation and must not be described as containing these updates.
4. Screenshots, Play Console declarations and account-specific testing remain separate work.

Sources: [pypdf patched release](https://github.com/py-pdf/pypdf/releases/tag/6.20.1), [Pillow 13](https://github.com/python-pillow/Pillow/releases/tag/13.0.0), [certifi trust-store advisory](https://github.com/advisories/GHSA-6q48-6c7w-9gw2), [PostCSS selector-parser advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
