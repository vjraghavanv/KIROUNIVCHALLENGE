"""Provider abstraction (ai-rag.md, rag-assistant spec).

Phase 1 ships only the deterministic MockProvider. BedrockProvider is NOT a
required dependency yet; it can be added later behind this same interface
without changing callers.
"""

from __future__ import annotations

from typing import Protocol

from app.domain.models import ServiceRecord


class GroundedAnswer:
    def __init__(self, text: str, source_refs: list[str]) -> None:
        self.text = text
        self.source_refs = source_refs


class Provider(Protocol):
    def generate(self, service: ServiceRecord, question: str, language: str) -> GroundedAnswer:
        ...


class MockProvider:
    """Deterministic, offline. Composes answers ONLY from the grounded record.

    It never invents facts: if the record lacks the information, it returns the
    standard "not available" phrasing from ai-rag.md.
    """

    NOT_AVAILABLE = {
        "en": "Official information not available in the current knowledge base.",
        "ta": "தற்போதைய அறிவுத் தளத்தில் அதிகாரப்பூர்வ தகவல் இல்லை.",
    }

    def generate(self, service: ServiceRecord, question: str, language: str) -> GroundedAnswer:
        lang = "ta" if language == "ta" else "en"
        desc = service.description.ta if lang == "ta" else service.description.en
        if not desc:
            return GroundedAnswer(self.NOT_AVAILABLE[lang], [])
        source_refs = [s.name for s in service.official_sources]
        return GroundedAnswer(desc, source_refs)
