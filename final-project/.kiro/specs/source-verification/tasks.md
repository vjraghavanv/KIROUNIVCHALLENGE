# Implementation Plan — Source Verification

- [ ] 1. Implement FreshnessChecker (pure)
  - `isStale(source, now, windowDays)`; missing `lastChecked` ⇒ needs
    verification.
  - _Requirements: 2_

- [ ] 2. Implement ClaimVerifier (pure)
  - Map each claim to a retrieved source; assign verified/unverified/stale.
  - Never upgrade without a concrete source ref.
  - _Requirements: 1, 3, 5_
  - _Depends on: official-knowledge-base, rag-assistant (retrieved chunks)_

- [ ] 3. Apply uncertainty phrasing on downgrade
  - Removed/marked claims use `ai-rag.md` phrasing.
  - _Requirements: 3_

- [ ] 4. Implement VerificationReporter
  - Aggregate missing sources, stale verification, unresolved conditions.
  - Shape output for the knowledge-validation hook.
  - _Requirements: 4_

- [ ] 5. Expose status/freshness to presenting features
  - Provide flags for action-planner and document-checklist UI.
  - _Requirements: 2_

- [ ] 6. Property-based tests (Lesson 4)
  - verified ⇒ concrete source exists; never fabricated verification; stale
    monotonic in age.
  - _Requirements: 1, 2, 5_

- [ ] 7. Integration tests
  - Verify across seed KB; report lists intentionally-unverified seed fields.
  - _Requirements: 1, 2, 3, 4_
