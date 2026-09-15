import os
import sqlite3
from pathlib import Path

DB_PATH = Path(os.getenv("DB_PATH", Path(__file__).resolve().parent.parent / "journal.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS work_entries (
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
"""


def get_connection(db_path: str | Path | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path or DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str | Path | None = None) -> None:
    conn = get_connection(db_path)
    try:
        conn.execute(SCHEMA)
        conn.commit()
    finally:
        conn.close()


def insert_entry(conn: sqlite3.Connection, entry: dict) -> int:
    cursor = conn.execute(
        """
        INSERT INTO work_entries (
            entry_date, project, title, description, category,
            impact, reference, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            entry["entry_date"],
            entry["project"],
            entry["title"],
            entry["description"],
            entry["category"],
            entry["impact"],
            entry["reference"],
            entry["status"],
            entry["created_at"],
            entry["updated_at"],
        ),
    )
    conn.commit()
    return cursor.lastrowid


def get_entry(conn: sqlite3.Connection, entry_id: int) -> sqlite3.Row | None:
    return conn.execute("SELECT * FROM work_entries WHERE id = ?", (entry_id,)).fetchone()


def list_entries(
    conn: sqlite3.Connection,
    *,
    q: str | None = None,
    project: str | None = None,
    category: str | None = None,
    status: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[sqlite3.Row]:
    clauses = []
    params: list[str] = []

    if q:
        clauses.append("(title LIKE ? OR description LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like])
    if project:
        clauses.append("project = ?")
        params.append(project)
    if category:
        clauses.append("category = ?")
        params.append(category)
    if status:
        clauses.append("status = ?")
        params.append(status)
    if date_from:
        clauses.append("entry_date >= ?")
        params.append(date_from)
    if date_to:
        clauses.append("entry_date <= ?")
        params.append(date_to)

    query = "SELECT * FROM work_entries"
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY entry_date DESC, id DESC"

    return conn.execute(query, params).fetchall()


def update_entry(conn: sqlite3.Connection, entry_id: int, entry: dict) -> None:
    conn.execute(
        """
        UPDATE work_entries
        SET entry_date = ?, project = ?, title = ?, description = ?,
            category = ?, impact = ?, reference = ?, status = ?, updated_at = ?
        WHERE id = ?
        """,
        (
            entry["entry_date"],
            entry["project"],
            entry["title"],
            entry["description"],
            entry["category"],
            entry["impact"],
            entry["reference"],
            entry["status"],
            entry["updated_at"],
            entry_id,
        ),
    )
    conn.commit()


def delete_entry(conn: sqlite3.Connection, entry_id: int) -> None:
    conn.execute("DELETE FROM work_entries WHERE id = ?", (entry_id,))
    conn.commit()


def _date_range_where(date_from: str | None, date_to: str | None) -> tuple[str, list[str]]:
    clauses = []
    params: list[str] = []
    if date_from:
        clauses.append("entry_date >= ?")
        params.append(date_from)
    if date_to:
        clauses.append("entry_date <= ?")
        params.append(date_to)
    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    return where, params


def count_by_project(
    conn: sqlite3.Connection, *, date_from: str | None = None, date_to: str | None = None
) -> list[sqlite3.Row]:
    where, params = _date_range_where(date_from, date_to)
    return conn.execute(
        f"SELECT project, COUNT(*) AS count FROM work_entries{where} GROUP BY project "
        "ORDER BY project",
        params,
    ).fetchall()


def count_by_category(
    conn: sqlite3.Connection, *, date_from: str | None = None, date_to: str | None = None
) -> list[sqlite3.Row]:
    where, params = _date_range_where(date_from, date_to)
    return conn.execute(
        f"SELECT category, COUNT(*) AS count FROM work_entries{where} GROUP BY category "
        "ORDER BY category",
        params,
    ).fetchall()


def count_by_month(
    conn: sqlite3.Connection, *, date_from: str | None = None, date_to: str | None = None
) -> list[sqlite3.Row]:
    where, params = _date_range_where(date_from, date_to)
    return conn.execute(
        f"""
        SELECT strftime('%Y-%m', entry_date) AS month, COUNT(*) AS count
        FROM work_entries{where}
        GROUP BY month
        ORDER BY month
        """,
        params,
    ).fetchall()
