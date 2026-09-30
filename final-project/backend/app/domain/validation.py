"""Schema/business validation for ServiceRecords.

Encodes the rules from .kiro/steering/data-governance.md and the
official-knowledge-base spec. Invalid records are reported and excluded, never
served (Req 1.3 / 7.2).
"""

from __future__ import annotations

from .models import (
    Channel,
    DocumentKind,
    DocumentRequirement,
    LocalizedText,
    ServiceRecord,
    Step,
    VerificationStatus,
)

_VALID_STATUSES = {s.value for s in VerificationStatus}
_VALID_DOC_KINDS = {k.value for k in DocumentKind}
_VALID_CHANNEL_TYPES = {"online", "offline", "csc"}


def _localized_ok(lt: LocalizedText) -> bool:
    return bool(lt.en.strip()) and bool(lt.ta.strip())


def _validate_documents(record: ServiceRecord, errors: list[str]) -> None:
    seen_names: dict[str, set[DocumentKind]] = {}
    seen_ids: set[str] = set()

    doc: DocumentRequirement
    for doc in record.documents:
        # Document id integrity
        if not doc.id.strip():
            errors.append("document has an empty id")
        elif doc.id in seen_ids:
            errors.append(f"duplicate document id '{doc.id}'")
        seen_ids.add(doc.id)

        # Kind must be a supported value (enum guards this, but be explicit)
        if doc.kind.value not in _VALID_DOC_KINDS:
            errors.append(f"document '{doc.id}' has unsupported kind '{doc.kind}'")

        # Localized name required
        if not _localized_ok(doc.name):
            errors.append(f"document '{doc.id}' name must provide both en and ta")

        # Conditional docs need a non-empty localized condition
        if doc.kind == DocumentKind.CONDITIONAL:
            if doc.condition is None:
                errors.append(f"conditional document '{doc.id}' must include a condition")
            elif not _localized_ok(doc.condition):
                errors.append(
                    f"conditional document '{doc.id}' condition must provide both en and ta"
                )

        seen_names.setdefault(doc.name.en.strip().lower(), set()).add(doc.kind)

    for name, kinds in seen_names.items():
        if DocumentKind.REQUIRED in kinds and DocumentKind.OPTIONAL in kinds:
            errors.append(f"document '{name}' appears as both required and optional")


def _validate_steps(record: ServiceRecord, errors: list[str]) -> None:
    if not record.steps:
        return
    step: Step
    orders = [s.order for s in record.steps]
    if any(o <= 0 for o in orders):
        errors.append("step orders must be positive (1-based)")
    if len(set(orders)) != len(orders):
        errors.append("step orders must be unique")
    if sorted(orders) != list(range(1, len(orders) + 1)):
        errors.append("steps must be 1-based and contiguous")
    for step in record.steps:
        if not _localized_ok(step.instruction):
            errors.append(f"step {step.order} instruction must provide both en and ta")


def _validate_channels(record: ServiceRecord, errors: list[str]) -> None:
    ch: Channel
    for ch in record.application_channels:
        if ch.type not in _VALID_CHANNEL_TYPES:
            errors.append(f"channel has unsupported type '{ch.type}'")
        if ch.type == "online" and not ch.url:
            errors.append("online channel must include a url")


def _validate_sources(record: ServiceRecord, errors: list[str]) -> None:
    if not record.official_sources:
        errors.append("record must have at least one official source")
        if record.status == VerificationStatus.VERIFIED:
            errors.append("record without a source cannot be verified")
        return
    for src in record.official_sources:
        if not src.name.strip():
            errors.append("official source must have a name")
        if not src.url.strip():
            errors.append("official source must have a url/reference")
        if not src.last_checked.strip():
            errors.append("official source must have a lastChecked date")
        if src.verification_status.value not in _VALID_STATUSES:
            errors.append(
                f"source has unsupported verificationStatus '{src.verification_status}'"
            )


def validate_record(record: ServiceRecord) -> list[str]:
    """Return a list of rule violations for a single record (empty == valid)."""
    errors: list[str] = []

    if not record.service_id.strip():
        errors.append("serviceId must be non-empty")

    # Unsupported verification state on the record itself
    if record.status.value not in _VALID_STATUSES:
        errors.append(f"unsupported verification status '{record.status}'")

    _validate_sources(record, errors)
    _validate_documents(record, errors)
    _validate_steps(record, errors)
    _validate_channels(record, errors)

    # Localized required top-level fields
    for field_name, lt in (
        ("name", record.name),
        ("description", record.description),
        ("department", record.department),
    ):
        if not _localized_ok(lt):
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
