# Implementation Plan — Accessibility & Senior Mode

- [ ] 1. Build AccessibilityProvider + PresentationTokens
  - `seniorMode` state, setter, derived tokens; session persistence.
  - Toggle preserves current context.
  - _Requirements: 1, 2_
  - _Depends on: multilingual-assistant (language default)_

- [ ] 2. Apply tokens across feature UIs
  - Wire size/density/emphasis + Tamil-first default into discovery, plan,
    checklist, chat.
  - _Requirements: 1_

- [ ] 3. Implement A11y primitives
  - Focus management, visible focus ring, aria role/name helpers.
  - _Requirements: 3_

- [ ] 4. Add LiveRegionAnnouncer for states
  - Announce loading; plain-language error/empty states.
  - _Requirements: 5_

- [ ] 5. Enforce contrast + non-color status cues
  - WCAG AA contrast; Tamil legibility; text/icon equivalents for color status.
  - _Requirements: 4, 6_

- [ ] 6. Preserve trust cues in senior mode
  - Keep sources + readiness visible/legible when density is reduced.
  - _Requirements: 6_

- [ ] 7. Accessibility testing
  - Automated axe-style checks; keyboard-only traversal; documented manual
    screen-reader pass (note automated checks are not full WCAG certification).
  - _Requirements: 3, 4, 5_

- [ ] 8. Property-based tests (Lesson 4)
  - Senior toggle never changes serviceId/facts; color status always has a
    non-color equivalent.
  - _Requirements: 1, 4_

- [ ] 9. Integration tests
  - Core journeys in senior mode, both languages, keyboard-only.
  - _Requirements: 1, 2, 3, 5, 6_
