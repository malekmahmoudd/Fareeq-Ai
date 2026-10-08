# Public wake delay investigation — 7 October 2026

The user reports repeated waits longer than three minutes on Blitz's waking page when opening fareeqai.pages.dev. They confirm the application becomes available afterwards. This is a public availability problem; the earlier successful single natural-idle rehearsal did not establish reliable cold-start performance.

## Evidence collected

- First Pages /api/health request: 200, 11.554 seconds total, database ok. This was not a controlled full cold-start measurement; the user's browser had already initiated wake.
- Subsequent Pages /api/health: 200, 0.306 seconds.
- Pages homepage: 200, 0.851 seconds.
- Direct Blitz /wake: 200, 0.258 seconds while already awake.
- Authenticated Blitz dashboard: online, no crashes since last startup. Activity records regular sleep/wake cycles and program requests rejected during sleep. Live Logs do not provide the historical startup output needed to attribute the earlier wait to Python, database readiness, image scheduling or platform provisioning.
- The platform also lists an automatically provisioned PostgreSQL 17 database linked to this app; the application's previously verified database is Neon. Whether platform database readiness adds delay is unverified. No database or linked service was deleted or changed.

## Conclusion and limitations

User observation places the delay inside the host wake/readiness path, before the backend responds. Warm service behavior is fast. The exact three-minute cause is not established by these measurements. No production restart, sleep defeat, paid setting or speculative application refactor was applied.

Blitz Free sleeps after visitor inactivity and program/API requests cannot wake it. The application cannot guarantee a short wake through frontend retries. Investigate alternative no-card free hosting with the existing container/API/Neon architecture; verify actual startup and browser/API behavior before migration. The current repeated wake delay remains unresolved and should be treated as a launch reliability concern.

Provider references: https://blitz.cloud/docs/limits/ and https://blitz.cloud/docs/app-status-and-logs/.

## Replacement screening

Two candidates were rejected against the no-card/no-paid-plan constraint. Current Hugging Face Spaces overview says Docker/Gradio compute creation requires a paid plan even though CPU Basic has no hourly compute charge. Current Northflank billing documentation says every plan requires a payment method to create resources. Neither is a verified eligible replacement. No new hosting account, resource, secret transfer or migration was attempted.

References: https://huggingface.co/docs/hub/spaces-overview and https://northflank.com/docs/v1/application/billing/pricing-on-northflank.

## Later incident — 7 October, approximately 17:58 Cairo

The user reports the public site has not become available since noon, independently of laptop power. Live Pages health returns HTTP 503 with X-Fareeq-Wake: 1. Direct backend health returns HTTP 503 with X-Blitz-Gate: starting and X-Blitz-Gate-Step: 4; the host HTML says FareeqAI API is starting, with Getting the new version and Starting the app complete and Connecting the address active. This identifies a host startup/readiness/routing gate, not a localhost dependency. It does not prove whether the process is listening or the platform's route registration is failing.

Authenticated browser controls are unavailable in this session. Dashboard Overview status and latest startup logs were requested from the user. No speculative code change, credential rotation, restart, paid upgrade or backend migration was made. Incident remains unresolved.

## Restart follow-up

The user performed one restart and reports that Logs still show no output and the startup loop continues. A subsequent direct health probe still returns HTTP 503, X-Blitz-Gate: starting, step 4 (Connecting the address), in 0.273 seconds. The restart has not demonstrably recovered service.

A read-only check from the developer computer reached Neon in 2.88 seconds: SELECT 1 succeeded and alembic_version was 0012. This confirms database availability from that computer, not connectivity from the Blitz container. No credentials were included in output.

The repository container binds Uvicorn to 0.0.0.0:8000 after running database migrations. The next diagnostic is to compare Blitz's configured Port with 8000. A port mismatch remains a hypothesis until the dashboard value is supplied; no application or hosting configuration was changed.

## Pause/resume follow-up

