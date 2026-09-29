# Design — Government Service Discovery

## Overview

Government Service Discovery converts a free-text citizen query (Tamil or
English) into a grounded outcome: a resolved service, a clarification question,
or an honest "no confident match." It is the first stage of the Namma Seva AI
pipeline and feeds the service-result UI, the document checklist, and the chat
experience.

This design implements the requirements in `requirements.md` and obeys the
`data-governance.md` schema and `ai-rag.md` grounding rules.

## Architecture

```
Query (ta/en)
   │
   ▼
LanguageDetector ── detected language ──┐
   │                                     │
   ▼                                     │
IntentResolver ── normalized intent ─────┤
   │                                     │
   ▼                                     ▼
ServiceRetriever ──▶ KnowledgeBase (ServiceRecord[])
   │
   ▼
Ranker ──▶ scored candidates
   │
   ├─ 1 above threshold ─▶ ResolvedService
   ├─ ≥2 above threshold ─▶ ClarificationRequest
   └─ 0 above threshold ─▶ NoMatch
   │
   ▼
DiscoveryResult (localized, grounded, cited)
```

The pipeline is provider-agnostic. Language detection and ranking can run with
deterministic local logic (MockProvider path) and, later, be enhanced by
`BedrockProvider` without changing the interfaces below.

## Components and interfaces

### LanguageDetector
- `detect(query: string): "ta" | "en"`
- Heuristic first (Unicode Tamil block presence, script ratio for code-mixing),
  provider-assisted later. Never throws on mixed input.

### IntentResolver
- `resolve(query: string, lang: Lang): NormalizedIntent`
- Produces normalized keywords/aliases and a candidate category. Uses a
  synonym/alias map so problem-descriptions ("street light not working") map
  toward a category ("civic-service").

### ServiceRetriever
- `retrieve(intent: NormalizedIntent): ServiceRecord[]`
- Pulls candidate records from the KB by category and keyword/alias match over
  both `en` and `ta` fields.

### Ranker
- `rank(intent, candidates): ScoredCandidate[]`
- Scores by field-weighted matches (name > category > description > faqs).
  Emits a normalized confidence in [0,1].

### DiscoveryService (orchestrator)
- `discover(query, uiLang): DiscoveryResult`
- Runs the pipeline, applies the confidence threshold, and returns exactly one
  of the result variants below.

### Result types

```ts
type Lang = "ta" | "en";

interface ResolvedService {
  kind: "resolved";
  service: ServiceRecord;
  confidence: number;
  language: Lang;
}

interface ClarificationRequest {
  kind: "clarification";
  question: LocalizedText;
  options: { serviceId: string; label: LocalizedText }[];
  originalQuery: string;   // retained for context
  language: Lang;
}

interface NoMatch {
  kind: "no-match";
  message: LocalizedText;  // honest "no confident match"
  language: Lang;
}

type DiscoveryResult = ResolvedService | ClarificationRequest | NoMatch;
```

## Confidence and thresholds

- A single tunable `CONFIDENCE_THRESHOLD` (config, not hardcoded per call).
- 1 candidate ≥ threshold → `resolved`.
- ≥ 2 candidates ≥ threshold → `clarification` with those candidates as options.
- 0 candidates ≥ threshold → `no-match`.
- Ties and near-ties always prefer clarification over guessing.

## Grounding and citations

- The retriever only ever returns real KB records; the ranker cannot synthesize
  a candidate.
- `ResolvedService.service` is passed unchanged to the UI; any missing field is
  rendered by the UI as the standard "not available" phrase (per `ai-rag.md`).
- Unverified records (`status: "unverified"`) are flagged in the result UI.

## Language handling

- Detection sets the *input* language; the *response* language is the UI-selected
  language when present (Requirement 1.3).
- Resolution operates on language-neutral aliases so that equivalent Tamil and
  English queries reach the same candidate set (Requirement 6).

## Error handling and resilience

- Empty/whitespace query → `no-match` with a prompt to rephrase (no throw).
- KB load failure → surfaced as a system error state, never a fabricated result.
- Provider unavailable → fall back to deterministic local ranking (MockProvider).

## Security and privacy

- The query string is treated as untrusted input; no query value that looks like
  an Aadhaar/PAN pattern is written to logs.
- No sensitive identifiers are requested during discovery.

## Testing strategy

- **Unit:** LanguageDetector (Tamil/English/mixed), Ranker scoring, threshold
  branching (resolved / clarification / no-match).
- **Property-based (Lesson 4):**
  - Language switch does not change the resolved serviceId (Req 6).
  - A `resolved` result's service is always a real KB record (Req 3).
  - `clarification` is emitted whenever ≥2 candidates tie above threshold (Req 2/4).
  - No result ever contains a field value absent from the source record.
- **Integration:** end-to-end discover() over the seed KB for the four initial
  certificate services, in both languages.

## Traceability

| Requirement | Components |
| --- | --- |
| 1 Language detection | LanguageDetector, DiscoveryService |
| 2 Intent/service resolution | IntentResolver, ServiceRetriever, Ranker |
| 3 Grounded results | ServiceRetriever, DiscoveryService, result UI |
| 4 Clarification | DiscoveryService, ClarificationRequest |
| 5 Category browsing | ServiceRetriever (category path) |
| 6 Language-invariant | IntentResolver aliases, Ranker |
| 7 Safety/trust | DiscoveryService result assembly |
| 8 Performance/resilience | MockProvider fallback, local ranking |
