# Engineering Work Journal

A personal engineering work journal: capture work entries, view a dashboard, and generate quarterly summaries — the foundation for an eventual AI-powered engineering knowledge assistant (see [docs/product-vision.md](docs/product-vision.md)).

The project is built in phases — see [docs/roadmap.md](docs/roadmap.md) for the current phase/milestone, [docs/requirements.md](docs/requirements.md) for what V1 does and doesn't include, and [CLAUDE.md](CLAUDE.md) for the working rules. Full doc set: `docs/` (product-vision, requirements, architecture, database, api, ai, roadmap, development, decisions, setup).

## Status

Phase 1 (Foundation) is substantially complete — no work-entry functionality yet. See [docs/setup.md](docs/setup.md) for full setup instructions and [SESSION_LOG.md](SESSION_LOG.md) for session-by-session history.

## Quick start

**Backend** (FastAPI, managed with [uv](https://docs.astral.sh/uv/)):

```
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

**Frontend** (Vue 3 + TypeScript + Vite):

```
cd frontend
npm install
npm run dev
```

Verify the backend is up: `curl http://localhost:8000/api/health` → `{"status":"ok"}`.

Full details, including linting/formatting/testing commands, are in [docs/setup.md](docs/setup.md).
