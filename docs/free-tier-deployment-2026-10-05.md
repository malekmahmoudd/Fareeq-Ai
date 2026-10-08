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

## Source publication and frontend deployment started

Verified GitHub repository ID 1362911923 is identical for the former Modeer-Ai
URL and the canonical malekmahmoudd/Fareeq-Ai URL. Updated the local origin to
the canonical URL. Published 84 reviewed source/evidence files on the existing
hardening/quality-auth-deploy branch, commit
e4a4a539d6488062d3b40ae20a2a824c048a6c5f. No force push or main merge; private
environment files and screenshots were excluded. Two build evidence files were
removed locally by the user after the publication snapshot; application sources
match the published branch. Preserved the user's local deletions.

After explicit confirmation, created Netlify project fareeqai-malek in Mind
Masters (Free), base frontend, command npm run build, publish .next. Initial
build started (deploy 6ac3d1515e5acd9936f37a8f). Project remains private by
default pending build and release checks; no claim of successful live deployment.
Backend URL has not yet been configured.

Render Blueprint setup requested a payment card despite the Free-only manifest.
Dismissed without entering payment information. Inspecting direct public Git
repository web-service setup as a card-free alternative; no backend created yet.

Netlify initial deployment completed successfully in 35 seconds, published
commit e4a4a53, with the Next.js adapter, one API edge function and one header
rule confirmed by the deploy summary. Dashboard project access remains private
by default. This is a successful hosting build, not yet a working release:
BACKEND_URL, Render deployment and end-to-end checks remain pending.

The direct Render form offers Free compute ($0/month, 0.1 CPU, 512 MB), now
selected, Docker root backend/, Dockerfile, build context ., Frankfurt and
/api/health/detail readiness. Auto-Deploy Off selected. No service created and
no secret transmitted while waiting for explicit browser-policy confirmation
for private DB/signing/provider credentials to My Workspace and deployment.
Actual ignored deploy/.env now has the Netlify HTTPS origin and managed MVP
configuration validation passes.

## Card verification blocker and requested frontend rename

After user approval, imported the 21 manifest production variables into Render's
My Workspace web-service form, including the Neon connection, signing secret and
Groq key. Values were not printed; the temporary import file was removed.
Clicked Deploy with Free explicitly selected ($0/month). Render nevertheless
requested a card verification and temporary $1 authorization. Dismissed it; no
card supplied. Connector service listing still returns no services. Therefore
backend deployment is blocked, no backend domain exists and no live API smoke
is possible. This is an account verification restriction, not permission to
upgrade or bypass the platform. Render acknowledges some accounts are asked
for verification even on Free:
https://community.render.com/t/the-deployement-of-a-web-service-fails/36005

At the user's request, renamed the existing Netlify project from fareeqai-malek
to fareeqai (same site ID 86507677-4cfe-4f3a-8eff-c42dfca70d07). Name availability
was confirmed and the overview now shows https://fareeqai.netlify.app. Project
remains Private. Updated ignored deploy/.env FRONTEND_URL accordingly. The
unsubmitted Render form must use this new origin before any later deploy.

Checked alternatives using official current sources: new Hugging Face Docker
Spaces require a paid plan; Northflank requires a payment method regardless of
plan. Neither is a compliant no-card fallback under the current constraints.
https://huggingface.co/docs/hub/main/en/spaces-overview
https://northflank.com/docs/v1/application/billing/pricing-on-northflank

## No-card replacement search (Railway explicitly excluded)

User reiterated that no card entry or verification is permitted and excluded
Railway because its free allowance is exhausted. Render is no longer a deploy
target. Do not retry card flows or reclassify a verification charge as acceptable.

Strongest current candidate found: blitz.cloud. Provider documentation explicitly
states Free is 0 EUR, no card, no time limit, with public GitHub or amd64 Docker
builds, HTTPS provider subdomains and encrypted per-app runtime variables.
Backend Dockerfile uses a non-root user and declares port 8000; 21 variables
fit the 64-variable limit. Reuse external Neon and existing Netlify frontend.
Advanced GitHub settings must select hardening/quality-auth-deploy, backend
build context and backend/Dockerfile; never let it auto-generate a recipe.

Critical unresolved fit: most recent limits page says a Free app sleeps after
30 minutes and only browser visits wake it; API clients do not. Earlier indexed
guides still say two hours. Use the current limits page. Netlify's API proxy is
a server request, so successful browser-to-proxy-to-backend wake must be proved
before this becomes a release recommendation. Do not spoof traffic or add
keepalive monitors to bypass the provider's restrictions. Container memory
ceiling is 512 MB, so verify OCR/document-search peak memory too. No credentials
were transferred and no app/account was created. Login page opened for user
account setup/sign-in, which remains necessary for actual deployment tests.

