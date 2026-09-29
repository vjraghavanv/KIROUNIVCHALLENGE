# Implementation Plan — Government Service Discovery

- [ ] 1. Define shared domain types and KB schema
  - Create `ServiceRecord`, `DocumentRequirement`, `Source`, `LocalizedText`,
    and discovery result types (`ResolvedService`, `ClarificationRequest`,
    `NoMatch`) in a shared module.
  - Encode the `data-governance.md` rules as a validation schema (unique
    serviceId, at least one source, conditional docs need a condition, steps
    contiguous).
  - _Requirements: 3_

- [ ] 2. Seed the knowledge base with initial certificate services
  - Author four `ServiceRecord` JSON files (birth, income, community,
    residence/nativity) with both `en` and `ta` fields.
  - Populate only source-backed facts; mark unverifiable fields honestly and set
    `status` accordingly.
  - _Requirements: 3, 5_

- [ ] 3. Implement LanguageDetector
  - Heuristic Tamil/English detection using Unicode script presence.
  - Handle code-mixed input without failing; expose `detect(query)`.
  - Unit tests for Tamil, English, and mixed inputs.
  - _Requirements: 1_

- [ ] 4. Implement IntentResolver with alias map
  - Normalize queries to keywords/aliases; map problem-descriptions toward a
    category.
  - Ensure Tamil and English aliases converge to the same normalized intent.
  - _Requirements: 2, 6_

- [ ] 5. Implement ServiceRetriever
  - Retrieve candidate records by category and keyword match over `en`/`ta`.
  - Add the category-browsing path (list categories, list services per category,
    empty-state when none).
  - _Requirements: 2, 5_

- [ ] 6. Implement Ranker and confidence scoring
  - Field-weighted scoring producing a normalized confidence in [0,1].
  - Configurable `CONFIDENCE_THRESHOLD` (no per-call hardcoding).
  - Unit tests for scoring and ordering.
  - _Requirements: 2_

- [ ] 7. Implement DiscoveryService orchestrator
  - Wire detector → resolver → retriever → ranker.
  - Apply threshold branching: resolved / clarification / no-match; ties prefer
    clarification.
  - Retain original query context across clarification.
  - _Requirements: 2, 4_

- [ ] 8. Enforce grounding in result assembly
  - Guarantee `resolved` results reference only real KB records.
  - Render missing fields via the standard "not available" phrase; flag
    `unverified` records.
  - Attach official source(s) + `lastVerified` to every result.
  - _Requirements: 3, 7_

- [ ] 9. Apply safety and privacy rules
  - Present assistant identity + "verify on official source" guidance on results.
  - Ensure no Aadhaar/PAN-like values are logged; request no sensitive
    identifiers.
  - _Requirements: 7_

- [ ] 10. Add resilience and performance fallback
  - MockProvider path works fully offline; provider-unavailable falls back to
    local ranking.
  - Guard empty/whitespace queries and KB-load failure (no fabricated results).
  - _Requirements: 8_

- [ ] 11. Property-based tests (Lesson 4)
  - Language switch preserves resolved serviceId.
  - Every `resolved` service is a real KB record; no result field is absent from
    its source.
  - ≥2 tied candidates above threshold always yield clarification.
  - _Requirements: 2, 3, 4, 6_

- [ ] 12. Integration tests over the seed KB
  - End-to-end `discover()` for all four services in Tamil and English, covering
    resolved, clarification, and no-match outcomes.
  - _Requirements: 1, 2, 3, 4, 5, 6_
