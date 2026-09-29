# Architecture — Namma Seva AI

## Guiding principle

Local-first, cloud-ready, retrieval-grounded, and as simple as the problem
allows. No Kubernetes, Kafka, unnecessary microservices, Redis, or bespoke ML
infrastructure. The government facts live in a structured knowledge base; the AI
only phrases and cites what the KB provides.

## Frontend architecture

- **React + TypeScript (Vite)** single-page app.
- Feature-oriented structure mirroring the specs: discovery, service result /
  action plan, document checklist, chat, senior/accessibility mode.
- Cross-cutting React contexts: `LanguageContext` (multilingual-assistant) and
  `AccessibilityProvider` (accessibility-senior-mode).
- Presentational components are fed typed data; no government facts are hardcoded
  in components.

## Backend architecture

- **Python + FastAPI** service exposing discovery, KB read, planning, checklist
  evaluation, and chat endpoints.
- Layered: routes → services (domain logic) → knowledge/retrieval → provider.
- Domain logic (readiness, plan composition, verification) is pure and unit/
  property testable, independent of the web framework.

## API boundaries

- JSON over HTTP; typed request/response contracts shared in intent with the
  frontend domain types.
- Endpoints (indicative): `POST /discover`, `GET /services/{id}`,
  `GET /services?category=`, `POST /checklist/evaluate`, `POST /chat`.
- The frontend never talks to Bedrock directly; all AI access is server-side
  behind the Provider.

## Domain model

- Canonical types defined in `data-governance.md`: `ServiceRecord`,
  `DocumentRequirement`, `Source`, `LocalizedText`, plus feature result types
  (`DiscoveryResult`, `ReadinessResult`, `ActionPlan`, `VerifiedClaim`).
- One shared domain vocabulary; features consume it rather than redefining it.

## Knowledge architecture

- Structured JSON `ServiceRecord`s validated at load (official-knowledge-base).
- In-memory `KnowledgeIndex` (by id, by category, keyword over `en`/`ta`).
- `RetrievalPort` seam: default keyword retrieval now; a vector store (e.g. via
  S3-hosted content + embeddings) can back it later without changing callers.

## Provider abstraction

- Single `Provider` interface: `generate(groundedContext, question, language)`.
- **MockProvider** — deterministic, offline; composes answers from grounded
  context. Default for local dev, tests, and demo fallback.
- **BedrockProvider** — Amazon Bedrock implementation; same contract; selected by
  configuration. Credentials come from the environment only (`security.md`); a
  provider error falls back to MockProvider so the product keeps working.
- Swapping providers must not change retrieval, grounding, or citation behavior.

## Deployment architecture

- Local: Vite dev server + FastAPI (`uvicorn`), MockProvider — fully offline.
- Cloud-ready: static frontend hosting + a container/service for the API;
  optional S3 for knowledge content and Bedrock for generation.
- Configuration selects the provider and knowledge source; nothing about
  deployment is hardcoded in feature logic.

## Extensibility principles

- Add a service = add a validated JSON record; no feature code changes.
- Add a language = add localized fields + catalog entries; feature logic
  unchanged.
- Swap retrieval or provider behind their seams; callers stay stable.
- Keep domain logic pure so it can be tested and reused across surfaces.
