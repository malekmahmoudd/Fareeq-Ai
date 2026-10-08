# FareeqAI

A personal AI team with Leo and nine specialists for study, travel, shopping, career, finance, fitness, writing, research and email. Talk to any teammate directly, keep separate conversations, and control the context your team remembers.

**[Try FareeqAI](https://fareeqai.pages.dev)** — guest access starts without signup. Signing in is optional. This is a technical portfolio project; the mobile client is under development.

## Web and mobile share one backend

The Next.js website and Expo Android/iOS client call the same FastAPI API and PostgreSQL database. Registered accounts share conversations and saved replies across clients. Anonymous devices have separate guest workspaces.

| Directory | Purpose |
| --- | --- |
| [frontend](frontend/README.md) | Next.js, React, TypeScript and Tailwind website |
| [backend](backend/README.md) | FastAPI modular monolith, agent runtime, authentication, memory and documents |
| [mobile/client](mobile/client/README.md) | Expo SDK 57 / React Native client, guest access, streaming chats and saved replies |
| [mobile/design](mobile/design/README.md) | Approved visual specification, design tokens and reference artwork |
| [deploy](docs/public-free-host-runbook.md) | Deployment configuration, backup helpers and isolated verification tools |
| [docs](docs/README.md) | Architecture, current operational guidance and dated audit evidence |

Agents are configurations of one runtime, rather than separate services. The provider abstraction supports mock responses for development and real LLM providers, including Groq. Personal context has shared and per-agent namespaces with account isolation and user controls.

Current public delivery uses Cloudflare Pages in front of the Netlify website, DockHosting for the Python backend, and Neon PostgreSQL. The Pages proxy is deployed by direct upload; pushing Git alone does not update it. See the [operations runbook](docs/public-free-host-runbook.md) before changing hosting.

## Run locally

Use Python 3.12 and Node.js 22.13 or newer. Docker is optional for local PostgreSQL; SQLite supports a first run without external services. No API key is needed with the mock provider.

```sh
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
```

The backend example selects local PostgreSQL. For SQLite, replace DATABASE_URL with `sqlite+pysqlite:///./modeer.db`; its development schema is created on startup. For PostgreSQL, start the root Compose database with `docker compose up -d db`, then run `alembic upgrade head` from backend.

```sh
uvicorn app.main:app --reload
```

In another terminal:

```sh
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The website proxies `/api` to http://localhost:8000 by default. If authentication is enabled locally, FRONTEND_URL must match the browser origin.

For the mobile client, see its [setup and Android testing instructions](mobile/client/README.md). The connected preview APK uses the public FareeqAI origin. The design-preview profile uses labeled sample data. Native keyboard, background/resume, accessibility and physical-device behavior still need verification; Goals/Plans, uploads and Markdown/source passages are implemented in the 0.2.0 client; see [verification and device checks](docs/android-features-2026-10-08.md).

## Validation

```sh
# From backend with its virtual environment active
pytest -q
ruff check app tests

# From frontend
npm run typecheck
npm run lint
npm test
npm run build

# From mobile/client
npm run typecheck
npm run lint
npm test
```

Deployment rehearsals operate on disposable databases and test identities. Never point those scripts at production data. Audit and release claims are dated evidence, not a guarantee that every current environment passes.

## Configuration and privacy

Copy the component-specific `.env.example` files and keep real `.env` files private. Database credentials, signing secrets and provider keys belong only on the backend host. Expo variables prefixed EXPO_PUBLIC_ are embedded in the app; use them only for public configuration.

Browser sessions use HttpOnly cookies and Origin protection. Native sessions use a separate signed bearer audience stored in SecureStore. MOBILE_ENABLED defaults to false and must be explicitly enabled for native clients. Guest access shares admission and AI budgets with the public service; account isolation still applies.

See the [architecture](docs/architecture.md), [agent design](docs/agents.md), [memory model](docs/memory.md), [current runbook](docs/public-free-host-runbook.md) and [remaining technical debt](docs/post-mvp-technical-debt.md).
