# Design — Document Checklist

## Overview

The Document Checklist renders a service's official document requirements, lets
the citizen mark which they hold, and computes a readiness verdict with a pure,
deterministic function. The verdict logic contains no model calls — it is the
canonical anti-hallucination surface of the product.

Implements `document-checklist/requirements.md`; obeys `data-governance.md`
(document kinds) and `ai-rag.md` (readiness is computed, not generated).

## Components and interfaces

### ChecklistBuilder
- `build(service: ServiceRecord): Checklist`
- Groups `documents` into required / conditional / optional; attaches source
  refs; carries the service `status`.

### ReadinessEvaluator (pure)
```ts
type Readiness = "READY" | "NOT_READY" | "NEEDS_VERIFICATION";

interface ReadinessResult {
  status: Readiness;
  missingRequired: DocumentRequirement[];
  applicableConditionalMissing: DocumentRequirement[];
  reasons: string[];
}

function evaluate(
  checklist: Checklist,
  held: Set<string>,           // document ids the citizen marked available
  conditionAnswers: Record<string, boolean | "unknown">
): ReadinessResult;
```
- Pure function; same inputs always yield the same result (property-testable).

### Readiness rules
- Any required doc not held → `NOT_READY`.
- Service `unverified` OR a required doc without `sourceRef` → `NEEDS_VERIFICATION`.
- A conditional doc whose condition is `unknown` → `NEEDS_VERIFICATION`.
- A conditional doc whose condition is `true` → treated as required.
- A conditional doc whose condition is `false` → ignored for readiness.
- Only when all required + applicable-conditional docs are held and the record
  is source-backed → `READY`.

### ChecklistState (frontend)
- Holds `held` selections and `conditionAnswers` for the session.
- Stores only document *type* selections, never identifier values (Req 2.3).

## Data flow

```
resolved ServiceRecord ─▶ ChecklistBuilder ─▶ Checklist
citizen ticks ─▶ ChecklistState(held, conditionAnswers)
        │
        ▼
ReadinessEvaluator.evaluate ─▶ ReadinessResult ─▶ UI (status + missing list + sources)
```

## Referenced steering

- `data-governance.md` — document kinds, conditional condition rule, source refs.
- `ai-rag.md` — readiness is computed, not model-generated; uncertainty phrasing.
- `security.md` — never store Aadhaar/PAN or identifier values; only "held" flags.
- `ui-ux.md` — checkbox affordance, clear READY/NOT READY/NEEDS VERIFICATION.

## Error and uncertainty handling

- No documents on the record → "Official information not available…" (Req 1.3).
- Unknown condition applicability → `NEEDS_VERIFICATION` (Req 4.3).
- Missing source on a required doc → `NEEDS_VERIFICATION` + flag (Req 6.2).

## Testing strategy

- **Unit:** grouping by kind; each readiness rule branch.
- **Property-based (Lesson 4):**
  - Never `READY` while any required doc is unheld.
  - A `false` condition never changes readiness; a `true` condition behaves as
    required.
  - `evaluate` is deterministic for identical inputs.
  - `unverified` service can never yield `READY`.
- **Integration:** compute readiness across the seed services for held/not-held
  permutations in both languages.
