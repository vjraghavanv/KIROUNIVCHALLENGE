"""Provider abstraction (ai-rag.md, rag-assistant spec).

The application depends only on the `Provider` interface. `MockProvider` is the
deterministic, offline default used for local dev, tests, and the demo.
`BedrockProvider` is a boundary/stub: it is selected only by explicit
configuration and, if unavailable, the factory falls back to MockProvider. The
app never requires live AWS access.
"""

from __future__ import annotations

import os
from typing import Protocol

from app.domain.models import ServiceRecord


class GroundedAnswer:
    def __init__(self, text: str, source_refs: list[str]) -> None:
        self.text = text
        self.source_refs = source_refs


class Provider(Protocol):
    def generate(self, service: ServiceRecord, question: str, language: str) -> GroundedAnswer:
        ...


NOT_AVAILABLE = {
    "en": "Official information not available in the current knowledge base.",
    "ta": "தற்போதைய அறிவுத் தளத்தில் அதிகாரப்பூர்வ தகவல் இல்லை.",
}


def _lang(language: str) -> str:
    return "ta" if language == "ta" else "en"


class MockProvider:
    """Deterministic, offline. Composes answers ONLY from the grounded record.

    Never invents facts: if the record lacks the information, it returns the
    standard "not available" phrasing from ai-rag.md.
    """

    name = "mock"

    def generate(self, service: ServiceRecord, question: str, language: str) -> GroundedAnswer:
        lang = _lang(language)
        desc = service.description.ta if lang == "ta" else service.description.en
        if not desc:
            return GroundedAnswer(NOT_AVAILABLE[lang], [])
        source_refs = [s.name for s in service.official_sources]
        return GroundedAnswer(desc, source_refs)


class BedrockProvider:
    """Amazon Bedrock boundary (NOT wired to live AWS in this phase).

    This exists so the production path has a home behind the same interface. It
    reads configuration from the environment only (never hardcoded credentials).
    In this phase it deliberately raises if invoked, so the factory falls back to
    MockProvider and tests never require AWS. Real generation is deferred.
    """

    name = "bedrock"

    def __init__(self) -> None:
        # Config is read from the environment only; no secrets in source.
        self.region = os.environ.get("AWS_REGION")
        self.model_id = os.environ.get("NSA_BEDROCK_MODEL_ID")

    def generate(self, service: ServiceRecord, question: str, language: str) -> GroundedAnswer:
        raise NotImplementedError(
            "BedrockProvider is a boundary stub in this phase; live generation is "
            "not enabled. Configure and implement before enabling NSA_PROVIDER=bedrock."
        )


def get_provider() -> Provider:
    """Select a provider from config. Defaults to MockProvider.

    NSA_PROVIDER=bedrock selects the Bedrock boundary, but if it cannot be
    constructed we fall back to MockProvider so the app keeps working offline.
    """
    choice = os.environ.get("NSA_PROVIDER", "mock").strip().lower()
    if choice == "bedrock":
        try:
            return BedrockProvider()
        except Exception:
            return MockProvider()
    return MockProvider()
