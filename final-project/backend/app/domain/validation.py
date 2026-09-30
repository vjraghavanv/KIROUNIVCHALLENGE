"""Schema/business validation for ServiceRecords.

Encodes the rules from .kiro/steering/data-governance.md. Invalid records are
reported and excluded, never served (official-knowledge-base spec, Req 1.3/7.2).
"""

from __future__ import annotations

from .models import DocumentKind, ServiceRecord, VerificationStatus


def validate_record(record: ServiceRecord) -> list[str]:
    """Return a list of rule violations for a single record (empty == valid)."""
    errors: list[str] = []

    if not record.service_id.strip():
        errors.append("serviceId must be non-empty")

    if not record.official_sources:
        errors.append("record must have at least one official source")

    if not record.official_sources and record.status == VerificationStatus.VERIFIED:
        errors.append("record without a source cannot be verified")

    # Document rules
    seen_names: dict[str, set[DocumentKind]] = {}
    for doc in record.documents:
        seen_names.setdefault(doc.name.en.lower(), set()).add(doc.kind)
        if doc.kind == DocumentKind.CONDITIONAL and doc.condition is None:
            errors.append(f"conditional document '{doc.id}' must include a condition")

    for name, kinds in seen_names.items():
        if DocumentKind.REQUIRED in kinds and DocumentKind.OPTIONAL in kinds:
            errors.append(f"document '{name}' appears as both required and optional")

    # Steps must be 1-based and contiguous
    if record.steps:
        orders = sorted(s.order for s in record.steps)
        expected = list(range(1, len(orders) + 1))
        if orders != expected:
            errors.append("steps must be 1-based and contiguous")

    # Online channels need a URL
    for ch in record.application_channels:
        if ch.type == "online" and not ch.url:
            errors.append("online channel must include a url")

    # Localized required fields
    for field_name, lt in (
        ("name", record.name),
        ("description", record.description),
        ("department", record.department),
    ):
        if not lt.en.strip() or not lt.ta.strip():
            errors.append(f"{field_name} must provide both en and ta")

    return errors


def validate_unique_ids(records: list[ServiceRecord]) -> list[str]:
    """Return violations for duplicate serviceIds across the set."""
    seen: set[str] = set()
    errors: list[str] = []
    for r in records:
        if r.service_id in seen:
            errors.append(f"duplicate serviceId: {r.service_id}")
        seen.add(r.service_id)
    return errors
