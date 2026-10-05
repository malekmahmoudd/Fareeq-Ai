# Free-only MVP deployment — 5 October 2026

User constraint: frontend/backend hosting must use free tiers only. No credit
card for hosting or domain registration; use included provider HTTPS subdomains.
No paid VPS, purchased domain, paid trial requiring a card, automatic upgrade or
paid overage is authorized. Do not add a payment method. If a provider's actual
onboarding requires one, stop using that candidate and select another free option.
This supersedes the paid-host/custom-domain assumptions in earlier runbooks.

## Working candidate, not a verified deployment

- Frontend: Netlify Free; included `<project>.netlify.app` URL, supports Next.js.
  Free plan permits commercial projects and has hard monthly limits. Current
  credit-based Free plan has 300 credits/month; exhaustion pauses projects.
- Backend: Render Free web service, running the existing FastAPI app. Included
  `<service>.onrender.com` URL. Accounts without a payment method have services
  suspended rather than billed when applicable allowances are exhausted. Idle
  services sleep after 15 minutes and can take about a minute to wake.
- Database: Neon Free PostgreSQL. No credit card required to sign up. Use an SSL
  connection from the backend, preserving application data outside ephemeral
  backend filesystems. Check current project limits in the actual console.

Sources checked 5 October 2026:

- [Netlify Free/no-card and commercial use](https://www.netlify.com/blog/introducing-netlify-free-plan/)
- [Current Netlify pricing and hard limits](https://www.netlify.com/pricing/)
- [Default Netlify subdomain](https://docs.netlify.com/manage/projects/how-projects-work/)
- [Next.js support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Render Free limits and no-payment-method behavior](https://render.com/docs/free)
- [Render default URL and free onboarding](https://render.com/docs/your-first-deploy)
- [Neon Free/no-card signup](https://neon.com/variable-load)

## Required compatibility verification

The existing single-host Compose deployment is not directly deployable on these
managed free services. Keep application/framework architecture; make only the
necessary deployment configuration changes once accounts/access are available.

Use the frontend's existing same-origin `/api` proxy with BACKEND_URL set to the
real backend HTTPS URL. Set backend FRONTEND_URL to the actual frontend HTTPS
origin, retain authentication and Secure HttpOnly cookies, and use private Neon
DATABASE_URL. Verify forwarded cookies, Origin, nonce CSP, SSE streaming and
platform request duration with a real preview before claiming this combination
works. Backend wake-up can exceed proxy deadlines; test first and returning
visits, not only a warm server. Preserve ingress limits on the backend when Caddy
is no longer its public edge. No cross-origin credential weakening is approved.

Backend local files cannot hold persistent SQLite/uploads. Document extracted
text currently lives in PostgreSQL; interrupted in-memory ingestion remains
tracked debt. Do not promise always-on scheduled/background processing on a
sleeping free service. Test host memory/parser/model limits and retain one worker.

Do not use Render Free PostgreSQL as the lasting database: it expires after 30
days. Vercel Hobby is not the default candidate for a product MVP because it is
restricted to personal, non-commercial use. Koyeb's current pricing FAQ requires
a card, so it does not meet this constraint.

Deployment and live provider smoke remain NOT ATTEMPTED. Needed inputs now are
access to suitable free accounts (or user-led signup/login) and private references
to provider credentials; purchasing a domain or provisioning a paid host is no
longer a prerequisite. AI API pricing is separate from hosting; no paid AI usage
is newly authorized by this constraint.

## Configuration progress

The user supplied deploy/.env locally. Confirmed Git ignores it and it is not
tracked; restricted permissions to 0600. Initial contents were development mode,
local SQLite and localhost frontend, with no authentication secret. Generated a
private signing secret, enabled production authentication/debug-off and disabled
signup/push/voice/TTS/team while retaining 6/minute and 60000 tokens/day. Existing
provider credentials were preserved; development files were not changed.

A read-only Groq model-list call authenticated successfully (HTTP 200). Both the
configured global model and writing-agent override were listed. No completion,
paid inference, provider-plan entitlement or production quality claim is made.
Render workspace “My Workspace” was confirmed by the user and contains no listed
services. The user already has Neon/Netlify accounts; opened their login pages for
user sign-in. No hosting resources were created or production data migrated.

The preflight now supports `--target managed` for hosted PostgreSQL with TLS and
the actual HTTPS frontend origin, without requiring a purchased domain or Compose
DB_PASSWORD. The original Compose mode remains available. Eight synthetic config
cases passed (valid managed/Compose; reject SQLite, no DB TLS, localhost, debug,
missing signing secret and open signup), with no credential echo. The actual
private file correctly remains blocked on real database/frontend addresses.

## Hosted database created and verified

With explicit confirmation, created a separate `fareeqai` Neon project on the
existing Free plan in Frankfurt: project `falling-unit-41907619`, production
branch `br-round-darkness-b23gjcvl`. Existing `Serenity` was not changed. The new
console default is PostgreSQL 18; actual connectivity passed, the database was
confirmed empty before migration, and Alembic upgraded it to 0012 (23 public
base tables). Stored its real TLS connection only in ignored deploy/.env, and
hid the console password display. No production application traffic/data existed.
Netlify Free/no saved card was verified from its billing page.

Prepared root `render.yaml` with one Free Docker backend (same tested Dockerfile,
OCR/embedding assets and one worker), external Neon DB, private environment
references and deployment branch. Prepared `netlify.toml` for the existing Next
frontend. No Render-hosted expiring database or paid disk is requested.

Netlify standard proxy rewrites have a 26-second timeout. Added a narrow `/api/*`
edge proxy: fixed configured HTTPS upstream, forward Origin/cookies without
weakening backend CSRF, preserve Secure Set-Cookie, pass through SSE bodies,
no-store API responses, bounded 35-second response-header wait and generic 503
retry notice on a sleeping/unavailable backend. The header deadline is removed
once streaming starts; browser cancellation reaches the upstream. Edge response
headers must arrive within 40 seconds; a sleeping Render backend can require
retrying after it wakes. This is an acknowledged free-tier limitation, not an
always-on guarantee.

Focused proxy checks pass for origin/cookies, untrusted forward-header stripping,
fixed upstream, incremental stream delivery, secure cookies, cancellation,
header-only deadline and sanitized error/config failure. Frontend now has five
portable checks; all pass, typecheck/build pass, lint remains 21 warnings/0 errors.
TOML/YAML syntax checked and only a Free backend is declared. Live hosting adapter,
cold-start and real-provider smoke are still pending.

Sources:
- [Netlify proxy timeout](https://www.netlify.com/knowledge-base/how-to-configure-redirects-headers-and-env-vars-in-netlifyto/)
- [Edge header/CPU limits](https://docs.netlify.com/build/edge-functions/limits/)
- [Edge streaming example](https://edge-functions-examples.netlify.app/example/long-running)
- [Runtime environment variables](https://docs.netlify.com/build/edge-functions/environment-variables/)

GitHub CLI/local Git push has no credentials on this machine. The connected GitHub
plugin is available for publishing the reviewed release source; environment files
and actual credential values must never be part of that commit. Netlify GitHub
import did not open its authorization popup in the in-app browser; user was asked
to connect only `malekmahmoudd/Modeer-Ai`. Backend/frontend are not deployed yet.
