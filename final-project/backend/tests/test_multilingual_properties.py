"""Property-based tests (Lesson 4) for multilingual invariants."""

from __future__ import annotations

from hypothesis import given
from hypothesis import strategies as st

from app.domain.discovery import ResolvedService, discover
from app.knowledge.knowledge_base import KnowledgeBase

kb = KnowledgeBase.load()

# (English alias, Tamil alias, expected serviceId) drawn from the demo KB.
EQUIVALENT_QUERIES = [
    ("income certificate", "வருமான சான்றிதழ்", "income-certificate"),
    ("income proof", "வருமான சான்று", "income-certificate"),
    ("birth certificate", "பிறப்பு சான்றிதழ்", "birth-certificate"),
    ("street light complaint", "தெரு விளக்கு புகார்", "street-light-complaint"),
]


def _resolved_id(query: str, lang: str) -> str | None:
    r = discover(kb, query, lang)
    return r.service.service_id if isinstance(r, ResolvedService) else None


@given(pair=st.sampled_from(EQUIVALENT_QUERIES))
def test_language_invariant_resolution(pair):
    """Equivalent EN/TA queries must resolve to the same underlying serviceId."""
    en_query, ta_query, expected = pair
    en_id = _resolved_id(en_query, "en")
    ta_id = _resolved_id(ta_query, "ta")
    assert en_id == ta_id == expected


@given(pair=st.sampled_from(EQUIVALENT_QUERIES), ui_lang=st.sampled_from(["en", "ta"]))
def test_response_language_does_not_change_service_identity(pair, ui_lang):
    """Switching the response language must not change the resolved service."""
    en_query, _, expected = pair
    # Same query text, different response language -> same serviceId.
    assert _resolved_id(en_query, ui_lang) == expected


@given(idx=st.integers(min_value=0, max_value=100))
def test_all_records_maintain_localized_invariants(idx):
    """Every served record has both en and ta for required localized fields."""
    records = kb.list_all()
    if not records:
        return
    rec = records[idx % len(records)]
    for lt in (rec.name, rec.description, rec.department):
        assert lt.en.strip() and lt.ta.strip()
