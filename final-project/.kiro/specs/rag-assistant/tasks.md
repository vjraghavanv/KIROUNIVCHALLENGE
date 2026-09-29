# Implementation Plan — RAG Assistant

- [ ] 1. Define the Provider interface + GeneratedAnswer type
  - Single `generate()` contract returning answer + referenced chunk ids.
  - _Requirements: 3_

- [ ] 2. Implement MockProvider (deterministic)
  - Compose answers from grounded context only; no external calls.
  - Default provider for dev/tests/demo.
  - _Requirements: 1, 3, 4_

- [ ] 3. Implement GroundedContextBuilder
  - Build model input from retrieved chunks only; attach source refs; cap size.
  - _Requirements: 1, 4_
  - _Depends on: official-knowledge-base (RetrievalPort)_

- [ ] 4. Implement ContextResolver + ConversationState
  - Track activeServiceId + turns; resolve pronouns/ellipsis; topic change
    updates context; store no sensitive identifiers.
  - _Requirements: 2, 6_

- [ ] 5. Integrate ClaimVerifier
  - Confirm each claim maps to a retrieved source; downgrade/remove unsupported;
    apply uncertainty phrasing.
  - _Requirements: 1, 4_
  - _Depends on: source-verification_

- [ ] 6. Wire language handling
  - Answer in selected language; same retrieval regardless of input language.
  - _Requirements: 5_
  - _Depends on: multilingual-assistant_

- [ ] 7. Add BedrockProvider (config-selected)
  - Same contract; credentials from environment only; MockProvider fallback on
    error.
  - _Requirements: 3_
  - _Depends on: architecture.md provider config_

- [ ] 8. Apply safety rules
  - Assistant identity; decline legal/guaranteed-outcome; never store/echo
    sensitive identifiers.
  - _Requirements: 6_

- [ ] 9. Property-based tests (Lesson 4)
  - Answer references ≥1 source; no un-retrieved fact asserted; language switch
    preserves serviceId; provider swap preserves grounding set.
  - _Requirements: 1, 3, 4, 5_

- [ ] 10. Integration tests
  - Multi-turn conversations over seed services in both languages; provider
    fallback path.
  - _Requirements: 1, 2, 3, 5, 6_