Sources checked 2026-10-05:
- https://blitz.cloud/ (Free, no card, no time limit)
- https://blitz.cloud/docs/limits/ (current sleep, memory, quotas)
- https://blitz.cloud/docs/deploy-from-github/ (branch, custom Dockerfile, monorepo)
- https://blitz.cloud/docs/settings-and-files/ (encrypted runtime variables)

Other checks: Koyeb pricing FAQ requires a card; Back4app's latest engineering
article says new Free container URLs expire after 60 minutes, so it is rejected
for ongoing MVP hosting. Leapcell has a Hobby serverless plan but no verified
card-free signup/custom-Docker compatibility yet, and requires review of
autoscaling/authentication state and streaming before selection.
- https://www.koyeb.com/docs/faqs/pricing
- https://www.back4app.com/blog/deploy-node-app-dockerfile-back4app
- https://www.leapcell.io/pricing

## blitz.cloud setup prepared

User signed in and completed account onboarding; dashboard confirms Free plan
and address malekmahmoud.blitz.cloud. Prepared FareeqAI API from the public
Fareeq-Ai repository, branch hardening/quality-auth-deploy, folder backend,
existing Dockerfile (default CMD and EXPOSE 8000), only the API service.
Disabled platform database creation; final review confirms Database: None.
Proposed URL: fareeqai-api.malekmahmoud.blitz.cloud. Supplied only the public
FRONTEND_URL https://fareeqai.netlify.app. The wizard retains a database field
marked automatic despite no platform database; real DATABASE_URL must be
overridden with the approved private Neon connection at import.

No application created or secret transmitted yet. Explicit confirmation is
pending for private DB/signing/provider credentials to this new destination
and public backend deployment. Provider default auto-deploy follows every
push; turn that off after creation if Settings supports it. Sleep/wake through
Netlify, authentication cookies, SSE, document processing and memory must pass
actual tests before releasing the private frontend.

## Backend creation and frontend connection

After explicit confirmation, created blitz.cloud app
dda51339-6ed5-4ba9-8824-2f662e704328, FareeqAI API, Free plan, address
fareeqai-api.malekmahmoud.blitz.cloud. Build
37bee3a7-29d0-4eff-9261-3af8601fa995 uses commit e4a4a53, folder backend,
Dockerfile from the repository. Provider reported successful image build and
save, then service startup. Certificate issuance is separately pending (UI
states 5–15 minutes). No runtime success or live smoke claim yet.

Wizard anomaly reproduced: automatic DATABASE_URL cannot be overridden;
manual duplicate blocks Continue. Imported other 20 approved runtime variables,
removed the duplicate, then created. Despite final review Database None, the
provider created an additional PostgreSQL database. Immediately replaced the
app's DATABASE_URL via its Environment tab with the real ignored Neon URL and
verified exact equality in memory; hid it again. No credentials printed,
and the temporary import file was removed. Extra database has not been deleted.
Local Settings production validation does not reject SQLite by itself; the
earlier conversational statement that it would prevent all missing-database
startup was too broad. Actual correctness must be established through runtime
Neon readiness and database verification, not that assumption.

Netlify BACKEND_URL now points to the public blitz HTTPS origin, all scopes,
without placing any DB/signing/provider secrets on Netlify. Triggered a
rebuild using the same published source; deploy 6ac3d7115e5acdc35bf3797b.
Frontend remains Private until end-to-end and cold wake checks pass.


## Live deployment checkpoint

Blitz overview confirms Online, Free plan, commit e4a4a53. Standard certificate-
verified HTTPS GET /api/health/detail returns 200 with status ok, database ok,
and schema_current true. Actual Neon SQL confirms revision 0012 and 10 seeded
agents, demonstrating that the backend uses Neon despite the unwanted additional
platform database. TLS issuance is complete.

Live security smoke: /api/auth/status returns required=true, signup_enabled=false;
/api/auth/account returns 401 without a session; signup returns 404; invalid
credential validation returns 422 without input values; wrong-origin login
returns 403; a body over 1 MiB returns 413 before parsing. No real account or AI
completion was exercised by these checks.

Netlify deploy 6ac3d7115e5acdc35bf3797b is Published, including completed
post-processing, at source e4a4a53 with BACKEND_URL set to Blitz. Provider domain
management confirms fareeqai.netlify.app. Both local DNS and Google's public
resolver return 35.157.26.135 and 63.176.8.218, but TCP connections to port 443
of both time out from this machine. app.netlify.com remains reachable. The user
also reports a connection error. Netlify status reports all systems operational;
its Oct 5 incident was marked resolved. This does not rule out a regional issue.
Private visibility could route through an inaccessible access layer, but that
cause has not been established; normally Netlify documents an access/login page.