The user confirmed Blitz Settings Port is 8000, matching the repository startup command. This rules out the reported dashboard port mismatch hypothesis, although live container output remains unavailable. The user then confirmed completing Pause/Resume. Two subsequent direct probes about 30 seconds apart returned HTTP 503 with the same starting gate and step 4; the frontend homepage still returned HTTP 200. This does not establish whether the resumed container will eventually start. No application changes were made. The next useful evidence is the exact Overview status/explanation after resuming, or provider-side container/readiness logs. Provider troubleshooting recommends contacting hallo@blitzworks.io with the app address if still stuck.

## Replacement selection after updated authorization

The user now permits entering their own card details but still requires free hosting, and prioritizes a faster wake. Render was screened: Free sleeps after 15 minutes and documents approximately one minute to resume. The existing Render My Workspace connector is available and currently lists no services, but no service was created.

Koyeb is the leading candidate for a controlled rehearsal. Official docs list one Free instance per organization, 512 MB RAM, 0.1 vCPU and 2 GB SSD, in Frankfurt or Washington, sleeping after one hour. Scale-to-zero documentation gives 1–5 seconds to create the underlying VM in deep sleep; this is not a measured FareeqAI total startup time or a guarantee. CPU/import/migration/Neon connection time must be measured. HTTP/2 requests cannot wake a sleeping service per these docs; the Pages proxy transport and browser requests need an actual cold rehearsal before cutover.

Critical onboarding limitation: Koyeb documents a $29 temporary card authorization and says signup may select Pro and charge its prorated subscription immediately. The user was advised to stop at the plan/payment page for inspection, with no paid plan authorized. A free instance alone does not establish a free total account bill. No payment, new deployment, deletion, credential transfer or Pages routing change has been performed.

The supported browser runtime is now accessible via node_repl and the bundled browser client, unlike the earlier unavailable control mechanism. A Koyeb login/signup tab was opened. The user is completing email verification; no verification code or card details were collected by the agent.

Sources: https://render.com/docs/free ; https://www.koyeb.com/docs/reference/instances ; https://www.koyeb.com/docs/run-and-scale/scale-to-zero ; https://www.koyeb.com/docs/faqs/pricing .

## Corrected provider eligibility and Northflank preparation

Koyeb is rejected for this new account. After login, the actual UI shows only the Mistral transition announcement, account Settings and Logout, with no deployment controls. Its official acquisition announcement explicitly limits new accounts to paid plans: https://www.koyeb.com/blog/koyeb-is-joining-mistral-ai-to-build-the-future-of-ai-infrastructure . That current eligibility statement overrides the free-instance descriptions in its older/generic documentation. No card or subscription was submitted by the agent.

Northflank is now eligible to evaluate because the user permits their own card verification. Its current pricing advertises a free Developer Sandbox with always-on compute (no idle sleeping), two services, one addon and two jobs. The user signed in and created a team. Actual UI confirms Free Team, allows London / europe-west on the Free plan, and explicitly says this service will not be charged on Developer Sandbox. Frankfurt requires an upgrade, so London was selected. The initial default runtime resource is nf-compute-10, 0.1 shared CPU and 256 MB; this is below the previous 512 MB envelope and must be checked against backend/OCR peak memory before claiming equivalence.

A combined service form was prepared with the name fareeqai-api. GitHub integration was opened and scoped to only malekmahmoudd/Fareeq-Ai. The GitHub application requests read/write repository administration, code, checks, commit status, deployment, pull request and hook permissions and read email access. The user was asked to review and authorize this integration themselves. Card verification is also pending; no secrets have been sent to Northflank and no service has been created yet.

Existing ignored deploy/.env passed the managed/public configuration validator; the synthetic public configuration suite passed all 10 cases. Git remote branch hardening/quality-auth-deploy currently resolves to d5a45caa1523f289f27f9a55d441180a789314ea. Local uncommitted mobile/backend changes are not automatically included in the remote deployment.

Sources: https://northflank.com/pricing ; https://northflank.com/docs/v1/application/billing/pricing-on-northflank .
