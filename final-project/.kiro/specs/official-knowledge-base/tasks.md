# Implementation Plan — Official Knowledge Base

- [ ] 1. Implement the ServiceRecord schema validator
  - Encode all `data-governance.md` rules as validation checks.
  - Return a structured `ValidationResult` with per-rule failures.
  - Unit test each rule (passing + failing case).
  - _Requirements: 1, 2, 3, 4, 5_
  - _Depends on: shared domain types (government-service-discovery task 1)_

- [ ] 2. Author seed records (4 certificate services)
  - Birth, income, community, residence/nativity in schema-valid JSON.
  - Both `en`/`ta`; only source-backed facts; honest `status`.
  - _Requirements: 1, 3, 5, 8_

- [ ] 3. Build KnowledgeIndex
  - `byId`, `byCategory`, keyword index over `en`/`ta`.
  - Rebuild on load; exclude invalid records.
  - _Requirements: 2, 6, 7_

- [ ] 4. Implement KnowledgeBase read API
  - `getById`, `listByCategory`, `searchKeyword`, `allCategories`, `status`.
  - Defined `NotFound` result; no fabricated records.
  - _Requirements: 6, 8_

- [ ] 5. Add RetrievalPort seam
  - Default keyword-backed `retrieve`; document the vector-store swap point.
  - _Requirements: 6_
  - _Depends on: rag-assistant (consumer)_

- [ ] 6. Surface ValidationReport to maintainers
  - Aggregate load-time failures/warnings (missing locale, etc.).
  - Feeds the knowledge-validation hook (Lesson 3).
  - _Requirements: 5, 7_

- [ ] 7. Property-based tests (Lesson 4)
  - Unique ids; ≥1 source; no required+optional clash; conditional needs
    condition; contiguous steps; no-source ⇒ not verified.
  - _Requirements: 2, 3, 4, 8_

- [ ] 8. Integration tests
  - Load seed KB; exercise all read paths in both languages.
  - _Requirements: 1, 5, 6, 7_
