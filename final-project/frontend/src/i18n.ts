// Minimal localization helpers (multilingual-assistant spec). UI chrome strings
// live here; government facts come from the KB and are never invented here.

import type { Lang, LocalizedText } from "./types";

export const UI = {
  appName: { en: "Namma Seva AI", ta: "நம்ம சேவை AI" },
  tagline: {
    en: "Government services, explained simply.",
    ta: "அரசு சேவைகள், எளிமையாக விளக்கப்பட்டவை.",
  },
  askPlaceholder: {
    en: "Example: I need a birth certificate",
    ta: "எடுத்துக்காட்டு: எனக்கு பிறப்பு சான்றிதழ் வேண்டும்",
  },
  heroTitle: { en: "How can we help you?", ta: "நாங்கள் எப்படி உதவலாம்?" },
  heroSubtitle: {
    en: "Ask about a government service in Tamil or English.",
    ta: "தமிழ் அல்லது ஆங்கிலத்தில் ஒரு அரசு சேவையைப் பற்றி கேளுங்கள்.",
  },
  askPrimary: { en: "Ask Namma Seva", ta: "நம்ம சேவாவிடம் கேள்" },
  hereIsWhat: { en: "Here's what you need", ta: "உங்களுக்குத் தேவையானது இதோ" },
  aboutService: { en: "About this service", ta: "இந்தச் சேவை பற்றி" },
  trustStatus: { en: "Trust status", ta: "நம்பகத்தன்மை நிலை" },
  categoryLabel: { en: "Category", ta: "வகை" },
  viewService: { en: "View service", ta: "சேவையைப் பார்" },
  search: { en: "Search", ta: "தேடு" },
  documents: { en: "Documents", ta: "ஆவணங்கள்" },
  steps: { en: "Steps", ta: "படிகள்" },
  whereToApply: { en: "Where to apply", ta: "எங்கே விண்ணப்பிக்க வேண்டும்" },
  sources: { en: "Official sources", ta: "அதிகாரப்பூர்வ ஆதாரங்கள்" },
  lastVerified: { en: "Last verified", ta: "கடைசியாக சரிபார்க்கப்பட்டது" },
  verificationStatus: { en: "Verification", ta: "சரிபார்ப்பு நிலை" },
  statusVerified: { en: "Verified", ta: "சரிபார்க்கப்பட்டது" },
  statusConditional: { en: "Conditional", ta: "நிபந்தனை" },
  statusUnverified: { en: "Unverified", ta: "சரிபார்க்கப்படாதது" },
  ask: { en: "Ask", ta: "கேள்" },
  answer: { en: "Answer", ta: "பதில்" },
  popularServices: { en: "Popular services", ta: "பிரபலமான சேவைகள்" },
  openService: { en: "Open service details", ta: "சேவை விவரங்களைத் திற" },
  citedSources: { en: "Cited sources", ta: "மேற்கோள் ஆதாரங்கள்" },
  viewFullService: { en: "View full service details", ta: "முழு சேவை விவரங்களைக் காண்க" },
  ungrounded: {
    en: "Not enough official information to answer confidently.",
    ta: "நம்பிக்கையுடன் பதிலளிக்க போதுமான அதிகாரப்பூர்வ தகவல் இல்லை.",
  },
  seniorMode: { en: "Senior-friendly mode", ta: "மூத்தோர் பயன்முறை" },
  loading: { en: "Loading…", ta: "ஏற்றுகிறது…" },
  back: { en: "Back", ta: "பின்செல்" },
  noMatch: { en: "No confident match.", ta: "உறுதியான பொருத்தம் இல்லை." },
  required: { en: "Required", ta: "தேவை" },
  conditional: { en: "Conditional", ta: "நிபந்தனை" },
  optional: { en: "Optional", ta: "விருப்பம்" },
  notAvailable: {
    en: "Official information not available in the current knowledge base.",
    ta: "தற்போதைய அறிவுத் தளத்தில் அதிகாரப்பூர்வ தகவல் இல்லை.",
  },
  demoNotice: {
    en: "Demo data only. This is an informational assistant, not an official service. Verify on the official source before acting.",
    ta: "மாதிரி தரவு மட்டுமே. இது ஒரு தகவல் உதவியாளர், அதிகாரப்பூர்வ சேவை அல்ல. செயல்படுவதற்கு முன் அதிகாரப்பூர்வ ஆதாரத்தில் சரிபார்க்கவும்.",
  },
  noMatchTitle: {
    en: "Sorry, I couldn't find a matching government service.",
    ta: "மன்னிக்கவும், பொருந்தும் அரசு சேவையைக் கண்டறிய முடியவில்லை.",
  },
  noMatchHint: {
    en: "Try asking in a different way, for example: \"I need a birth certificate\".",
    ta: "வேறு விதமாகக் கேட்டுப் பாருங்கள், எடுத்துக்காட்டு: \"எனக்கு பிறப்பு சான்றிதழ் வேண்டும்\".",
  },
  backendError: {
    en: "We couldn't connect to Namma Seva AI right now. Please try again.",
    ta: "இப்போது நம்ம சேவை AI உடன் இணைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  },
  importantNote: { en: "Important note", ta: "முக்கியக் குறிப்பு" },
} as const;

const LANG_KEY = "nsa.lang";

export function hasSavedLang(): boolean {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === "ta" || saved === "en";
  } catch {
    return false;
  }
}

export function loadLang(fallback: Lang = "en"): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ta" || saved === "en") return saved;
  } catch {
    // localStorage may be unavailable; fall back to default.
  }
  return fallback; // default per multilingual-assistant spec (en), senior mode -> ta
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Non-fatal: persistence is best-effort.
  }
}

// Localized labels for the service category enum. UI chrome only — these are
// generic category names, not government facts about any specific service.
const CATEGORY_LABELS: Record<string, LocalizedText> = {
  certificate: { en: "Certificate", ta: "சான்றிதழ்" },
  "welfare-scheme": { en: "Welfare scheme", ta: "நலத்திட்டம்" },
  pension: { en: "Pension", ta: "ஓய்வூதியம்" },
  education: { en: "Education", ta: "கல்வி" },
  "civic-service": { en: "Civic service", ta: "குடிமைச் சேவை" },
  other: { en: "Service", ta: "சேவை" },
};

const CATEGORY_FALLBACK: LocalizedText = { en: "Service", ta: "சேவை" };

export function categoryLabel(category: string, lang: Lang): string {
  const entry = CATEGORY_LABELS[category] ?? CATEGORY_FALLBACK;
  return entry[lang];
}

export function pick(text: LocalizedText, lang: Lang): string {
  const value = lang === "ta" ? text.ta : text.en;
  if (value && value.trim().length > 0) return value;
  // Fallback order: requested -> English -> marked unavailable.
  if (text.en && text.en.trim().length > 0) return `${text.en} (translation unavailable)`;
  return UI.notAvailable[lang];
}
