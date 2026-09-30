"""Multilingual discovery tests (multilingual-assistant + discovery specs)."""

from __future__ import annotations

from app.domain.discovery import NoMatch, ResolvedService, discover
from app.knowledge.knowledge_base import KnowledgeBase

kb = KnowledgeBase.load()


def _resolved_id(query: str, lang: str) -> str | None:
    r = discover(kb, query, lang)
    return r.service.service_id if isinstance(r, ResolvedService) else None


def test_english_query_resolves_income():
    assert _resolved_id("I need an income certificate", "en") == "income-certificate"


def test_tamil_query_resolves_income():
    assert _resolved_id("எனக்கு வருமான சான்றிதழ் வேண்டும்", "ta") == "income-certificate"


def test_same_intent_same_service_id_across_languages():
    en = _resolved_id("income certificate", "en")
    ta = _resolved_id("வருமான சான்றிதழ்", "ta")
    assert en == ta == "income-certificate"


def test_birth_certificate_both_languages():
    assert _resolved_id("birth certificate", "en") == "birth-certificate"
    assert _resolved_id("பிறப்பு சான்றிதழ்", "ta") == "birth-certificate"


def test_response_language_echoed():
    r = discover(kb, "income certificate", "ta")
    assert r.language == "ta"


def test_unknown_query_no_match():
    r = discover(kb, "zzzznotathing quantum teleporter", "en")
    assert isinstance(r, NoMatch)


def test_resolved_record_has_both_locales():
    r = discover(kb, "income certificate", "en")
    assert isinstance(r, ResolvedService)
    svc = r.service
    assert svc.name.en and svc.name.ta
    assert svc.description.en and svc.description.ta
