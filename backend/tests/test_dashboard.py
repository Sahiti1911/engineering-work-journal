import pytest
from fastapi.testclient import TestClient

from app import db
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test_journal.db")
    return TestClient(app)


def _create(client, **overrides):
    payload = {
        "entry_date": "2026-01-10",
        "project": "Frontend",
        "title": "Build login page",
        "description": "Implemented OAuth login flow",
        "category": "Feature",
        "impact": None,
        "reference": None,
        "status": "Completed",
    }
    payload.update(overrides)
    client.post("/api/entries", json=payload)


def test_dashboard_summary_empty_database(client):
    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json() == {"by_project": [], "by_category": [], "by_month": []}


def test_dashboard_summary_counts_by_project(client):
    _create(client, project="Frontend")
    _create(client, project="Frontend")
    _create(client, project="Backend")

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json()["by_project"] == [
        {"project": "Backend", "count": 1},
        {"project": "Frontend", "count": 2},
    ]


def test_dashboard_summary_counts_by_category(client):
    _create(client, category="Feature")
    _create(client, category="Bug Fix")
    _create(client, category="Bug Fix")

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json()["by_category"] == [
        {"category": "Bug Fix", "count": 2},
        {"category": "Feature", "count": 1},
    ]


def test_dashboard_summary_counts_by_month(client):
    _create(client, entry_date="2026-01-05")
    _create(client, entry_date="2026-01-25")
    _create(client, entry_date="2026-02-15")

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    assert response.json()["by_month"] == [
        {"month": "2026-01", "count": 2},
        {"month": "2026-02", "count": 1},
    ]


def test_dashboard_summary_aggregates_multiple_entries_correctly(client):
    _create(client, project="Frontend", category="Feature", entry_date="2026-01-10")
    _create(client, project="Frontend", category="Bug Fix", entry_date="2026-01-20")
    _create(client, project="Backend", category="Bug Fix", entry_date="2026-02-15")

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    body = response.json()
    assert body["by_project"] == [
        {"project": "Backend", "count": 1},
        {"project": "Frontend", "count": 2},
    ]
    assert body["by_category"] == [
        {"category": "Bug Fix", "count": 2},
        {"category": "Feature", "count": 1},
    ]
    assert body["by_month"] == [
        {"month": "2026-01", "count": 2},
        {"month": "2026-02", "count": 1},
    ]


def _seed_range_entries(client):
    _create(client, project="Frontend", category="Feature", entry_date="2026-01-10")
    _create(client, project="Backend", category="Bug Fix", entry_date="2026-02-15")
    _create(client, project="Frontend", category="Bug Fix", entry_date="2026-03-20")


def test_dashboard_no_date_filters_preserves_existing_behavior(client):
    _seed_range_entries(client)

    response = client.get("/api/dashboard/summary")

    assert response.status_code == 200
    body = response.json()
    assert sum(row["count"] for row in body["by_project"]) == 3
    assert sum(row["count"] for row in body["by_category"]) == 3
    assert sum(row["count"] for row in body["by_month"]) == 3


def test_dashboard_date_from_only(client):
    _seed_range_entries(client)

    response = client.get("/api/dashboard/summary", params={"date_from": "2026-02-01"})

    assert response.status_code == 200
    body = response.json()
    assert body["by_project"] == [
        {"project": "Backend", "count": 1},
        {"project": "Frontend", "count": 1},
    ]
    assert body["by_category"] == [{"category": "Bug Fix", "count": 2}]
    assert body["by_month"] == [
        {"month": "2026-02", "count": 1},
        {"month": "2026-03", "count": 1},
    ]


def test_dashboard_date_to_only(client):
    _seed_range_entries(client)

    response = client.get("/api/dashboard/summary", params={"date_to": "2026-02-01"})

    assert response.status_code == 200
    body = response.json()
    assert body["by_project"] == [{"project": "Frontend", "count": 1}]
    assert body["by_category"] == [{"category": "Feature", "count": 1}]
    assert body["by_month"] == [{"month": "2026-01", "count": 1}]


def test_dashboard_date_from_and_date_to(client):
    _seed_range_entries(client)

    response = client.get(
        "/api/dashboard/summary",
        params={"date_from": "2026-01-15", "date_to": "2026-03-01"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["by_project"] == [{"project": "Backend", "count": 1}]
    assert body["by_category"] == [{"category": "Bug Fix", "count": 1}]
    assert body["by_month"] == [{"month": "2026-02", "count": 1}]


def test_dashboard_date_range_inclusive_boundaries(client):
    _seed_range_entries(client)

    response = client.get(
        "/api/dashboard/summary",
        params={"date_from": "2026-01-10", "date_to": "2026-03-20"},
    )

    assert response.status_code == 200
    body = response.json()
    assert sum(row["count"] for row in body["by_project"]) == 3
    assert sum(row["count"] for row in body["by_month"]) == 3


def test_dashboard_entries_outside_range_excluded(client):
    _seed_range_entries(client)

    response = client.get(
        "/api/dashboard/summary",
        params={"date_from": "2026-01-11", "date_to": "2026-03-19"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["by_project"] == [{"project": "Backend", "count": 1}]
    assert body["by_month"] == [{"month": "2026-02", "count": 1}]


def test_dashboard_rejects_invalid_date_from(client):
    response = client.get("/api/dashboard/summary", params={"date_from": "not-a-date"})

    assert response.status_code == 422


def test_dashboard_rejects_invalid_date_to(client):
    response = client.get("/api/dashboard/summary", params={"date_to": "not-a-date"})

    assert response.status_code == 422


def test_dashboard_empty_date_range_returns_empty_dashboard(client):
    _seed_range_entries(client)

    response = client.get(
        "/api/dashboard/summary",
        params={"date_from": "2026-06-01", "date_to": "2026-06-30"},
    )

    assert response.status_code == 200
    assert response.json() == {"by_project": [], "by_category": [], "by_month": []}
