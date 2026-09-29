# Coding Standards — Namma Seva AI

These rules apply to all application code. They build on the existing
`kiro-university-lesson-2/.kiro/steering/typescript-standards.md` (strict TS, no
`any`, explicit boundary types) and extend it to React and Python/FastAPI.

## TypeScript / React

- **Strict TypeScript.** `strict: true`, no implicit `any`, no unchecked null
  access. Use `unknown` + narrowing, never `any`.
- **Explicit types at boundaries.** Annotate exported functions, props, and API
  payloads; let inference handle obvious locals.
- **Function components + hooks.** No class components. Keep components focused;
  extract logic into hooks or pure functions.
- **Domain logic outside components.** Readiness, plan composition, and
  verification live in pure modules, not in JSX.
- **No hardcoded government facts** in components; render typed data from the KB.

## Python / FastAPI

- **Type hints everywhere**; run a type checker (mypy/pyright) in CI and hooks.
- **Pydantic models** for request/response and for validating loaded records.
- **Thin routes, rich services.** Routes parse/serialize; domain logic lives in
  service modules and stays framework-independent and unit-testable.
- **Pure domain functions** for readiness/planning/verification so property
  tests can target them directly.

## Naming

- Descriptive, intent-revealing names. `serviceId`, `ReadinessResult`,
  `GroundedContextBuilder` — not `data`, `tmp`, `mgr`.
- TS: `camelCase` values, `PascalCase` types/components. Python: `snake_case`
  functions/vars, `PascalCase` classes. `serviceId` stays kebab-case as data.

## Error handling

- Fail loud in development, degrade safely for citizens.
- No silent catches; either handle meaningfully or surface a typed error.
- Never fabricate a fallback government fact on error — return "not available"
  or an error state (per `ai-rag.md`).
- Provider errors fall back to MockProvider, not to guessed content.

## API design

- REST, JSON, typed contracts; explicit status codes; validation errors return
  structured messages (no stack traces to clients).
- Idempotent reads; no side effects on GET.
- Version-friendly response shapes; additive changes preferred.

## Type safety

- One shared domain vocabulary (`data-governance.md` types). Do not redefine
  `ServiceRecord`/`Source` per feature.
- Parse external/untrusted input (`unknown`) at the boundary and narrow before
  use.

## Component structure

- `feature/` folders group UI + hooks + local types.
- Container vs. presentational separation; presentational components are pure and
  prop-driven.
- Accessibility is a build-time requirement, not an afterthought (see
  `ui-ux.md`).

## Logging

- Structured logs; never log Aadhaar/PAN or other sensitive identifiers, secrets,
  or full query strings that may contain them (`security.md`).
- Log decisions and errors, not personal data. Redact by default.

## Configuration

- All environment-specific values (provider selection, model ids, knowledge
  source) come from configuration, never hardcoded in feature logic.
- Sensible offline defaults: MockProvider + local KB with no configuration.

## Environment variables

- Secrets and endpoints via environment variables only; never committed.
- Provide a `.env.example` documenting names (not values).
- Reference secrets by name in code/docs; never echo values into logs or output.
