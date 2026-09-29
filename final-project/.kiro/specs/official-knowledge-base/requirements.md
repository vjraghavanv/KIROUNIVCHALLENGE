# Requirements — Official Knowledge Base

## Introduction

The Official Knowledge Base (KB) is the single source of truth for all
government-service facts in Namma Seva AI. It stores structured, versioned
`ServiceRecord`s with localized content and official source metadata, and it
exposes read access to every other feature. No feature may present a
government-service fact that does not originate here.

This feature is the concrete implementation of the `data-governance.md` schema
and lifecycle. It is a foundational dependency for nearly every other spec.

## Dependencies

- **data-governance.md** (steering) — defines the authoritative schema this KB
  implements.
- Consumed by **government-service-discovery**, **rag-assistant**,
  **document-checklist**, **service-action-planner**, **source-verification**,
  **multilingual-assistant**.

## Requirements

### Requirement 1 — Structured service records

**User story:** As a maintainer, I want each service stored as a structured
record, so that features can read consistent, typed data.

#### Acceptance criteria

1. WHEN a service is stored THEN it SHALL conform to the `ServiceRecord` schema
   in `data-governance.md`.
2. WHEN a record is loaded THEN all required fields SHALL be present and typed.
3. IF a record violates the schema THEN the KB SHALL reject it at validation
   time rather than serving it.

### Requirement 2 — Unique, stable identifiers

**User story:** As a maintainer, I want stable unique service IDs, so that
references stay valid over time.

#### Acceptance criteria

1. WHEN records are validated THEN every `serviceId` SHALL be unique across the
   KB.
2. WHEN a service is renamed THEN its `serviceId` SHALL remain unchanged.
3. IF two records share a `serviceId` THEN validation SHALL fail.

### Requirement 3 — Official source metadata

**User story:** As a citizen, I want every service backed by an official source,
so that I can trust the information.

#### Acceptance criteria

1. WHEN a record is validated THEN it SHALL contain at least one official
   `Source` with a name, reference/URL, and `lastChecked` date.
2. IF a record has no source THEN it SHALL NOT be assigned `status: "verified"`.
3. WHEN a source is present THEN its `verificationStatus` SHALL be one of the
   defined values.

### Requirement 4 — Document requirement integrity

**User story:** As a citizen, I want document lists to be internally consistent,
so that readiness can be computed reliably.

#### Acceptance criteria

1. WHEN documents are validated THEN each SHALL have exactly one kind (required,
   conditional, or optional).
2. IF a document is `conditional` THEN it SHALL include a non-empty condition.
3. WHEN document sets are validated THEN the same document SHALL NOT appear as
   both required and optional.

### Requirement 5 — Localized content

**User story:** As a bilingual citizen, I want records available in Tamil and
English, so that I can read in my language.

#### Acceptance criteria

1. WHEN a record is validated THEN `name`, `description`, and `department` SHALL
   provide both `en` and `ta`.
2. WHERE a localized field is missing a locale THEN the KB SHALL record it as a
   validation warning surfaced to maintainers.

### Requirement 6 — Read access for features

**User story:** As a feature developer, I want a clean read API, so that
features retrieve records consistently.

#### Acceptance criteria

1. WHEN a feature requests a service by `serviceId` THEN the KB SHALL return the
   record or a defined not-found result.
2. WHEN a feature requests services by category THEN the KB SHALL return all
   matching records.
3. WHEN a feature searches by keyword THEN the KB SHALL match over `en` and `ta`
   fields.

### Requirement 7 — Extensibility

**User story:** As a maintainer, I want to add services without code changes, so
that coverage can grow.

#### Acceptance criteria

1. WHEN a new valid record is added THEN it SHALL become available to features
   without modifying feature logic.
2. WHEN the KB loads THEN it SHALL validate all records and report failures
   without serving invalid data.

### Requirement 8 — Verification lifecycle exposure

**User story:** As a citizen, I want to know how trustworthy each record is, so
that I can judge the information.

#### Acceptance criteria

1. WHEN a record is served THEN its `status` (verified / conditional /
   unverified) SHALL be available to the presenting feature.
2. WHEN `status` is `unverified` THEN features SHALL be able to flag the result
   accordingly.
