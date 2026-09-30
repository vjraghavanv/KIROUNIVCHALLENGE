"""RAG assistant example tests (rag-assistant spec + ai-rag.md)."""

from __future__ import annotations

from datetime import date

from fastapi.testclient import TestClient

from app.ai.provider import BedrockProvider, MockProvider, get_provider
from app.domain.rag_assistant import ask
from app.knowledge.knowledge_base import KnowledgeBase
from app.main import app

kb = KnowledgeBase.load()
provider = MockProvider()
NOW = date(2026, 9, 28)
client = TestClient(app)


def test_english_query_grounds_to_income():
    r = ask(kb, provider, "I need an income certificate", "en", now=NOW)
    assert r.service_id == "income-certificate"
    assert r.answer.en.strip()


def test_tamil_query_grounds_to_income():
    r = ask(kb, provider, "எனக்கு வருமான சான்றிதழ் வேண்டும்", "ta", now=NOW)
    assert r.service_id == "income-certificate"
    assert r.answer.ta.strip()


def test_grounded_response_carries_documents_steps_sources():
    r = ask(kb, provider, "income certificate", "en", now=NOW)
    assert r.kind == "answer"
    assert r.grounded is True
    assert len(r.documents) >= 1
    assert len(r.steps) >= 1
    assert len(r.sources) >= 1


def test_cited_sources_are_subset_of_retrieved_record():
    r = ask(kb, provider, "income certificate", "en", now=NOW)
    retrieved = kb.get_by_id("income-certificate")
    assert retrieved is not None
    allowed = {s.name for s in retrieved.official_sources}
    assert set(r.cited_source_refs).issubset(allowed)


def test_demo_unverified_service_not_marked_verified():
    r = ask(kb, provider, "income certificate", "en", now=NOW)
    # income-certificate is demo/unverified -> must not be reported verified.
    assert r.is_verified is False


def test_conditional_service_status_surfaced():
    r = ask(kb, provider, "street light complaint", "en", now=NOW)
    assert r.service_id == "street-light-complaint"
    assert r.verification_status is not None
    assert r.is_verified is False


def test_no_match_returns_safe_fallback():
    r = ask(kb, provider, "quantum teleporter warp drive", "en", now=NOW)
    assert r.kind == "no-match"
    assert r.grounded is False
    assert r.cited_source_refs == []


def test_steps_are_ordered():
    r = ask(kb, provider, "income certificate", "en", now=NOW)
    orders = [s.order for s in r.steps]
    assert orders == sorted(orders)


def test_provider_factory_defaults_to_mock():
    assert isinstance(get_provider(), MockProvider)


def test_bedrock_provider_is_boundary_only():
    # The boundary must not silently pretend to work.
    svc = kb.get_by_id("income-certificate")
    assert svc is not None
    try:
        BedrockProvider().generate(svc, "q", "en")
        assert False, "BedrockProvider should not generate in this phase"
    except NotImplementedError:
        pass


def test_ask_endpoint_english():
    res = client.post("/ask", json={"query": "income certificate", "language": "en"})
    assert res.status_code == 200
    body = res.json()
    assert body["kind"] == "answer"
    assert body["serviceId"] == "income-certificate"
    assert body["isVerified"] is False
    assert "notice" in body


def test_ask_endpoint_tamil():
    res = client.post("/ask", json={"query": "வருமான சான்றிதழ்", "language": "ta"})
    assert res.status_code == 200
    assert res.json()["serviceId"] == "income-certificate"


def test_existing_endpoints_still_work():
    assert client.get("/health").status_code == 200
    assert client.get("/services").status_code == 200
    assert client.post("/discover", json={"query": "income", "language": "en"}).status_code == 200
