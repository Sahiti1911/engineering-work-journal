# Requirements — V1 (Phases 1–2)

Scope boundary and rationale: [product-vision.md](product-vision.md); phase breakdown: [roadmap.md](roadmap.md).

## Functional Requirements (MVP)

The MVP must allow the user to:

1. Add a work entry
2. View work entries
3. Edit a work entry
4. Delete a work entry
5. Search work entries
6. Filter work entries
7. Categorize work
8. Associate work with a project
9. Record impact
10. Record a PR/ticket reference
11. View basic statistics (dashboard)
12. View quarterly work

The MVP must **not** include: AI agents, RAG/vector databases, GitHub/Jira/Slack/Teams integrations, mobile app, multi-user support, complex analytics, notifications, browser extension, or distributed/microservice architecture. See [roadmap.md](roadmap.md) for where these belong.

## Work Entry Requirements

Each entry stores: `date`, `title`, `description`, `project`, `category`, `impact`, `reference` (PR/ticket), `status` (plus `id`, `created_at`, `updated_at`). Full field/type/constraint detail: [database.md](database.md).

- **Categories** (fixed set — add only with a clear need): Feature, Bug Fix, Improvement, Performance, Security, DevOps, Investigation, Documentation, Other.
- **Statuses** (fixed set): Planned, In Progress, Completed, Blocked.
- `project` is freeform text for V1 (no managed project list) — see [decisions.md](decisions.md).
- Do not add fields beyond this set without a clear requirement (per CLAUDE.md rule against scope creep).

## Search / Filter Requirements

- Search: substring match over `title` and `description`.
- Filter: by `project`, `category`, `status`, and date range (`date_from`/`date_to`).
- Search and filter can combine (e.g. search text + category filter at once).
- Full endpoint shape: [api.md](api.md).

## Dashboard Requirements

Answers "What did I work on?" and "How much did I accomplish?":
- Work by project
- Work by category
- Monthly view
- Quarterly view

Basic counts only for V1 — no charts/visual analytics beyond simple counts/breakdowns (that would be "complex analytics", a non-goal).

## Quarterly Summary Requirements (Phase 3 — not MVP)

Phase 2 already provides a **quarterly view**: filtering entries to a given quarter and showing dashboard-style breakdowns of them (no new synthesis, just the existing dashboard scoped to a date range).

Phase 3 goes further: a **quarterly summary** — a structured, computed (non-AI) report grouping that quarter's entries into: major accomplishments, features delivered, bugs/issues resolved, technical improvements, projects contributed to, impact, and key learnings. This is a distinct, later deliverable from the Phase 2 quarterly view — not part of the MVP acceptance criteria below.

## MVP Acceptance Criteria

- Add a work item in under 2 minutes.
- See all work entries.
- Search and filter work entries.
- Edit and delete work entries.
- See basic statistics (dashboard).
- Select a quarter and see the work done in it (quarterly view).

If all of the above work, the MVP (Phases 1–2) is complete. Don't add features just because the MVP looks simple.
