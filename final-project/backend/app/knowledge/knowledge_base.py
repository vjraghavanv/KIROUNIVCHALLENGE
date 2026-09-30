"""Official Knowledge Base read layer (official-knowledge-base spec).

Loads demo ServiceRecords from JSON, validates them against
data-governance rules, excludes invalid records, and exposes a typed read API.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from app.domain.models import ServiceCategory, ServiceRecord
from app.domain.validation import validate_record, validate_unique_ids

_DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "demo_services.json"


class KnowledgeBase:
    """In-memory, validated index over ServiceRecords."""

    def __init__(self, records: list[ServiceRecord], report: list[str]) -> None:
        self._by_id: dict[str, ServiceRecord] = {r.service_id: r for r in records}
        self._records = records
        self.validation_report = report

    @classmethod
    def load(cls, data_file: Path = _DATA_FILE) -> "KnowledgeBase":
        raw = json.loads(data_file.read_text(encoding="utf-8"))
        candidates = [ServiceRecord.model_validate(item) for item in raw]

        report: list[str] = []
        valid: list[ServiceRecord] = []
        for rec in candidates:
            errors = validate_record(rec)
            if errors:
                report.extend(f"{rec.service_id}: {e}" for e in errors)
            else:
                valid.append(rec)

        report.extend(validate_unique_ids(valid))
        return cls(valid, report)

    def get_by_id(self, service_id: str) -> Optional[ServiceRecord]:
        return self._by_id.get(service_id)

    def list_all(self) -> list[ServiceRecord]:
        return list(self._records)

    def list_by_category(self, category: ServiceCategory) -> list[ServiceRecord]:
        return [r for r in self._records if r.category == category]

    def search_keyword(self, term: str) -> list[ServiceRecord]:
        t = term.strip().lower()
        if not t:
            return []
        results: list[ServiceRecord] = []
        for r in self._records:
            haystack = " ".join(
                [
                    r.name.en,
                    r.name.ta,
                    r.description.en,
                    r.description.ta,
                    r.category.value,
                ]
            ).lower()
            if t in haystack:
                results.append(r)
        return results

    def all_categories(self) -> list[ServiceCategory]:
        return sorted({r.category for r in self._records}, key=lambda c: c.value)
