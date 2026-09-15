import pytest
from fastapi.testclient import TestClient

from app import db
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test_journal.db")
    return TestClient(app)


def _valid_payload(**overrides):
    payload = {
        "entry_date": "2026-09-11",
        "project": "AI Governance",
        "title": "Implemented risk filtering for user activity",
        "description": "Implemented risk filtering in the Recent Activity section.",
        "category": "Feature",
        "impact": "Improves visibility into potentially risky AI interactions.",
        "reference": "PR #284",
        "status": "Completed",
    }
    payload.update(overrides)
    return payload


def test_create_entry_returns_created_entry(client):
    response = client.post("/api/entries", json=_valid_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["id"] > 0
    assert body["entry_date"] == "2026-09-11"
    assert body["project"] == "AI Governance"
    assert body["title"] == "Implemented risk filtering for user activity"
    assert body["category"] == "Feature"
    assert body["status"] == "Completed"
    assert body["reference"] == "PR #284"
    assert body["created_at"]
    assert body["updated_at"]


def test_list_entries_returns_created_entry(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.get("/api/entries")

    assert response.status_code == 200
    entries = response.json()
    assert len(entries) == 1
    assert entries[0] == created


def test_create_entry_rejects_invalid_category(client):
    response = client.post("/api/entries", json=_valid_payload(category="Not A Category"))

    assert response.status_code == 422


def test_create_entry_rejects_invalid_status(client):
    response = client.post("/api/entries", json=_valid_payload(status="Not A Status"))

    assert response.status_code == 422


def test_get_entry_returns_existing_entry(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.get(f"/api/entries/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_get_entry_for_nonexistent_id_returns_404(client):
    response = client.get("/api/entries/999")

    assert response.status_code == 404


def _updated_payload(**overrides):
    payload = {
        "entry_date": "2026-09-12",
        "project": "Platform",
        "title": "Fixed flaky deploy pipeline",
        "description": "Root-caused and fixed the intermittent deploy failure.",
        "category": "Bug Fix",
        "impact": "Deploys are now reliable.",
        "reference": "PR #301",
        "status": "In Progress",
    }
    payload.update(overrides)
    return payload


def test_update_entry_returns_updated_entry(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.put(f"/api/entries/{created['id']}", json=_updated_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == created["id"]
    assert body["title"] == "Fixed flaky deploy pipeline"
    assert body["created_at"] == created["created_at"]
    assert body["updated_at"] != created["updated_at"]


def test_update_entry_updates_all_fields(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.put(f"/api/entries/{created['id']}", json=_updated_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["entry_date"] == "2026-09-12"
    assert body["project"] == "Platform"
    assert body["title"] == "Fixed flaky deploy pipeline"
    assert body["description"] == "Root-caused and fixed the intermittent deploy failure."
    assert body["category"] == "Bug Fix"
    assert body["impact"] == "Deploys are now reliable."
    assert body["reference"] == "PR #301"
    assert body["status"] == "In Progress"


def test_update_entry_rejects_invalid_category(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.put(
        f"/api/entries/{created['id']}", json=_updated_payload(category="Not A Category")
    )

    assert response.status_code == 422


def test_update_entry_rejects_invalid_status(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.put(
        f"/api/entries/{created['id']}", json=_updated_payload(status="Not A Status")
    )

    assert response.status_code == 422


def test_update_entry_for_nonexistent_id_returns_404(client):
    response = client.put("/api/entries/999", json=_updated_payload())

    assert response.status_code == 404


def test_delete_entry_succeeds(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    response = client.delete(f"/api/entries/{created['id']}")

    assert response.status_code == 204


def test_delete_entry_for_nonexistent_id_returns_404(client):
    response = client.delete("/api/entries/999")

    assert response.status_code == 404


def test_deleted_entry_not_returned_in_list(client):
    created = client.post("/api/entries", json=_valid_payload()).json()

    client.delete(f"/api/entries/{created['id']}")
    response = client.get("/api/entries")

    assert response.status_code == 200
    assert response.json() == []


def _seed_entries(client):
    client.post(
        "/api/entries",
        json=_valid_payload(
            entry_date="2026-01-10",
            project="Frontend",
            title="Build login page",
            description="Implemented OAuth login flow",
            category="Feature",
            status="Completed",
        ),
    )
    client.post(
        "/api/entries",
        json=_valid_payload(
            entry_date="2026-02-15",
            project="Backend",
            title="Fix pagination bug",
            description="Investigated off-by-one error in pagination",
            category="Bug Fix",
            status="In Progress",
        ),
    )
    client.post(
        "/api/entries",
        json=_valid_payload(
            entry_date="2026-03-20",
            project="Frontend",
            title="Fix CSS overflow",
            description="Resolved overflow issue on mobile viewport",
            category="Bug Fix",
            status="Completed",
        ),
    )


def test_search_by_q(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"q": "login"})

    assert response.status_code == 200
    titles = [entry["title"] for entry in response.json()]
    assert titles == ["Build login page"]


def test_search_with_no_matches_returns_empty_list(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"q": "does-not-exist"})

    assert response.status_code == 200
    assert response.json() == []


def test_filter_by_project(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"project": "Frontend"})

    assert response.status_code == 200
    titles = {entry["title"] for entry in response.json()}
    assert titles == {"Build login page", "Fix CSS overflow"}


def test_filter_by_category(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"category": "Bug Fix"})

    assert response.status_code == 200
    titles = {entry["title"] for entry in response.json()}
    assert titles == {"Fix pagination bug", "Fix CSS overflow"}


def test_filter_by_status(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"status": "Completed"})

    assert response.status_code == 200
    titles = {entry["title"] for entry in response.json()}
    assert titles == {"Build login page", "Fix CSS overflow"}


def test_filter_by_date_from(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"date_from": "2026-02-01"})

    assert response.status_code == 200
    titles = {entry["title"] for entry in response.json()}
    assert titles == {"Fix pagination bug", "Fix CSS overflow"}


def test_filter_by_date_to(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"date_to": "2026-02-01"})

    assert response.status_code == 200
    titles = [entry["title"] for entry in response.json()]
    assert titles == ["Build login page"]


def test_multiple_filters_combine_with_and(client):
    _seed_entries(client)

    response = client.get("/api/entries", params={"project": "Frontend", "category": "Bug Fix"})

    assert response.status_code == 200
    titles = [entry["title"] for entry in response.json()]
    assert titles == ["Fix CSS overflow"]


def test_no_filters_returns_all_entries(client):
    _seed_entries(client)

    response = client.get("/api/entries")

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_filter_rejects_invalid_category(client):
    response = client.get("/api/entries", params={"category": "Not A Category"})

    assert response.status_code == 422


def test_filter_rejects_invalid_status(client):
    response = client.get("/api/entries", params={"status": "Not A Status"})

    assert response.status_code == 422


def test_filter_rejects_invalid_date(client):
    response = client.get("/api/entries", params={"date_from": "not-a-date"})

    assert response.status_code == 422
