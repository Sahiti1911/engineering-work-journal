# Database

## Database Choice

SQLite (`journal.db`) for now. Single-user, local, no server to install. Planned migration to PostgreSQL later — see [decisions.md](decisions.md) for the rationale and the migration plan.

## Tables

One table for V1 — no relationships yet, so no joins/foreign keys to design.

### `work_entries`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | |
| `entry_date` | TEXT | NOT NULL | ISO 8601 date (`'2026-09-09'`); called `date` in the conceptual model (§ requirements.md), named `entry_date` here to avoid colliding with SQL's `DATE` type/keyword |
| `project` | TEXT | NOT NULL | Freeform text for V1 (see decisions.md) |
| `title` | TEXT | NOT NULL | |
| `description` | TEXT | | Optional |
| `category` | TEXT | NOT NULL, `CHECK (category IN (...))` | Fixed set, see below |
| `impact` | TEXT | | Optional |
| `reference` | TEXT | | Optional PR/ticket reference, e.g. `'PR #284'` |
| `status` | TEXT | NOT NULL, `CHECK (status IN (...))` | Fixed set, see below |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

```sql
CREATE TABLE work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_date TEXT NOT NULL,
    project TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Feature', 'Bug Fix', 'Improvement', 'Performance',
        'Security', 'DevOps', 'Investigation', 'Documentation', 'Other'
    )),
    impact TEXT,
    reference TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'Planned', 'In Progress', 'Completed', 'Blocked'
    )),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## Relationships

None yet — a single flat table. If `project` or `category` later need metadata of their own (owners, colors, archiving), promote them to real tables then; not justified for V1.

## Indexing Considerations

No indexes beyond the implicit primary key for now — at personal-journal scale (low hundreds to low thousands of rows), a full scan for filter/search queries is fast enough. Candidate indexes if it ever gets slow: `entry_date`, `project`, `category`, `status` (whichever filter is actually used most). Don't add these preemptively.

## Important Constraints

- `category` and `status` are enforced via `CHECK` constraints against the fixed sets in [requirements.md](requirements.md), not a separate lookup table — adding a new category/status is a deliberate schema change (migration), not a self-service insert. See [decisions.md](decisions.md) for why.
- All access goes through `backend/app/db.py` — no other module runs raw SQL. This is what keeps the future SQLite → Postgres migration a one-file change.
