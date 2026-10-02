# Kiro University Challenge

Build-along project for the AWS User Group Madurai Kiro University challenge.

## Lessons

- **lesson-1** — Todo feature spec (requirements, design, tasks) via Kiro spec-driven development.
- **lesson-2** — TypeScript coding standards steering file.
- **lesson-3** — Kiro hook: format TypeScript on save (Prettier).
- **lesson-4** — Property-based testing for `addTask` with fast-check.
- **lesson-5** — API testing with the Postman power: workspace, environment, and collection with a `GET /posts/1` request against JSONPlaceholder, with five test assertions (status 200, JSON content-type, required fields, `id` equals 1, response time under 2000ms). All five passed. Config saved in `kiro-university-lesson-5/.postman.json`.
- **lesson-6** — MCP server setup: `fetch` (`mcp-server-fetch` via `uvx`) and `playwright` (`@playwright/mcp` via `npx`), configured in `kiro-university-lesson-6/.kiro/settings/mcp.json`. Used the Playwright MCP server to open https://example.com and read the page title and main heading (both "Example Domain").
- **lesson-7** — Custom `web-tester` agent (`kiro-university-lesson-7/.kiro/agents/web-tester.json`) that uses the Playwright MCP server for UI checks. Verified https://example.com: page title and main heading both "Example Domain" (both assertions passed). Result recorded in `kiro-university-lesson-7/results/example-domain-test.md`.
  - **bonus-lesson-1 (250 credits)** — Kiro Web, cloud sessions, and cloud configuration: shifting agentic engineering into a cloud sandbox and syncing local Kiro setup (steering, hooks, skills, powers, custom agents) into cloud sessions that follow your account across Kiro Web, CLI, and IDE. Notes in `kiro-university-lesson-7/bonus-lesson-1/README.md`.
  - **bonus-lesson-2** — Custom API Testing power (`kiro-university-lesson-7/bonus-lesson-2/api-testing-power/`) with an `api-testing` skill (`plugin.json` + `skills/api-testing/SKILL.md`) giving practical REST API testing guidance: HTTP methods, status codes, response validation, and PASS/FAIL reporting. Used it to run a real `GET https://jsonplaceholder.typicode.com/posts/1`, validating status 200, JSON content-type, required fields (`userId`, `id`, `title`, `body`), `id` equals 1, and response time (~34.5ms). All five assertions passed. Result recorded in `kiro-university-lesson-7/bonus-lesson-2/results/api-testing-power-result.md`.

## Final Project — Namma Seva AI

**Government services, explained simply.** Namma Seva AI is a multilingual
(Tamil / English) civic-tech assistant that helps citizens understand government
services: intent → relevant service → trusted official information → simple
explanation → document checklist → step-by-step plan → official sources. It is
an informational assistant grounded in trusted official sources, not a
replacement for government portals and not a source of legal advice.

The project lives under `final-project/` and is being built with Kiro. The Kiro
planning foundation (Specs + Steering) is in place. **Phase 1** (the first
working vertical slice), **Phase 2** (the Official Knowledge Base: strengthened
validation and source verification), **Phase 3** (the Multilingual Assistant:
language-invariant Tamil/English discovery), **Phase 4** (the grounded RAG
assistant: a `/ask` pipeline with source-grounded answers and a provider
abstraction), and **Phase 5** (Accessibility & Senior Mode: a Tamil-first,
large-control, screen-reader-friendly experience) have been implemented and
tested.

### Status

- Planning foundation complete: 8 feature specs + 8 steering documents.
- Phase 1 vertical slice implemented: FastAPI backend + React/TS frontend
  covering **service search → service details → documents → action steps**.
- Phase 2 implemented: hardened knowledge-base validation, a source-verification
  module (VERIFIED / CONDITIONAL / UNVERIFIED + freshness), and a frontend
  verification badge with source and last-verified/checked display.
- Phase 3 implemented: language-invariant service discovery so equivalent Tamil
  and English queries resolve to the same service, plus persisted UI-language
  selection.
