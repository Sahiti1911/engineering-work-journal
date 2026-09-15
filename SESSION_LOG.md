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

---

Date: 2026-09-11
What I worked on: Implemented Create + View for work entries — `POST /api/entries` and `GET /api/entries`.
What I completed: New `backend/app/entries.py` with `Category`/`Status` enums mirroring the DB `CHECK` constraints, `WorkEntryCreate`/`WorkEntryOut` Pydantic models, and both endpoints wired via a small `get_conn` FastAPI dependency; extended `db.py` with `insert_entry`/`get_entry`/`list_entries` (all parameterized SQL); registered the router in `main.py`. Added `tests/test_entries.py` covering: valid create, list returning the created entry, invalid `category` → 422, invalid `status` → 422. Full suite (6 tests), `ruff check`, and `ruff format --check` all pass. No edit/delete/search/filter/dashboard/AI/auth — out of scope for this task.
What I learned: FastAPI's recommended way to inject a per-request resource (here, a DB connection) is a generator dependency (`yield`-based), which also gave a natural place to call `db.init_db()` lazily per-request instead of at import time — that laziness is what let tests redirect `db.DB_PATH` to a temp file via `monkeypatch` *before* the table ever gets created, without touching the real `journal.db`. Also hit two `ruff` rules worth remembering: B008 (don't call `Depends()` in a default value — use `Annotated[T, Depends(...)]` instead) and DTZ003 (`datetime.utcnow()` is deprecated in favor of timezone-aware `datetime.now(UTC)`).
Problems encountered: Initial draft used `Depends(get_conn)` as a bare default value and `datetime.utcnow()` — both flagged by `ruff`; fixed by switching to `Annotated[sqlite3.Connection, Depends(get_conn)]` and `datetime.now(UTC)`.
Decisions made: None new — implementation followed `docs/api.md` and `docs/database.md` as documented; no doc updates needed.
Next task: Implement `PUT /api/entries/{id}` and `DELETE /api/entries/{id}` (Edit + Delete) in `backend/app/entries.py`, reusing the existing models/`db.py` functions plus a new `db.update_entry`/`db.delete_entry`, with a 404 when the id doesn't exist. No search/filter/dashboard yet.

---

Date: 2026-09-11
What I worked on: Implemented Edit + Delete for work entries — `PUT /api/entries/{id}` and `DELETE /api/entries/{id}`.
What I completed: Added `db.update_entry`/`db.delete_entry` (parameterized SQL, reusing the existing connection approach); `PUT` handler does a full replacement via the existing `WorkEntryCreate` model, preserves `created_at`, bumps `updated_at`, and 404s via `HTTPException` if the id doesn't exist (checked with the existing `db.get_entry` before writing); `DELETE` returns `204 No Content` on success, same 404 on a missing id. No new Pydantic models needed. Added 8 new tests in `tests/test_entries.py` (14 total) covering successful update, all-fields update, invalid category/status on update, update on a missing id, successful delete, delete on a missing id, and a deleted entry no longer appearing in the list. Full suite, `ruff check`, and `ruff format --check` all pass.
What I learned: `api.md` didn't actually specify a `DELETE` response body — filled that gap with the standard `204 No Content` convention and documented the decision in `api.md` rather than leaving it implicit. Checking existence via a plain `SELECT` (`db.get_entry`) before the `UPDATE`/`DELETE` keeps the 404 logic identical for both endpoints and avoids relying on SQLite's rowcount to detect a no-op write.
Problems encountered: None.
Decisions made: `PUT` is a full replacement, not a partial update (documented in `docs/api.md`); `DELETE` responds `204 No Content` (also documented there).
Next task: Add search (`?q=`) and filtering (`?project=`, `?category=`, `?status=`, `?date_from=`, `?date_to=`) query parameters to `GET /api/entries`, extending `db.list_entries` with optional parameterized `WHERE` clauses. No dashboard/quarterly view yet.

---

Date: 2026-09-11
What I worked on: Added search and filtering to `GET /api/entries` — `?q=`, `?project=`, `?category=`, `?status=`, `?date_from=`, `?date_to=`.
What I completed: Extended `db.list_entries` to build a parameterized `WHERE` clause (fixed SQL text + bound values only, all filters `AND`-ed together); `entries.py`'s handler takes these as plain optional query parameters, reusing the existing `Category`/`Status` enums and `date` type so invalid values 422 the same way create/update already do. Added 12 new tests (26 total) covering each filter individually, search with no matches, multiple filters combined, no filters, and 422s for invalid category/status/date. Full suite, `ruff check`, and `ruff format --check` all pass. Updated `docs/api.md` to reflect what's actually implemented vs. still pending; `docs/database.md` needed no change (schema untouched).
What I learned: Because `category`/`status` were already modeled as enums and dates as `date` for the request body, reusing those same types for query parameters gave the same validation (and 422s) for free — no separate validation code needed for the filter values. Also confirmed the safe way to build a dynamic `WHERE` clause: the SQL *text* (column names, `AND`, `LIKE`) is always a fixed string I wrote, and only the *values* travel through the parameters list — never the reverse.
Problems encountered: None.
Decisions made: None new.
Next task: Implement `GET /api/dashboard/summary` — counts of work entries by project, by category, and by month, per `docs/requirements.md`'s Dashboard Requirements. No quarterly summary (Phase 3) yet.

