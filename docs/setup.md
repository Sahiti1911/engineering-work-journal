# Setup

## Prerequisites

- Python 3.11+ (uv can download an isolated interpreter automatically if needed)
- [uv](https://docs.astral.sh/uv/) for backend dependency management
- Node.js + npm (for the Vue/TypeScript/Vite frontend)

Postgres is not required for now — using SQLite until Postgres can be installed locally (see [decisions.md](decisions.md)). No database tables exist yet either — foundation only, so far.

Testing/lint expectations and workflow (not just commands): [development.md](development.md).

## 1. Backend

```
cd backend
uv sync
```

This creates `backend/.venv` and installs dependencies from `pyproject.toml`/`uv.lock`.

Copy `.env.example` to `.env` and adjust if needed:

```
copy .env.example .env
```

Run the dev server:

```
uv run uvicorn app.main:app --reload
```

Run tests:

```
uv run pytest
```

Lint and format (ruff):

```
uv run ruff check .
uv run ruff format .
```

## 2. Frontend

```
cd frontend
npm install
npm run dev
```

Other commands:

```
npm run build     # production build -> frontend/dist (copy into backend/app/static for a single-process deploy)
npm run test       # vitest
npm run lint        # eslint
npm run format      # prettier --write
```

## Verifying the health endpoint

With the backend running (`uv run uvicorn app.main:app --reload` from `backend/`):

```
curl http://localhost:8000/api/health
```

Expected response: `{"status":"ok"}`. The Vite dev server also proxies `/api` to `http://localhost:8000`, so once the frontend calls the API it can use relative paths (`/api/health`) without CORS issues in dev.

## Status

Foundation only: FastAPI app with a health-check endpoint, Vue+TS+Vite scaffold, linting/formatting/testing wired up on both sides. No work-entry models, routes, DB tables, or UI yet. See [architecture.md](architecture.md) for the design and [roadmap.md](roadmap.md) for milestone order.
