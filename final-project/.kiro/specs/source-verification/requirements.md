# Requirements — Source Verification

## Introduction

Source Verification is the trust-enforcement layer of Namma Seva AI. It checks
that displayed claims are backed by official sources, tracks the verification
status and freshness of records, and lets the RAG Assistant downgrade or reject
claims that cannot be traced to a source. It is how the product delivers on its
central promise: no unsupported claim is presented as an official fact.

This feature implements the verification lifecycle from `data-governance.md` and
the grounding/uncertainty rules from `ai-rag.md`.

## Dependencies

- **official-knowledge-base** — supplies records, sources, and status.
- **rag-assistant** — consumes claim verification during answer assembly.
- Consumed by **service-action-planner** and **document-checklist** for the
  displayed verification flags.

## Requirements

### Requirement 1 — Claim-to-source mapping

**User story:** As a citizen, I want each claim tied to a source, so that I can
verify it.

#### Acceptance criteria

1. WHEN a claim is prepared for display THEN the system SHALL determine whether
   it maps to a retrieved official source.
2. IF a claim maps to no source THEN the system SHALL NOT present it as a
   verified official fact.
3. WHEN a claim maps to a source THEN the system SHALL expose that source
   reference for citation.

### Requirement 2 — Verification status and freshness

**User story:** As a citizen, I want to know how current and trustworthy the
information is, so that I can judge it.

#### Acceptance criteria

1. WHEN a record is presented THEN the system SHALL expose its `status`
   (verified / conditional / unverified) and `lastVerified` date.
2. WHERE `lastVerified` is older than a configured freshness window THEN the
   system SHALL flag the record as needing re-verification.
3. WHEN a source lacks a `lastChecked` date THEN the system SHALL treat the
   claim as needing verification.

### Requirement 3 — Unsupported-claim handling

**User story:** As a citizen, I want unsupported claims removed or flagged, so
that I am not misled.

#### Acceptance criteria

1. WHEN an answer contains an unsupported claim THEN the system SHALL remove it
   or mark it as unverified before display.
2. WHEN a claim is downgraded THEN the system SHALL apply the uncertainty
   phrasing defined in `ai-rag.md`.

### Requirement 4 — Verification report for maintainers

**User story:** As a maintainer, I want a report of verification gaps, so that I
can fix the KB.

#### Acceptance criteria

1. WHEN the KB is validated THEN the system SHALL produce a report of records
   with missing sources, stale verification, or unresolved conditions.
2. WHEN a report is produced THEN it SHALL be consumable by the
   knowledge-validation hook (Lesson 3).

### Requirement 5 — No fabricated verification

**User story:** As a citizen, I want verification to be honest, so that a green
check always means something.

#### Acceptance criteria

1. WHEN the system marks a claim verified THEN there SHALL exist a concrete
   source reference behind it.
2. WHEN evidence is insufficient THEN the system SHALL NOT upgrade a claim's
   status to make output look complete.
