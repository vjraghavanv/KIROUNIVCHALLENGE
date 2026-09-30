"""Integration tests for the FastAPI endpoints (Phase 1 vertical slice)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_categories():
    r = client.get("/categories")
    assert r.status_code == 200
    assert "certificate" in r.json()


def test_list_services():
    r = client.get("/services")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 2
    # All Phase 1 data must be clearly marked demo.
    assert all(item["dataSource"] == "demo" for item in data)


def test_get_service_found():
    r = client.get("/services/income-certificate")
    assert r.status_code == 200
    assert r.json()["serviceId"] == "income-certificate"


def test_get_service_not_found():
    r = client.get("/services/does-not-exist")
    assert r.status_code == 404


def test_discover_resolves_income():
    r = client.post("/discover", json={"query": "income certificate", "language": "en"})
    assert r.status_code == 200
    body = r.json()
    # Should resolve or clarify, never fabricate.
    assert body["kind"] in {"resolved", "clarification"}


def test_discover_no_match():
    r = client.post("/discover", json={"query": "zzzznotathing", "language": "en"})
    assert r.status_code == 200
    assert r.json()["kind"] == "no-match"


def test_checklist_not_ready_when_required_missing():
    r = client.post(
        "/checklist/evaluate",
        json={"serviceId": "birth-certificate", "held": [], "conditionAnswers": {}},
    )
    assert r.status_code == 200
    assert r.json()["status"] in {"NOT_READY", "NEEDS_VERIFICATION"}
