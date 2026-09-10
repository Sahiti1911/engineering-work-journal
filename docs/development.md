# Development

## Local Development Process

Exact install/run/test/lint commands live in [setup.md](setup.md) — this doc covers process and expectations, not commands, so they don't drift out of sync.

## Testing Expectations

- Every new endpoint or component gets at least one test before the task is considered done.
- Run the relevant test suite (`pytest` backend, `vitest` frontend) before reporting a task complete.
- At MVP scale, aim for the happy path plus one meaningful edge case (e.g. a 404 on an unknown id) — not exhaustive coverage.

## Code Quality Expectations

- Backend: `ruff check` and `ruff format` clean before a task is done.
- Frontend: `eslint` and `prettier` clean before a task is done.
- No new dependency without stating why (CLAUDE.md rule) — prefer the standard library or an already-installed package first.
- No new abstraction (base classes, interfaces, config layers) unless the current task actually needs it.

## Git Workflow

- Small, incremental commits, one completed task per commit — don't mix unrelated changes.
- Commit only when explicitly asked.
- Never force-push, rebase interactively, or skip hooks without being asked.

## Documentation Workflow

- Update the relevant doc(s) in the same session as any change that affects architecture, schema, API shape, or scope — not as a separate later cleanup pass.
- Avoid duplicating the same fact across multiple docs — link instead (see how [roadmap.md](roadmap.md), [requirements.md](requirements.md), and [database.md](database.md) cross-reference each other).
- Log every session in [SESSION_LOG.md](../SESSION_LOG.md), even a short one.

## One-Hour-Per-Day Development Approach

Recommended session shape:
- **10–15 min** — learn/understand a concept relevant to the current task.
- **30–40 min** — implement one small task.
- **5–10 min** — test, document, and log the session.

Tasks should be scoped to fit inside one session. At the end of a session, exactly one next task is recommended — not a list of unrelated tasks.
