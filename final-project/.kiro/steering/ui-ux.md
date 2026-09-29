# UI / UX — Namma Seva AI

## Civic-tech design principles

- This is a civic-tech product, not a generic chatbot. The primary surface is a
  service explorer with structured results, not a blank chat box.
- Clarity over cleverness: plain language, strong visual hierarchy, obvious
  primary actions.
- Calm, trustworthy visual tone; generous spacing; readable type.
- Every result reads like an official-information card with sources, not a wall
  of chat text.

## Homepage

- **Hero:** "Government services, explained simply."
- **Ask/Search:** prominent input — "என்ன சேவை வேண்டும்?" / "What do you need
  help with?"
- **Quick services:** Certificates, Welfare schemes, Pension, Education, Civic
  services, Other.
- **Language switcher:** Tamil / English, always visible.
- **Senior-friendly mode:** a clear, discoverable toggle.

## Service result layout

A resolved service renders as a structured card, in this order: service name,
what it is, who needs it, documents, steps, where to apply, important notes,
official sources, last verified, and an "ask a follow-up" entry. This layout is
shared with the Service Action Planner.

## Tamil / English experience

- Full parity: any screen works in either language.
- Tamil-first defaults in senior mode.
- Preserve official proper nouns; never show a lossy transliteration of an
  official name.
- Language switch keeps the current context (Requirement: multilingual-assistant).

## Senior-friendly design

- Larger controls and text, reduced density, one clear primary action per screen.
- Minimal terminology; short sentences; step-by-step emphasis.
- Trust cues (sources, readiness) remain visible when density is reduced.

## Accessibility

- WCAG AA contrast; visible focus indicators; full keyboard operability;
  screen-reader roles and names.
- Never convey meaning by color alone — pair with text/icon (e.g. readiness).
- Legible Tamil font and sizing.
- Automated checks are necessary but not sufficient; manual assistive-technology
  testing is required for real conformance (see `testing.md`).

## Responsive behavior

- Mobile-first; single-column on small screens; comfortable tap targets.
- Layout scales to tablet/desktop without hiding trust cues or sources.

## Component conventions

- Presentational components are pure and prop-driven; no government facts
  hardcoded.
- Shared primitives for cards, source blocks, readiness badges, and status
  chips so trust presentation is consistent.

## Loading states

- Show a clear, announced loading state (live region) — never a frozen screen.
- Skeletons/placeholders must not imply content that may not exist.

## Error states

- Plain-language, actionable error messages; never a silent failure or a raw
  stack trace.
- On AI/provider failure, degrade to grounded content or an honest "try again"
  message — never a fabricated answer.

## Empty states

- Distinguish "no results" from "no data": a category with no services shows an
  explicit empty state, not a fabricated entry.
- Offer a next step (rephrase, browse categories, switch language).

## Trust / source presentation

- Every service result and substantive answer shows official source name +
  reference + `lastVerified` date.
- Readiness (READY / NOT READY / NEEDS VERIFICATION) and verification status are
  always visible and expressed in text, not color alone.
- Unverified records are visibly flagged.
- A persistent, unobtrusive note identifies the app as an informational
  assistant and advises verifying on the official source before acting.
