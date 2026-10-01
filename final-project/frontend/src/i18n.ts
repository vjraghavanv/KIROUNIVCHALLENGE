// Minimal localization helpers (multilingual-assistant spec). UI chrome strings
// live here; government facts come from the KB and are never invented here.

import type { Lang, LocalizedText } from "./types";

export const UI = {
  appName: { en: "Namma Seva AI", ta: "நம்ம சேவை AI" },
  tagline: {
    en: "Government services, explained simply.",
    ta: "அரசு சேவைகள், எளிமையாக விளக்கப்பட்டவை.",
  },
  askPlaceholder: { en: "What do you need help with?", ta: "என்ன சேவை வேண்டும்?" },
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

export function pick(text: LocalizedText, lang: Lang): string {
  const value = lang === "ta" ? text.ta : text.en;
  if (value && value.trim().length > 0) return value;
  // Fallback order: requested -> English -> marked unavailable.
  if (text.en && text.en.trim().length > 0) return `${text.en} (translation unavailable)`;
  return UI.notAvailable[lang];
}
