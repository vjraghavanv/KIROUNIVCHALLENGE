// Typed API client. Single source of truth for the backend base URL.
//
// - Local development: VITE_API_BASE_URL is unset, so BASE defaults to "/api"
//   and the Vite dev server proxies /api -> http://localhost:8000.
// - Production (e.g. AWS Amplify): set VITE_API_BASE_URL to the deployed
//   FastAPI backend origin (for example https://api.example.com). The value is
//   injected at build time by Vite. No localhost URL is hardcoded for production.

import type {
  DiscoveryResult,
  GroundedResponse,
  Lang,
  ReadinessResult,
  ServiceRecord,
} from "./types";

// Trim any trailing slash so paths join cleanly (`${BASE}/health`).
const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const BASE = RAW_BASE.replace(/\/+$/, "");

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function discover(query: string, language: Lang): Promise<DiscoveryResult> {
  const res = await fetch(`${BASE}/discover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
  return json<DiscoveryResult>(res);
}

export async function ask(query: string, language: Lang): Promise<GroundedResponse> {
  const res = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
  return json<GroundedResponse>(res);
}

export async function getService(serviceId: string): Promise<ServiceRecord> {
  return json<ServiceRecord>(await fetch(`${BASE}/services/${encodeURIComponent(serviceId)}`));
}

export async function listServices(): Promise<ServiceRecord[]> {
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
