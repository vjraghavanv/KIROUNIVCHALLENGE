# Product — Namma Seva AI

## Vision

Government services, explained simply. Namma Seva AI is a multilingual,
AI-powered navigation assistant that helps citizens understand government
services — eligibility, required documents, application steps, and official
sources — in simple Tamil or English. It explains information retrieved from
trusted official sources; it does not replace official portals or give legal
advice.

## Problem statement

Government information often exists online, but citizens struggle to discover the
right service, understand terminology and eligibility, know which documents are
needed, find where and how to apply, read it in their language, and tell official
information apart from AI-generated content. Namma Seva AI converts a citizen
question into: intent → relevant service → trusted official information → simple
explanation → document checklist → step-by-step plan → official sources.

## Target users

- **Unfamiliar citizen** — knows the goal, not the process ("How do I get an
  income certificate?").
- **Tamil-speaking citizen** — wants to interact in Tamil.
- **Senior / low digital literacy** — needs large controls, plain language,
  minimal clutter, Tamil-first.
- **Problem-not-service citizen** — knows the problem, not the service name; the
  system maps it to a category where the KB supports it.

## Product principles

- Solve the citizen's next step, not a generic chat.
- Retrieval-grounded truth over model fluency.
- Small, correct scope over broad, shaky coverage.
- Bilingual by design; extensible to more Indian languages.
- Simple, maintainable architecture; no infrastructure the deadline can't carry.

## Trust principles

- Every important government-service claim is traceable to an official source.
- The system clearly distinguishes confirmed, conditional, unavailable, and
  needs-verification information.
- Prefer "I couldn't verify this from official sources" over a confident guess.
- Application readiness is computed from official data, never invented.
- Always identify as an informational assistant; never claim to be an official
  service; never guarantee eligibility or outcome; ask citizens to confirm on the
  official source before acting.

## Accessibility goals

- Usable by senior and low-literacy citizens: large controls, plain language,
  strong visual hierarchy, Tamil-first senior mode.
- Meet WCAG AA contrast; full keyboard operability; screen-reader semantics.
- Never convey status by color alone.
- (Full WCAG conformance requires manual assistive-technology testing and expert
  review — automated checks alone are not sufficient.)

## Scope boundaries

- **In scope (initial):** four certificate services (birth, income, community,
  residence/nativity), Tamil/English, discovery, action plan, document checklist,
  grounded chat, source verification, senior/accessible mode.
- **Extensible later via KB data (no new code):** welfare schemes, pension,
  education, civic complaints, more languages.
- **Out of scope:** legal advice, guaranteed outcomes, storing citizen
  identifiers, acting as an official submission channel, unbounded web scraping.
