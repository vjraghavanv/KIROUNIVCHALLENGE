"""Property-based tests (Lesson 4) for knowledge-record and verification invariants."""

from __future__ import annotations

from datetime import date, timedelta

from hypothesis import given
from hypothesis import strategies as st

from app.domain.models import (
    DocumentKind,
    DocumentRequirement,
    Source,
    Step,
    VerificationStatus,
)
from app.domain.source_verification import is_stale, verify_service
from app.domain.validation import validate_record

from .factories import lt, valid_record

NOW = date(2026, 9, 28)

ids = st.lists(
    st.text(alphabet="abcdefghij", min_size=1, max_size=4),
    min_size=1,
    max_size=5,
    unique=True,
)


@given(doc_ids=ids)
def test_valid_multi_doc_record_passes_validation(doc_ids):
    docs = [
        DocumentRequirement(id=d, name=lt(d), kind=DocumentKind.REQUIRED, sourceRef="s1")
        for d in doc_ids
    ]
    steps = [Step(order=i + 1, instruction=lt(f"s{i}")) for i in range(len(doc_ids))]
    rec = valid_record(documents=docs, steps=steps)
    assert validate_record(rec) == []


@given(n=st.integers(min_value=2, max_value=6))
def test_shuffled_but_contiguous_steps_are_valid(n):
    # Any permutation of 1..n is contiguous and must validate.
    import random

    orders = list(range(1, n + 1))
    random.shuffle(orders)
    steps = [Step(order=o, instruction=lt(f"s{o}")) for o in orders]
    rec = valid_record(steps=steps)
    assert validate_record(rec) == []


@given(gap=st.integers(min_value=2, max_value=10))
def test_step_gap_always_rejected(gap):
    steps = [Step(order=1, instruction=lt("a")), Step(order=1 + gap, instruction=lt("b"))]
    rec = valid_record(steps=steps)
    assert any("contiguous" in e for e in validate_record(rec))


@given(status=st.sampled_from(list(VerificationStatus)))
def test_non_verified_status_never_reports_is_verified(status):
    rec = valid_record(status=status)
    result = verify_service(rec, NOW)
    if status != VerificationStatus.VERIFIED:
        assert result.is_verified is False


@given(age_days=st.integers(min_value=0, max_value=4000))
def test_staleness_monotonic_in_age(age_days):
    checked = NOW - timedelta(days=age_days)
    src = Source(
        name="S",
        url="https://e.com",
        lastChecked=checked.isoformat(),
        verificationStatus=VerificationStatus.VERIFIED,
    )
    stale = is_stale(src, NOW, window_days=365)
    # Older than window must be stale; within window must not be.
    assert stale == (age_days > 365)
