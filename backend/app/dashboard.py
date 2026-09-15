from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel

from app import db
from app.entries import Conn

router = APIRouter(tags=["dashboard"])


class ProjectCount(BaseModel):
    project: str
    count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class MonthCount(BaseModel):
    month: str
    count: int


class DashboardSummary(BaseModel):
    by_project: list[ProjectCount]
    by_category: list[CategoryCount]
    by_month: list[MonthCount]


@router.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    conn: Conn,
    date_from: date | None = None,
    date_to: date | None = None,
) -> DashboardSummary:
    date_from_str = date_from.isoformat() if date_from else None
    date_to_str = date_to.isoformat() if date_to else None
    return DashboardSummary(
        by_project=[
            ProjectCount(project=row["project"], count=row["count"])
            for row in db.count_by_project(conn, date_from=date_from_str, date_to=date_to_str)
        ],
        by_category=[
            CategoryCount(category=row["category"], count=row["count"])
            for row in db.count_by_category(conn, date_from=date_from_str, date_to=date_to_str)
        ],
        by_month=[
            MonthCount(month=row["month"], count=row["count"])
            for row in db.count_by_month(conn, date_from=date_from_str, date_to=date_to_str)
        ],
    )
