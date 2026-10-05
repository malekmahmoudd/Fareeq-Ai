# FareeqAI safe MVP release — 4 October 2026

> 5 October update: hosting must be free-only with no credit card and included
> provider subdomains. A purchased domain/paid host is not required. See the
> [free-tier deployment constraint and candidate](free-tier-deployment-2026-10-05.md).

**Decision: CONDITIONAL GO.** The known immediate application blockers are fixed
and locally verified. The release is ready for deployment to a small invite-only
pilot after real host/provider configuration is supplied and verified. **Actual
deployment: NOT ATTEMPTED. Production smoke test: NOT ATTEMPTED.** Local HTTPS
containers and a scripted provider are not production or real AI evidence.

The newest MVP brief supersedes the previous blanket P1 production-sign-off
requirement. Reused the [audit](technical-audit-2026-10-03.md) and
[completed remediation evidence](production-remediation-2026-10-04.md), with
focused verification of remaining immediate risks rather than another audit.
No native application, framework migration or broad refactor was performed.

## Classification

Each remaining finding has exactly one MVP category. Completed findings are
shown with their category and closure evidence for traceability.

| Category | Finding | Status / rationale |
|---|---|---|
| MUST FIX BEFORE MVP | B1 exploitable runtime dependencies; B2 unbounded uploads | Fixed in earlier remediation. Runtime dependency checks remain green; ingress bytes/parts/time limits are tested before parsing and through Caddy. |
| MUST FIX BEFORE MVP | H1 credential-error echo | Reproduced with model-level and field errors; fixed using loc/type/msg allowlist, omitting input/ctx and setting no-store. Three regressions pass. |
| MUST FIX BEFORE MVP | H2 concurrent TOTP replay | Reproduced two simultaneous successful logins. Login now takes the existing database credential lock and refreshes state, rechecks password/suspension, then consumes the second factor. Concurrent test now yields one success and one rejection. |
| MUST FIX BEFORE MVP | H3 suspended account recovery | Verified missing policy in code; recovery now refuses suspension before consuming a code/changing credentials/issuing a session. Regression checks unchanged password/code and no cookie. |
| MUST FIX BEFORE MVP | H4 shared-browser draft exposure | Account-scoped draft keys; clear all legacy/scoped drafts and handoff text on protected 401, successful identity change and explicit logout. Portable and browser regressions pass. |
| MUST FIX BEFORE MVP | H14 unusable frontend checks | Repaired actual source alias/TSX/translation loading, added npm test and privacy regression. All four portable checks pass; no dummy i18n implementation was substituted. |
| MUST FIX BEFORE MVP | B3 actual deployment and essential live verification | Local image/PG/TLS/SSE/backup/rollback evidence already exists. Real host/domain/access and provider credentials are missing. Must establish real HTTPS/origin, persistence, provider/model availability and complete the live smoke below before inviting users. |
| MUST FIX BEFORE MVP | H12 basic MVP spend exposure | Existing quotas retained: 6 requests/minute, 60000 budgeted tokens/account/day. Initial launch must have finite operator-provisioned invites, signup/push/voice/TTS/team off, and a verified provider spending limit/free quota. Structural preflight added; actual provider limit not yet verified. |
| SAFE TO DEFER | B1 seven build-chain advisories; T4 extra supply-chain work | One unpatched braces advisory remains in build tools only; exact exception is narrow and affected tools absent from standalone runtime. Minimal runtime portion of T4 already fixed. No blanket clean npm audit claim. |
| SAFE TO DEFER | H5 push privacy; H6 microphone policy | Push and voice/TTS disabled for initial release. Revisit before enabling either. |
| SAFE TO DEFER | H7 upload recovery after restart | Normal upload/parsing/RAG tested; interrupted in-memory processing may require deleting and reuploading. Avoid rollout during active uploads; durable jobs and explicit interruption status are next-stage debt. |
| SAFE TO DEFER | H8 derived memory writes; H9 cross-process turn claims | One backend worker/host, bounded pilot. Same-account concurrent tabs and stale derived context remain; no demonstrated cross-user exposure. Required before multiple workers. |
| SAFE TO DEFER | H10 historical retention; H11 pool/performance | Explain memory removal versus transcript/account erasure. Small pilot, no current capacity failure. Measure and improve before growth. |
| SAFE TO DEFER | H12 sophisticated global admission, broader auth/IP throttles | Strong invitations, existing email/second-factor throttles, signup disabled, finite invite count and account quotas. Revisit before unrestricted signup or increased scale. |
| SAFE TO DEFER | H13 Anthropic parity | Initial release restricted to the tested OpenAI-compatible contract (Groq/OpenAI); do not select Anthropic. Real model availability still needs verification. |
| SAFE TO DEFER | B3 enterprise recovery/operations certification | Physical off-host restore rehearsal, advanced alert/scheduler automation and exhaustive operational certification are not pilot launch gates. Basic persistence, a backup before upgrading real data, and an operator remain necessary. |
| SAFE TO DEFER | T1–T3, T5–T6 and wider evaluation/mobile preparation | Documentation consolidation, naming/lint organization, typed SDKs, scale metrics/queues and broader quality/device matrices tracked in debt. |

Detailed priorities and revisit conditions are in
[post-MVP technical debt](post-mvp-technical-debt.md).

## Focused verification

