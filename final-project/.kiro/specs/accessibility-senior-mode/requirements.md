# Requirements — Accessibility & Senior Mode

## Introduction

Accessibility & Senior Mode makes Namma Seva AI usable by citizens with low
digital literacy, older citizens, and users of assistive technology. It provides
a simplified, Tamil-first, large-control experience and enforces accessibility
standards across the whole application. It is a cross-cutting presentation
feature; it changes how content is shown, never what the facts are.

This feature depends on the Multilingual Assistant for language and obeys
`ui-ux.md` (design principles) and `product.md` (accessibility goals).

## Dependencies

- **multilingual-assistant** — Tamil-first interaction and switching.
- Applies to all presenting features: **government-service-discovery**,
  **service-action-planner**, **document-checklist**, **rag-assistant**.

## Requirements

### Requirement 1 — Senior mode experience

**User story:** As a senior citizen, I want a simple, large, uncluttered
interface, so that I can use the app comfortably.

#### Acceptance criteria

1. WHEN senior mode is enabled THEN the system SHALL increase control and text
   size and reduce on-screen density.
2. WHEN senior mode is enabled THEN the system SHALL present a Tamil-first
   experience with plain language.
3. WHEN senior mode is enabled THEN the system SHALL reduce non-essential UI
   elements and emphasize the primary action.

### Requirement 2 — Toggle and persistence

**User story:** As a citizen, I want to turn senior mode on or off easily, so
that I control my experience.

#### Acceptance criteria

1. WHEN a citizen toggles senior mode THEN the system SHALL apply it immediately
   without losing the current context.
2. WHERE senior mode is set THEN the system SHALL persist the preference for the
   session.

### Requirement 3 — Keyboard and screen-reader accessibility

**User story:** As a user of assistive technology, I want full keyboard and
screen-reader support, so that I can navigate independently.

#### Acceptance criteria

1. WHEN a citizen navigates by keyboard THEN all interactive elements SHALL be
   reachable and operable in a logical order.
2. WHEN a screen reader is used THEN interactive elements SHALL expose accessible
   names and roles.
3. WHEN focus moves THEN a visible focus indicator SHALL be shown.

### Requirement 4 — Contrast and readability

**User story:** As a citizen with low vision, I want readable text and
sufficient contrast, so that I can read comfortably.

#### Acceptance criteria

1. WHEN text is displayed THEN color contrast SHALL meet the WCAG AA ratio for
   the text size in use.
2. WHEN Tamil text is displayed THEN a font and size ensuring legibility SHALL be
   used.
3. WHEN information is conveyed by color (e.g. readiness status) THEN it SHALL
   also be conveyed by text or icon.

### Requirement 5 — Accessible states

**User story:** As any user, I want loading, empty, and error states to be
perceivable, so that I always know what is happening.

#### Acceptance criteria

1. WHEN content is loading THEN the system SHALL announce a loading state to
   assistive technology.
2. WHEN an error or empty state occurs THEN the system SHALL present a clear,
   plain-language message, not a silent failure.

### Requirement 6 — Consistency with trust presentation

**User story:** As a citizen, I want sources and readiness to remain clear in
senior mode, so that trust cues are not lost.

#### Acceptance criteria

1. WHEN senior mode is enabled THEN official source references and readiness
   status SHALL remain visible and legible.
2. WHEN density is reduced THEN trust cues SHALL NOT be removed, only simplified.
