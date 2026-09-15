import sqlite3
from datetime import UTC, date, datetime
from enum import Enum
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from app import db

router = APIRouter(tags=["entries"])


class Category(str, Enum):
    FEATURE = "Feature"
    BUG_FIX = "Bug Fix"
    IMPROVEMENT = "Improvement"
    PERFORMANCE = "Performance"
    SECURITY = "Security"
    DEVOPS = "DevOps"
    INVESTIGATION = "Investigation"
    DOCUMENTATION = "Documentation"
    OTHER = "Other"


class Status(str, Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    BLOCKED = "Blocked"


class WorkEntryCreate(BaseModel):
    entry_date: date
    project: str
    title: str
    description: str | None = None
    category: Category
    impact: str | None = None
    reference: str | None = None
    status: Status


class WorkEntryOut(BaseModel):
    id: int
    entry_date: date
    project: str
    title: str
    description: str | None
    category: Category
    impact: str | None
    reference: str | None
    status: Status
    created_at: datetime
    updated_at: datetime


def get_conn():
    db.init_db()
    conn = db.get_connection()
    try:
        yield conn
    finally:
        conn.close()


Conn = Annotated[sqlite3.Connection, Depends(get_conn)]


def _row_to_entry(row: sqlite3.Row) -> WorkEntryOut:
    return WorkEntryOut(**dict(row))


@router.post("/api/entries", response_model=WorkEntryOut, status_code=201)
def create_entry(entry: WorkEntryCreate, conn: Conn) -> WorkEntryOut:
    now = datetime.now(UTC).isoformat()
    try:
        entry_id = db.insert_entry(
            conn,
            {
                "entry_date": entry.entry_date.isoformat(),
                "project": entry.project,
                "title": entry.title,
                "description": entry.description,
                "category": entry.category.value,
                "impact": entry.impact,
                "reference": entry.reference,
                "status": entry.status.value,
                "created_at": now,
                "updated_at": now,
            },
        )
        row = db.get_entry(conn, entry_id)
    except sqlite3.DatabaseError as exc:
        raise HTTPException(status_code=500, detail="Failed to save work entry") from exc
    return _row_to_entry(row)


@router.get("/api/entries", response_model=list[WorkEntryOut])
def list_entries(
    conn: Conn,
    q: str | None = None,
    project: str | None = None,
    category: Category | None = None,
    status: Status | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[WorkEntryOut]:
    try:
        rows = db.list_entries(
            conn,
            q=q,
            project=project,
            category=category.value if category else None,
            status=status.value if status else None,
            date_from=date_from.isoformat() if date_from else None,
            date_to=date_to.isoformat() if date_to else None,
        )
    except sqlite3.DatabaseError as exc:
        raise HTTPException(status_code=500, detail="Failed to load work entries") from exc
    return [_row_to_entry(row) for row in rows]


@router.get("/api/entries/{entry_id}", response_model=WorkEntryOut)
def get_entry(entry_id: int, conn: Conn) -> WorkEntryOut:
    row = db.get_entry(conn, entry_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Work entry not found")
    return _row_to_entry(row)


@router.put("/api/entries/{entry_id}", response_model=WorkEntryOut)
def update_entry(entry_id: int, entry: WorkEntryCreate, conn: Conn) -> WorkEntryOut:
    existing = db.get_entry(conn, entry_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Work entry not found")

    now = datetime.now(UTC).isoformat()
    try:
        db.update_entry(
            conn,
            entry_id,
            {
                "entry_date": entry.entry_date.isoformat(),
                "project": entry.project,
                "title": entry.title,
                "description": entry.description,
                "category": entry.category.value,
                "impact": entry.impact,
                "reference": entry.reference,
                "status": entry.status.value,
                "updated_at": now,
            },
        )
        row = db.get_entry(conn, entry_id)
    except sqlite3.DatabaseError as exc:
        raise HTTPException(status_code=500, detail="Failed to update work entry") from exc
    return _row_to_entry(row)


@router.delete("/api/entries/{entry_id}", status_code=204)
def delete_entry(entry_id: int, conn: Conn) -> Response:
    existing = db.get_entry(conn, entry_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Work entry not found")

    try:
        db.delete_entry(conn, entry_id)
    except sqlite3.DatabaseError as exc:
        raise HTTPException(status_code=500, detail="Failed to delete work entry") from exc
    return Response(status_code=204)