---

Date: 2026-09-11
What I worked on: Implemented `GET /api/dashboard/summary` — counts by project, by category, and by month.
What I completed: Added `db.count_by_project`/`count_by_category`/`count_by_month` (each a single `SELECT ... GROUP BY ... ORDER BY`, no user input so no parameterization needed); new `backend/app/dashboard.py` router (following the existing `entries.py` conventions, reusing its `Conn` dependency) with `ProjectCount`/`CategoryCount`/`MonthCount`/`DashboardSummary` Pydantic models; registered the router in `main.py`. Proposed and documented the response shape in `docs/api.md` (three arrays of named-field objects), since requirements.md didn't specify one. Added 5 new tests (31 total): empty database, counts by project, by category, by month, and a combined test verifying correct aggregation when several entries share the same project/category/month. Full suite, `ruff check`, and `ruff format --check` all pass.
What I learned: `GROUP BY` plus `COUNT(*)` does the aggregation entirely inside SQLite in one pass — only the small, already-summarized result crosses into Python, rather than pulling every row across and counting in a Python dict. `strftime('%Y-%m', entry_date)` works directly on the `TEXT` ISO-date column to truncate it to a month bucket, so no date parsing was needed on the Python side for that grouping.
Problems encountered: None beyond `ruff format` reflowing one list comprehension — cosmetic, auto-fixed.
Decisions made: Dashboard response is three arrays of `{<key-name>: value, count}` objects (documented in `docs/api.md`) rather than a nested dict-of-dicts, to be simple to iterate from Vue later.
Next task: Add optional `date_from`/`date_to` query parameters to `GET /api/dashboard/summary` (reusing `db.list_entries`'s date-range filtering pattern) so it can produce a "quarterly view" of the dashboard scoped to a date range, per `docs/requirements.md`'s Quarterly Summary Requirements. Still no Phase 3 structured quarterly summary — that's a separate, later endpoint.

---

Date: 2026-09-11
What I worked on: Added optional `date_from`/`date_to` query parameters to `GET /api/dashboard/summary` — the Phase 2 "quarterly view" (date-range-scoped dashboard, not the Phase 3 structured summary).
What I completed: Added a shared `db._date_range_where()` helper (built from the same fixed-fragment pattern `list_entries` already uses) and threaded optional `date_from`/`date_to` through `count_by_project`/`count_by_category`/`count_by_month`, so the same date window narrows the rows before each `GROUP BY`. `dashboard.py`'s handler takes `date_from`/`date_to` as the same `date` type `entries.py` already uses, so invalid values 422 the same way, with no new validation code. Response shape unchanged. Added 10 new tests (40 total): no-filter baseline, `date_from` only, `date_to` only, both together, inclusive boundaries, entries just outside the range excluded, invalid `date_from`/`date_to` → 422, and an empty-matching-range case. Full suite, `ruff check`, and `ruff format --check` all pass. Updated `docs/api.md` (query params + semantics) and `docs/roadmap.md` (Phase 2 backend now essentially complete).
What I learned: Because the date range needed to apply identically to three separate `GROUP BY` queries, factoring the `WHERE`-building into one small helper (`_date_range_where`) avoided writing the same `if date_from: ... if date_to: ...` logic three times — the kind of duplication that's worth a tiny shared helper rather than three copies, without turning it into a bigger abstraction than the problem needs.
Problems encountered: None.
Decisions made: None new — reused the existing date-range and validation patterns as instructed.
Current phase/milestone: Phase 2 (Core Work Journal) — the backend side is now essentially complete (schema, full CRUD, search/filter, dashboard with quarterly-view date scoping). Remaining before Phase 2 is fully done: `GET /api/entries/{id}` (view one, never implemented) and the Vue frontend to consume all of this.
Next task: Implement `GET /api/entries/{id}` (view one entry), returning `WorkEntryOut` on success and 404 if the id doesn't exist — closing the last documented gap in the Phase 2 backend before frontend work starts.

---

Date: 2026-09-11
What I worked on: Implemented `GET /api/entries/{id}` — the last documented gap in the Phase 2 backend.
What I completed: Added the route to `entries.py`, reusing `db.get_entry` exactly as-is (no new database logic) and the same 404 convention already used by `PUT`/`DELETE`. Added 2 tests (42 total): fetching an existing entry (asserting the response matches the created entry exactly) and a 404 for a non-existent id. Full suite, `ruff check`, and `ruff format --check` all pass. Updated `docs/api.md` (marks the endpoint implemented, notes Phase 2 backend is complete) and `docs/roadmap.md` (Phase 2 backend done; only the Vue frontend remains).
What I learned: Nothing new technically — this was a direct application of patterns already established over the last several sessions (existence check via `db.get_entry`, same 404 message, same response model), which is itself a small confirmation that those patterns generalized cleanly to one more endpoint without needing any new abstraction.
Problems encountered: None.
Decisions made: None new.
Current phase/milestone: Phase 2 (Core Work Journal) — backend requirements are now fully complete (schema, full CRUD including view-one, search/filter, dashboard with quarterly-view date scoping, 42 passing tests). The only remaining Phase 2 work is the Vue frontend.
Next task: Create `frontend/src/api.ts` — a thin `fetch` wrapper for the `/api/entries` endpoints (list/get/create/update/delete) — as the first frontend task, before building any UI components.
