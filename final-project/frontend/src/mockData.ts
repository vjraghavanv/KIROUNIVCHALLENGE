// Bundled demo data for the backend-less ("mock") deployment path.
//
// This is a faithful FRONTEND COPY of the three demo services in
// `backend/app/data/demo_services.json`, expressed in the frontend's camelCase
// `ServiceRecord` shape. It exists only so the app can run on static hosting
// (e.g. AWS Amplify) with no backend. It introduces NO new government facts and
// preserves the exact trust/verification status of each record (all demo /
// unverified / conditional). The backend data file is unchanged.

import type { ServiceRecord } from "./types";

export const MOCK_SERVICES: ServiceRecord[] = [
  {
    serviceId: "income-certificate",
    name: { en: "Income Certificate (DEMO)", ta: "வருமான சான்றிதழ் (மாதிரி)" },
    category: "certificate",
    description: {
      en: "DEMO record. An income certificate states a family's annual income for use with schemes and admissions. Values here are placeholders, not official.",
      ta: "மாதிரி பதிவு. வருமான சான்றிதழ் ஒரு குடும்பத்தின் ஆண்டு வருமானத்தைக் குறிக்கிறது. இங்குள்ள தகவல்கள் மாதிரி மட்டுமே.",
    },
    eligibility: [
      { en: "DEMO: Resident of the state (placeholder criterion).", ta: "மாதிரி: மாநில குடியிருப்பாளர் (மாதிரி நிபந்தனை)." },
    ],
    documents: [
      {
        id: "id-proof",
        name: { en: "Identity proof", ta: "அடையாளச் சான்று" },
        kind: "required",
        reason: { en: "DEMO placeholder reason.", ta: "மாதிரி காரணம்." },
        sourceRef: "demo-source",
      },
      {
        id: "address-proof",
        name: { en: "Address proof", ta: "முகவரிச் சான்று" },
        kind: "required",
        sourceRef: "demo-source",
      },
      {
        id: "income-declaration",
        name: { en: "Income declaration", ta: "வருமான அறிக்கை" },
        kind: "conditional",
        condition: { en: "If self-employed", ta: "சுயதொழில் செய்பவராக இருந்தால்" },
        sourceRef: "demo-source",
      },
      {
        id: "passport-photo",
        name: { en: "Passport photo", ta: "பாஸ்போர்ட் புகைப்படம்" },
        kind: "optional",
        sourceRef: "demo-source",
      },
    ],
    steps: [
      { order: 1, instruction: { en: "DEMO: Gather the required documents.", ta: "மாதிரி: தேவையான ஆவணங்களைச் சேகரிக்கவும்." }, sourceRef: "demo-source" },
      { order: 2, instruction: { en: "DEMO: Submit the application at the designated office or portal.", ta: "மாதிரி: விண்ணப்பத்தை சமர்ப்பிக்கவும்." }, sourceRef: "demo-source" },
      { order: 3, instruction: { en: "DEMO: Track the application and collect the certificate.", ta: "மாதிரி: விண்ணப்பத்தைக் கண்காணித்து சான்றிதழைப் பெறவும்." }, sourceRef: "demo-source" },
    ],
    applicationChannels: [
      { type: "online", label: { en: "Demo online portal", ta: "மாதிரி ஆன்லைன் போர்டல்" }, url: "https://www.tnesevai.tn.gov.in/citizen/" },
      { type: "offline", label: { en: "Demo local office", ta: "மாதிரி உள்ளூர் அலுவலகம்" } },
    ],
    department: { en: "Demo Revenue Department", ta: "மாதிரி வருவாய்த் துறை" },
    officialSources: [
      { name: "Tamil Nadu e-Sevai (TN eSevai) citizen portal", url: "https://www.tnesevai.tn.gov.in/citizen/", lastChecked: "2026-09-01", verificationStatus: "unverified" },
    ],
    faqs: [
      { question: { en: "Is this real government data?", ta: "இது உண்மையான அரசு தரவா?" }, answer: { en: "No. This is DEMO data for development only.", ta: "இல்லை. இது மேம்பாட்டிற்கான மாதிரி தரவு மட்டுமே." } },
    ],
    lastVerified: "2026-09-01",
    status: "unverified",
    dataSource: "demo",
    aliases: [
      { en: "income certificate", ta: "வருமான சான்றிதழ்" },
      { en: "income proof", ta: "வருமான சான்று" },
    ],
  },
  {
    serviceId: "birth-certificate",
    name: { en: "Birth Certificate (DEMO)", ta: "பிறப்பு சான்றிதழ் (மாதிரி)" },
    category: "certificate",
    description: {
      en: "DEMO record. A birth certificate is an official record of a birth. Placeholder content only.",
      ta: "மாதிரி பதிவு. பிறப்பு சான்றிதழ் ஒரு பிறப்பின் அதிகாரப்பூர்வ பதிவு. மாதிரி உள்ளடக்கம் மட்டுமே.",
    },
    eligibility: [
      { en: "DEMO: Applicable to births to be registered (placeholder).", ta: "மாதிரி: பதிவு செய்யப்பட வேண்டிய பிறப்புகளுக்கு (மாதிரி)." },
    ],
    documents: [
      {
        id: "hospital-record",
        name: { en: "Hospital birth record", ta: "மருத்துவமனை பிறப்பு பதிவு" },
        kind: "required",
        sourceRef: "demo-source",
      },
      {
        id: "parent-id",
        name: { en: "Parent identity proof", ta: "பெற்றோர் அடையாளச் சான்று" },
        kind: "required",
        sourceRef: "demo-source",
      },
    ],
    steps: [
      { order: 1, instruction: { en: "DEMO: Obtain the hospital birth record.", ta: "மாதிரி: மருத்துவமனை பிறப்பு பதிவைப் பெறவும்." }, sourceRef: "demo-source" },
      { order: 2, instruction: { en: "DEMO: Register the birth at the local body.", ta: "மாதிரி: உள்ளாட்சி அமைப்பில் பிறப்பைப் பதிவு செய்யவும்." }, sourceRef: "demo-source" },
    ],
    applicationChannels: [
      { type: "offline", label: { en: "Demo local body office", ta: "மாதிரி உள்ளாட்சி அலுவலகம்" } },
    ],
    department: { en: "Demo Municipal Department", ta: "மாதிரி நகராட்சித் துறை" },
    officialSources: [
      { name: "Tamil Nadu e-Sevai (TN eSevai) citizen portal", url: "https://www.tnesevai.tn.gov.in/citizen/", lastChecked: "2026-09-01", verificationStatus: "unverified" },
    ],
    faqs: [],
    lastVerified: "2026-09-01",
    status: "unverified",
    dataSource: "demo",
    aliases: [{ en: "birth certificate", ta: "பிறப்பு சான்றிதழ்" }],
  },
  {
    serviceId: "street-light-complaint",
    name: { en: "Street Light Complaint (DEMO)", ta: "தெரு விளக்கு புகார் (மாதிரி)" },
    category: "civic-service",
    description: {
      en: "DEMO record. Report a non-working public street light to the local body. Placeholder content; verify the real channel officially.",
      ta: "மாதிரி பதிவு. வேலை செய்யாத பொது தெரு விளக்கை உள்ளாட்சிக்குத் தெரிவிக்கவும். மாதிரி உள்ளடக்கம்; உண்மையான வழியை அதிகாரப்பூர்வமாக சரிபார்க்கவும்.",
    },
    eligibility: [
      { en: "DEMO: Any resident may report a civic issue (placeholder).", ta: "மாதிரி: எந்த குடியிருப்பாளரும் புகார் அளிக்கலாம் (மாதிரி)." },
    ],
    documents: [
      {
        id: "location-detail",
        name: { en: "Location / pole reference", ta: "இட / கம்ப குறிப்பு" },
        kind: "required",
        sourceRef: "demo-source",
      },
      {
        id: "photo",
        name: { en: "Photo of the issue", ta: "பிரச்சினையின் புகைப்படம்" },
        kind: "conditional",
        condition: { en: "If requested by the local body", ta: "உள்ளாட்சி கேட்டால்" },
        sourceRef: "demo-source",
      },
    ],
    steps: [
      { order: 1, instruction: { en: "DEMO: Note the pole/location reference.", ta: "மாதிரி: கம்ப / இட குறிப்பைக் குறித்துக் கொள்ளவும்." }, sourceRef: "demo-source" },
      { order: 2, instruction: { en: "DEMO: Submit the complaint through the local body channel.", ta: "மாதிரி: உள்ளாட்சி வழியாக புகாரை சமர்ப்பிக்கவும்." }, sourceRef: "demo-source" },
    ],
    applicationChannels: [
      { type: "online", label: { en: "Demo civic portal", ta: "மாதிரி குடிமை போர்டல்" }, url: "https://www.tnesevai.tn.gov.in/citizen/" },
      { type: "offline", label: { en: "Demo local body office", ta: "மாதிரி உள்ளாட்சி அலுவலகம்" } },
    ],
    department: { en: "Demo Local Body", ta: "மாதிரி உள்ளாட்சி அமைப்பு" },
    officialSources: [
      { name: "Tamil Nadu e-Sevai (TN eSevai) citizen portal", url: "https://www.tnesevai.tn.gov.in/citizen/", lastChecked: "2026-09-01", verificationStatus: "conditional" },
    ],
    faqs: [],
    lastVerified: "2026-09-01",
    status: "conditional",
    dataSource: "demo",
    aliases: [
      { en: "street light complaint", ta: "தெரு விளக்கு புகார்" },
      { en: "broken street light", ta: "தெரு விளக்கு வேலை செய்யவில்லை" },
    ],
  },
];
