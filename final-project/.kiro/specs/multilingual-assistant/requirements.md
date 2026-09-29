# Requirements — Multilingual Assistant

## Introduction

The Multilingual Assistant is the language layer of Namma Seva AI. It detects
the citizen's language, lets them switch between Tamil and English, and ensures
factual content is preserved across languages. It is a cross-cutting capability
consumed by Government Service Discovery, the RAG Assistant, the Document
Checklist, and the Service Action Planner.

This feature obeys the `data-governance.md` localized-field model (`en`/`ta`
pairs) and the `ai-rag.md` rule that switching language must not change resolved
intent or factual content.

## Dependencies

- **official-knowledge-base** — supplies localized (`en`/`ta`) `ServiceRecord`
  content that this layer renders and switches between.
- Consumed by **government-service-discovery**, **rag-assistant**,
  **document-checklist**, **service-action-planner**, **accessibility-senior-mode**.

## Glossary

- **UI language** — the language the citizen has explicitly selected.
- **Input language** — the language detected from the citizen's typed query.
- **Localized field** — a `{ en, ta }` pair defined in the KB schema.

## Requirements

### Requirement 1 — Language detection

**User story:** As a citizen, I want the app to recognize whether I typed Tamil
or English, so that it can respond appropriately.

#### Acceptance criteria

1. WHEN a citizen submits text THEN the system SHALL classify the input language
   as Tamil or English.
2. IF the text is code-mixed THEN the system SHALL not fail and SHALL defer to
   the UI language for the response.
3. WHEN input contains Tamil script characters THEN the system SHALL treat the
   input as containing Tamil.

### Requirement 2 — Explicit language switching

**User story:** As a bilingual citizen, I want to switch the interface language,
so that I can read in whichever language I prefer.

#### Acceptance criteria

1. WHEN a citizen selects a language THEN the system SHALL render all UI chrome
   and localized content in that language.
2. WHERE a citizen has selected a UI language THEN the system SHALL respond in
   that language regardless of input language.
3. WHEN the language is switched THEN the current service/result context SHALL
   be preserved (no loss of the active service).

### Requirement 3 — Factual preservation across languages

**User story:** As a citizen, I want the facts to stay the same in Tamil and
English, so that I can trust either version.

#### Acceptance criteria

1. WHEN localized content is displayed THEN factual fields (document names,
   eligibility, steps, sources) SHALL carry the same meaning in `en` and `ta`.
2. WHEN an official proper noun exists THEN the system SHALL preserve the
   official name rather than producing a lossy transliteration.
3. IF a Tamil translation is missing for a field THEN the system SHALL fall back
   to a clearly marked English value rather than fabricating a translation.

### Requirement 4 — Extensible language architecture

**User story:** As a maintainer, I want to add more Indian languages later, so
that the product can grow beyond Tamil and English.

#### Acceptance criteria

1. WHERE a new language is added THEN the system SHALL support it through the
   localized-field structure without changing feature logic.
2. WHEN a locale has no content for a field THEN the system SHALL apply a
   defined fallback order rather than erroring.

### Requirement 5 — Safety of translation

**User story:** As a citizen, I want translations to never invent requirements,
so that language does not introduce errors.

#### Acceptance criteria

1. WHEN content is localized THEN the system SHALL NOT add facts absent from the
   source `ServiceRecord`.
2. IF automated translation is used for non-authoritative helper text THEN the
   system SHALL mark authoritative facts as source-derived, not model-derived.
