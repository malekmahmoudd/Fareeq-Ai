# DockHosting verification — 8 October 2026

Status: project `6ac79ba4eabedb8ebecf11a5` is Running at `https://fareeqai-api.dockhosting.dev`. The second build succeeded in 6m 59s after configuration was saved. Cloudflare Pages production now routes API traffic to DockHosting. The existing Neon database remains in use.

## Public cutover verification

- Published the reviewed two-file package to existing FareeqAI Pages Production. Cloudflare displayed Success and production revision `20c6a35b-b45b-4c15-922a-8ed1b77af346`. Previous production revision `94df1688-af27-46a1-89ac-6d3637baf78c` remains available for rollback; it routes to the previously unreliable Blitz backend.
- Public `/api/health/detail` returned database ok and schema_current true. `/api/auth/status` confirms guest access. Fresh guest bootstrap returned a Secure HttpOnly cookie.
- Synthetic markdown and PNG uploads through the public origin reached ready with one chunk each. A real SSE reply returned its first frame in 3.14 seconds and completed in 9.22 seconds; the conversation persisted. Synthetic documents and conversation were deleted (204).
- Browser opened the FareeqAI home page, with optional sign-in and the existing session's recent chats retained. No existing user records were modified by these checks.
- The default Python urllib user-agent was rejected with Cloudflare error 1010. A clearly identified `FareeqAI-Deployment-Verification/1.0` client and the real browser succeeded; no security setting was disabled.
- Idle wake measurement and broader load testing remain pending. Warm checks do not establish cold-start reliability. Blitz has not been deleted, and Northflank remains unprovisioned.

## Deployment attempt

- Billing UI confirms Current plan Free, Active, No monthly charge; no payments.
- Build logs confirm `backend/Dockerfile`, Python 3.12, backend Docker build context and commit `d5a45caa1523f289f27f9a55d441180a789314ea`, despite the Node.js dashboard badge.
- Initial failure: pip reports `Connection broken: BrokenPipeError(32, 'Broken pipe')` during locked dependency downloads. This occurs before migrations or application startup; missing environment variables did not cause this build error.
- Environment tab initially showed no variables. Following the user's reply to the specific transfer/deploy approval, 27 backend Settings keys from ignored `deploy/.env` were entered through the UI and saved. Other deployment-only fields were excluded. Ordinary fields match the source; password controls redact their observable values, so a complete value comparison is not claimed. Dashboard confirmed the save. The temporary private transfer file was removed.
- Retry succeeded. Public health returned HTTP 200 in 0.88 seconds with database ok and schema_current true.
- Fresh isolated guest bootstrap succeeded. Synthetic markdown and PNG uploads both reached ready with one chunk; the PNG exercises Tesseract OCR. A real AI SSE response completed in 3.49 seconds and its conversation persisted. Both probe documents and the probe conversation were deleted through their owner session (HTTP 204).
- Overview displays 0.5 vCPU and 256 MB for this project. The advertised 1 GB free ceiling is not the observed allocation. Basic probes passed at this allocation; broader load/headroom testing remains pending.
- Build logs indicate provider-added secret-named ARG declarations. No production credential values are copied into this document. A runtime-only environment option was not visible in this editor; further provider configuration review remains needed.
- Idle wake time remains unverified. Fast warm health does not establish cold-start performance.
- Pages worker backend target and its regression expectation point to DockHosting. Existing transport checks passed. Published `/tmp/fareeqai-pages-dockhosting.zip` contains only `_worker.js` and `index.html`, no secrets.

## Follow-up verification

The final wizard exposes Root directory, Start command and App port, including an explicit Dockerfile EXPOSE hint. The official deploying overview says an existing Dockerfile takes precedence over framework detection. Missing Docker/Python choices alone therefore do not establish that a Docker build is blocked; the previous conclusion was premature. Actual Docker build behavior remains unverified.

Prepared repository/branch as above, name `fareeqai-api` (proposed hostname `fareeqai-api.dockhosting.dev`), root `backend`, port `8000`, and the existing migration-plus-Uvicorn startup command. Selected no provider database; Neon remains the intended database via runtime configuration. Private managed/public configuration validator passed. Secrets have not been uploaded. The free plan is advertised in provider docs but actual resource allocation and build behavior still require verification before public cutover.

## Observed behavior

- The registration page now loads and advertises no credit card required.
- GitHub authorization requested `repo` and `read:user`, including public and private repositories. The user completed authorization and email verification themselves.
- Selected `malekmahmoudd/Fareeq-Ai`, branch `hardening/quality-auth-deploy` in the draft wizard.
- Runtime choices in both onboarding views: Node.js, NestJS, React, Vue, Static HTML, PHP, Laravel, Ruby. No Docker or Python choice is visible.
- Onboarding's Skip controls returned to onboarding instead of exposing the main dashboard.
- Official installer at `https://get.dockhosting.dev/install.sh` points to a macOS binary download. The downloaded macOS architecture-specific file is a 38-byte shell script containing only `echo DockHosting CLI v2.1.0`; it provides no deployment commands. It was inspected, not executed or installed.

## Documentation versus verification

Official docs advertise Docker/FastAPI, 1 GB per free app, and fast waking on an HTTP request. These capabilities have not been verified on this account. Do not transmit production credentials or cut over FareeqAI based on those claims alone.

- https://docs.dockhosting.dev/docs/pricing-and-billing
- https://docs.dockhosting.dev/docs/deploying/docker
- https://docs.dockhosting.dev/docs/cli

The current backend needs its existing Docker image with Python, OCR dependencies, PostgreSQL connectivity and streaming. Selecting an unrelated runtime to bypass the missing controls would not verify compatibility.