Prepared unsaved visibility change: keep Private for previews only, making
production public while application auth stays enforced. Explicit at-action
confirmation is pending because this widens public access. Screenshot:
remediation/netlify-public-production-review-2026-10-05.png. Live proofs:
remediation/blitz-live-2026-10-05.png and
remediation/netlify-connected-published-2026-10-05.png.

No launch/sign-off yet: actual frontend reachability, authenticated cookie/SSE/
provider/document checks, operator invitation and cold wake from the Netlify
proxy remain outstanding. Free Blitz sleeps after 30 minutes; API-client wake
limitations must be tested before it can be treated as a reliable frontend API.


## Public launch intent and visibility result

User clarified this will be announced to users as a public release. Limited-
pilot assumptions are not sufficient sign-off for that audience. Existing
enterprise-level deferred work remains deferred; concrete usability and public
onboarding gates still apply.

After explicit approval, saved Private visibility for previews only. Netlify
confirms Production Public and Deploy Preview Private. Screenshot:
remediation/netlify-public-production-2026-10-05.png. A fresh HTTPS connection
still times out before TLS; a fresh browser navigation also timed out. Making
production public did not resolve the current network symptom. No speculative
DNS/OS security change was made. Asked the user to test the public login page
on mobile data to distinguish a network route problem from deployment access.

Current production configuration disables signup and has no operator invitation
entries. Asked the user to select self-service accounts or individual invitations
for the announced release. This is an onboarding decision, not a claim that a
publicly deployed login page is sufficient for users to join. Actual authenticated
smoke tests, AI/document flows and cold wake remain required. Current launch
readiness is not signed off.


## Cloudflare Pages entry point preparation

User selected fareeqai.pages.dev, authorized setup, and signed into Cloudflare
account a6d9cd30f81ff75653cbf2c61caaf220. Cloudflare accepted project fareeqai
with that exact hostname; created the empty Direct Upload project and uploaded
only _worker.js/index.html. No production secrets transferred. Publication is
pending explicit at-action confirmation.

Current Next.js dynamically renders nonce-bearing pages and reads preference
cookies. Pages static export is not a compatible direct replacement. Prepared
an advanced-mode delivery proxy instead: frontend still runs on Netlify, API
requests go directly to Blitz, all requests are served to users through Pages.
The package is 1766 compressed bytes and contains no private credentials.
Local tests passed credential isolation, fixed upstream (including // paths),
API Origin/cookie/stream preservation, preview refusal, CSP preservation and
error redaction. This does not yet prove Cloudflare can reach the Netlify origin
or that live authentication/provider/document flows work.

Netlify regional diagnosis is an inference backed by matching support reports
(including the exact IPs and dashboard/site accessibility split), not proof of
which ISP/provider causes the interruption. User confirms both Wi-Fi and mobile
data fail. References and deployment limits are documented in
 deploy/cloudflare-pages/README.md.


## Pages publication and repaired frontend origin

After explicit confirmation, Cloudflare published fareeqai.pages.dev successfully.
The first live browser request reached Netlify but returned its 404 page. Netlify
build logs and deploy summary showed raw .next assets, no SSR function and only
the custom API edge function. This was a separate deployment defect from the
regional TCP timeouts. Added explicit @netlify/plugin-nextjs to netlify.toml;
published only that configuration fix on hardening/quality-auth-deploy, commit
542646ed6dad5a97bbf83d511c36ebc2409d210f. Netlify deploy
6ac3dcf198c4fd0008a763a7 is Published with 1 server function and 2 edge functions.
No application refactor or secret upload was needed.

Blitz FRONTEND_URL was saved/restarted to https://fareeqai.pages.dev; ignored
private deploy/.env matches it and remains mode 0600. Browser now renders the
FareeqAI login page on the selected Pages hostname. Standard curl over verified
HTTPS through Pages returns readiness 200 (database ok/schema_current true),
auth status 200 (required=true/signup_enabled=false), account 401, and synthetic
invalid-key login with Origin https://fareeqai.pages.dev returns 401 Invalid
access key, demonstrating that the new origin reaches application authentication
rather than failing CSRF origin validation. No session credential was printed.

Python urllib probes received Cloudflare 403/1010 while standard curl and the
browser worked; this difference is retained, not represented as a clean universal
client result. In-app browser direct JSON navigation was blocked by the client;
API checks used ordinary curl without browser impersonation or disabling any
security setting.

Proof: remediation/cloudflare-pages-published-2026-10-05.png and
remediation/fareeqai-pages-login-2026-10-05.png. Exact requested name was available;
no alternative domain was assigned. No card, domain purchase or paid upgrade.
This proves reachable frontend and warm API transport, not complete public launch
readiness. User onboarding decision, authenticated persistence/SSE/real provider/
document tests and cold wake verification remain outstanding.
