# Session Log

Template for each entry:

```
Date:
What I worked on:
What I completed:
What I learned:
Problems encountered:
Decisions made:
Next task:
```

---

Date: 2026-09-09
What I worked on: Repository assessment and documentation foundation — split the project guardrails into a full doc set (product-vision, requirements, architecture, database, api, ai, roadmap, development, decisions), rewrote CLAUDE.md as the project's behavior guardrails, created this log.
What I completed: Confirmed the current stack (FastAPI + uv + SQLite→Postgres backend, Vue 3 + TypeScript + Vite frontend) has no strong technical reason to change; restructured all docs so scope/design facts live in exactly one place each; no application code touched.
What I learned:
Problems encountered:
Decisions made: See [docs/decisions.md](docs/decisions.md) for the technical decisions carried over/reconfirmed during this pass (SQLite for now, `uv`, no ORM, Vue+TS, fixed category/status via `CHECK`, `ruff`).
Next task: Implement `backend/app/db.py` — SQLite connection + `init_db()` creating the `work_entries` table per [docs/database.md](docs/database.md), plus one test verifying the table/columns exist. No API endpoints yet.

---

Date: 2026-09-11
What I worked on: Implemented `backend/app/db.py` (SQLite connection helper + `init_db()`), the first piece of Phase 2.
What I completed: `work_entries` table created exactly per `docs/database.md` (including the `category`/`status` `CHECK` constraints); added `tests/test_db.py` verifying the table and its columns exist after `init_db()`; full backend test suite and `ruff` lint/format still clean. No API endpoints, no frontend, no AI touched.
What I learned: SQLite enforces the `category`/`status` fixed sets at the database layer via `CHECK (... IN (...))` — no application-level validation is needed for that yet, though `api.md` still calls for mirroring it in the Pydantic models so bad input is rejected before it reaches the DB. Making the DB path overridable (`init_db(db_path)` / `DB_PATH` env var) rather than hardcoded is what let the test create an isolated temp database instead of touching the real `journal.db`.
Problems encountered: None beyond `ruff format` reflowing a set-comprehension in the new test file — cosmetic, auto-fixed.
Decisions made: None new — implementation followed `docs/database.md` as documented, no deviations.
Next task: Implement the `POST /api/entries` and `GET /api/entries` endpoints (Create + list/View) in a new `backend/app/entries.py`, using `db.py` for persistence, with Pydantic request/response models per `docs/api.md`. No edit/delete/search/filter yet.
