"""Test helpers for building valid ServiceRecords to then mutate."""

from __future__ import annotations

from app.domain.models import (
    Channel,
    DataSource,
    DocumentKind,
    DocumentRequirement,
    LocalizedText,
    ServiceCategory,
    ServiceRecord,
    Source,
    Step,
    VerificationStatus,
)


def lt(s: str = "x") -> LocalizedText:
    return LocalizedText(en=s, ta=s)


def valid_record(**overrides) -> ServiceRecord:
    base = dict(
        serviceId="svc-1",
        name=lt("Service"),
        category=ServiceCategory.CERTIFICATE,
        description=lt("A demo service."),
        eligibility=[lt("Anyone")],
        documents=[
            DocumentRequirement(id="d1", name=lt("Doc 1"), kind=DocumentKind.REQUIRED, sourceRef="s1"),
        ],
        steps=[Step(order=1, instruction=lt("Step one"), sourceRef="s1")],
        applicationChannels=[Channel(type="offline", label=lt("Office"))],
        department=lt("Dept"),
        officialSources=[
            Source(
                name="Demo",
                url="https://example.com",
                lastChecked="2026-09-01",
                verificationStatus=VerificationStatus.UNVERIFIED,
            )
        ],
        faqs=[],
        lastVerified="2026-09-01",
        status=VerificationStatus.UNVERIFIED,
        dataSource=DataSource.DEMO,
    )
    base.update(overrides)
    return ServiceRecord(**base)
