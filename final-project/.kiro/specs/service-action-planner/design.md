# Design — Service Action Planner

## Overview

The Service Action Planner composes a resolved `ServiceRecord` into an ordered,
sectioned plan for the citizen. It is a pure presentation-composition layer: it
selects and orders record fields, applies the "not available" rule for missing
sections, and hands the result to the UI and the follow-up chat entry point.

Implements `service-action-planner/requirements.md`; obeys `data-governance.md`
and `ai-rag.md`.

## Components and interfaces

### PlanComposer (pure)
```ts
interface PlanSection {
  key: PlanSectionKey;              // what-it-is, who, eligibility, documents, ...
  title: LocalizedText;
  content: PlanContent | Unavailable;   // Unavailable renders the standard phrase
  sourceRef?: string;
}

interface ActionPlan {
  serviceId: string;
  sections: PlanSection[];          // fixed canonical order
  sources: Source[];
  lastVerified: ISODate;
  unverified: boolean;
  followUpContext: { serviceId: string };
}

function compose(service: ServiceRecord, lang: Lang): ActionPlan;
```
- Canonical section order is fixed (Requirement 1.1).
- Any absent field becomes an `Unavailable` section, never a fabricated value.
- Fees/processing only populate when present with a source (Requirement 2).

### PlanView (frontend)
- Renders sections, source block, unverified flag, and the follow-up entry that
  seeds the RAG Assistant with `followUpContext`.

## Data flow

```
resolved ServiceRecord ─▶ PlanComposer.compose(service, lang) ─▶ ActionPlan
ActionPlan ─▶ PlanView ─▶ (sections + sources + follow-up entry)
follow-up click ─▶ RAG Assistant (same serviceId context)
```

## Referenced steering

- `data-governance.md` — which fields are source-backed; fees/processing rules.
- `ai-rag.md` — "not available" phrasing; no invented facts; safety framing.
- `ui-ux.md` — sectioned service-result layout (not a chat blob).
- `product.md` — trust principles and assistant identity.

## Error and uncertainty handling

- Missing section → `Unavailable` (standard phrase), per section (Req 1.3).
- No official fee/processing → omit value + show phrase (Req 2).
- Unverified record → whole plan flagged (Req 4.2).

## Testing strategy

- **Unit:** section ordering; Unavailable substitution; fee/processing gating.
- **Property-based (Lesson 4):**
  - Every section present in the record appears; no section contains a value
    absent from the record.
  - Fees/processing never appear without a source.
  - Section order is always the canonical order.
- **Integration:** compose plans for all seed services in both languages;
  confirm follow-up carries the correct serviceId.
