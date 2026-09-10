# Roadmap

## Phases

**Phase 1 — Foundation.** Project architecture, database, backend API structure, frontend structure, testing and development workflow.

**Phase 2 — V1 Core Work Journal.** Create/view/edit/delete/search/filter work entries; project tracking; category tracking; work status; basic dashboard; monthly view; quarterly view. Full detail: [requirements.md](requirements.md).

**Phase 3 — Quarterly Summary.** A structured, computed (non-AI) quarterly summary answering: major accomplishments, features delivered, bugs/issues resolved, technical improvements, projects contributed to, impact, key learnings. Distinct from Phase 2's simpler quarterly *view* — see [requirements.md](requirements.md).

**Phase 4 — AI.** Only after Phases 1–3 work. Rewrite notes, suggest category/project/impact, summarize work, group related work, identify themes, generate quarterly summaries (now AI-assisted, building on Phase 3's non-AI version). Placeholder detail: [ai.md](ai.md). This phase maps onto a more granular staged learning path (LLM fundamentals → prompting → AI backend engineering → structured outputs → AI work assistant) — see [product-vision.md](product-vision.md) Long-Term Vision.

**Phase 5 — Automatic Integrations.** GitHub, Jira, Azure DevOps, Slack/Teams — pulling supporting context into the journal rather than replacing manual entries. Not part of the initial MVP.

## Current Milestone

Phase 1 (Foundation) is substantially complete: backend (FastAPI + uv) and frontend (Vue 3 + TypeScript + Vite) scaffolds, linting/formatting/testing wired up on both sides, a working health-check endpoint. What Phase 1 does **not** yet include — and what Phase 2 starts with — is the actual database and work-entry API.

**Current milestone: start of Phase 2 — first slice is the `work_entries` schema plus Create + View.**

## Completed Work

- Backend foundation: FastAPI app, `uv`-managed dependencies, `ruff` lint/format, `pytest`/`httpx` testing, `GET /api/health`.
- Frontend foundation: Vue 3 + TypeScript + Vite scaffold, `eslint`/`prettier`, `vitest`/`@vue/test-utils`, default demo content removed.
- Documentation foundation: this doc set (product-vision, requirements, architecture, database, api, ai, roadmap, development, decisions), `CLAUDE.md` guardrails, `SESSION_LOG.md`.

## In-Progress Work

None yet within Phase 2 — the schema and API design are documented ([database.md](database.md), [api.md](api.md)) but not implemented.

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
