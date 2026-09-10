# API

## Conventions

- REST-ish JSON API, all endpoints under `/api/`.
- Plural resource nouns (`/api/entries`), id in the path for single-item operations.
- Timestamps and dates are ISO 8601 strings in both requests and responses.
- List endpoints return a plain JSON array (no pagination envelope) — not needed at personal-journal scale; revisit if that changes.

## Endpoint Structure (V1)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness check — implemented today, foundation phase |
| POST | `/api/entries` | create a work entry |
| GET | `/api/entries` | list; supports `?q=` (search over title/description), `?project=`, `?category=`, `?status=`, `?date_from=`, `?date_to=` (filter) |
| GET | `/api/entries/{id}` | view one entry |
| PUT | `/api/entries/{id}` | edit an entry |
| DELETE | `/api/entries/{id}` | delete an entry |
| GET | `/api/dashboard/summary` | counts by project, by category, by month — powers the dashboard |
| GET | `/api/quarterly-summary?year=&quarter=` | Phase 3: structured quarterly summary (see requirements.md) |

Not yet implemented — planned per [roadmap.md](roadmap.md) phase order.

## Request/Response Expectations

- Request and response bodies are JSON; `Content-Type: application/json`.
- A created/updated entry is returned in full (including `id`, `created_at`, `updated_at`) so the frontend doesn't need a follow-up GET.
- `category` and `status` in requests are validated against the fixed sets in [requirements.md](requirements.md) — same values as the DB `CHECK` constraints in [database.md](database.md).

## Error Handling

- FastAPI/Starlette defaults: `HTTPException` → `{"detail": "<message>"}` JSON body with the matching status code.
- 404 when an entry id doesn't exist (edit/delete/get-one).
- 422 for validation failures (FastAPI's automatic Pydantic validation) — e.g. an invalid `category` or `status` value, missing required field.
- No custom error envelope for V1 — FastAPI's default is sufficient at this scale.

## Validation Approach

- Pydantic models define request/response schemas per endpoint.
- `category`/`status` are modeled as Python `Enum`s mirroring the DB `CHECK` constraints, so an invalid value is rejected before it reaches the database.
- No authentication/authorization to validate — out of scope for V1 (see product-vision.md Non-Goals).
