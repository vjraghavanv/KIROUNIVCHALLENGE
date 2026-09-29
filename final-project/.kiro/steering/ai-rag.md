# AI / RAG Grounding — Namma Seva AI

## Purpose

Namma Seva AI answers citizens' questions about government services. The
correctness and trustworthiness of those answers is the product. This document
defines how the AI layer must retrieve, ground, cite, and hedge — and what it
must never do. These rules are binding on the retrieval pipeline, prompt
construction, and the provider abstraction.

## Core rule: retrieval-grounded, never memory-grounded

The language model must not supply government-service facts from its own
training memory. Every factual claim in a response must originate from a
`ServiceRecord` retrieved from the knowledge base (see `data-governance.md`).

The model's job is limited to:

- understanding the citizen's intent,
- selecting/ranking retrieved records,
- rephrasing retrieved content into simple Tamil or English,
- asking a clarification question when confidence is low.

The model's job never includes inventing eligibility rules, documents, steps,
fees, deadlines, office names, or URLs.

## Pipeline

```
question
  → language detect (ta / en)
  → intent + candidate service resolution
  → knowledge retrieval (KB records + matched fields)
  → grounded context assembly (only retrieved text + its source refs)
  → provider (MockProvider ↔ BedrockProvider) generates answer
  → verification pass (every claim maps to a retrieved source)
  → localized, cited response
```

## Provider abstraction

- All model access goes through a `Provider` interface with a single
  `generate(groundedContext, question, language)` contract.
- `MockProvider` is deterministic and offline; it composes answers directly from
  the grounded context and is the default for local dev, tests, and the demo
  fallback.
- `BedrockProvider` is a drop-in implementation using Amazon Bedrock. Swapping
  providers must not require any change to UI, routes, retrieval, or
  verification.
- No provider may be given raw model access to answer without grounded context.

## Citations

- Every service result and every substantive chat answer must show its official
  source(s): source name + reference/URL + `lastVerified` date.
- If a claim cannot be tied to a retrieved source, it must not be presented as an
  official fact.

## Confidence and clarification

- When intent maps to multiple plausible services, ask one clarification
  question rather than guessing.
- When retrieval returns nothing relevant, say so plainly; do not fabricate a
  service.

## Uncertainty language (required phrasing)

- Missing field in an otherwise valid record:
  "Official information not available in the current knowledge base."
- Unverifiable claim:
  "I couldn't verify this requirement from the available official sources."
- Conditional record:
  surface the condition; do not present conditional facts as unconditional.

Saying "I don't have that verified" is always preferable to a confident
hallucination.

## Safety and identity

- Always identify as an informational assistant, never as an official government
  service or authority.
- No legal advice; no guarantees of eligibility, approval, or outcome.
- Prompt the citizen to confirm critical details on the official source before
  acting or submitting.
- Never request unnecessary sensitive identifiers; never echo Aadhaar/PAN or
  similar into logs or responses.

## Testable properties (feeds Lesson 4 PBT)

- A grounded answer must reference at least one retrieved source.
- No response may assert a document/step/fee that is absent from the retrieved
  records.
- Switching language must not change the underlying resolved service/intent.
- Factual fields must be preserved between Tamil and English representations.
