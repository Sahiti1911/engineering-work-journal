# Architecture

Status: Phase 1 foundation implemented (health-check endpoint + tooling only). Work-entry functionality (schema, CRUD, search, filter, dashboard, quarterly view/summary) not yet implemented — see [roadmap.md](roadmap.md).

## Overall Architecture

A simple two-tier local web app, single process:

```
Browser (Vue 3 + TS SPA)  <-- REST/JSON -->  Backend (FastAPI)  <-->  SQLite (journal.db)
```

No API gateway, background workers, or queues — none are justified by the requirements. The backend serves both the JSON API and the built frontend's static assets from one process.

## Frontend

Vue 3 + TypeScript, scaffolded with Vite. Dev server on `:5173` proxies `/api` to the backend on `:8000` (see `frontend/vite.config.ts`). Production build (`npm run build`) outputs to `frontend/dist`, copied into `backend/app/static/` for the single-process deployment shape.

Tooling: `eslint` + `prettier` (lint/format), `vitest` + `@vue/test-utils` (tests).

## Backend

Python + FastAPI, managed with [uv](https://docs.astral.sh/uv/) (`pyproject.toml` + `uv.lock`). Plain SQL via the stdlib `sqlite3` (no ORM) — see [decisions.md](decisions.md) for why. Endpoint/error/validation conventions: [api.md](api.md).

Tooling: `ruff` (lint + format), `pytest` + `httpx` (tests).

## Database

SQLite (`journal.db`) now, with a planned migration to PostgreSQL. Full schema, constraints, and migration plan: [database.md](database.md) and [decisions.md](decisions.md).

## AI Layer

Not built — Phase 4. Placeholder design notes: [ai.md](ai.md). Nothing in the current architecture depends on or anticipates an AI layer beyond keeping the backend simple enough to extend later.

## External Integrations

Not built — Phase 5 (GitHub/Jira/Azure DevOps/Slack/Teams). See [roadmap.md](roadmap.md). No integration hooks exist in the current architecture; adding them is deferred until this phase.

## Data Flow

Browser → `fetch` → FastAPI JSON API → SQLite, and back. In production, the same FastAPI process also serves the built frontend as static files, so there's no separate frontend host or CDN to reason about for V1.

## Deployment Architecture

Local-only for now — no cloud hosting, no CI/CD (both are non-goals for V1; see [product-vision.md](product-vision.md)). If/when deployment becomes relevant, the expected shape is a single process (this same FastAPI app, serving API + static assets) on a single host, backed by SQLite or the migrated Postgres instance — no separate services to orchestrate.

## Why These Choices

- SQLite (for now): zero-config, unblocks development immediately; Postgres remains the intended end state.
- No ORM: one table doesn't justify SQLAlchemy.
- No normalized category/status tables, no FTS, no auth: all explicitly deferred — see [decisions.md](decisions.md) and [roadmap.md](roadmap.md) (Future Ideas).

Full decision log (with alternatives/tradeoffs): [decisions.md](decisions.md).

## Folder Structure

```
backend/
  app/
    main.py           # FastAPI app: CORS, health check, mounts static/ if present
    static/             # built frontend output goes here (gitignored except .gitkeep)
  tests/
    test_health.py
  pyproject.toml        # uv-managed deps + ruff/pytest config
  uv.lock
  .env.example
  .env                   # gitignored

frontend/
  src/
    App.vue
    main.ts
    App.spec.ts
  eslint.config.js
  .prettierrc.json
  package.json
  node_modules/          # gitignored (created by npm install)

docs/
  product-vision.md, requirements.md, architecture.md, database.md,
  api.md, ai.md, roadmap.md, development.md, decisions.md, setup.md

CLAUDE.md
README.md
SESSION_LOG.md
```

Not yet created (planned across the milestones in [roadmap.md](roadmap.md)): `backend/app/db.py`, `backend/app/entries.py`, `backend/app/dashboard.py`, `backend/journal.db`, `frontend/src/api.ts`, `frontend/src/components/` (EntryForm, EntryList, EntryDetail, FilterBar, Dashboard, QuarterlySummary).
