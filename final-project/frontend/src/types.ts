// Domain types mirroring shared/CONTRACT.md. Single source of truth is the
// contract; keep these in sync with the backend Pydantic models.

export type Lang = "ta" | "en";

export type ServiceCategory =
  | "certificate"
  | "welfare-scheme"
  | "pension"
  | "education"
  | "civic-service"
  | "other";

export type VerificationStatus = "verified" | "conditional" | "unverified";
export type DocumentKind = "required" | "conditional" | "optional";
export type DataSource = "demo" | "official";

export interface LocalizedText {
  en: string;
  ta: string;
}

export interface Source {
  name: string;
  url: string;
  publishedDate?: string;
  lastChecked: string;
  verificationStatus: VerificationStatus;
}

export interface DocumentRequirement {
  id: string;
  name: LocalizedText;
  kind: DocumentKind;
  condition?: LocalizedText;
  reason?: LocalizedText;
  sourceRef: string;
}

export interface Step {
  order: number;
  instruction: LocalizedText;
  sourceRef?: string;
}

export interface Channel {
  type: "online" | "offline" | "csc";
  label: LocalizedText;
  url?: string;
}

export interface Faq {
  question: LocalizedText;
  answer: LocalizedText;
}

export interface ServiceRecord {
  serviceId: string;
  name: LocalizedText;
  category: ServiceCategory;
  description: LocalizedText;
  eligibility: LocalizedText[];
  documents: DocumentRequirement[];
  steps: Step[];
  applicationChannels: Channel[];
  department: LocalizedText;
  officialSources: Source[];
  faqs: Faq[];
  lastVerified: string;
  status: VerificationStatus;
  dataSource: DataSource;
  aliases?: LocalizedText[];
}

export type DiscoveryResult =
  | { kind: "resolved"; service: ServiceRecord; confidence: number; language: Lang }
  | {
      kind: "clarification";
      question: LocalizedText;
      options: { serviceId: string; label: LocalizedText }[];
      originalQuery: string;
      language: Lang;
    }
  | { kind: "no-match"; message: LocalizedText; language: Lang };

export type Readiness = "READY" | "NOT_READY" | "NEEDS_VERIFICATION";

export interface ReadinessResult {
  status: Readiness;
  missingRequired: DocumentRequirement[];
  applicableConditionalMissing: DocumentRequirement[];
  reasons: string[];
}

export interface GroundedResponse {
  kind: "answer" | "clarification" | "no-match";
  grounded: boolean;
  answer: LocalizedText;
  language: Lang;
  serviceId?: string;
  serviceName?: LocalizedText;
  documents: DocumentRequirement[];
  steps: Step[];
  sources: Source[];
  verificationStatus?: VerificationStatus;
  isVerified: boolean;
  citedSourceRefs: string[];
  clarificationOptions: { serviceId: string; label: LocalizedText }[];
  notice: LocalizedText;
}
