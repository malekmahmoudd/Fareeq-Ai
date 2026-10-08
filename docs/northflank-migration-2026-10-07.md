# Northflank migration rehearsal — 7 October 2026

Status: service form prepared; public traffic still routes to Blitz. User approved transmitting the existing Neon connection, app signing secret and Groq key to Northflank and deploying on Free. Runtime variables entered, but no service has been created. Card verification remains pending. No database replacement or deletion has been performed.

## Selected configuration

- Team: malekmahmoud’s team, Free / Developer Sandbox, verified in UI.
- Project: Default, Northflank Cloud, Europe West / London. Frankfurt is unavailable on Free.
- Service: fareeqai-api, combined Git build and deployment.
- Repository: malekmahmoudd/Fareeq-Ai.
- Branch: hardening/quality-auth-deploy; current remote head d5a45caa1523f289f27f9a55d441180a789314ea.
- Build engine: BuildKit; Dockerfile /backend/Dockerfile; build context /backend. Check the form’s absolute path explanation before creation.
- Runtime: existing image ENTRYPOINT/CMD, listens on 0.0.0.0:8000 after migrations.
- One instance; included nf-compute-20 allocation (0.2 shared CPU, 512 MB), verified available on Free; no paid upgrade, BYOC or persistent volume. Confirm the resource cost in the final form.
- Port: 8000, public HTTP with managed HTTPS.
- Readiness: HTTP /api/health/detail on port 8000, subject to the provider’s actual supported readiness settings.
- Runtime configuration: validated ignored deploy/.env, after specific authorization to send credentials to Northflank. Do not inject credentials as Docker build arguments or publish them in source. Preserve the signing secret and Neon database; do not create a replacement database.

## Pending checks before cutover

1. User completed the GitHub integration permission review scoped to this repository. Card verification on the Free plan remains pending. CI is disabled for this initial deployment.
2. Included 512 MB allocation selected. Measure startup and chat/OCR memory; do not silently disable existing features or upgrade to paid compute to pass.
3. Create service only after validating branch, Docker context, Free plan, one instance, health check and runtime configuration.
4. Read build/startup logs; verify public health and database checks, real AI streaming, document processing and persistence.
5. Record actual generated backend hostname and show it to the user before changing public routing, as previously requested. Keep fareeqai.pages.dev unchanged.
6. Update only the Pages backend upstream and necessary provider-specific wake handling. Run the existing Pages proxy regression suite. Build a package containing only _worker.js and index.html.
7. Deploy the Pages package; verify guest bootstrap, existing authentication cookies, optional signup, chat streaming, upload/OCR and saved work through the public origin.
8. Observe availability after ordinary inactivity; measure wake if any occurs. The advertised always-on behavior is provider documentation, not an actual availability guarantee.
9. Retire the old Blitz app only after successful cutover. Keep the Neon database and backups. An explicit permanent-deletion review is needed at the browser action, even though replacement/removal is within the requested scope.

## Verification to date

Private managed/public configuration validator passed. Public configuration regression suite: 10 cases passed. All 28 runtime keys and values in the service form were compared privately with the intended configuration and matched. MOBILE_ENABLED remains false. The temporary credential transfer file was removed and the browser clipboard cleared. No deployment validation has passed yet.

During form inspection, an incorrectly redacted diagnostic printed a database connection credential into the tool transcript. Subsequent verification reports only counts, matching status and key names; no credential values are copied into repository documentation. This transcript should be treated as sensitive.

## References

- https://northflank.com/pricing
- https://northflank.com/docs/v1/application/billing/pricing-on-northflank
- https://northflank.com/docs/v1/application/build/build-with-a-dockerfile
- https://www.koyeb.com/blog/koyeb-is-joining-mistral-ai-to-build-the-future-of-ai-infrastructure
