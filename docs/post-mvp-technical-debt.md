# Post-MVP technical debt — 4 October 2026

> Updated launch scope: the public showcase now uses isolated guests, optional signup and a shared daily AI cap. Earlier invite-only assumptions below are historical. See [public release verification](public-release-verification-2026-10-06.md) for the current deployment and limits.
This replaces the earlier blanket P1 launch requirement. The MVP is a small,
isolated guest workspaces with optional signup, one backend process/host, PostgreSQL, HTTPS,
and a verified OpenAI-compatible provider. Signup, push, voice/TTS and expensive
multi-agent consultation stay off initially. These constraints make the items
below deferrable; changing a constraint requires revisiting its dependent debt.
Credential response redaction, concurrent 2FA replay protection, suspended
recovery and shared-browser draft isolation were fixed rather than deferred.

Priorities: **P1 — Soon after MVP**, **P2 — Before significant user growth**,
**P3 — Future improvement**. Existing audit IDs are retained for traceability.

## Security hardening

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | Encrypt TOTP seeds with a separate key; improve secret rotation procedures | Existing passwords/recovery codes are hashed and sessions scoped. No current database disclosure was found. Revisit as the audience and operational access expand. |
| P2 | H12 IP+account credential/key throttles and bounded signup/push registration | Email/TOTP and per-address signup throttles exist; guests have per-address and global admission caps, and AI usage has a shared daily cap. Push remains disabled. Broader abuse protection and trusted client-address verification across the deployed proxies remain growth work. |
| P2 | B1 upstream braces/toolchain advisory fix | Seven build-only findings under one advisory; affected tools absent from runtime, zero runtime advisories, trusted reviewed build input. Keep the exact dependency gate; do not widen its exception. |
| P2 | CORS/Origin multi-origin policy | MVP uses one HTTPS origin. Required before cross-origin clients; never weaken CSRF as a native-auth workaround. |

## Reliability

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | Durable turn IDs/idempotent retry and reconnect | Current UI prevents normal duplicate sending, saves interrupted replies and offers retry. Uncertain multi-device/network outcomes can be handled with refresh/support during the limited pilot. |
| P2 | Coordinated background scheduler and durable job queues | One worker avoids duplicate scheduling. No native notification SLA is promised. |
| P2 | Fully automated immutable-release promotion/secure rollback catalog | Local rollback/migration/restore behavior is rehearsed. Retain secure images and take a backup before changes; retired vulnerable rehearsal images are not release targets. |

## Concurrency

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | H8 version memory/summary writes and protect against stale analysis | Overlapping turns can produce stale derived context, not cross-account authorization. Manual corrections and interrupted-memory notices exist; address observed pilot cases. |
| P2 | H9 database-coordinated chat/mutation claims | Process lock covers ordinary turns; UI disables mutations during streams. Same-account tabs remain an edge case. Required before multiple workers/replicas. |
| P2 | Atomic admission for count-then-create document/CV/template caps | Constraints bound ordinary use; invite-only load is small. Required when concurrency/cap overruns appear. |

## Privacy

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | H10 memory-removal versus historical receipt/chat/summary retention policy | Copies stay inside the same authorized account; deleting a memory entry is not full transcript erasure. Explain this clearly; retain whole-account deletion. |
| P1 | H5 device/session-bound push cleanup and generic default notifications | Push is disabled in the MVP configuration, preventing outgoing detailed reminders. Required before enabling push. |
| P2 | Export/backup erasure metadata and retention automation | Existing account export/delete and encrypted backup scripts work. Operate the initial backup procedure manually and document its retention. |

## AI/provider robustness

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | Broader model/prompt/extraction quality evaluation, adversarial memory tests | Existing behavioral checks and bounded context remain. The MVP is assistance, with no executable booking/trading/mail actions. Fix observed quality defects. |
| P2 | H13 Anthropic timeout/EOF/usage/health parity | Anthropic is outside the initial supported launch configuration. Required before selecting it. |
| P2 | H12 provider-wide concurrency/spend admission and exact cost attribution | Atomic shared 100000-token/day admission now covers both guests and registered accounts, alongside 6 requests/minute and 60000 tokens/account/day. Live models and provider minute/request limits were verified. Exact cost attribution and broader concurrency control remain growth work. |

