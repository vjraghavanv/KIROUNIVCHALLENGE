# Requirements — Government Service Discovery

## Introduction

Government Service Discovery is the entry point of Namma Seva AI. It takes a
citizen's question in Tamil or English, understands intent, and resolves it to
one or more government services from the trusted knowledge base (KB). When the
match is confident it returns the service; when it is ambiguous it asks a
clarification question; when nothing matches it says so plainly rather than
guessing.

This feature depends on the `data-governance.md` schema (the `ServiceRecord`
model) and the `ai-rag.md` grounding rules. It must never invent a service or a
service fact.

## Glossary

- **Intent** — what the citizen wants to accomplish (e.g. "obtain an income
  certificate").
- **Service resolution** — mapping an intent to zero, one, or many
  `ServiceRecord`s.
- **Confidence** — a score reflecting how strongly the query matches a service.
- **Clarification** — a single follow-up question asked when multiple services
  plausibly match.

## Requirements

### Requirement 1 — Language detection

**User story:** As a citizen, I want the system to understand my question
whether I write in Tamil or English, so that I can use my preferred language.

#### Acceptance criteria

1. WHEN a citizen submits a query THEN the system SHALL detect the language as
   Tamil or English before resolving intent.
2. IF the query mixes Tamil and English (code-mixing) THEN the system SHALL
   resolve intent without failing and SHALL respond in the language the citizen
   has selected in the UI.
3. WHERE the citizen has explicitly selected a response language THEN the system
   SHALL respond in that language regardless of the detected input language.

### Requirement 2 — Intent and service resolution

**User story:** As a citizen, I want the system to figure out which government
service I need, so that I do not have to know the official service name.

#### Acceptance criteria

1. WHEN a query is submitted THEN the system SHALL resolve it to a ranked list
   of candidate `ServiceRecord`s from the KB.
2. IF exactly one candidate scores above the confidence threshold THEN the
   system SHALL return that service as the result.
3. IF two or more candidates score above the threshold THEN the system SHALL
   ask one clarification question instead of guessing.
4. IF no candidate scores above the threshold THEN the system SHALL return a
   "no confident match" outcome and SHALL NOT fabricate a service.
5. WHEN a citizen describes a problem rather than a service (e.g. a broken
   street light) THEN the system SHALL attempt to map it to a service category
   supported by the KB, and SHALL fall back to clarification or "no match" if
   unsupported.

### Requirement 3 — Grounded results only

**User story:** As a citizen, I want the answer to come from official
information, so that I can trust what I read.

#### Acceptance criteria

1. WHEN the system returns a service THEN every displayed fact SHALL come from
   the resolved `ServiceRecord`.
2. IF a requested field is absent from the record THEN the system SHALL display
   "Official information not available in the current knowledge base." and SHALL
   NOT invent a value.
3. WHEN a service result is displayed THEN the system SHALL show at least one
   official source with its `lastVerified` date.
4. IF the resolved record has `status: "unverified"` THEN the system SHALL
   visibly mark the result as unverified.

### Requirement 4 — Clarification flow

**User story:** As a citizen, I want to be asked a simple question when my
request is unclear, so that I reach the right service.

#### Acceptance criteria

1. WHEN the system asks a clarification question THEN it SHALL offer the
   distinct candidate services as selectable options.
2. WHEN the citizen selects an option THEN the system SHALL resolve to that
   service without requiring the query to be retyped.
3. WHILE a clarification is pending THE system SHALL retain the original query
   context.

### Requirement 5 — Category browsing fallback

**User story:** As a citizen who is not sure how to phrase my need, I want to
browse by category, so that I can still find a service.

#### Acceptance criteria

1. WHEN a citizen opens the explorer THEN the system SHALL list supported
   service categories.
2. WHEN a citizen selects a category THEN the system SHALL list the services in
   that category from the KB.
3. WHERE a category has no services in the KB THEN the system SHALL show an
   empty-state message rather than a fabricated entry.

### Requirement 6 — Language-invariant resolution

**User story:** As a bilingual citizen, I want the same question in Tamil or
English to reach the same service, so that the language I choose does not change
the answer.

#### Acceptance criteria

1. WHEN semantically equivalent queries are submitted in Tamil and English THEN
   the system SHALL resolve to the same service (or the same clarification set).
2. WHEN the response language is switched THEN the resolved service and its
   factual fields SHALL remain unchanged.

### Requirement 7 — Safety and trust

**User story:** As a citizen, I want to know this is an informational assistant,
so that I verify critical details officially before acting.

#### Acceptance criteria

1. WHEN a result is displayed THEN the system SHALL present itself as an
   informational assistant, not an official government service.
2. WHEN a result includes actionable steps THEN the system SHALL advise the
   citizen to confirm on the official source before submitting.
3. WHEN a query is submitted THEN the system SHALL NOT request unnecessary
   sensitive identifiers, and SHALL NOT log Aadhaar/PAN or similar values.

### Requirement 8 — Performance and resilience

**User story:** As a citizen, I want quick answers, so that the tool feels
usable.

#### Acceptance criteria

1. WHEN a query is resolved using the local KB and MockProvider THEN the system
   SHALL return a result within a reasonable interactive latency budget.
2. IF the AI provider is unavailable THEN the system SHALL fall back to the
   grounded MockProvider so that discovery still functions.
