# Design — Multilingual Assistant

## Overview

The Multilingual Assistant provides language detection, language switching, and
localized rendering across Namma Seva AI. It is a thin, shared layer: it does
not own government facts (those live in the KB) — it selects and presents the
correct localized view of them.

Implements `multilingual-assistant/requirements.md`; obeys `data-governance.md`
(localized `en`/`ta` fields) and `ai-rag.md` (language switch must not change
intent or facts).

## Components and interfaces

### LanguageDetector (shared with discovery)
- `detect(text: string): Lang` where `Lang = "ta" | "en"`.
- Unicode Tamil-block heuristic; code-mixing defers to UI language.
- Single implementation reused by discovery and chat (no duplication).

### LanguageContext (frontend)
- Holds the active UI language; exposes `setLanguage(lang)` and `t(key)`.
- Persists selection for the session; preserves active service context on switch.

### Localizer
- `pick(field: LocalizedText, lang: Lang): string`
- Applies fallback order: requested locale → English → marked "translation
  unavailable". Never fabricates a translation.

### MessageCatalog
- UI-chrome strings (`en`/`ta`) for buttons, labels, empty/error states.
- Separate from KB content; catalog is app copy, KB is authoritative facts.

## Data flow

```
citizen text ──▶ LanguageDetector ──▶ inputLang
UI selector ───▶ LanguageContext ───▶ uiLang (authoritative for responses)
KB LocalizedText ──▶ Localizer(pick, uiLang) ──▶ rendered string
```

Responses always render in `uiLang` when set; `inputLang` only informs
heuristics and analytics-free UX (e.g. defaulting the selector on first use).

## Referenced steering

- `data-governance.md` — `LocalizedText` shape and the "no fabricated
  translation" rule.
- `ai-rag.md` — language-invariance and factual-preservation properties.
- `ui-ux.md` — Tamil/English presentation and font/readability expectations.

## Error and uncertainty handling

- Missing Tamil field → render English value with a visible "translation
  unavailable" marker (Requirement 3.3).
- Unknown/empty text → treated as UI language; no throw.
- Never substitute a machine translation for an authoritative KB fact.

## Testing strategy

- **Unit:** detector (ta/en/mixed), Localizer fallback order, context switch
  preserves active service.
- **Property-based (Lesson 4):**
  - Switching language preserves the resolved serviceId/intent.
  - `pick` never returns a value for a locale that was not present without the
    "unavailable" marker.
- **Integration:** render a seed `ServiceRecord` in both languages and confirm
  factual fields match in meaning and count.
