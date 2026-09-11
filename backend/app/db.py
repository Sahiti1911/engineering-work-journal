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
