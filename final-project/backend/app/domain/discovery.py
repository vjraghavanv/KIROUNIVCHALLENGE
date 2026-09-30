"""Government Service Discovery (government-service-discovery spec).

Resolves a query to one of: resolved service / clarification / no-match.
Deterministic, KB-grounded ranking (MockProvider path). Never fabricates a
service.
"""

from __future__ import annotations

from typing import Literal, Optional, Union

from pydantic import BaseModel, Field

from app.knowledge.knowledge_base import KnowledgeBase

from .models import LocalizedText, ServiceRecord

Lang = str
CONFIDENCE_THRESHOLD = 0.3


class ResolvedService(BaseModel):
    kind: Literal["resolved"] = "resolved"
    service: ServiceRecord
    confidence: float
    language: Lang


class ClarificationOption(BaseModel):
    service_id: str = Field(alias="serviceId")
    label: LocalizedText

    model_config = {"populate_by_name": True}


class ClarificationRequest(BaseModel):
    kind: Literal["clarification"] = "clarification"
    question: LocalizedText
    options: list[ClarificationOption]
    original_query: str = Field(alias="originalQuery")
    language: Lang

    model_config = {"populate_by_name": True}


class NoMatch(BaseModel):
    kind: Literal["no-match"] = "no-match"
    message: LocalizedText
    language: Lang


DiscoveryResult = Union[ResolvedService, ClarificationRequest, NoMatch]


def _score(record: ServiceRecord, term: str) -> float:
    """Field-weighted match score in [0, 1]. Name > category > description."""
    t = term.strip().lower()
    if not t:
        return 0.0
    tokens = [tok for tok in t.split() if tok]
    if not tokens:
        return 0.0

    name = f"{record.name.en} {record.name.ta}".lower()
    desc = f"{record.description.en} {record.description.ta}".lower()
    category = record.category.value.lower()

    hits = 0.0
    for tok in tokens:
        if tok in name:
            hits += 1.0
        elif tok in category:
            hits += 0.6
        elif tok in desc:
            hits += 0.4
    return min(hits / len(tokens), 1.0)


def discover(kb: KnowledgeBase, query: str, language: Lang) -> DiscoveryResult:
    scored = [
        (rec, _score(rec, query)) for rec in kb.list_all()
    ]
    above = [(rec, s) for rec, s in scored if s >= CONFIDENCE_THRESHOLD]
    above.sort(key=lambda pair: pair[1], reverse=True)

    if len(above) == 1:
        rec, s = above[0]
        return ResolvedService(service=rec, confidence=round(s, 3), language=language)

    if len(above) >= 2:
        # Ties / multiple candidates => clarify rather than guess.
        top = above[0][1]
        contenders = [rec for rec, s in above if abs(s - top) < 1e-9] or [
            rec for rec, _ in above
        ]
        if len(contenders) == 1:
            rec = contenders[0]
            return ResolvedService(
                service=rec, confidence=round(above[0][1], 3), language=language
            )
        return ClarificationRequest(
            question=LocalizedText(
                en="Which service did you mean?",
                ta="நீங்கள் எந்த சேவையைக் குறிப்பிடுகிறீர்கள்?",
            ),
            options=[
                ClarificationOption(serviceId=rec.service_id, label=rec.name)
                for rec, _ in above
            ],
            originalQuery=query,
            language=language,
        )

    return NoMatch(
        message=LocalizedText(
            en="No confident match was found. Try rephrasing or browse by category.",
            ta="உறுதியான பொருத்தம் கிடைக்கவில்லை. மறுபடியும் முயற்சிக்கவும் அல்லது வகை வாரியாகப் பார்க்கவும்.",
        ),
        language=language,
    )
