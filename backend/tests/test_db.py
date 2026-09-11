import sqlite3

from app.db import init_db


def test_init_db_creates_work_entries_table_with_expected_columns(tmp_path):
    db_path = tmp_path / "test_journal.db"

    init_db(db_path)

    conn = sqlite3.connect(db_path)
    try:
        tables = {
            row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
        assert "work_entries" in tables

        columns = {row[1] for row in conn.execute("PRAGMA table_info(work_entries)")}
    finally:
        conn.close()

    assert columns == {
        "id",
        "entry_date",
        "project",
        "title",
        "description",
        "category",
        "impact",
        "reference",
        "status",
        "created_at",
        "updated_at",
    }
