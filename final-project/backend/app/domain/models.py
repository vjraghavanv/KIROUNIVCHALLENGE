"""Canonical domain models for Namma Seva AI.

Mirrors shared/CONTRACT.md and .kiro/steering/data-governance.md. These Pydantic
models are the single backend definition of the domain vocabulary; features
consume them rather than redefining shapes.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


Lang = str  # "ta" | "en" — kept permissive at the type level, validated at boundaries


class ServiceCategory(str, Enum):
    CERTIFICATE = "certificate"
    WELFARE_SCHEME = "welfare-scheme"
    PENSION = "pension"
    EDUCATION = "education"
    CIVIC_SERVICE = "civic-service"
    OTHER = "other"


class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    CONDITIONAL = "conditional"
    UNVERIFIED = "unverified"


class DocumentKind(str, Enum):
    REQUIRED = "required"
    CONDITIONAL = "conditional"
    OPTIONAL = "optional"


class DataSource(str, Enum):
    DEMO = "demo"
    OFFICIAL = "official"


class LocalizedText(BaseModel):
    en: str
    ta: str


class Source(BaseModel):
    name: str
    url: str
    published_date: Optional[str] = Field(default=None, alias="publishedDate")
    last_checked: str = Field(alias="lastChecked")
    verification_status: VerificationStatus = Field(alias="verificationStatus")

    model_config = {"populate_by_name": True}


class DocumentRequirement(BaseModel):
    id: str
    name: LocalizedText
    kind: DocumentKind
    condition: Optional[LocalizedText] = None
    reason: Optional[LocalizedText] = None
    source_ref: str = Field(alias="sourceRef")

    model_config = {"populate_by_name": True}


class Step(BaseModel):
    order: int
    instruction: LocalizedText
    source_ref: Optional[str] = Field(default=None, alias="sourceRef")

    model_config = {"populate_by_name": True}


class Channel(BaseModel):
    type: str  # "online" | "offline" | "csc"
    label: LocalizedText
    url: Optional[str] = None


class Faq(BaseModel):
    question: LocalizedText
    answer: LocalizedText


class ServiceRecord(BaseModel):
    service_id: str = Field(alias="serviceId")
    name: LocalizedText
    category: ServiceCategory
    description: LocalizedText
    eligibility: list[LocalizedText] = Field(default_factory=list)
    documents: list[DocumentRequirement] = Field(default_factory=list)
    steps: list[Step] = Field(default_factory=list)
    application_channels: list[Channel] = Field(
        default_factory=list, alias="applicationChannels"
    )
    department: LocalizedText
    official_sources: list[Source] = Field(default_factory=list, alias="officialSources")
    faqs: list[Faq] = Field(default_factory=list)
    last_verified: str = Field(alias="lastVerified")
    status: VerificationStatus
    data_source: DataSource = Field(default=DataSource.DEMO, alias="dataSource")

    model_config = {"populate_by_name": True}


class Readiness(str, Enum):
    READY = "READY"
    NOT_READY = "NOT_READY"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"


class ReadinessResult(BaseModel):
    status: Readiness
    missing_required: list[DocumentRequirement] = Field(
        default_factory=list, alias="missingRequired"
    )
    applicable_conditional_missing: list[DocumentRequirement] = Field(
        default_factory=list, alias="applicableConditionalMissing"
    )
    reasons: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}
