# Public release verification — 6 October 2026

Public address: https://fareeqai.pages.dev. This is a public technical showcase with optional sign-in. All selected hosting remains on Free plans, without a card or a purchased domain. This report supersedes the earlier invite-only launch assumptions; it is not an availability or enterprise recovery certification.

## Current deployment

- Cloudflare Pages `fareeqai`: delivery proxy to the existing Netlify Next.js frontend; API requests go to Blitz, with API cookies excluded from Netlify requests. No secrets are in the Pages worker.
- Netlify published frontend: wake-path correction `c585e4505ef0e525fbe2ef32ff76219aa94f7408`, deploy `6ac418ede6423000084af851`. Backend-only commits are correctly skipped by its build filter.
- Blitz backend: final retrieval correction `ded758872b279d8476e18c811b75ceda125fd13a`, shown live at 00:10 Cairo; startup guest cleanup verified against Neon.
- Neon PostgreSQL remains the persistent database. AUTH_REQUIRED=true, GUEST_ENABLED=true, SIGNUP_ENABLED=true. One backend worker; push, voice, TTS and team mode remain disabled.

## Failures found and fixes

1. The pinned local semantic model did not fit the backend's 512 MB ceiling. An isolated Docker run with that exact memory limit exited 137 while loading it. Live upload requests stalled and the server restarted. DOCUMENT_SEMANTIC_SEARCH=false now selects the existing keyword retrieval mode explicitly. Model loading is moved off the event loop, and document ingestion is serialized within the single worker. Local bounded text/image/scanned-PDF parsing peaked near 91 MB; all three subsequently processed live. Semantic paraphrase/multilingual matching is not promised on this deployment.
2. Upload bytes are not durably retained. A restart during processing cannot safely replay an upload. Startup now marks interrupted processing as failed with a clear request to upload again, instead of leaving it processing forever. A previously interrupted synthetic upload was verified to show that error live.
3. A generic question about several uploaded files previously expanded only the top short document. Shared boilerplate caused a text note to suppress the scanned file containing the answer. The live agent correctly refused to invent the missing answer. Retrieval now keeps ranked passages for generic multi-file questions, within the existing hit/context budgets. A regression uses the same three-file corpus that failed live.
4. Guest expiry previously ended access without deleting stored work. Startup and the hourly sweeper now erase expired guest workspaces, with the same account lock used by signup and a live-session recheck. Recent guests and promoted accounts are protected. Sleeping defers cleanup until startup; the privacy notice and guest Account screen state this.
5. The deployment preflight still required SIGNUP_ENABLED=false after guest/signup approval. An explicit --audience public profile now requires guest access, optional signup, authentication and the approved shared/admission quotas. The actual ignored managed configuration passed; ten synthetic pass/refusal/redaction cases passed. The invited profile remains available explicitly.
6. Free backend sleeping requires an actual browser visit to wake. Hosting gate HTML is normalized into a safe API error by Pages. Page requests, chat streams, uploads and optional authentication share the wake signal and navigate the visitor once to a fixed backend /wake page, then return to the same safe local route. Unsent chat text is retained in its account-scoped draft; incognito text and credentials are not persisted. Unsafe cross-origin, JavaScript and double-slash return states are refused. The redirect is bounded and does not replay a message/upload or carry credentials in its URL. No uptime traffic is used to keep the free host awake. Natural-idle visitor recovery passed on 6 October; see the live evidence below.

## Automated verification

- Backend: 569 passed, 4 skipped; lint passed. Skips retain the prior environment-dependent cases.
- Frontend: typecheck, portable tests and production build passed for the published frontend. Lint: 19 warnings, zero errors.
- Dependency gate passed: zero runtime advisories; seven known build-chain findings remain under the exact recorded braces advisory exception.
- Pages proxy tests passed: fixed upstreams, credential isolation, origin preservation, cookie/stream passthrough, preview refusal, startup gate normalization and error redaction.
- Added checks cover expired guest deletion/promotion protection, serialized ingestion, disabled semantic-model loading, interrupted upload status, fixed wake destination bounded browser navigation, safe return paths, no stream/upload/auth replay, scoped draft recovery and multi-file retrieval.

## Live verification

