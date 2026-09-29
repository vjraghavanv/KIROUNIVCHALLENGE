# Design — Official Knowledge Base

## Overview

The KB stores `ServiceRecord`s as versioned JSON files and exposes a typed,
read-only query API to the rest of the application. It enforces the
`data-governance.md` schema at load time and refuses to serve invalid records.
It is intentionally simple: a validated in-memory index over structured files,
with a retrieval seam that can later be backed by a vector store without
changing callers.

## Architecture

```
JSON records (per service)
   │  load
   ▼
SchemaValidator ──(fail)──▶ ValidationReport (maintainer-facing)
   │ (pass)
   ▼
KnowledgeIndex (by id, by category, keyword index over en/ta)
   │
   ▼
KnowledgeBase (read API) ──▶ features
```

## Components and interfaces

### SchemaValidator
- `validate(record: unknown): ValidationResult`
- Encodes every `data-governance.md` rule: required fields, unique id (at set
  level), ≥1 source, one document kind, conditional needs condition, no
  required+optional clash, contiguous steps, online channel needs URL.

### KnowledgeIndex
- Builds maps: `byId`, `byCategory`, and a keyword index over `en`/`ta` text.
- Rebuilt on load; pure in-memory.

### KnowledgeBase (public read API)
```ts
interface KnowledgeBase {
  getById(serviceId: string): ServiceRecord | NotFound;
  listByCategory(category: ServiceCategory): ServiceRecord[];
  searchKeyword(term: string, lang?: Lang): ServiceRecord[];
  allCategories(): ServiceCategory[];
  status(): { total: number; invalid: number };
}
```

### RetrievalPort (seam for RAG)
- `retrieve(query, k): RetrievedChunk[]` — default implementation delegates to
  keyword search; a future vector-backed implementation swaps in without
  changing the RAG assistant.

## Data flow

- **Load:** files → validate → index → ready. Invalid records are excluded and
  reported, never served (Req 1.3, 7.2).
- **Read:** features call the read API; the KB returns typed records or a defined
  not-found (Req 6).

## Referenced steering

- `data-governance.md` — the schema and verification lifecycle (authoritative).
- `ai-rag.md` — RetrievalPort feeds grounded generation.
- `architecture.md` — knowledge architecture and the vector-store extensibility
  seam.
- `security.md` — records hold no PII; source URLs are validated, not executed.

## Error and uncertainty handling

- Invalid record → excluded + ValidationReport entry; the KB still serves the
  valid remainder.
- Missing locale → validation warning, not a hard failure (Req 5.2).
- Not found → explicit `NotFound`, never a fabricated record.
- `unverified` status is passed through so presenting features can flag it.

## Testing strategy

- **Unit:** validator rules (each rule has a passing and failing case); index
  lookups by id/category/keyword.
- **Property-based (Lesson 4):**
  - Every served record has a unique id and ≥1 source.
  - No document is both required and optional; conditional docs always carry a
    condition.
  - Steps are contiguous and 1-based.
  - A record with no source is never `verified`.
- **Integration:** load the seed KB (4 certificate services) and exercise all
  read paths in both languages.