- Phase 4 implemented: a grounded RAG assistant (`POST /ask`) that retrieves,
  grounds answers strictly in the retrieved record, verifies sources, and safely
  declines when it cannot ground an answer — behind a MockProvider/BedrockProvider
  abstraction that never requires live AWS.
- Phase 5 implemented: an Accessibility & Senior Mode presentation layer — a
  session-persisted, Tamil-first, large-control senior mode that reduces density
  and emphasizes the primary action, with keyboard/screen-reader support,
  non-color status cues, and accessible loading/empty/error states. It changes
  how content is shown, never the underlying facts.
- All service data is clearly-marked **demo/mock** data; no real government
  requirements are asserted yet.
- Backend tests: **65/65 passing** (integration + validation + source-verification
  + multilingual + RAG + property-based). Frontend typecheck and production build
  pass.
- Existing Git history preserved.

### Phase 1 implementation (vertical slice)

Everything lives inside `final-project/`, with backend and frontend cleanly
separated and a shared contract as the source of truth.

- `shared/CONTRACT.md` — the domain/API contract both sides implement
  (`ServiceRecord` schema, result types, HTTP endpoints).
- `backend/` — Python + FastAPI. Domain models + validation
  (`data-governance` rules), a validated demo knowledge base, deterministic
  discovery and readiness logic, and a `MockProvider` (Bedrock is **not** a
  required dependency yet). Tests in `backend/tests/`.
- `frontend/` — React + TypeScript + Vite (strict TS). Home/search screen with a
  Tamil/English switch and a service-detail screen showing documents (by kind),
  action steps, application channels, and official sources, with demo/unverified
  badges and a persistent "informational assistant" notice.

**API endpoints (Phase 1):** `GET /health`, `POST /discover`, `GET /categories`,
`GET /services`, `GET /services/{serviceId}`, `POST /checklist/evaluate`.

**Run locally:** backend — `cd final-project/backend`, create a venv, install
`.[test]`, then `uvicorn app.main:app --port 8000`. Frontend — `cd
final-project/frontend`, `npm install`, `npm run dev` (proxies `/api` to the
backend on port 8000).

### Phase 2 implementation (Official Knowledge Base)

Phase 2 strengthens the knowledge layer so it is ready to consume verified
official information later, without changing the architecture, the Provider
abstraction, or the API contract.

- **Hardened validation** (`backend/app/domain/validation.py`): rejects blank or
  duplicate `serviceId`; unsupported verification states; missing official
  source, verified-without-source, and sources missing name/url/`lastChecked`;
  malformed documents (empty or duplicate ids, missing localized name,
  conditional without a localized condition, the same document marked both
  required and optional); malformed steps (non-positive, duplicate, or
  non-contiguous orders, missing localized instruction); channels (bad type,
  online without a URL); and localized fields missing `en` or `ta`. Invalid
  records are excluded and reported, never served.
- **Source verification** (`backend/app/domain/source_verification.py`): a pure
  module that distinguishes **VERIFIED / CONDITIONAL / UNVERIFIED**, flags stale
  sources (older than a freshness window, or undated), and aggregates a
  maintainer-facing report. A record is treated as verified only if it claims
  `VERIFIED` and has a non-stale official source; nothing upgrades an unverified
  record.
