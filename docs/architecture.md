# Architecture — V1

## Stack

- **Backend:** Python + FastAPI, run via `uvicorn`.
- **Database:** SQLite (stdlib `sqlite3`, no ORM), single file `journal.db`.
- **Frontend:** One static HTML page + vanilla JS, served by FastAPI's
  `StaticFiles`. No build step, no frontend framework.

Chosen for simplicity: one process, one language, no build tooling, no ORM
layer. SQLite comfortably handles a personal journal's scale. See
`CLAUDE.md` rule 4 (prefer simple architecture) and rule 3 (justify new
dependencies) — `fastapi`, `uvicorn`, and `pydantic` (bundled with FastAPI)
are the only third-party dependencies.

## Data model

Single table, no joins:

```sql
CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL,
    work_date  TEXT NOT NULL,   -- ISO date, e.g. '2026-09-08'
    tags       TEXT,            -- comma-separated, nullable
    created_at TEXT NOT NULL,   -- ISO timestamp
    updated_at TEXT NOT NULL    -- ISO timestamp
);
CREATE INDEX IF NOT EXISTS idx_entries_work_date ON entries(work_date);
```

Tags are a comma-separated string rather than a normalized table —
sufficient for `LIKE`-based filtering at personal-journal scale. Search is
substring match (`LIKE`) over `title`/`body`, not SQLite FTS5 — revisit
only if relevance/ranking becomes a real need.

## Backend structure

```
backend/
  app/
    main.py           # FastAPI app, mounts router + static frontend
    database.py        # sqlite3 connection + schema creation
    models.py           # Pydantic schemas: EntryCreate, EntryUpdate, EntryOut
    crud.py               # create/get/list/update/delete + search/filter queries
    routers/
      entries.py          # /api/entries endpoints
    static/
      index.html
      app.js
      styles.css
  requirements.txt
journal.db              # sqlite file, gitignored
```

## API surface

- `GET /api/entries?q=&tag=&date_from=&date_to=` — list, optional
  search/filter params, sorted by `work_date` desc
- `POST /api/entries` — create
- `GET /api/entries/{id}` — read one
- `PUT /api/entries/{id}` — update
- `DELETE /api/entries/{id}` — delete

## Milestones within V1

1. **Create + View** (vertical slice: schema, create/list API, minimal UI) — done first.
2. **Edit + Delete** — extends the same list UI.
3. **Search + Filter** — extends the list endpoint + adds UI controls.

## Running locally

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open `http://localhost:8000`.
