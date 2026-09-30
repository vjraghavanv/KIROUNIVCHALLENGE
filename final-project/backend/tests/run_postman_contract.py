"""Local contract runner mirroring the Namma Seva AI Postman collection.

Used when the Postman cloud MCP session is unavailable. Exercises every endpoint
in shared/CONTRACT.md against a live server and asserts the response contract,
including the ServiceRecord.aliases field and the /ask provider path
(app/ai/provider.py get_provider -> MockProvider).
"""

from __future__ import annotations

import json
import sys
import urllib.request

BASE = "http://127.0.0.1:8000"
results: list[tuple[str, bool, str]] = []


def _req(method: str, path: str, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"} if data else {}
    r = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def check(name: str, cond: bool, detail: str = "") -> None:
    results.append((name, bool(cond), detail))


# 1. GET /health
st, body = _req("GET", "/health")
check("health: 200", st == 200, f"status={st}")
check("health: status ok", body.get("status") == "ok", str(body))

# 2. GET /categories
st, cats = _req("GET", "/categories")
check("categories: 200", st == 200, f"status={st}")
check("categories: is list", isinstance(cats, list) and len(cats) > 0, str(cats))
check("categories: contains 'certificate'", "certificate" in cats, str(cats))

# 3. GET /services (all)
st, svcs = _req("GET", "/services")
check("services: 200", st == 200, f"status={st}")
check("services: non-empty list", isinstance(svcs, list) and len(svcs) >= 1, str(len(svcs)))
first = svcs[0] if svcs else {}
check("services: item has serviceId", "serviceId" in first, list(first.keys()))
check("services: item has aliases field", "aliases" in first, list(first.keys()))
check("services: aliases is list", isinstance(first.get("aliases"), list), str(first.get("aliases")))

# 4. GET /services?category=certificate
st, filtered = _req("GET", "/services?category=certificate")
check("services?category: 200", st == 200, f"status={st}")
check(
    "services?category: all certificate",
    isinstance(filtered, list) and all(s.get("category") == "certificate" for s in filtered),
    str([s.get("category") for s in filtered]),
)

# 5. GET /services/{id}
st, svc = _req("GET", "/services/income-certificate")
check("service by id: 200", st == 200, f"status={st}")
check("service by id: correct id", svc.get("serviceId") == "income-certificate", str(svc.get("serviceId")))
check("service by id: has aliases field", "aliases" in svc, list(svc.keys()))
check("service by id: aliases is list", isinstance(svc.get("aliases"), list), str(svc.get("aliases")))

# 6. GET /services/{id} not found
st, nf = _req("GET", "/services/does-not-exist")
check("service by id 404", st == 404, f"status={st}")
check("service by id 404 detail", nf.get("detail") == "service not found", str(nf))

# 7. POST /discover
st, disc = _req("POST", "/discover", {"query": "income certificate", "language": "en"})
check("discover: 200", st == 200, f"status={st}")
check("discover: has kind", "kind" in disc, list(disc.keys()))

# 8. POST /ask (exercises provider.py get_provider -> MockProvider)
st, ask = _req("POST", "/ask", {"query": "income certificate", "language": "en"})
check("ask: 200", st == 200, f"status={st}")
check("ask: has kind", "kind" in ask, list(ask.keys()))
check("ask: has grounded flag", "grounded" in ask, list(ask.keys()))
check("ask: has answer.en", isinstance(ask.get("answer"), dict) and "en" in ask.get("answer", {}), str(ask.get("answer")))
check("ask: has notice", "notice" in ask, list(ask.keys()))

# 8b. POST /ask (Tamil) -> provider language branch
st, askta = _req("POST", "/ask", {"query": "income certificate", "language": "ta"})
check("ask ta: 200", st == 200, f"status={st}")
check("ask ta: language ta", askta.get("language") == "ta", str(askta.get("language")))

# 9. POST /checklist/evaluate
st, chk = _req(
    "POST",
    "/checklist/evaluate",
    {"serviceId": "income-certificate", "held": [], "conditionAnswers": {}},
)
check("checklist: 200", st == 200, f"status={st}")
check("checklist: has status", chk.get("status") in {"READY", "NOT_READY", "NEEDS_VERIFICATION"}, str(chk.get("status")))

# 10. POST /checklist/evaluate not found
st, chknf = _req("POST", "/checklist/evaluate", {"serviceId": "nope", "held": [], "conditionAnswers": {}})
check("checklist 404", st == 404, f"status={st}")

# Report
passed = sum(1 for _, ok, _ in results if ok)
failed = len(results) - passed
print(f"\n{'='*60}\nNamma Seva AI - Postman Contract Run (local runner)\n{'='*60}")
for name, ok, detail in results:
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f"  -> {detail}" if not ok else ""))
print(f"{'-'*60}\nTotal: {len(results)} | Passed: {passed} | Failed: {failed}")
print(f"Success rate: {round(passed/len(results)*100)}%\n")
sys.exit(1 if failed else 0)
