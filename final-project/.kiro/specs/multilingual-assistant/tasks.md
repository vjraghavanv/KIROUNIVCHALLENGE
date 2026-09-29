# Implementation Plan — Multilingual Assistant

- [ ] 1. Establish Lang type and LocalizedText usage
  - Reuse the shared `LocalizedText` type from the domain module.
  - Define `Lang = "ta" | "en"` and the fallback order constant.
  - _Requirements: 3, 4_
  - _Depends on: official-knowledge-base (schema)_

- [ ] 2. Implement shared LanguageDetector
  - Unicode Tamil-block heuristic; code-mixing defers to UI language.
  - Expose a single `detect()` reused by discovery and chat.
  - Unit tests: Tamil, English, mixed.
  - _Requirements: 1_

- [ ] 3. Implement Localizer.pick with fallback
  - requested locale → English → "translation unavailable" marker.
  - Never fabricate a translation.
  - _Requirements: 3, 4, 5_

- [ ] 4. Build LanguageContext (frontend)
  - Active UI language, `setLanguage`, `t()`; session persistence.
  - Preserve active service/result context across switches.
  - _Requirements: 2_

- [ ] 5. Author MessageCatalog (en/ta) for UI chrome
  - Buttons, labels, empty/error/loading states.
  - Keep separate from KB content.
  - _Requirements: 2, 3_

- [ ] 6. Enforce factual-preservation rules in rendering
  - Preserve official proper nouns; mark missing Tamil fields.
  - Ensure no fact is added during localization.
  - _Requirements: 3, 5_

- [ ] 7. Property-based tests (Lesson 4)
  - Language switch preserves resolved serviceId.
  - `pick` fallback never invents a locale value silently.
  - _Requirements: 3, 4, 5_

- [ ] 8. Integration test: bilingual render of a seed service
  - Same factual fields (count + meaning) in `en` and `ta`.
  - _Requirements: 1, 2, 3_
