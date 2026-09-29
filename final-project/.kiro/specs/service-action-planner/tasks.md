# Implementation Plan — Service Action Planner

- [ ] 1. Implement PlanComposer (pure)
  - Compose an `ActionPlan` in canonical section order from a `ServiceRecord`.
  - Substitute `Unavailable` for absent sections.
  - _Requirements: 1_
  - _Depends on: official-knowledge-base (records)_

- [ ] 2. Gate fees and processing info
  - Show only when present with a source; otherwise "not available".
  - _Requirements: 2_

- [ ] 3. Compose application channels
  - List channels; require URL for online; add "verify on official source" note.
  - _Requirements: 3_

- [ ] 4. Attach sources and unverified flag
  - Include sources + `lastVerified`; flag `unverified` records.
  - _Requirements: 4_

- [ ] 5. Build PlanView + follow-up entry
  - Sectioned layout; follow-up seeds RAG Assistant with the serviceId context.
  - _Requirements: 1, 5_
  - _Depends on: rag-assistant, multilingual-assistant_

- [ ] 6. Apply safety framing
  - Assistant identity; no guarantee of approval/outcome.
  - _Requirements: 6_

- [ ] 7. Property-based tests (Lesson 4)
  - No section value absent from record; canonical order always; fees/processing
    never without a source.
  - _Requirements: 1, 2_

- [ ] 8. Integration tests
  - Compose plans for all seed services in both languages; follow-up carries
    correct serviceId.
  - _Requirements: 1, 3, 4, 5_
