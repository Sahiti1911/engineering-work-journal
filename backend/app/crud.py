from datetime import datetime, timezone

from app.database import get_connection
from app.models import EntryCreate


def create_entry(entry: EntryCreate) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO entries (title, body, work_date, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (entry.title, entry.body, entry.work_date, entry.tags, now, now),
        )
        conn.commit()
        return get_entry(cursor.lastrowid, conn)
    finally:
        conn.close()


def get_entry(entry_id: int, conn=None) -> dict | None:
    owns_conn = conn is None
    conn = conn or get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM entries WHERE id = ?", (entry_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        if owns_conn:
            conn.close()


def list_entries() -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM entries ORDER BY work_date DESC, id DESC"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
