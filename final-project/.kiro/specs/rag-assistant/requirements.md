# Requirements — RAG Assistant

## Introduction

The RAG Assistant is the conversational core of Namma Seva AI. It answers
citizen questions using retrieval-augmented generation grounded strictly in the
Official Knowledge Base, maintains conversational context across follow-ups, and
cites the official sources behind every answer. It never answers government-fact
questions from model memory.

This feature is the concrete implementation of `ai-rag.md`. It depends on the KB
for retrieval and on the Multilingual Assistant for language handling, and it
uses the Provider abstraction (MockProvider / BedrockProvider).

## Dependencies

- **official-knowledge-base** — retrieval source via the RetrievalPort.
- **multilingual-assistant** — language detection and response language.
- **government-service-discovery** — provides the active service context.
- **source-verification** — validates that answer claims map to sources.

## Requirements

### Requirement 1 — Grounded answers

**User story:** As a citizen, I want answers based on official information, so
that I can trust them.

#### Acceptance criteria

1. WHEN the assistant answers a government-fact question THEN every factual claim
   SHALL derive from retrieved KB content.
2. WHEN no relevant content is retrieved THEN the assistant SHALL say it cannot
   verify an answer rather than generating one from memory.
3. WHEN an answer is produced THEN it SHALL include the official source(s) for
   the claims.

### Requirement 2 — Conversational context

**User story:** As a citizen, I want follow-up questions to be understood in
context, so that I do not repeat myself.

#### Acceptance criteria

1. WHEN a citizen asks a follow-up THEN the assistant SHALL resolve pronouns and
   ellipsis against the active service context.
2. WHILE a service is in context THE assistant SHALL keep answering about that
   service until the citizen changes topic.
3. WHEN the topic changes to a different service THEN the assistant SHALL update
   the active context.

### Requirement 3 — Provider abstraction

**User story:** As a maintainer, I want to swap the AI provider, so that we can
run locally and later use Bedrock.

#### Acceptance criteria

1. WHEN the assistant generates an answer THEN it SHALL do so through the
   `Provider` interface.
2. WHERE no cloud provider is configured THEN the assistant SHALL use the
   deterministic MockProvider.
3. WHEN the provider is switched THEN retrieval, grounding, and citation
   behavior SHALL remain unchanged.

### Requirement 4 — Hallucination prevention

**User story:** As a citizen, I want the assistant to avoid making things up, so
that I am not misled.

#### Acceptance criteria

1. WHEN an answer is assembled THEN claims without supporting retrieved content
   SHALL NOT be presented as verified official facts.
2. IF the assistant is uncertain THEN it SHALL use the defined uncertainty
   phrasing from `ai-rag.md`.
3. WHEN a fee, deadline, or eligibility rule is requested but not retrieved THEN
   the assistant SHALL state it is not available rather than estimating.

### Requirement 5 — Language consistency

**User story:** As a bilingual citizen, I want answers in my chosen language, so
that I understand them.

#### Acceptance criteria

1. WHEN the citizen has a selected language THEN the assistant SHALL answer in
   that language.
2. WHEN the same question is asked in Tamil or English THEN the underlying
   retrieved service SHALL be the same.

### Requirement 6 — Safety

**User story:** As a citizen, I want safe, honest interaction, so that I trust
the tool.

#### Acceptance criteria

1. WHEN the assistant responds THEN it SHALL identify as an informational
   assistant, not an official authority.
2. WHEN a citizen shares sensitive identifiers THEN the assistant SHALL NOT
   store or echo them and SHALL discourage sharing them.
3. WHEN a citizen asks for legal or guaranteed-outcome advice THEN the assistant
   SHALL decline and point to official verification.
