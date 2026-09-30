"""Source verification (source-verification spec).

Pure helpers that enforce the trust promise from data-governance.md and
ai-rag.md: distinguish VERIFIED / CONDITIONAL / UNVERIFIED, detect stale
sources, and produce a maintainer-facing report. No model calls; no network.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from .models import DocumentKind, ServiceRecord, Source, VerificationStatus

DEFAULT_FRESHNESS_WINDOW_DAYS = 365


def _parse_iso(d: str) -> date | None:
    try:
        return date.fromisoformat(d.strip())
    except (ValueError, AttributeError):
        return None


def is_stale(source: Source, now: date, window_days: int = DEFAULT_FRESHNESS_WINDOW_DAYS) -> bool:
    """A source is stale if lastChecked is missing/unparseable or older than the window."""
    checked = _parse_iso(source.last_checked)
    if checked is None:
        return True
    return (now - checked).days > window_days


class ServiceVerification(BaseModel):
    service_id: str = Field(alias="serviceId")
    status: VerificationStatus
    is_verified: bool = Field(alias="isVerified")
    stale: bool
    issues: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


def verify_service(
    record: ServiceRecord,
    now: date,
    window_days: int = DEFAULT_FRESHNESS_WINDOW_DAYS,
) -> ServiceVerification:
    """Assess a single record's verification state and freshness.

    Never upgrades a record to verified: a record is treated as verified only if
    its own status is VERIFIED AND it has at least one non-stale source.
    """
    issues: list[str] = []

    if not record.official_sources:
        issues.append("no official source")

    stale = all(is_stale(s, now, window_days) for s in record.official_sources) if record.official_sources else True
    if stale:
        issues.append("all sources stale or undated")

    # Unresolved conditional documents (condition present but nothing else) are noted.
    for doc in record.documents:
        if doc.kind == DocumentKind.CONDITIONAL and doc.condition is None:
            issues.append(f"conditional document '{doc.id}' has no condition")

    # A record is only "verified" for display if it claims VERIFIED and is fresh + sourced.
    is_verified = (
        record.status == VerificationStatus.VERIFIED
        and bool(record.official_sources)
        and not stale
    )

    return ServiceVerification(
        serviceId=record.service_id,
        status=record.status,
        isVerified=is_verified,
        stale=stale,
        issues=issues,
    )


class VerificationReport(BaseModel):
    total: int
    verified: int
    conditional: int
    unverified: int
    services: list[ServiceVerification]

    model_config = {"populate_by_name": True}


def build_report(
    records: list[ServiceRecord],
    now: date,
    window_days: int = DEFAULT_FRESHNESS_WINDOW_DAYS,
) -> VerificationReport:
    """Aggregate verification state across records (feeds the Lesson 3 hook)."""
    assessments = [verify_service(r, now, window_days) for r in records]
    return VerificationReport(
        total=len(assessments),
        verified=sum(1 for a in assessments if a.status == VerificationStatus.VERIFIED),
        conditional=sum(1 for a in assessments if a.status == VerificationStatus.CONDITIONAL),
        unverified=sum(1 for a in assessments if a.status == VerificationStatus.UNVERIFIED),
        services=assessments,
    )
