# Requirements — Service Action Planner

## Introduction

The Service Action Planner turns a resolved service into a clear, ordered "what
to do next" plan for the citizen: what the service is, who needs it, eligibility,
documents, how and where to apply, steps, and — only when officially documented —
fees and processing time. Every section is drawn from the `ServiceRecord`;
missing sections are shown honestly rather than filled in by the model.

This feature obeys `data-governance.md` (source-backed fields only) and
`ai-rag.md` (no invented facts; explicit "not available" phrasing).

## Dependencies

- **official-knowledge-base** — supplies eligibility, steps, channels, fees,
  processing info, and sources.
- **government-service-discovery** — provides the resolved service.
- **document-checklist** — the documents section links to the checklist.
- **multilingual-assistant** — renders the plan in the citizen's language.

## Requirements

### Requirement 1 — Structured action plan

**User story:** As a citizen, I want a step-by-step plan, so that I know exactly
what to do.

#### Acceptance criteria

1. WHEN a service is resolved THEN the system SHALL present sections in this
   order: what it is, who needs it, eligibility, documents, application method,
   steps, fees, processing info, official source, important notes.
2. WHEN steps are shown THEN they SHALL appear in the record's defined order.
3. IF a section has no data in the record THEN the system SHALL show "Official
   information not available in the current knowledge base." for that section.

### Requirement 2 — Fees and processing shown only when documented

**User story:** As a citizen, I want fee and timing info only when it is
official, so that I am not misled.

#### Acceptance criteria

1. WHEN a fee is present in the record with a source THEN the system SHALL show
   it.
2. IF no official fee is recorded THEN the system SHALL NOT display a fee and
   SHALL show the "not available" phrase.
3. WHEN processing time is present with a source THEN the system SHALL show it;
   otherwise it SHALL show the "not available" phrase.

### Requirement 3 — Application channels

**User story:** As a citizen, I want to know where and how to apply, so that I
can take action.

#### Acceptance criteria

1. WHEN channels exist THEN the system SHALL list them (online / offline / CSC)
   with labels.
2. WHEN a channel is online THEN the system SHALL show its official URL.
3. WHEN an actionable step is shown THEN the system SHALL advise verifying on the
   official source before submitting.

### Requirement 4 — Source attribution

**User story:** As a citizen, I want to see the source for the plan, so that I
can trust and verify it.

#### Acceptance criteria

1. WHEN the plan is displayed THEN the system SHALL show the official source(s)
   and the `lastVerified` date.
2. IF the record `status` is `unverified` THEN the plan SHALL be visibly flagged.

### Requirement 5 — Follow-up continuity

**User story:** As a citizen, I want to ask a follow-up question about this plan,
so that I can get clarification.

#### Acceptance criteria

1. WHEN a plan is displayed THEN the system SHALL offer a follow-up entry point
   that carries the current service as context.
2. WHEN a follow-up is asked THEN the RAG Assistant SHALL answer grounded in the
   same service record.

### Requirement 6 — Safety framing

**User story:** As a citizen, I want honest framing, so that I do not treat this
as an official guarantee.

#### Acceptance criteria

1. WHEN a plan is shown THEN the system SHALL identify itself as an informational
   assistant, not an official service.
2. WHEN the plan implies eligibility THEN the system SHALL NOT guarantee approval
   or outcome.
