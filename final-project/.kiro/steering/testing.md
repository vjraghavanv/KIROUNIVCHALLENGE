# Testing — Namma Seva AI

## Testing philosophy

Trust is the product, so tests focus on grounding, readiness, and language
invariants — not just happy-path rendering. Domain logic is pure and heavily
tested; the AI provider is mocked so tests are deterministic and offline.

## Conventional tests vs. Kiro Property-Based Testing

This project uses both, and the distinction is deliberate:

- **Conventional (example-based) tests** assert specific input → specific output
  for chosen cases (a birth-certificate query returns the birth-certificate
  service). They document concrete behavior and catch regressions on known
  cases.
- **Kiro Property-Based Testing (Lesson 4)** asserts *universal properties* that
  must hold across many generated inputs (fast-check on the TS side,
  Hypothesis on the Python side). Instead of one example, the framework
  generates hundreds of cases and shrinks any failure to a minimal counter-
  example. Properties encode invariants like "readiness is never READY while a
  required document is missing" — true for *all* inputs, not one.

We use PBT for invariants and example tests for concrete scenarios; neither
replaces the other.

## Unit testing

- Pure domain functions: readiness evaluation, plan composition, claim
  verification, ranking, language detection, localization fallback.
- Each validation rule has a passing and a failing case.

## Integration testing

- End-to-end feature flows over the seed KB: discovery → action plan → checklist
  → grounded follow-up, in Tamil and English.
- Provider-unavailable path falls back to MockProvider.

## API testing

- Exercise FastAPI endpoints for status codes, JSON content type, required
  response fields, and error shapes — consistent with the API Testing approach
  already used in the repo (lesson-5 / bonus-lesson-2). Report PASS/FAIL against
  observed responses only.

## Property-based testing (targets)

- **KB:** unique ids; ≥1 source; no required+optional clash; conditional needs a
  condition; contiguous steps; no-source ⇒ not verified.
- **Readiness:** never READY with an unheld required doc; false condition inert;
  true condition acts as required; deterministic.
- **Language:** switching language preserves resolved serviceId; factual fields
  preserved across `en`/`ta`.
- **RAG:** answer references ≥1 source; no un-retrieved fact asserted; provider
  swap preserves grounding set.
- **Verification:** verified ⇒ concrete source exists; never fabricated
  verification; staleness monotonic in age.

## Test data

- A small, versioned seed KB of the four initial services, including at least one
  intentionally `unverified`/conditional field to exercise trust paths.
- No real personal identifiers in any fixture; placeholders only.

## Mocking providers

- `MockProvider` is the default in all tests: deterministic, offline, composes
  answers from grounded context.
- `BedrockProvider` is integration-tested behind configuration and never required
  for the suite to pass.

## Acceptance testing

- Map tests back to spec acceptance criteria; a feature is "done" when its EARS
  criteria have covering tests and the demo journeys pass.

## Accessibility testing

- Automated axe-style checks for roles, names, and contrast.
- Keyboard-only traversal of core journeys.
- Documented manual screen-reader pass. Note: automated checks are necessary but
  not sufficient — full WCAG conformance requires manual assistive-technology
  testing and expert review.

## Regression testing

- Property and integration suites run via hooks (Lesson 3) on relevant changes.
- Any bug fix adds a covering test (example or property) so it cannot silently
  return.
