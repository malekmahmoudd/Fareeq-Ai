# FareeqAI production remediation — 3–4 October 2026

> Historical enterprise-sign-off phase. The subsequent safe-MVP brief supersedes
> its blanket P1/off-host certification gate. Current fixes, launch conditions and
> actual deployment status are in [MVP release](mvp-release-2026-10-04.md).

**Production sign-off is still withheld.** Environment recovery, P0 application changes and local release rehearsals are complete as described below. The remaining P0 deployment evidence and build-advisory exception must be resolved/acknowledged before proceeding to the P1 implementation stage, as requested. No iOS/Android application was created. No public deployment or real-user data migration was performed.

## Baseline and environment

Read and verified the existing [technical audit](technical-audit-2026-10-03.md). The repository had moved to `/Users/malekmahmoud/code/FareeqAi`; the old chat cwd no longer contained application source. Using the actual checkout restored process execution. Docker Desktop required starting and its CLI required adding to PATH. Initial registry pulls timed out during startup; retry succeeded without changing Docker configuration. System Chrome subsequently failed to launch with a path-service error; an explicitly recorded Playwright Chrome for Testing channel completed the browser runs.

The starting revision was `12ccfcbe84dd56f4d29b77865721b2030653b233`, with an existing modified frontend lockfile. Its original diff was preserved privately before updates. All remediation remains uncommitted for review. The release images include the working-tree fixes; this is not a signed Git release.

Current configuration confirms why deployment-specific work cannot proceed: backend/.env selects the development mock provider and has no provider key; deploy/.env does not exist. No production host/domain, real-provider credentials or physical off-host backup access is available in this checkout. These were not replaced by dummy values and reported as production evidence.

[Baseline/environment reproduction](remediation/baseline-2026-10-03.md): backend 541 passed/4 skipped; Ruff passed; Python compatibility passed; frontend typecheck/build passed, lint 21 warnings/0 errors; two portable checks failed on i18n resolution; npm 12 advisories. No backend static type-checker or frontend npm test script was configured. Python vulnerability scan found no known runtime advisories.

## P0 status

| Finding | Remediation / verification | Remaining gate |
|---|---|---|
| B1 dependency release gate | Next 16.3.8, PostCSS/ESLint/compatible transitive updates; minimal standalone frontend runtime; clean npm ci/typecheck/lint/build; zero runtime npm advisories; Python scan clean; dependency gate added | Full npm audit still reports seven high build-chain findings rooted in the unpatched braces advisory. Exact applicability exception documented; future releases must recheck it. This is not an unconditional zero-vulnerability sign-off. |
| B2 pre-parser upload limits | Bounded ASGI collection before JSON/multipart parsing; byte/part/header/concurrency/idle/total limits; Caddy edge cap, read deadlines and full-duplex early rejection | Fixed and verified locally; use the same proxy/configuration in deployment and rerun ingress probes there. |
| B3 release/operational evidence | Exact app Dockerfiles and production-pinned PostgreSQL/Caddy; migrations to 0012 and downgrade/upgrade rehearsal; HTTPS cookie/SSE/privacy/failure/retry journey; encrypted backup/restore/table equality; image rollback/session persistence | Local rehearsal passes. Public DNS/TLS, live provider smoke, physically off-host storage/key recovery, actual scheduler/watchdog/operator ownership remain deployment-specific evidence, not proven by local directories or a scripted provider. Deployment identifiers/access were requested. |

Detailed [dependency applicability](remediation/dependencies-2026-10-04.md) and [ingress changes/tests](remediation/ingress-2026-10-04.md). The dependency check fails on runtime advisories, a new build advisory, an audit-service error, or affected build tools appearing in standalone output. It does not suppress the nonzero full npm audit.

## Release verification results

