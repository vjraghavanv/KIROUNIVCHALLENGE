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
planning foundation (Specs + Steering) is in place, and **Phase 1** — the first
working vertical slice — has been implemented and tested.

### Status

- Planning foundation complete: 8 feature specs + 8 steering documents.
- Phase 1 vertical slice implemented: FastAPI backend + React/TS frontend
  covering **service search → service details → documents → action steps**.
- All service data is clearly-marked **demo/mock** data; no real government
  requirements are asserted yet.
- Backend tests: **12/12 passing** (8 integration + 4 property-based). Frontend
  typecheck and production build pass.
- No commits or pushes made; existing Git history preserved.

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

### Seven-lesson mapping (planned)

| Lesson | Implementation in Namma Seva AI | Evidence location |
| --- | --- | --- |
| Lesson 1 — Specs | 8 feature specs driving the build | `final-project/.kiro/specs/` |
| Lesson 2 — Steering | 8 steering documents | `final-project/.kiro/steering/` |
| Lesson 3 — Hooks | Frontend / backend / knowledge / security hooks (planned) | `final-project/.kiro/hooks/` |
| Lesson 4 — Property-Based Testing | Readiness invariants (Hypothesis) — real tests today; more to come | `final-project/backend/tests/test_readiness_properties.py` |
| Lesson 5 — Powers | Namma Seva Government Services Power (planned) | `final-project/namma-seva-power/` |
| Lesson 6 — MCP | AWS/Bedrock docs + fetch during development (planned) | `final-project/.kiro/settings/mcp.json` |
| Lesson 7 — Custom Agents | Purpose-built domain agents (planned) | `final-project/.kiro/agents/` |

Note: Lessons 1 and 2 have real artifacts today (the specs and steering above),
and Lesson 4 now has real property-based tests in the Phase 1 backend. Lessons
3, 5, 6, and 7 are designed and mapped but not yet implemented; the table marks
those as planned and their evidence locations will be populated as the build
proceeds.
