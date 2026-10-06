# FareeqAI public free-host operation

The public address is https://fareeqai.pages.dev. Visitors get a separate guest workspace automatically. Sign-in and account creation are optional. Hosting is Cloudflare Pages + Netlify + Blitz + Neon on existing Free plans; no purchased domain or card is required by this selected setup.

Use the canonical checkout `/Users/malekmahmoud/code/FareeqAi`. Keep real configuration in ignored `deploy/.env` with permissions 0600; never commit or paste it into logs. Rebuild a fresh Python environment from the lock on another machine rather than moving virtual-environment launchers. Frontend dependencies use npm ci and its committed lock.

Before a configuration change, run `backend/.venv/bin/python deploy/check-mvp-config.py --target managed --audience public`. It validates structure and the approved bounds without printing values. It is not a connection test. The synthetic policy check is `backend/.venv/bin/python deploy/tests/public-config-check.py`.

Keep AUTH_REQUIRED=true, GUEST_ENABLED=true, SIGNUP_ENABLED=true. Keep the shared daily AI cap at or below 100000, guest admission at or below 200/day, each account at or below 60000 tokens/day and six requests/minute. Provider limits may refuse requests before the app's daily cap. Do not create extra sessions to bypass a quota.

DOCUMENT_SEMANTIC_SEARCH=false is intentional on the 512 MB backend. Upload/OCR and keyword retrieval are available; semantic matching is not. Ingestion is serialized. An interrupted upload is marked failed on startup with an instruction to upload again. Do not advertise durable accepted-file recovery.

Guest work is automatically erased after expiry by startup/hourly cleanup. A sleeping backend cannot sweep until it wakes. Promoted accounts are protected. Guests can delete their own work from Account; operators must not run synthetic rehearsal cleanup against real user identities.

The free backend sleeps after inactivity. A real visitor may see its startup page before returning to FareeqAI. Do not run a monitor or synthetic browser visits to defeat that sleep. API errors are generic and temporary; existing saved work remains in Neon. Page reads, chat sends, uploads and optional sign-in share the wake flow. It returns to the same local page, with ordinary account-scoped chat drafts retained. A message, upload or credential submission is not automatically replayed after the redirect; incognito text is not persisted.

Blitz batches pushes at most every five minutes, and its UI can show a deployment before HTTP behavior changes. Check the published revision and the actual API behavior. Netlify correctly skips backend-only commits. Pages is a delivery proxy, so the Netlify frontend origin remains a required service. Routine documentation-only commits should use [skip ci] [skip blitz] to avoid unnecessary application builds.

See `public-release-verification-2026-10-06.md` for the latest actual evidence and `post-mvp-technical-debt.md` for remaining operational work. Restart persistence does not prove a database restore; take a protected database backup before migrations and never delete/reset the production database to rehearse recovery.

A first encrypted live snapshot has been restored locally. Repeat managed backups with `backend/.venv/bin/python deploy/managed-backup-check.py --env-file deploy/.env --output /absolute/private/new-backup-directory --image postgres:18-alpine@sha256:77f585114c32fbca283dc835b0596f4e52b51b4c6662d7810b2f4084f60a1873`. Use a new directory each time. Keep the generated restore key protected separately from any shared archive, and never publish it. The helper refuses to overwrite an existing snapshot/key, encrypts without a plaintext archive on disk, restores into a temporary isolated database and removes only that test container. It does not schedule backups or apply retention.