- **Small demo dataset** (`backend/app/data/demo_services.json`): three
  clearly-marked demo services — `income-certificate` (unverified),
  `birth-certificate` (unverified), and `street-light-complaint` (civic-service,
  conditional). The service facts, fees, documents, and procedures remain
  placeholder demo content and are not invented as official. The referenced
  source now points at the real Tamil Nadu e-Sevai citizen portal
  (`https://www.tnesevai.tn.gov.in/citizen/`, labelled "Tamil Nadu e-Sevai
  (TN eSevai) citizen portal") instead of a placeholder URL, but this is only a
  pointer to the official portal — it does **not** mean the demo records have
  been verified against it. Each record stays `unverified`/`conditional` and
  marked `dataSource: "demo"`; nothing was upgraded to verified.
- **Frontend** (`ServiceDetail`): shows a verification badge as text plus status
  (not color alone), the record's last-verified date, and each source's
  last-checked date.

The API contract is unchanged in Phase 2, so `shared/CONTRACT.md` was not
modified. `source_verification` is currently internal (no endpoint yet); wiring
its report into a knowledge-validation hook is planned for Lesson 3.

### Phase 3 implementation (Multilingual Assistant)

Phase 3 makes the discovery experience genuinely usable in Tamil and English,
keeping the architecture, the Provider abstraction (`MockProvider`), and the HTTP
API stable.

- **Language-invariant discovery** (`backend/app/domain/discovery.py`): query
  scoring now drops language-balanced stopwords and matches tokens against the
  service name **and** per-language aliases in both `en` and `ta`, so equivalent
  Tamil and English queries resolve to the same `serviceId`. The
  resolved / clarification / no-match behavior is unchanged; nothing is guessed.
- **Search aliases** (`backend/app/domain/models.py`,
  `backend/app/data/demo_services.json`): `ServiceRecord` gains an optional
  `aliases` field (localized keyword lists) used only for discovery matching, not
  asserted as official facts. The three demo services carry bilingual aliases.
- **Persisted UI language** (`frontend/src/i18n.ts`, `App.tsx`): the selected
  Tamil/English language is stored in `localStorage` and restored on load,
  defaulting to English per the multilingual spec.
- **Contract** (`shared/CONTRACT.md`): documents the new optional `aliases`
  field. The change is additive and backward compatible — no endpoint signatures
  changed.

Example: both "I need an income certificate" (EN) and "எனக்கு வருமான சான்றிதழ்
வேண்டும்" (TA) resolve to `income-certificate`, each responding in the selected
language. Verified by live API check and by property-based tests asserting
equivalent EN/TA queries share one `serviceId`.

### Phase 4 implementation (grounded RAG assistant)

Phase 4 adds a grounded question-answering pipeline that reuses the existing
retrieval and verification rather than introducing a parallel system.

- **Ask pipeline** (`backend/app/domain/rag_assistant.py`): `ask()` retrieves via
  the existing `discover()`, grounds the phrasing through the `Provider`, verifies
  the record via `source_verification`, and returns a single `GroundedResponse`
  (answer, service, documents, steps, sources, verification status, cited source
  refs, and a safety notice). Cited sources are always a subset of the retrieved
  record's sources, so an answer can never cite a source that was not retrieved.
- **Safe grounding** (`ai-rag.md`): if nothing grounds to a source, the response
  is marked `grounded=false`, is never reported as verified, and falls back to the
  standard "official information unavailable" phrasing. Ambiguous queries return a
  clarification, unknown queries return no-match — nothing is fabricated.
- **Provider abstraction** (`backend/app/ai/provider.py`): `MockProvider` stays
  the deterministic default; a `BedrockProvider` boundary is selected only by
  `NSA_PROVIDER=bedrock` (config from environment only), and the factory falls
  back to MockProvider so the app never requires live AWS or credentials.
- **API** (`backend/app/main.py`, `shared/CONTRACT.md`): adds an additive
  `POST /ask` returning `GroundedResponse`. All existing endpoints are unchanged.
- **Frontend** (`App.tsx`, `api.ts`, `types.ts`, `i18n.ts`): an "Ask" action that
  shows the grounded answer, the service's verification status, cited sources, and
  a link to the full service detail — preserving the Phase 3 Tamil/English switch.

Example: `POST /ask` with "I need an income certificate" (EN) returns a grounded
answer for `income-certificate` with `isVerified=false` (demo/unverified data),
citing only the retrieved record's source; a gibberish query returns a safe
no-match. Verified by live API check and property-based tests (an answer never
cites an un-retrieved source; ungrounded content is never marked verified).

### Phase 5 — Senior-Friendly Accessibility Mode

Phase 5 adds a cross-cutting, senior-friendly accessibility layer that makes the
app easier to use for older citizens, people with low digital literacy, and users
of assistive technology. It is presentation-only: it changes **how** content is
shown, never **what** the facts are — service ids, documents, steps, sources, and
verification status are untouched.

Implemented functionality (all in the frontend):

- **Senior-friendly mode** toggled from the header, built on an
  `AccessibilityProvider` (`frontend/src/accessibility.tsx`) that reflects the
  mode on `<body>` so global CSS can respond.
- **Larger typography and controls** in senior mode (`frontend/src/styles.css`):
  increased base font size and line height, larger headings, and larger search
  input and buttons.
- **Minimum 56px touch targets** for the primary controls (search/ask buttons,
  language chips, result cards, and the senior-mode toggle) via
  `min-height: 56px` in senior mode.
- **Reduced visual density** in senior mode: wider spacing on document, step,
  channel, and source lists, and a roomier page container.
- **Tamil-first behavior** when senior mode is enabled and the user has not
  explicitly saved a language: the UI defaults to Tamil (`defaultLang = "ta"`).
  An explicit language choice always wins and is respected.
- **Session persistence** of the senior-mode preference via `sessionStorage`
  (best-effort; failures are non-fatal), restored on reload.
- **Semantic buttons**: interactive controls are real `<button>` elements rather
  than click-handling `<div>`s.
- **`aria-pressed` support** on the senior-mode toggle and the language chips, so
  their on/off state is exposed to assistive technology.
- **Visible keyboard focus states** via a `:focus-visible` outline, so
  keyboard users can see where focus is.
- **`aria-live` loading/status announcements**: a polite live region announces
  the loading state, and the answer/results regions are `aria-live="polite"`.
- **Plain-language error/empty states**: errors render in a `role="alert"`
  region with plain-language messages (e.g. "Could not reach the service. Is the
  backend running?"), and no-match returns a clear message rather than a silent
  failure.
- **Non-color status cues**: verification and readiness status always include a
  text label (verified / conditional / unverified) in addition to color, so
  meaning never depends on color alone.
- **Preservation of source/trust information**: official sources, cited source
  references, verification badges, and the demo/informational notice stay visible
  and legible in senior mode — density is reduced, trust cues are not removed.
- **Frontend accessibility tests** (`frontend/src/test/`): `accessibility.test.tsx`
  and `App.test.tsx` (with a Vitest/jsdom `setup.ts`) cover the senior-mode
  toggle, session persistence, Tamil-first default, English-first normal mode,
  the localized toggle label, and `aria-pressed` state transitions.

This phase is frontend-only; the backend, the Provider abstraction, and the HTTP
API contract are unchanged.

**Scope note (honest limitations):** these are practical accessibility
improvements validated by the frontend tests above. They are **not** a claim of
full WCAG certification, and the project does **not** include automated axe-core
audits or a completed screen-reader certification. A full manual screen-reader
pass and formal WCAG conformance review would still be required before claiming
compliance.

### Kiro Specs — Lesson 1 (`final-project/.kiro/specs/`)

Each spec contains `requirements.md` (EARS-style, testable acceptance criteria,
declared dependencies), `design.md` (components/interfaces, data flow,
referenced steering, error/uncertainty handling, testing strategy), and
`tasks.md` (implementation tasks traced to requirements, with property-based and
integration testing called out).

- `government-service-discovery` — query → resolved service / clarification /
  honest "no match"; grounded, cited results.
- `multilingual-assistant` — language detection, switching, and factual
  preservation across Tamil/English; extensible to more languages.
- `official-knowledge-base` — structured, validated `ServiceRecord` store; the
  single source of truth for all government-service facts.
- `document-checklist` — official document list + deterministic readiness
  (READY / NOT READY / NEEDS VERIFICATION), computed, never model-generated.
- `service-action-planner` — ordered action plan composed only from the service
  record; missing sections shown honestly.
- `rag-assistant` — retrieval-grounded conversational answers with citations,
  conversational context, and a provider abstraction.
- `source-verification` — maps every displayed claim to an official source;
  removes/flags unsupported claims; freshness tracking.
- `accessibility-senior-mode` — accessibility baseline plus a Tamil-first,
  large-control senior experience.

### Kiro Steering — Lesson 2 (`final-project/.kiro/steering/`)

- `product.md` — vision, users, problem statement, product & trust principles,
  accessibility goals, scope boundaries.
- `architecture.md` — React/TS frontend, Python/FastAPI backend, domain model,
  knowledge architecture, and the MockProvider ↔ BedrockProvider abstraction.
- `coding-standards.md` — TypeScript/React and Python/FastAPI conventions,
  naming, error handling, API design, logging, configuration, env vars.
- `ui-ux.md` — civic-tech design (not a generic chatbot), Tamil/English,
  senior-friendly design, accessibility, and trust/source presentation.
- `security.md` — secrets management, PII minimization, sensitive-data logging
  rules, input validation, prompt-injection and RAG security, AI safety.
- `testing.md` — unit/integration/API testing and Kiro Property-Based Testing,
  explicitly distinguished from conventional example tests.
- `data-governance.md` — the canonical `ServiceRecord` schema, source metadata,
  and verification lifecycle.
- `ai-rag.md` — retrieval-grounding pipeline, provider abstraction, citations,
  hallucination prevention, and required uncertainty phrasing.

### Seven-lesson mapping

**The seven required Kiro University lessons are already completed, each with
concrete evidence** in its own top-level directory (summarized in the
**Lessons** section at the top of this README). This is the evidence scored for
the challenge:

| Lesson | Completed evidence | Evidence location |
| --- | --- | --- |
| Lesson 1 — Specs | Todo feature spec (requirements, design, tasks) | `kiro-university-lesson-1/` |
| Lesson 2 — Steering | TypeScript coding-standards steering file | `kiro-university-lesson-2/` |
| Lesson 3 — Hooks | Format-TypeScript-on-save hook | `kiro-university-lesson-3/` |
| Lesson 4 — Property-Based Testing | `addTask` property test with fast-check | `kiro-university-lesson-4/` |
| Lesson 5 — Powers | Postman API test run (5/5 assertions passed) | `kiro-university-lesson-5/` |
| Lesson 6 — MCP | `fetch` + `playwright` MCP servers, used live | `kiro-university-lesson-6/` |
| Lesson 7 — Custom Agents* | `web-tester` custom agent driving Playwright MCP, with a recorded live run | `kiro-university-lesson-7/` |

*Lesson 7 — Custom Agents (based on the project's build-along lesson notes and
repository evidence; the public Kiro University landing/terms pages do not
publish a per-lesson title list). The custom-agent capability itself is
documented at https://kiro.dev/docs/custom-agents/.

#### Optional: re-demonstrating lessons inside the final project

Separately from the completed lesson evidence above, there is an **optional,
in-progress effort to also re-demonstrate some of those lesson mechanisms inside
the Namma Seva AI `final-project/` directory**. This is an enhancement, not a
requirement — "planned" below refers only to this optional re-implementation, not
to the required lessons, which are already complete.

| Lesson | Re-implementation in Namma Seva AI | Status | Location |
| --- | --- | --- | --- |
| Lesson 1 — Specs | 8 feature specs driving the build | Done | `final-project/.kiro/specs/` |
| Lesson 2 — Steering | 8 steering documents | Done | `final-project/.kiro/steering/` |
| Lesson 4 — Property-Based Testing | Readiness, knowledge/verification, multilingual, and RAG-grounding invariants (Hypothesis) | Done | `final-project/backend/tests/test_readiness_properties.py`, `test_knowledge_properties.py`, `test_multilingual_properties.py`, `test_rag_properties.py` |
| Lesson 3 — Hooks | Frontend / backend / knowledge / security hooks | Planned (optional) | `final-project/.kiro/hooks/` |
| Lesson 5 — Powers | Namma Seva Government Services Power | Planned (optional) | `final-project/namma-seva-power/` |
| Lesson 6 — MCP | AWS/Bedrock docs + fetch during development | Planned (optional) | `final-project/.kiro/settings/mcp.json` |
| Lesson 7 — Custom Agents | Purpose-built domain agents | Planned (optional) | `final-project/.kiro/agents/` |
