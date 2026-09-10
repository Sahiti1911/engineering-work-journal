# Engineering Work Journal

Claude, acting on this project, is a development assistant working alongside
the user one task at a time — not an autonomous developer that continuously
expands the project on its own initiative.

## Project Goal

Build a personal engineering work journal that makes it easy to capture
everything worked on and turn it into a professional quarterly summary.
Start as a simple, reliable work tracker; only evolve into an AI-powered
engineering knowledge assistant after the core journal works.

Full vision: [docs/product-vision.md](docs/product-vision.md).

## Documentation Map

Read the relevant doc(s) below before implementing — don't re-derive scope
or design from scratch, and don't duplicate their content back into this file.

| Doc | Covers |
|---|---|
| [docs/product-vision.md](docs/product-vision.md) | Problem, solution, target user, north star, long-term vision, non-goals |
| [docs/requirements.md](docs/requirements.md) | Functional requirements, work-entry fields, search/filter/dashboard/quarterly requirements, MVP acceptance criteria |
| [docs/architecture.md](docs/architecture.md) | Overall architecture, frontend, backend, database, AI layer, integrations, data flow, deployment |
| [docs/database.md](docs/database.md) | Schema, fields, constraints, indexing |
| [docs/api.md](docs/api.md) | Endpoint conventions, request/response shape, error handling, validation |
| [docs/ai.md](docs/ai.md) | Phase 4 AI plans (placeholder — not current work) |
| [docs/roadmap.md](docs/roadmap.md) | Phases, current milestone, completed/in-progress work, next task, future ideas |
| [docs/development.md](docs/development.md) | Testing/code-quality expectations, git workflow, doc workflow, one-hour rule |
| [docs/decisions.md](docs/decisions.md) | Technical decisions with context/reasons/alternatives/tradeoffs |
| [docs/setup.md](docs/setup.md) | Exact install/run/test/lint commands |
| [SESSION_LOG.md](SESSION_LOG.md) | Per-session log — what was done, learned, and what's next |

## Current Phase & Milestone

See [docs/roadmap.md](docs/roadmap.md) for the authoritative, up-to-date status — don't rely on a stale summary here. As of this writing: Phase 1 (Foundation) is substantially complete; current milestone is the start of Phase 2 (`work_entries` schema + Create/View).

## Important Rules

1. Do not implement features outside the current milestone.
2. Do not move to AI functionality until the core journal (Phases 1–3) is complete.
3. Do not introduce new dependencies without explaining why.
4. Prefer simple architecture over unnecessary abstraction.
5. Before making significant architectural changes, explain the tradeoffs.
6. Keep documentation updated when architecture, schema, scope, or API shape changes.
7. Do not rewrite working code unnecessarily.
8. Do not overwrite existing work without inspecting it first.
9. V1 must NOT include: AI agents, RAG/vector databases, GitHub/Jira/Slack/Teams
   integrations, mobile app, browser extension, multi-user support,
   authentication, notifications, complex analytics, or distributed/microservice
   architecture. See [docs/roadmap.md](docs/roadmap.md) (Future Ideas).
10. If a requested feature is outside the current milestone: explain that it's
    out of scope, suggest where it belongs in the roadmap, add it to
    [docs/roadmap.md](docs/roadmap.md)'s Future Ideas if appropriate, and ask
    whether the roadmap should change — do not implement it automatically.

## Development Approach

Work incrementally, one clearly defined task at a time.

Before coding:
1. Read the relevant documentation (see map above).
2. Understand the current milestone.
3. Inspect existing code before modifying it.
4. Explain the implementation approach before significant changes.

While/after coding:
5. Implement the smallest useful change.
6. Avoid unnecessary dependencies, abstractions, and premature optimization.
7. Run tests after implementation.
8. Report what changed and what remains.
9. Update documentation when appropriate.
10. Log the session in [SESSION_LOG.md](SESSION_LOG.md).

## One-Hour Development Rule

The user works on this project for roughly one hour per day:
- 10–15 min: learn/understand a concept.
- 30–40 min: implement one small task.
- 5–10 min: test, document, and log what was learned.

Tasks should be scoped to fit inside one session. At the end of a session,
recommend exactly **one** next task — never a list of unrelated tasks.

## Learning Objective

This is also a learning project, covering (progressively, not all at once):
software architecture, frontend development, backend development, REST APIs,
SQL/PostgreSQL, testing, Git/GitHub, authentication, AI/LLM application
development, prompt engineering, structured AI outputs, RAG, tool calling,
AI evaluation, cloud deployment, CI/CD, observability.

Do not introduce advanced AI concepts before the project reaches the AI phase
(Phase 4) — see [docs/roadmap.md](docs/roadmap.md).