- The user confirmed from their actual phone/mobile data: “It opens and replies without login.”
- Browser at 390 × 844: page width and scroll width both 390; optional sign-in links and guest workspace visible.
- Synthetic TXT: ready, 273 extracted characters. PNG OCR and scanned-PDF OCR: ready, 163 extracted characters each. All correctly report searchable_by_meaning=false.
- Corrected live text and scanned-file answers returned 2468 and 7319. Their citation labels resolved through the source endpoint to verification.txt and verification-scan.pdf passages containing those exact values. An initial test expected ASCII brackets and a literal filename; the model used 【D1】 and the UI maps labels to separate source buttons. The check was corrected to verify the actual source relationship, not a specific bracket style.
- All ten configured agents returned completed live Groq streams and saved replies: modeer, study, career, research, writing, travel, shopping, finance, fitness, email.
- Startup cleanup verified live: the newly created, artificially expired synthetic guest, its goal and device sessions were removed. The active verification guest and all three ready documents were preserved. At 00:16 Cairo, Blitz recorded the controlled manual restart. After it completed, the same cookie restored the same guest identity, all three ready extracted documents, both completed conversations, and their exact source passages.
- The first encrypted live Neon snapshot was restored into a fresh local PostgreSQL 18 container with no network or published ports. Schema revision and user/document/conversation/message counts were read back. The temporary restore container was removed; production was unchanged. Archive and generated restore key stay outside Git in a 0700 directory, with files 0600. See remediation/evidence/public-release/managed-restore-2026-10-06.json. This proves this snapshot can be restored locally, not scheduled backup retention or recovery-time guarantees.
- Natural sleep and visitor wake passed on 6 October around 12:50–12:54 Cairo. Before opening the browser, a Pages API probe returned 503 JSON with X-Fareeq-Wake: 1. Visiting /account automatically navigated to the Blitz /wake startup page, then returned through Pages to /account without login. The prior REST/GraphQL conversation remained visible in the same guest workspace. A fresh pull-request-review question received a completed reply, and that reply remained after a reload. The account page was verified within approximately 68 seconds of the initial test timestamp; this includes observation/tool time and is not a precise startup benchmark. Screenshot: ../docs/remediation/cold-wake-verified-2026-10-06.png.

Application probes use synthetic verification data. The encrypted database backup necessarily contains the live snapshot and stays private outside Git. Temporary CLI cookie jars were no longer available after the overnight interval; no account deletion was attempted without their ownership evidence. The synthetic guest fixtures follow the verified automatic expiry policy. The browser guest workspace was preserved. Production secrets and user content are never included in this report.

## Free usage bounds

The app shares a 100,000-token daily AI budget across guest and registered accounts. Each account is limited to 60,000 budgeted tokens/day and six requests/minute. New guests are capped at ten per address/hour and 200/day across the deployment. Estimates are reserved atomically before provider calls; these are not unlimited-use promises.

The live shared daily ledger held 44004 charged tokens after the checks, below the 100000-token cap. Saved reply metadata confirmed nine agents on openai/gpt-oss-120b and writing on qwen/qwen3.8-27b, all through Groq.

Both configured Groq models were found in the provider model listing and accepted real calls. The observed response headers reported an 8,000-token/minute and 1,000-request/day provider limit. Provider limits and app estimates can still cause a temporary quota refusal. References: https://console.groq.com/docs/rate-limits and https://console.groq.com/docs/models. Exact account daily-token settings were not independently exposed in the response headers.

## Reliable local validation

Canonical checkout: /Users/malekmahmoud/code/FareeqAi, Git remote malekmahmoudd/Fareeq-Ai, deployment branch hardening/quality-auth-deploy. The ambient older Fareeq-Modeer-Ai path is not the active checkout. Moving the repository left 30 virtual-environment launchers/activation scripts pointing at the old location; those local paths were corrected and the pytest launcher verified. Recreating the virtual environment from pinned requirements is the reproducible setup for another machine. Running `.venv/bin/python -m pytest` also avoids launcher-path ambiguity. Secrets remain in ignored deploy/.env, mode 0600. Managed public preflight: `backend/.venv/bin/python deploy/check-mvp-config.py --target managed --audience public`. Its synthetic regression: `backend/.venv/bin/python deploy/tests/public-config-check.py`. The preflight checks structure and bounds; the live evidence above establishes actual runtime behavior.

## Operational limits

Free host sleep introduces startup delay; provider and hosting quotas remain finite. The system uses one worker and request-background document work rather than a durable queue. Semantic retrieval is disabled on this memory tier. Large concurrent public traffic, multiple workers, durable upload retries, comprehensive monitoring and recurring protected backups/retention remain documented follow-up work. The one real database snapshot restore above is separate from the service restart rehearsal.

Provider deployment behavior references: [Blitz GitHub deployments](https://blitz.cloud/docs/deploy-from-github/) documents [skip blitz] for frontend-only commits and [skip ci] for documentation-only updates. [Free host sleeping](https://blitz.cloud/faq/) states a 30-minute visitor inactivity threshold and that program requests do not wake the service. The live cold test above is the completion evidence.

## Announcement decision

The recorded checks support announcing this deployment as a public technical showcase with optional login. No launch blocker remains in this verification scope. Free-host startup delays and bounded daily AI usage should be communicated; this does not certify high-traffic availability or enterprise operations. Recurring backup scheduling and monitoring remain follow-up operational work.
