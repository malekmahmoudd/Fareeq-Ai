# FareeqAI website

Next.js App Router, React, TypeScript and Tailwind. This website and the native mobile client use the same FastAPI backend; see the [project overview](../README.md).

## Local development

Requires Node.js 22.13+ and the backend on port 8000.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The Next.js proxy routes `/api` to BACKEND_URL, defaulting to http://localhost:8000. Guest entry and optional sign-in depend on backend configuration.

## Checks and build

```sh
npm run typecheck
npm run lint
npm test
npm run check:dependencies
npm run build
```

The contract checks cover API errors, streaming, links, shared-device privacy and the Netlify edge proxy. They complement backend tests and real browser/device checks.

## Deployment

Netlify builds this directory using the root netlify.toml. Cloudflare Pages serves the existing dynamic website through a delivery proxy; it is not a static Next.js export. Public API requests route directly to DockHosting. Follow the [runbook](../docs/public-free-host-runbook.md) and [Pages package instructions](../deploy/cloudflare-pages/README.md).

No backend signing, database or AI credentials belong in browser configuration. Preserve account-scoped drafts, cache clearing on sign-out, and authentication error handling when changing the chat flow.
