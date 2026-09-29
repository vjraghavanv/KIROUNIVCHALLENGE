# Design — RAG Assistant

## Overview

The RAG Assistant answers citizen questions by retrieving relevant KB content,
assembling a grounded context, generating a response through the Provider
abstraction, and verifying that every claim maps to a source before display. It
maintains conversational context so follow-ups resolve against the active
service.

This is the concrete implementation of `ai-rag.md`. It changes no government
facts — it retrieves, phrases, and cites.

## Architecture

```
question + conversation state
   │
   ▼
LanguageResolver (uiLang) ──▶ responseLang
   │
   ▼
ContextResolver ──▶ activeService (from discovery / follow-up)
   │
   ▼
RetrievalPort.retrieve(query, k) ──▶ RetrievedChunk[]  (from KB)
   │
   ▼
GroundedContextBuilder ──▶ prompt with ONLY retrieved text + source refs
   │
   ▼
Provider.generate(context, question, lang) ── Mock ◀▶ Bedrock
   │
   ▼
ClaimVerifier (source-verification) ──▶ verified answer + citations
   │
   ▼
Response (localized, cited, uncertainty-marked)
```

## Components and interfaces

### Provider (abstraction)
```ts
interface Provider {
  generate(input: {
    groundedContext: RetrievedChunk[];
    question: string;
    language: Lang;
    activeServiceId?: string;
  }): Promise<GeneratedAnswer>;   // answer + referenced chunk ids
}
```
- **MockProvider** — deterministic; composes the answer directly from the
  grounded context (no external calls). Default for dev, tests, demo fallback.
- **BedrockProvider** — calls Amazon Bedrock; same contract. Selected by config;
  no credentials in source (see `security.md`).

### ContextResolver
- Tracks `activeServiceId` and recent turns; resolves pronouns/ellipsis
  (Requirement 2). Topic change updates context.

### GroundedContextBuilder
- Builds the model input from retrieved chunks only; attaches source refs; caps
  size. Never injects un-retrieved facts.

### ClaimVerifier (delegates to source-verification)
- Confirms each surfaced claim is backed by a retrieved chunk/source; downgrades
  or removes unsupported claims and applies uncertainty phrasing.

### ConversationState
- Per-session turns + activeServiceId; stores no sensitive identifiers.

## Referenced steering

- `ai-rag.md` — grounding, provider abstraction, citations, uncertainty phrasing.
- `data-governance.md` — record fields available for grounding.
- `security.md` — prompt-injection handling, no-secret rules, PII minimization.
- `product.md` — assistant identity and trust principles.

## Error and uncertainty handling

- Empty retrieval → "couldn't verify" response; no memory answer (Req 1.2, 4).
- Provider error → fall back to MockProvider (Req 3.2).
- Unsupported claim → removed/marked, never shown as verified (Req 4.1).
- Prompt-injection in retrieved or user text → treated as data, not instructions.

## Testing strategy

- **Unit:** ContextResolver pronoun resolution; GroundedContextBuilder excludes
  un-retrieved facts; provider selection/fallback.
- **Property-based (Lesson 4):**
  - Every produced answer references at least one retrieved source.
  - No answer asserts a document/step/fee absent from retrieved chunks.
  - Language switch does not change the retrieved serviceId.
  - Provider swap yields the same grounding/citation set for the same inputs.
- **Integration:** multi-turn conversation over seed services (Journeys A, B, E,
  and follow-ups) in both languages; provider-unavailable fallback path.
