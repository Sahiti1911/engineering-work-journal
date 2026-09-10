# Decisions

Only decisions with real tradeoffs are logged here — not trivial choices.

## SQLite for V1, PostgreSQL planned later

- **Decision:** Use SQLite (`journal.db`) now; migrate to PostgreSQL once it can be installed locally.
- **Context:** Personal, single-user, local-only tool. Postgres was the original preference but couldn't be installed on the dev machine at the time.
- **Reason:** SQLite needs no server process — zero-config, file-based, unblocks development immediately.
- **Alternatives considered:** PostgreSQL now (blocked by install issue), MySQL (no particular advantage here).
- **Tradeoffs:** A migration will be needed later. Mitigated by isolating all DB access behind `backend/app/db.py` (see [database.md](database.md)) so the migration touches one file.

## `uv` for backend dependency/environment management

- **Decision:** Manage the backend with `uv` (`pyproject.toml` + `uv.lock`), not pip + `requirements.txt`.
- **Context:** User's explicit choice for the backend toolchain.
- **Reason:** Single tool for venv + dependency resolution + lockfile; fast; reproducible installs.
- **Alternatives considered:** pip + `requirements.txt` (original foundation draft), Poetry, Pipenv.
- **Tradeoffs:** Newer tool than pip; team members (if this ever stops being single-user) would need `uv` installed. Acceptable for a personal project.

## No ORM — plain SQL via `sqlite3`

- **Decision:** Use the stdlib `sqlite3` module with parameterized SQL directly, no ORM.
- **Context:** Schema is a single table (`work_entries`) for all of V1.
- **Reason:** An ORM (e.g. SQLAlchemy) is unnecessary abstraction for one table — violates "prefer simple architecture."
- **Alternatives considered:** SQLAlchemy.
- **Tradeoffs:** Revisit if the schema grows to multiple related tables where an ORM's relationship handling would earn its keep.

## Vue 3 + TypeScript + Vite for the frontend

- **Decision:** Vue 3 + TypeScript, scaffolded with Vite.
- **Context:** User's explicit choice over React.
- **Reason:** User preference/familiarity.
- **Alternatives considered:** React + TypeScript + Vite.
- **Tradeoffs:** None significant — both are viable for this scope; recorded because it's a stack choice, not because of a strong technical differentiator.

## Fixed `category`/`status` via `CHECK` constraint, not lookup tables

- **Decision:** `category` and `status` are `TEXT` columns constrained with SQL `CHECK (... IN (...))`, not separate normalized tables.
- **Context:** Both are small, fixed sets (9 categories, 4 statuses) expected to change rarely (product-vision.md: "add new categories only when there is a real need").
- **Reason:** A lookup table plus foreign key is unnecessary joins/abstraction for a list this small and this stable — simpler to keep them as constrained text.
- **Alternatives considered:** Separate `categories`/`statuses` tables with foreign keys.
- **Tradeoffs:** Adding a new category/status later requires a schema migration rather than an `INSERT` — acceptable since that's meant to be a deliberate, rare decision, not self-service.

## `ruff` for backend lint + format

- **Decision:** `ruff check` + `ruff format` instead of `black` + `flake8` + `isort`.
- **Context:** Needed one lint/format setup for the backend foundation.
- **Reason:** Single fast tool covering both linting and formatting instead of three separate tools/configs.
- **Alternatives considered:** `black` + `flake8` + `isort`.
- **Tradeoffs:** None material — `ruff` is a drop-in replacement for that combination at this point.
