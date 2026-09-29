# Design — Accessibility & Senior Mode

## Overview

Accessibility & Senior Mode is a presentation layer that adapts the whole app:
an accessibility baseline that always applies (keyboard, screen-reader semantics,
contrast, accessible states) plus an opt-in Senior Mode that increases size,
reduces density, and goes Tamil-first. It never alters facts, sources, or
readiness — only their presentation.

Implements `accessibility-senior-mode/requirements.md`; obeys `ui-ux.md` and
`product.md`.

## Components and interfaces

### AccessibilityProvider (frontend context)
- Exposes `seniorMode: boolean`, `setSeniorMode()`, and derived presentation
  tokens (size scale, density, emphasis).
- Persists preference for the session; toggling preserves current context
  (Requirement 2).

### PresentationTokens
```ts
interface PresentationTokens {
  fontScale: number;       // baseline vs. senior
  controlSize: "regular" | "large";
  density: "comfortable" | "spacious";
  languageDefault: Lang;   // senior mode ⇒ "ta"
}
```
- Consumed by all feature UIs so a single toggle reshapes the app consistently.

### A11y primitives
- Focus management utilities, visible focus ring, `aria` role/name helpers, and
  a live-region announcer for loading/empty/error states.

## Data flow

```
citizen toggle ─▶ AccessibilityProvider(seniorMode) ─▶ PresentationTokens
PresentationTokens ─▶ every feature UI (size, density, default language)
state changes ─▶ LiveRegionAnnouncer ─▶ assistive tech
```

## Referenced steering

- `ui-ux.md` — civic-tech, senior-friendly, accessible states, trust cues.
- `product.md` — accessibility goals and target users (senior / low literacy).
- `multilingual-assistant` design — Tamil-first default in senior mode.

## Error and uncertainty handling

- Loading → announced via live region (Req 5.1).
- Error/empty → plain-language message, never silent (Req 5.2).
- Status conveyed by color also conveyed by text/icon (Req 4.3), so readiness and
  verification cues survive senior mode.

## Testing strategy

- **Unit:** token derivation for baseline vs. senior; announcer behavior.
- **Accessibility testing:** automated axe-style checks for roles/names/contrast;
  keyboard-only traversal of core journeys; documented manual screen-reader pass.
  (Automated checks cannot fully certify WCAG; manual AT testing is required — see
  `testing.md`.)
- **Property-based (Lesson 4):**
  - Toggling senior mode never changes the resolved serviceId or displayed facts
    (presentation-only invariant).
  - Any status shown by color always has a non-color (text/icon) equivalent.
- **Integration:** run core journeys (discovery → plan → checklist → follow-up)
  in senior mode, both languages, keyboard-only.
