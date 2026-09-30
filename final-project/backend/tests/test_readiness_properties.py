"""Property-based tests (Lesson 4) for readiness invariants.

These assert universal properties across many generated inputs, complementing
the example-based tests in test_api.py.
"""

from __future__ import annotations

from hypothesis import given
from hypothesis import strategies as st

from app.domain.models import (
    DataSource,
    DocumentKind,
    DocumentRequirement,
    LocalizedText,
    Readiness,
    ServiceCategory,
    ServiceRecord,
    Source,
    VerificationStatus,
)
from app.domain.readiness import evaluate_readiness


def _lt(s: str = "x") -> LocalizedText:
    return LocalizedText(en=s, ta=s)


def _make_service(docs, status=VerificationStatus.VERIFIED) -> ServiceRecord:
    return ServiceRecord(
        serviceId="svc",
        name=_lt(),
        category=ServiceCategory.CERTIFICATE,
        description=_lt(),
        eligibility=[],
        documents=docs,
        steps=[],
        applicationChannels=[],
        department=_lt(),
        officialSources=[
            Source(
                name="demo",
                url="https://example.com",
                lastChecked="2026-09-01",
                verificationStatus=VerificationStatus.VERIFIED,
            )
        ],
        faqs=[],
        lastVerified="2026-09-01",
        status=status,
        dataSource=DataSource.DEMO,
    )


req_doc_ids = st.lists(
    st.text(alphabet="abcdefghij", min_size=1, max_size=4),
    min_size=1,
    max_size=5,
    unique=True,
)


@given(doc_ids=req_doc_ids, held_subset=st.data())
def test_never_ready_when_a_required_doc_is_missing(doc_ids, held_subset):
    docs = [
        DocumentRequirement(
            id=d, name=_lt(d), kind=DocumentKind.REQUIRED, sourceRef="demo"
        )
        for d in doc_ids
    ]
    service = _make_service(docs)
    # Hold a strict subset (at least one missing).
    keep = held_subset.draw(st.lists(st.sampled_from(doc_ids), unique=True))
    if set(keep) == set(doc_ids):
        keep = keep[:-1]  # ensure at least one missing
    result = evaluate_readiness(service, set(keep), {})
    assert result.status != Readiness.READY


@given(doc_ids=req_doc_ids)
def test_ready_when_all_required_held_and_verified(doc_ids):
    docs = [
        DocumentRequirement(
            id=d, name=_lt(d), kind=DocumentKind.REQUIRED, sourceRef="demo"
        )
        for d in doc_ids
    ]
    service = _make_service(docs, status=VerificationStatus.VERIFIED)
    result = evaluate_readiness(service, set(doc_ids), {})
    assert result.status == Readiness.READY


@given(doc_ids=req_doc_ids)
def test_unverified_service_never_ready(doc_ids):
    docs = [
        DocumentRequirement(
            id=d, name=_lt(d), kind=DocumentKind.REQUIRED, sourceRef="demo"
        )
        for d in doc_ids
    ]
    service = _make_service(docs, status=VerificationStatus.UNVERIFIED)
    result = evaluate_readiness(service, set(doc_ids), {})
    assert result.status != Readiness.READY


def test_false_condition_does_not_block_readiness():
    docs = [
        DocumentRequirement(id="r1", name=_lt("r1"), kind=DocumentKind.REQUIRED, sourceRef="demo"),
        DocumentRequirement(
            id="c1",
            name=_lt("c1"),
            kind=DocumentKind.CONDITIONAL,
            condition=_lt("if X"),
            sourceRef="demo",
        ),
    ]
    service = _make_service(docs)
    # Condition does not apply -> conditional doc is inert.
    result = evaluate_readiness(service, {"r1"}, {"c1": False})
    assert result.status == Readiness.READY
