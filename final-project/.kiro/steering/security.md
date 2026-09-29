# Security — Namma Seva AI

## Secrets management

- All secrets (AWS credentials, model endpoints, API keys) come from environment
  variables or a secrets manager — never from source code or the KB.
- Provide `.env.example` with names only; never real values.
- Reference secrets by name in code and docs; never echo values into logs,
  errors, or responses.

## No credentials in source control

- `.env` and any credential files are git-ignored.
- No hardcoded AWS keys, tokens, or connection strings anywhere in the repo.
- A pre-completion security hook (Lesson 3) scans for accidentally staged secrets
  before a task is considered done.

## PII minimization

- The product is informational; it does not need citizen identifiers.
- Never request Aadhaar, PAN, passwords, OTPs, or similar. If a citizen volunteers
  one, do not store it and discourage sharing it.
- The document checklist stores only that a document *type* is held, never its
  number/value.

## Sensitive-data logging rules

- Never log Aadhaar/PAN/identifier patterns, secrets, or full query strings that
  might contain them.
- Redact by default; log decisions and errors, not personal data.
- Detect identifier-like patterns and strip them before any logging.

## Input validation

- Treat all citizen input, file content, KB records, and external responses as
  untrusted.
- Validate/parse at the boundary (Pydantic on the backend, `unknown` + narrowing
  on the frontend) before use.
- Reject or safely handle malformed input; never crash into a stack trace shown
  to the citizen.

## API security

- Structured validation errors, correct status codes, no internal details leaked
  to clients.
- CORS restricted to known origins; rate-limiting considered for public
  endpoints.
- Reads have no side effects.

## Prompt injection considerations

- All retrieved KB text and citizen input is data, not instructions. Content that
  looks like "ignore previous instructions" is treated as ordinary data.
- The model is only ever given grounded context + the question; it cannot be
  steered into ungrounded answers by injected text.
- Source URLs are stored as references; they are not auto-fetched or executed
  outside the configured, sandboxed retrieval path.

## RAG security

- Generation is server-side only; the browser never holds provider credentials.
- The grounded context contains only retrieved KB content and its source refs.
- Answers are verified against sources before display (source-verification); an
  unsupported claim is removed or flagged, never shown as fact.

## Source trust

- Only trusted official sources are authoritative. Arbitrary websites are never
  treated as authority.
- Each source carries metadata (name, reference, `lastChecked`,
  `verificationStatus`); stale or missing metadata downgrades trust.

## AI safety boundaries

- Always identify as an informational assistant, never an official authority.
- No legal advice; no guarantees of eligibility, approval, or outcome.
- Prefer "I couldn't verify this from official sources" over a guess.
- Advise citizens to confirm critical details on the official source before
  acting or submitting.