| Check | Observed result |
|---|---|
| Backend host regression | 553 passed, 4 optional OCR/embedding skips; Ruff passed |
| Backend production image | **557 passed, zero skips**; hashed runtime lock exact, no missing/wrong/extra runtime packages |
| Frontend install/typecheck/lint/build | Passed; lint still 21 warnings, zero errors |
| Runtime dependency audit / standalone inspection | Zero npm runtime advisories; affected build tools absent from actual image; Next 16.3.8 |
| Git history secrets | Redacted gitleaks scan of all reachable refs: 55 commits, no findings; no credential values printed |
| PostgreSQL production image | Empty database -> head 0012; head -> 0003 -> head; sentinel account/session epoch preserved |
| HTTPS ingress | 413 declared oversize without body; 413 chunked excessive parts; 413 oversized chunked JSON; 408 stalled body |
| Fresh browser journey | **23 checkpoints passed**, Chrome for Testing 153.0.8010.12, no CSP violations/uncaught page errors |
| Accessibility | Zero automated axe/keyboard findings in final release run; not a manual screen-reader/device certification |
| Linux operations rehearsal | Ten checks passed: encryption requirements, verified copy/retention, wrong key, restore, exact table equality, populated restore, watchdog transitions/retry/failure |
| Application image rollback | Audited backend/preceding patched frontend become ready; existing session/conversations preserved; current images restored and ingress probes passed again; schema unchanged |

Fresh browser QA exposed a home-page overflow: intrinsic grid sizing let a long recent-chat title stretch a 390px page to 609px. Explicit one-column/minimum-width constraints fixed it; the rebuilt image passed the existing viewport assertion. This is a small web regression fix, not mobile-app development.

The first HTTPS abuse probe exposed HTTP/1 proxy draining, which delayed early rejection. Caddy full-duplex handling/deadlines fixed it. One intermediate exact-backup comparison failed because the simultaneous accessibility signup changed source rows; the final backup test stopped application/test writers and passed. Neither failure was counted as a passing check.

Rollback uses disposable loopback-only retired images to verify compatibility. The retired backend predates ingress hardening and is **not** an approved public rollback target. Real rollback policy must select a secure compatible release; schema downgrade can destroy credential data, so a validated backup is required. The restore comparison checks every table against an unchanged source, but both copy destinations were on this machine: no physical off-host durability claim is made.

## Evidence and reproduction

[Evidence directory](remediation/evidence/) contains baseline/advisory outputs, redacted scan results, image test/migration logs, HTTPS probes, operations/rollback results, lint/typecheck and image identities. [Browser report](remediation/browser-2026-10-04.json) and [accessibility report](remediation/accessibility-2026-10-04.json) identify the actual tested browser. Container image IDs are local immutable identities, not published registry release digests. Base image digests are recorded in the Compose/Dockerfiles.

Use [production rehearsal instructions](../deploy/tests/production-rehearsal/README.md). The new ingress probe uses only localhost and the disposable local CA. The operations helper refuses a different Compose project; exact comparisons require stopped writers. The rollback helper restores current images in a finally block. Never apply rehearsal deletion/rollback commands to real data.

After recording the final image identities and rerunning ingress against the restored images, the disposable rehearsal containers/volumes were removed. Built images and evidence remain available; no production resources were touched.

## Work still required

The two frontend hook checks still fail on `@/lib/i18n` (H14); they were reproduced and not represented as green. All audit P1 items remain in the next implementation stage: credential-error redaction, atomic 2FA/suspension recovery, draft/account/401 and push cleanup, voice permission policy, interrupted ingestion recovery, derived-memory/summary/mutation concurrency, privacy retention, pool/load/global admission controls and provider contract parity. Passing the current journey does not cover those missing concurrency/privacy regressions.

Following the requested P0-first order, P1 application changes have not begun while B3 deployment evidence remains open. Required next input: whether an existing production deployment is in scope, its host/domain and access method, and a physically independent backup destination/key-recovery arrangement. If the requested scope is local release readiness only, the remaining external checks must be explicitly recorded as deployment gates; that does not itself grant production sign-off or waive P1 findings.
