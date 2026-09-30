"""Property-based tests (Lesson 4) for RAG grounding invariants."""

from __future__ import annotations

from datetime import date

from hypothesis import given
from hypothesis import strategies as st

from app.ai.provider import MockProvider
from app.domain.rag_assistant import ask
from app.knowledge.knowledge_base import KnowledgeBase

kb = KnowledgeBase.load()
provider = MockProvider()
NOW = date(2026, 9, 28)

# Queries that should confidently resolve to a known service in the demo KB.
GROUNDED_QUERIES = [
    ("income certificate", "en", "income-certificate"),
    ("வருமான சான்றிதழ்", "ta", "income-certificate"),
    ("birth certificate", "en", "birth-certificate"),
    ("பிறப்பு சான்றிதழ்", "ta", "birth-certificate"),
    ("street light complaint", "en", "street-light-complaint"),
]

_ALL_SOURCE_NAMES = {
    s.name for rec in kb.list_all() for s in rec.official_sources
}


@given(pair=st.sampled_from(GROUNDED_QUERIES))
def test_answer_never_cites_unretrieved_source(pair):
    query, lang, expected_id = pair
    r = ask(kb, provider, query, lang, now=NOW)
    retrieved = kb.get_by_id(expected_id)
    assert retrieved is not None
    allowed = {s.name for s in retrieved.official_sources}
    # Every cited source must belong to the retrieved record.
    assert set(r.cited_source_refs).issubset(allowed)


@given(pair=st.sampled_from(GROUNDED_QUERIES))
def test_ungrounded_never_marked_verified(pair):
    query, lang, _ = pair
    r = ask(kb, provider, query, lang, now=NOW)
    # All demo records are unverified/conditional -> is_verified must be False.
    if not r.grounded:
        assert r.is_verified is False
    else:
        # Even grounded demo answers cannot be "verified" (demo/unverified data).
        assert r.is_verified is False


@given(pair=st.sampled_from(GROUNDED_QUERIES))
def test_resolved_service_is_valid_kb_reference(pair):
    query, lang, expected_id = pair
    r = ask(kb, provider, query, lang, now=NOW)
    if r.service_id is not None:
        assert kb.get_by_id(r.service_id) is not None


@given(pair=st.sampled_from(GROUNDED_QUERIES), ui_lang=st.sampled_from(["en", "ta"]))
def test_language_does_not_return_unrelated_service(pair, ui_lang):
    query, _, expected_id = pair
    # Regardless of the response language chosen, the same query text must not
    # resolve to a different, unrelated service.
    r = ask(kb, provider, query, ui_lang, now=NOW)
    if r.service_id is not None:
        assert r.service_id == expected_id


@given(pair=st.sampled_from(GROUNDED_QUERIES))
def test_cited_refs_are_globally_known_sources(pair):
    query, lang, _ = pair
    r = ask(kb, provider, query, lang, now=NOW)
    assert set(r.cited_source_refs).issubset(_ALL_SOURCE_NAMES)
