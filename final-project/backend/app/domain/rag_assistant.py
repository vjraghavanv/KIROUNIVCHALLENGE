"""Grounded RAG assistant orchestration (rag-assistant spec + ai-rag.md).

Pipeline: retrieve (reuse discovery) -> ground (provider) -> verify (reuse
source_verification) -> grounded response. It never fabricates: if retrieval is
not confident, it returns a safe clarification/unavailable response. Every cited
source must come from the retrieved record.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.ai.provider import NOT_AVAILABLE, Provider
from app.knowledge.knowledge_base import KnowledgeBase

from .discovery import ClarificationRequest, NoMatch, ResolvedService, discover
from .models import (
    DocumentRequirement,
    LocalizedText,
    Source,
    Step,
    VerificationStatus,
)
from .source_verification import verify_service

Lang = str

_ASSISTANT_NOTICE = {
    "en": "This is an informational assistant, not an official government service. Verify on the official source before acting.",
    "ta": "இது ஒரு தகவல் உதவியாளர், அதிகாரப்பூர்வ அரசு சேவை அல்ல. செயல்படுவதற்கு முன் அதிகாரப்பூர்வ ஆதாரத்தில் சரிபார்க்கவும்.",
}
_CLARIFY = {
    "en": "Could you clarify which service you mean?",
    "ta": "நீங்கள் எந்த சேவையைக் குறிப்பிடுகிறீர்கள் என்பதைத் தெளிவுபடுத்த முடியுமா?",
}


class GroundedResponse(BaseModel):
    """A grounded answer or a safe fallback. `grounded=False` means no confident,
    source-backed answer was produced (clarification/unavailable)."""

    kind: str  # "answer" | "clarification" | "no-match"
    grounded: bool
    answer: LocalizedText
    language: Lang
    service_id: str | None = Field(default=None, alias="serviceId")
    service_name: LocalizedText | None = Field(default=None, alias="serviceName")
    documents: list[DocumentRequirement] = Field(default_factory=list)
    steps: list[Step] = Field(default_factory=list)
    sources: list[Source] = Field(default_factory=list)
    verification_status: VerificationStatus | None = Field(
        default=None, alias="verificationStatus"
    )
    is_verified: bool = Field(default=False, alias="isVerified")
    cited_source_refs: list[str] = Field(default_factory=list, alias="citedSourceRefs")
    clarification_options: list[dict] = Field(
        default_factory=list, alias="clarificationOptions"
    )
    notice: LocalizedText

    model_config = {"populate_by_name": True}


def _lang(language: str) -> str:
    return "ta" if language == "ta" else "en"


def ask(
    kb: KnowledgeBase,
    provider: Provider,
    query: str,
    language: str,
    now: date | None = None,
) -> GroundedResponse:
    """Answer a citizen question, grounded strictly in the retrieved record."""
    lang = _lang(language)
    now = now or date.today()
    notice = LocalizedText(en=_ASSISTANT_NOTICE["en"], ta=_ASSISTANT_NOTICE["ta"])

    retrieval = discover(kb, query, lang)

    # No confident retrieval -> safe, non-fabricated fallback.
    if isinstance(retrieval, NoMatch):
        return GroundedResponse(
            kind="no-match",
            grounded=False,
            answer=retrieval.message,
            language=lang,
            notice=notice,
        )

    if isinstance(retrieval, ClarificationRequest):
        return GroundedResponse(
            kind="clarification",
            grounded=False,
            answer=LocalizedText(en=_CLARIFY["en"], ta=_CLARIFY["ta"]),
            language=lang,
            clarificationOptions=[
                {"serviceId": o.service_id, "label": {"en": o.label.en, "ta": o.label.ta}}
                for o in retrieval.options
            ],
            notice=notice,
        )

    assert isinstance(retrieval, ResolvedService)
    service = retrieval.service

    # Ground the phrasing through the provider (from the retrieved record only).
    generated = provider.generate(service, query, lang)

    # Claim/source verification: only cite sources that belong to the retrieved
    # record. This guarantees an answer cannot cite an un-retrieved source.
    retrieved_source_names = {s.name for s in service.official_sources}
    cited = [ref for ref in generated.source_refs if ref in retrieved_source_names]

    assessment = verify_service(service, now)

    # If nothing could be grounded to a source, do not present it as verified and
    # fall back to the safe "unavailable" phrasing.
    if not cited:
        return GroundedResponse(
            kind="answer",
            grounded=False,
            answer=LocalizedText(en=NOT_AVAILABLE["en"], ta=NOT_AVAILABLE["ta"]),
            language=lang,
            serviceId=service.service_id,
            serviceName=service.name,
            documents=service.documents,
            steps=sorted(service.steps, key=lambda s: s.order),
            sources=service.official_sources,
            verificationStatus=service.status,
            isVerified=False,
            citedSourceRefs=[],
            notice=notice,
        )

    return GroundedResponse(
        kind="answer",
        grounded=True,
        answer=LocalizedText(
            en=generated.text if lang == "en" else service.description.en,
            ta=generated.text if lang == "ta" else service.description.ta,
        ),
        language=lang,
        serviceId=service.service_id,
        serviceName=service.name,
        documents=service.documents,
        steps=sorted(service.steps, key=lambda s: s.order),
        sources=service.official_sources,
        verificationStatus=service.status,
        isVerified=assessment.is_verified,
        citedSourceRefs=cited,
        notice=notice,
    )
