"""Schema/business validation tests (official-knowledge-base spec)."""

from __future__ import annotations

from app.domain.models import (
    Channel,
    DocumentKind,
    DocumentRequirement,
    LocalizedText,
    Source,
    Step,
    VerificationStatus,
)
from app.domain.validation import validate_record, validate_unique_ids

from .factories import lt, valid_record


def test_valid_record_has_no_errors():
    assert validate_record(valid_record()) == []


def test_missing_service_id_rejected():
    errors = validate_record(valid_record(serviceId="  "))
    assert any("serviceId" in e for e in errors)


def test_duplicate_service_ids_rejected():
    a = valid_record(serviceId="dup")
    b = valid_record(serviceId="dup")
    errors = validate_unique_ids([a, b])
    assert any("duplicate serviceId" in e for e in errors)


def test_missing_official_source_rejected():
    errors = validate_record(valid_record(officialSources=[]))
    assert any("at least one official source" in e for e in errors)


def test_verified_without_source_rejected():
    errors = validate_record(
        valid_record(officialSources=[], status=VerificationStatus.VERIFIED)
    )
    assert any("cannot be verified" in e for e in errors)


def test_localized_field_missing_locale_rejected():
    errors = validate_record(valid_record(name=LocalizedText(en="Only EN", ta="  ")))
    assert any("name must provide both en and ta" in e for e in errors)


def test_conditional_document_without_condition_rejected():
    doc = DocumentRequirement(id="c1", name=lt("Cond"), kind=DocumentKind.CONDITIONAL, sourceRef="s1")
    errors = validate_record(valid_record(documents=[doc]))
    assert any("must include a condition" in e for e in errors)


def test_document_required_and_optional_clash_rejected():
    docs = [
        DocumentRequirement(id="a", name=lt("Same"), kind=DocumentKind.REQUIRED, sourceRef="s1"),
        DocumentRequirement(id="b", name=lt("Same"), kind=DocumentKind.OPTIONAL, sourceRef="s1"),
    ]
    errors = validate_record(valid_record(documents=docs))
    assert any("both required and optional" in e for e in errors)


def test_duplicate_document_id_rejected():
    docs = [
        DocumentRequirement(id="dup", name=lt("A"), kind=DocumentKind.REQUIRED, sourceRef="s1"),
        DocumentRequirement(id="dup", name=lt("B"), kind=DocumentKind.OPTIONAL, sourceRef="s1"),
    ]
    errors = validate_record(valid_record(documents=docs))
    assert any("duplicate document id" in e for e in errors)


def test_non_contiguous_steps_rejected():
    steps = [
        Step(order=1, instruction=lt("one")),
        Step(order=3, instruction=lt("three")),
    ]
    errors = validate_record(valid_record(steps=steps))
    assert any("contiguous" in e for e in errors)


def test_duplicate_step_orders_rejected():
    steps = [
        Step(order=1, instruction=lt("one")),
        Step(order=1, instruction=lt("dup")),
    ]
    errors = validate_record(valid_record(steps=steps))
    assert any("unique" in e for e in errors)


def test_online_channel_without_url_rejected():
    ch = Channel(type="online", label=lt("Portal"))
    errors = validate_record(valid_record(applicationChannels=[ch]))
    assert any("online channel must include a url" in e for e in errors)


def test_source_missing_last_checked_rejected():
    src = Source(name="X", url="https://e.com", lastChecked="  ", verificationStatus=VerificationStatus.UNVERIFIED)
    errors = validate_record(valid_record(officialSources=[src]))
    assert any("lastChecked" in e for e in errors)
