# Design — Source Verification

## Overview

Source Verification provides pure functions and a reporting utility that enforce
the product's trust promise: every displayed fact maps to an official source, or
it is flagged/removed. It is consumed by the RAG Assistant during answer
assembly and by the presenting features for their verification flags, and it
feeds the knowledge-validation hook.

Implements `source-verification/requirements.md`; enforces the
`data-governance.md` lifecycle and `ai-rag.md` uncertainty rules.

## Components and interfaces

### ClaimVerifier (pure)
```ts
type ClaimStatus = "verified" | "unverified" | "stale";

interface VerifiedClaim {
  text: string;
  status: ClaimStatus;
  sourceRef?: string;      // present when verified
}

function verifyClaims(
  claims: string[],
  retrieved: RetrievedChunk[],
  now: ISODate,
  freshnessWindowDays: number
): VerifiedClaim[];
```
- A claim is `verified` only if it maps to a retrieved chunk carrying a source.
- `stale` when the backing source's `lastChecked` is older than the window.
- Never upgrades status without a concrete source reference.

### FreshnessChecker (pure)
- `isStale(source: Source, now, windowDays): boolean` — no `lastChecked` ⇒ treat
  as needing verification.

### VerificationReporter
- `report(records: ServiceRecord[], now): VerificationReport`
- Lists missing sources, stale verification, unresolved conditional docs; shaped
  for the knowledge-validation hook.

## Data flow

```
RAG answer claims + retrieved chunks ─▶ ClaimVerifier.verifyClaims ─▶ VerifiedClaim[]
        │
        ├─ verified   ─▶ shown with citation
        ├─ stale      ─▶ shown with "needs re-verification"
        └─ unverified ─▶ removed or marked (uncertainty phrasing)

KB records ─▶ VerificationReporter.report ─▶ VerificationReport ─▶ Lesson 3 hook
```

## Referenced steering

- `data-governance.md` — verification lifecycle, source metadata, freshness.
- `ai-rag.md` — unsupported-claim handling and uncertainty phrasing.
- `security.md` — source URLs treated as data; never auto-executed/fetched
  without the configured, sandboxed path.
- `testing.md` — verification is a prime property-based-testing target.

## Error and uncertainty handling

- Missing `lastChecked` ⇒ needs verification (Req 2.3).
- No source for a claim ⇒ not verified; removed or marked (Req 1.2, 3).
- Reporter never throws on a bad record; it records the gap instead.

## Testing strategy

- **Unit:** verifyClaims mapping; FreshnessChecker window boundaries; reporter
  aggregation.
- **Property-based (Lesson 4):**
  - A claim is `verified` only if a concrete source ref exists.
  - No claim is upgraded without a source (never fabricated verification).
  - Stale detection is monotonic in age (older ⇒ at least as stale).
- **Integration:** run verification across the seed KB; confirm the report lists
  intentionally-unverified seed fields.