## Document processing

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | H7 durable input/job recovery | Normal parsing/type/size/sandbox/RAG paths are tested. Startup now marks interrupted processing failed with a clear reupload instruction. Parsed documents persist in Neon; accepted raw file recovery is still not promised. |
| P2 | Stronger parser privilege/network sandbox | Current subprocess CPU/memory/time/type and ingress limits exist; ingestion is serialized on the single worker. Increase isolation when exposure/workload grows. |

## Performance/scalability

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P2 | H11 shorter transactions/async or thread-offloaded DB, pool/statement limits | Small invite-only load and one worker; no evidence of current pilot capacity failure. Measure before adding workers. |
| P2 | Pagination, incremental sync, bounded search/export/history queries | Small initial accounts; API prompt/context size is already bounded. Required for long-lived/heavy accounts and mobile sync. |
| P2 | Representative load/resource tuning, host redundancy | Do a basic resource check on the selected host; no enterprise availability SLA for the pilot. |

## Observability

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | Recurring protected backups/retention and basic readiness monitoring/operator ownership | A real encrypted Neon snapshot was restored on the local Mac in an isolated PostgreSQL 18 container. Scheduled backups, independent key custody, retention and recovery objectives still require operation. |
| P2 | SSE completion/job/backlog/provider-cost metrics and durable monitoring | Current request/incident/provider counters suffice for a small monitored pilot. Add depth with usage. |
| P2 | Log rotation/resource policies, automated off-host watchdog and alerts | Configure basic host disk monitoring; richer automation is operational debt, not evidence of an immediate auth/data-loss bug. |

## Testing

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | Physical-device/Safari/manual screen-reader and additional Arabic journeys | Existing automated responsive/axe/journey evidence passes; quick deployed mobile smoke is still required. |
| P2 | Multi-process PostgreSQL races, deletion during stream, full provider failure matrix | New 2FA replay regression is fixed/tested; broad concurrency matrices are required before scale, not a small single-worker pilot. |
| P2 | Comprehensive CI coverage/SBOM/OS image advisory automation | Existing locked/pinned dependencies, runtime scan and release checks remain. Keep current checks repeatable. |

The two H14 portable hook scripts were stale alias loading, not a production
runtime defect. A small test-only source loader repaired them while adding the
MVP privacy check. Tests use real source/translation modules; no passing result
was fabricated. This item is resolved, not silently waived.

## Developer experience

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P2 | T1 consolidate/archive stale setup/schema/team/default documentation | Current MVP release/runbook is authoritative; old dated documents remain historical evidence. |
| P3 | T2 legacy naming; T3 lint warnings/component organization; T5 response schema consistency | No user-facing deployment/runtime failure was demonstrated. Fix incrementally, without redesigning working flows. |
| P3 | Deterministic self-hosted build fonts / reproducible network-independent builds | Current release build succeeds; build egress is an explicit requirement. |

## Mobile preparation

| Priority | Work | Why safe to defer / revisit trigger |
|---|---|---|
| P1 | Versioned typed API/error/SSE contracts and shared TypeScript utilities | Begin after real MVP deployment/smoke success. Keep the Python backend central. |
| P2 | Native access/refresh rotation, device revocation and secure local credential storage | Current web uses secure HttpOnly cookies/Origin checks. Required before native clients; do not port cookie assumptions blindly. |
| P2 | Turn reconnect/idempotency, pagination/sync/tombstones, device push lifecycle | Required as native backgrounding/offline behavior is introduced. |
| P3 | APNs/FCM, deep links, encrypted outbox and store-release/physical-device workflows | Native phase only. No React Native/Expo application is created in this task. |
