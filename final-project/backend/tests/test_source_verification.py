"""Source-verification tests (source-verification spec)."""

from __future__ import annotations

from datetime import date

from app.domain.models import Source, VerificationStatus
from app.domain.source_verification import (
    build_report,
    is_stale,
    verify_service,
)

from .factories import valid_record

NOW = date(2026, 9, 28)


def _source(last_checked: str, status=VerificationStatus.VERIFIED) -> Source:
    return Source(name="S", url="https://e.com", lastChecked=last_checked, verificationStatus=status)


def test_fresh_source_not_stale():
    assert is_stale(_source("2026-09-01"), NOW, window_days=365) is False


def test_old_source_is_stale():
    assert is_stale(_source("2020-01-01"), NOW, window_days=365) is True


def test_undated_source_is_stale():
    assert is_stale(_source("   "), NOW) is True


def test_unverified_record_never_reported_as_verified():
    rec = valid_record(status=VerificationStatus.UNVERIFIED)
    result = verify_service(rec, NOW)
    assert result.is_verified is False
    assert result.status == VerificationStatus.UNVERIFIED


def test_verified_fresh_sourced_record_is_verified():
    rec = valid_record(
        status=VerificationStatus.VERIFIED,
        officialSources=[_source("2026-09-01")],
    )
    result = verify_service(rec, NOW)
    assert result.is_verified is True


def test_verified_but_stale_is_not_treated_as_verified():
    rec = valid_record(
        status=VerificationStatus.VERIFIED,
        officialSources=[_source("2000-01-01")],
    )
    result = verify_service(rec, NOW)
    assert result.is_verified is False
    assert result.stale is True


def test_report_counts_by_status():
    recs = [
        valid_record(serviceId="a", status=VerificationStatus.UNVERIFIED),
        valid_record(serviceId="b", status=VerificationStatus.CONDITIONAL),
        valid_record(
            serviceId="c",
            status=VerificationStatus.VERIFIED,
            officialSources=[_source("2026-09-01")],
        ),
    ]
    report = build_report(recs, NOW)
    assert report.total == 3
    assert report.verified == 1
    assert report.conditional == 1
    assert report.unverified == 1