| Check | Result |
|---|---|
| Backend host suite / lint | 558 passed, 4 optional dependency skips; lint passed |
| Built production backend suite | **562 passed, zero skips**; exact 51-package runtime lock verified |
| Frontend portable checks | API, stream, links, new privacy check all passed |
| Frontend typecheck / production build | Passed |
| Frontend lint | 21 warnings, zero errors (unchanged debt) |
| Dependency release gate | Passed: zero runtime advisories; seven build-only findings under exact known exception |
| Updated Compose build/start | Passed with PostgreSQL and Caddy; one worker; dummy local configuration |
| Targeted HTTPS browser regression | **8 checks passed**, Chrome for Testing 153.0.8010.12; secure cookie, reloadable scoped draft, document ready/retrieval context, saved conversation, expired-session cleanup, account separation, 390px overflow check, secret redaction and persistent account data; no page errors |
| Private production preflight | Expected failure: deploy/.env missing; synthetic valid/invalid configurations were separately checked, without printing values |

[Focused logs](remediation/evidence/mvp/) and
[browser report](remediation/mvp-browser-2026-10-04.json). Initial regression
failures are retained as failures, not represented as green. The browser probe
initially used the intentionally unavailable production synchronous chat route;
it was corrected to the actual SSE route and completion contract. Its successful
run proves transport/context behavior with the scripted provider, not answer
quality with a real model. Earlier 23-check journey, history secret scan,
PostgreSQL migration, ingress, accessibility, encrypted restore and rollback
results are reused rather than rerun without cause.

## Deployment preparation and required inputs

Execution works from `/Users/malekmahmoud/code/FareeqAi`; the chat's old checkout
path was stale. Use backend/.venv, frontend npm ci and the documented dependency
locks. Start Docker Desktop; its CLI is under
`/Applications/Docker.app/Contents/Resources/bin` on this Mac. Portable frontend
checks run with `npm test`. Browser probes need Playwright and its installed
Chromium; system Chrome previously failed to launch. Build requires registry,
package/font network access. No external mail service is required. Production
uses the existing PostgreSQL/backend/frontend/Caddy Compose architecture.

Production host/domain were never chosen in the existing deployment document.
Current backend/.env is development/mock with no provider key; deploy/.env is
absent. No production SSH target/access configuration was found. The user was
asked for host/domain and **file/secret-store references**, not secret values.
Nothing was invented, purchased or deployed to an arbitrary target.

Once supplied, on the target host:

1. Inspect the existing stack/volumes and capacity. Preserve existing DB_PASSWORD,
   AUTH_SECRET and account keys. If upgrading real data, take and verify a backup
   before migration. Never run rehearsal cleanup or down -v on production.
2. Store deploy/.env privately (0600, ignored), with actual domain/provider/model
   and keys. Set SIGNUP_ENABLED/PUSH_ENABLED/VOICE_ENABLED/TTS_ENABLED/TEAM_ENABLED
   false. Retain quota defaults and one backend worker. Set the provider's spend
   limit or establish its free-tier cap. Do not print rendered Compose env/secrets.
3. Run `backend/.venv/bin/python deploy/check-mvp-config.py`. A pass is structural
   only, not a live credential/DNS assertion. Check real provider credentials,
   global model and writing agent's override `qwen/qwen3.8-27b`; if that model is
   unavailable, make the smallest verified configuration fix before launch.
4. Build both release images from this reviewed working tree, start PostgreSQL,
   and migrate the new image to Alembic head (currently 0012) with no concurrent
   migrations. Provision initial invitation accounts privately using the existing
   `backend/provision_user.py` bootstrap procedure; merge only hashes into the
   private environment. Keep bootstrap containers unpublished and remove them.
5. Point real DNS to the host and open only intended HTTPS/HTTP ingress. Bring up
   backend/frontend/Caddy using deploy/compose.yml. Confirm trusted public TLS,
   matching HTTPS FRONTEND_URL, protected API, persistent PostgreSQL/certificate
   volumes, readiness and bounded logs/resource usage. Record image identities.
6. Execute the production smoke below; stop at successful deployment and smoke.
   Operator ownership, finite invite count and a first real backup must be set.

For N enabled accounts, the configured daily envelope is N × 60000 budgeted
tokens across tracked AI calls. This is not a currency guarantee; confirm actual
pricing/free quota and model reasoning behavior with the selected provider.
Reply/context sizes are already bounded; optional additional-call features are
off. No elaborate global spend service is introduced for the MVP.

## Required production smoke (pending real target)

Record actual domain, deployed image identities, migration revision and sanitized
outcomes. Use disposable smoke accounts; send no real personal data.

- Authentication: invitation/password login as configured, optional 2FA/recovery,
  logout and expired session; secure HttpOnly SameSite cookies; protected routes
  reject anonymous requests; invalid credentials never echo submitted secrets.
- Core agents: send an actual real-provider prompt, observe progressive SSE,
  usable complete reply, error/rate-limit behavior and reload persistence. Check
  both the global model and configured writing override; verify provider quotas.
- Documents: upload a small supported document, see ready state, ask a known
  question from it and inspect retrieval/citation plus sensible real AI response.
  Unsupported/oversized file rejection must work; keep destructive tests bounded.
- Account separation: account B cannot retrieve A's conversation, memory or
  document; shared-browser A draft never appears after logout/expiry/login B.
- Persistence and basic UI: health/readiness, desktop and phone-width core flow,
  no browser/CSP errors; controlled application restart preserves conversation
  and documents. Verify initial backup and keep the launch account count finite.

These checks have not been run against a public target. CONDITIONAL GO authorizes
the prepared limited MVP deployment once inputs are available; it does not claim
a launched service or invite users before the live checks pass.
