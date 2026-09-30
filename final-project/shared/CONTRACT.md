# Shared Domain / API Contract — Namma Seva AI

This is the source-of-truth contract for the Phase 1 vertical slice. Both the
FastAPI backend (`backend/`) and the React frontend (`frontend/`) implement the
types and endpoints defined here. It is derived directly from
`.kiro/steering/data-governance.md` and the feature specs.

> All service data in Phase 1 is **clearly-marked demo/mock data**. No real
> government-service requirements are asserted. Every seed record carries
> `"dataSource": "demo"` and demo sources, per the instruction not to invent
> official requirements before official sources are introduced.

## Core types

```
Lang = "ta" | "en"
ServiceCategory = "certificate" | "welfare-scheme" | "pension"
                | "education" | "civic-service" | "other"
VerificationStatus = "verified" | "conditional" | "unverified"
DocumentKind = "required" | "conditional" | "optional"

LocalizedText { en: string; ta: string }

Source {
  name: string
  url: string
  publishedDate?: string     # YYYY-MM-DD
  lastChecked: string        # YYYY-MM-DD
  verificationStatus: VerificationStatus
}

DocumentRequirement {
  id: string
  name: LocalizedText
  kind: DocumentKind
  condition?: LocalizedText   # required when kind == "conditional"
  reason?: LocalizedText
  sourceRef: string
}

Step { order: int; instruction: LocalizedText; sourceRef?: string }

Channel { type: "online"|"offline"|"csc"; label: LocalizedText; url?: string }

ServiceRecord {
  serviceId: string
  name: LocalizedText
  category: ServiceCategory
  description: LocalizedText
  eligibility: LocalizedText[]
  documents: DocumentRequirement[]
  steps: Step[]
  applicationChannels: Channel[]
  department: LocalizedText
  officialSources: Source[]
  faqs: { question: LocalizedText; answer: LocalizedText }[]
  lastVerified: string        # YYYY-MM-DD
  status: VerificationStatus
  dataSource: "demo" | "official"   # Phase 1 is always "demo"
  aliases?: LocalizedText[]   # optional search keywords per language (Phase 3);
                              # used only for discovery matching, not asserted as
                              # official facts
}
```

## Result types

```
DiscoveryResult =
  | { kind: "resolved"; service: ServiceRecord; confidence: number; language: Lang }
  | { kind: "clarification"; question: LocalizedText;
      options: { serviceId: string; label: LocalizedText }[];
      originalQuery: string; language: Lang }
  | { kind: "no-match"; message: LocalizedText; language: Lang }

Readiness = "READY" | "NOT_READY" | "NEEDS_VERIFICATION"

ReadinessResult {
  status: Readiness
  missingRequired: DocumentRequirement[]
  applicableConditionalMissing: DocumentRequirement[]
  reasons: string[]
}
```

## HTTP endpoints (Phase 1)

| Method | Path | Body / Query | Returns |
| --- | --- | --- | --- |
| GET  | `/health` | — | `{ status: "ok" }` |
| POST | `/discover` | `{ query: string; language: Lang }` | `DiscoveryResult` |
| GET  | `/services` | `?category=<ServiceCategory>` (optional) | `ServiceRecord[]` |
| GET  | `/services/{serviceId}` | — | `ServiceRecord` or 404 |
| GET  | `/categories` | — | `ServiceCategory[]` |
| POST | `/checklist/evaluate` | `{ serviceId: string; held: string[]; conditionAnswers: {[docId]: bool} }` | `ReadinessResult` |

All responses are JSON. Missing fields on a record are represented by absence;
the UI renders the "not available" phrase per `ai-rag.md`. No endpoint fabricates
a record or a fact.
