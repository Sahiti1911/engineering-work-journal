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
| GET | `/api/dashboard/summary` | counts by project, by category, by month — powers the dashboard; supports `?date_from=`/`?date_to=` to scope it to a date range (the Phase 2 "quarterly view") |
| GET | `/api/quarterly-summary?year=&quarter=` | Phase 3: structured quarterly summary (see requirements.md) |

Implemented so far: `POST /api/entries`, `GET /api/entries` (including `q`/`project`/`category`/`status`/`date_from`/`date_to`, combined with AND), `GET /api/entries/{id}`, `PUT /api/entries/{id}`, `DELETE /api/entries/{id}`, `GET /api/dashboard/summary` (including `date_from`/`date_to`). This completes the Phase 2 backend. Not yet implemented: the quarterly-summary endpoint (Phase 3) and the Vue frontend — planned per [roadmap.md](roadmap.md) phase order.

`GET /api/dashboard/summary` response shape (not otherwise specified in requirements.md, so documenting the choice here): three arrays of small named-field objects, one count per distinct value —

```json
{
  "by_project": [{"project": "Backend", "count": 1}, {"project": "Frontend", "count": 2}],
  "by_category": [{"category": "Bug Fix", "count": 2}, {"category": "Feature", "count": 1}],
  "by_month": [{"month": "2026-01", "count": 2}, {"month": "2026-02", "count": 1}]
}
```

Each array is sorted by its key (project/category/month) for deterministic output — not a user-facing sort feature, just internal ordering. An empty database (or a date range matching no entries) returns all three arrays empty.

`date_from`/`date_to` (both optional, same `date` type/validation as `GET /api/entries`) narrow all three breakdowns to the same inclusive date range: `date_from` only → on/after that date; `date_to` only → on/before that date; both → inclusive range; neither → all-time (unchanged default). This is the Phase 2 "quarterly view" — a date-scoped read of the existing dashboard, not the Phase 3 structured quarterly summary.

## Request/Response Expectations

- Request and response bodies are JSON; `Content-Type: application/json`.
- A created/updated entry is returned in full (including `id`, `created_at`, `updated_at`) so the frontend doesn't need a follow-up GET.
- `PUT` is a full replacement (all fields required, same shape as the create request) — not a partial update.
- `DELETE` returns `204 No Content` with an empty body on success.
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
