// Typed API client. Single source of truth for the backend base URL.
//
// - Local development: VITE_API_BASE_URL is unset, so BASE defaults to "/api"
//   and the Vite dev server proxies /api -> http://localhost:8000.
// - Real backend (e.g. AWS App Runner): set VITE_API_BASE_URL to the deployed
//   FastAPI origin (for example https://xxxx.region.awsapprunner.com). Injected
//   at build time by Vite. No localhost URL is hardcoded for production.
// - Backend-less demo: set VITE_API_BASE_URL=mock to serve the bundled demo
//   data entirely in the browser (used for static hosting on AWS Amplify with
//   no backend). See mockApi.ts / mockData.ts.

import type {
  DiscoveryResult,
  GroundedResponse,
  Lang,
  ReadinessResult,
  ServiceRecord,
} from "./types";
import { mockAsk, mockDiscover, mockGetService, mockListServices } from "./mockApi";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Backend-less mode: VITE_API_BASE_URL=mock serves bundled demo data in-browser.
const USE_MOCK = RAW_BASE.trim().toLowerCase() === "mock";

// Trim any trailing slash so paths join cleanly (`${BASE}/health`).
const BASE = RAW_BASE.replace(/\/+$/, "");

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function discover(query: string, language: Lang): Promise<DiscoveryResult> {
  if (USE_MOCK) return mockDiscover(query, language);
  const res = await fetch(`${BASE}/discover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
  return json<DiscoveryResult>(res);
}

export async function ask(query: string, language: Lang): Promise<GroundedResponse> {
  if (USE_MOCK) return mockAsk(query, language);
  const res = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
  return json<GroundedResponse>(res);
}

export async function getService(serviceId: string): Promise<ServiceRecord> {
  if (USE_MOCK) {
    const svc = mockGetService(serviceId);
    if (!svc) throw new Error("service not found");
    return svc;
  }
  return json<ServiceRecord>(await fetch(`${BASE}/services/${encodeURIComponent(serviceId)}`));
}

export async function listServices(): Promise<ServiceRecord[]> {
  if (USE_MOCK) return mockListServices();
  return json<ServiceRecord[]>(await fetch(`${BASE}/services`));
}

export async function evaluateChecklist(
  serviceId: string,
  held: string[],
  conditionAnswers: Record<string, boolean>
): Promise<ReadinessResult> {
  const res = await fetch(`${BASE}/checklist/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceId, held, conditionAnswers }),
  });
  return json<ReadinessResult>(res);
}
