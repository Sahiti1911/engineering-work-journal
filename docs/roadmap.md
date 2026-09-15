# Roadmap

## Phases

**Phase 1 — Foundation.** Project architecture, database, backend API structure, frontend structure, testing and development workflow.

**Phase 2 — V1 Core Work Journal.** Create/view/edit/delete/search/filter work entries; project tracking; category tracking; work status; basic dashboard; monthly view; quarterly view. Full detail: [requirements.md](requirements.md).

**Phase 3 — Quarterly Summary.** A structured, computed (non-AI) quarterly summary answering: major accomplishments, features delivered, bugs/issues resolved, technical improvements, projects contributed to, impact, key learnings. Distinct from Phase 2's simpler quarterly *view* — see [requirements.md](requirements.md).

**Phase 4 — AI.** Only after Phases 1–3 work. Rewrite notes, suggest category/project/impact, summarize work, group related work, identify themes, generate quarterly summaries (now AI-assisted, building on Phase 3's non-AI version). Placeholder detail: [ai.md](ai.md). This phase maps onto a more granular staged learning path (LLM fundamentals → prompting → AI backend engineering → structured outputs → AI work assistant) — see [product-vision.md](product-vision.md) Long-Term Vision.

**Phase 5 — Automatic Integrations.** GitHub, Jira, Azure DevOps, Slack/Teams — pulling supporting context into the journal rather than replacing manual entries. Not part of the initial MVP.

## Current Milestone

Phase 1 (Foundation) is complete: backend (FastAPI + uv) and frontend (Vue 3 + TypeScript + Vite) scaffolds, linting/formatting/testing wired up on both sides, a working health-check endpoint.

Phase 2's backend is now complete: `work_entries` schema, full CRUD including view-one (`POST`/`GET`/`GET /{id}`/`PUT`/`DELETE /api/entries`), search + filter (`?q=`/`?project=`/`?category=`/`?status=`/`?date_from=`/`?date_to=`), and the dashboard (`GET /api/dashboard/summary`, by project/category/month) — including the date-range "quarterly view" (the same `?date_from=`/`?date_to=` scoping applied to the dashboard).

**Current milestone: Phase 2 backend requirements are done; the Vue frontend that consumes these endpoints has not been started — that's the only thing left before Phase 2 as a whole is complete.**

## Completed Work

- Backend foundation: FastAPI app, `uv`-managed dependencies, `ruff` lint/format, `pytest`/`httpx` testing, `GET /api/health`.
- Frontend foundation: Vue 3 + TypeScript + Vite scaffold, `eslint`/`prettier`, `vitest`/`@vue/test-utils`, default demo content removed.
- Documentation foundation: this doc set (product-vision, requirements, architecture, database, api, ai, roadmap, development, decisions), `CLAUDE.md` guardrails, `SESSION_LOG.md`.
- Phase 2 backend (complete): `work_entries` schema (`backend/app/db.py`); Create/View-one/View-all/Edit/Delete (`backend/app/entries.py`); search + filter on `GET /api/entries`; dashboard counts by project/category/month with date-range scoping (`backend/app/dashboard.py`). 42 backend tests passing.

## In-Progress Work

None currently in progress. Remaining before Phase 2 as a whole is done: the Vue frontend to actually use these endpoints (forms/lists/dashboard views) — see [requirements.md](requirements.md). No backend gaps remain.

## Next Task

See "Exactly one next task" in the latest session's report, and/or the most recent entry in [SESSION_LOG.md](../SESSION_LOG.md) — kept there instead of duplicated here so it doesn't go stale in two places.

## Future Ideas

Not part of the current phase plan above; revisit if/when a real need appears:

- Freeform tags alongside the fixed category list (if categories prove insufficient).
- Full-text search (SQLite FTS5), if substring search proves insufficient.
- Multi-user support / authentication / cloud hosting.
- Mobile application.
- Browser extension.
- Notifications.
- Complex/advanced analytics.
- Team collaboration.
- Automatic activity detection.
- AI agent / agentic workflows beyond the staged path above.
- Kubernetes / microservices / distributed architecture — no technical reason for this at personal-tool scale.
