# FareeqAI shared backend

FastAPI modular monolith serving both the website and Expo Android/iOS client. See the repo root [`README.md`](../README.md) and
[`docs/`](../docs) for the full picture.

## Quick start

```bash
python3.12 -m venv .venv
# Windows: .venv\Scripts\activate   |   Unix: source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env

alembic upgrade head          # only needed for PostgreSQL; SQLite auto-creates
uvicorn app.main:app --reload # http://localhost:8000  ·  docs at /docs
```

## Common commands

```bash
pytest                        # full suite, LLM mocked
ruff check .                  # lint
python -m app.agents.evals    # agent evaluation harness
alembic revision -m "msg"     # new migration (autogenerate needs a live DB)
```

## Layout

```
app/
  main.py            app + lifespan
  core/config.py     settings
  db/                Base, session, models
  api/routes/        health users agents conversations chat memory goals briefings team
  agents/            schema · registry · context · runtime · evals · <slug>/*
  llm/               base · mock · anthropic · provider
  users/ conversations/ memory/ goals/ briefings/   schemas + services
migrations/           Alembic (0001 = full initial schema)
tests/                registry, context, memory isolation, API, milestone flow
```

## Authentication and managed hosting

Browser clients use protected cookies; native clients use the separate mobile bearer audience. Native guest/login/signup routes require MOBILE_ENABLED=true. Guest access and signup remain independently configurable, and public AI/admission budgets apply across clients. Native tokens cannot authenticate browser cookies or bypass account/device revocation.

The current backend runs on DockHosting with Neon PostgreSQL. Docker starts migrations before Uvicorn on port 8000. Configuration, backups and deployment limitations are in the [operations runbook](../docs/public-free-host-runbook.md). Local development can use SQLite and the mock provider without hosting credentials.
