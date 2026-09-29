# Implementation Plan — Document Checklist

- [ ] 1. Implement ChecklistBuilder
  - Group a service's documents into required/conditional/optional.
  - Attach source refs and the service `status`.
  - _Requirements: 1, 6_
  - _Depends on: official-knowledge-base (records)_

- [ ] 2. Implement ReadinessEvaluator (pure function)
  - Encode all readiness rules; return status + missing lists + reasons.
  - No model calls; deterministic.
  - _Requirements: 3, 4_

- [ ] 3. Handle conditional-document logic
  - Apply true/false/unknown condition answers per the rules.
  - Unknown ⇒ NEEDS_VERIFICATION.
  - _Requirements: 4_

- [ ] 4. Build ChecklistState (frontend)
  - Track held document ids + condition answers for the session.
  - Store only type-level selections, never identifier values.
  - _Requirements: 2_
  - _Depends on: multilingual-assistant (rendering)_

- [ ] 5. Render checklist + readiness UI
  - Grouped documents, missing-items list, READY/NOT READY/NEEDS VERIFICATION,
    official sources, optional clearly distinguished.
  - Empty-documents ⇒ "not available" phrase.
  - _Requirements: 1, 5, 6_

- [ ] 6. Property-based tests (Lesson 4)
  - Never READY with an unheld required doc.
  - false condition inert; true condition acts as required.
  - Deterministic evaluate; unverified never READY.
  - _Requirements: 3, 4_

- [ ] 7. Integration tests
  - Readiness across seed services for held/not-held permutations, both
    languages.
  - _Requirements: 1, 2, 3, 4, 5, 6_
