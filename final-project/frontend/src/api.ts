// Typed API client. Talks to the FastAPI backend via the Vite /api proxy.

import type {
  DiscoveryResult,
  Lang,
  ReadinessResult,
  ServiceRecord,
} from "./types";

const BASE = "/api";

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
