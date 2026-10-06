// Backend-less ("mock") implementation of the API, used when no real backend
// is configured. It faithfully mirrors the backend's deterministic behavior
// (see backend/app/domain/discovery.py and rag_assistant.py): tokenization +
// stopwords, field-weighted scoring, a 0.3 confidence threshold, and
// resolved / clarification / no-match outcomes. Grounding returns the record's
// own description + source names (same as the backend MockProvider) and never
// invents facts. Trust/verification status is taken verbatim from the data.

import { MOCK_SERVICES } from "./mockData";
import type {
  DiscoveryResult,
  GroundedResponse,
  Lang,
  ServiceRecord,
} from "./types";

const CONFIDENCE_THRESHOLD = 0.3;

// Mirror of backend _STOPWORDS (language-balanced).
const STOPWORDS = new Set<string>([
  "i", "need", "a", "an", "the", "for", "to", "how", "do", "get", "my", "want",
  "apply", "please", "help", "with", "of", "me",
  "எனக்கு", "வேண்டும்", "எப்படி", "பெற", "செய்ய", "வேண்டி", "ஒரு", "என்",
]);

const ASSISTANT_NOTICE = {
  en: "This is an informational assistant, not an official government service. Verify on the official source before acting.",
  ta: "இது ஒரு தகவல் உதவியாளர், அதிகாரப்பூர்வ அரசு சேவை அல்ல. செயல்படுவதற்கு முன் அதிகாரப்பூர்வ ஆதாரத்தில் சரிபார்க்கவும்.",
};

function tokens(term: string): string[] {
  return term
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

function score(record: ServiceRecord, term: string): number {
  const toks = tokens(term);
  if (toks.length === 0) return 0;

  const name = `${record.name.en} ${record.name.ta}`.toLowerCase();
  const aliases = (record.aliases ?? [])
    .map((a) => `${a.en} ${a.ta}`)
    .join(" ")
    .toLowerCase();
  const desc = `${record.description.en} ${record.description.ta}`.toLowerCase();
  const category = record.category.toLowerCase();
  const nameAndAliases = `${name} ${aliases}`;

  let hits = 0;
  for (const tok of toks) {
    if (nameAndAliases.includes(tok)) hits += 1.0;
    else if (category.includes(tok)) hits += 0.6;
    else if (desc.includes(tok)) hits += 0.4;
  }
  return Math.min(hits / toks.length, 1.0);
}

export function mockDiscover(query: string, language: Lang): DiscoveryResult {
  const scored = MOCK_SERVICES.map((rec) => ({ rec, s: score(rec, query) }));
  const above = scored
    .filter((p) => p.s >= CONFIDENCE_THRESHOLD)
    .sort((a, b) => b.s - a.s);

  if (above.length === 1) {
    return {
      kind: "resolved",
      service: above[0]!.rec,
      confidence: Math.round(above[0]!.s * 1000) / 1000,
      language,
    };
  }

  if (above.length >= 2) {
    const top = above[0]!.s;
    const contenders = above.filter((p) => Math.abs(p.s - top) < 1e-9);
    if (contenders.length === 1) {
      return {
        kind: "resolved",
        service: contenders[0]!.rec,
        confidence: Math.round(top * 1000) / 1000,
        language,
      };
    }
    return {
      kind: "clarification",
      question: {
        en: "Which service did you mean?",
        ta: "நீங்கள் எந்த சேவையைக் குறிப்பிடுகிறீர்கள்?",
      },
      options: above.map((p) => ({ serviceId: p.rec.serviceId, label: p.rec.name })),
      originalQuery: query,
      language,
    };
  }

  return {
    kind: "no-match",
    message: {
      en: "No confident match was found. Try rephrasing or browse by category.",
      ta: "உறுதியான பொருத்தம் கிடைக்கவில்லை. மறுபடியும் முயற்சிக்கவும் அல்லது வகை வாரியாகப் பார்க்கவும்.",
    },
    language,
  };
}

export function mockAsk(query: string, language: Lang): GroundedResponse {
  const lang: Lang = language === "ta" ? "ta" : "en";
  const notice = { en: ASSISTANT_NOTICE.en, ta: ASSISTANT_NOTICE.ta };
  const retrieval = mockDiscover(query, lang);

  if (retrieval.kind === "no-match") {
    return {
      kind: "no-match",
      grounded: false,
      answer: retrieval.message,
      language: lang,
      documents: [],
      steps: [],
      sources: [],
      isVerified: false,
      citedSourceRefs: [],
      clarificationOptions: [],
      notice,
    };
  }

  if (retrieval.kind === "clarification") {
    return {
      kind: "clarification",
      grounded: false,
      answer: {
        en: "Could you clarify which service you mean?",
        ta: "நீங்கள் எந்த சேவையைக் குறிப்பிடுகிறீர்கள் என்பதைத் தெளிவுபடுத்த முடியுமா?",
      },
      language: lang,
      documents: [],
      steps: [],
      sources: [],
      isVerified: false,
      citedSourceRefs: [],
      clarificationOptions: retrieval.options.map((o) => ({
        serviceId: o.serviceId,
        label: o.label,
      })),
      notice,
    };
  }

  const service = retrieval.service;
  const citedSourceRefs = service.officialSources.map((s) => s.name);
  const steps = [...service.steps].sort((a, b) => a.order - b.order);

  // Grounded: answer is the record's own description (same as backend MockProvider).
  // Demo/unverified data is never reported as verified (isVerified stays false).
  return {
    kind: "answer",
    grounded: true,
    answer: service.description,
    language: lang,
    serviceId: service.serviceId,
    serviceName: service.name,
    documents: service.documents,
    steps,
    sources: service.officialSources,
    verificationStatus: service.status,
    isVerified: false,
    citedSourceRefs,
    clarificationOptions: [],
    notice,
  };
}

export function mockListServices(): ServiceRecord[] {
  return MOCK_SERVICES;
}

export function mockGetService(serviceId: string): ServiceRecord | undefined {
  return MOCK_SERVICES.find((s) => s.serviceId === serviceId);
}
