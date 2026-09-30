"""FastAPI application for Namma Seva AI (Phase 1 vertical slice).

Endpoints per shared/CONTRACT.md. All data is DEMO/mock. No Bedrock dependency.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.ai.provider import get_provider
from app.domain.discovery import DiscoveryResult, discover
from app.domain.models import ReadinessResult, ServiceCategory, ServiceRecord
from app.domain.rag_assistant import GroundedResponse, ask
from app.domain.readiness import evaluate_readiness
from app.knowledge.knowledge_base import KnowledgeBase

app = FastAPI(title="Namma Seva AI", version="0.1.0-demo")

# Frontend dev server (Vite default). Adjust via config for other origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

kb = KnowledgeBase.load()
provider = get_provider()


class DiscoverRequest(BaseModel):
    query: str
    language: str = "en"


class AskRequest(BaseModel):
    query: str
    language: str = "en"


class ChecklistRequest(BaseModel):
    service_id: str = Field(alias="serviceId")
    held: list[str] = []
    condition_answers: dict[str, bool] = Field(default_factory=dict, alias="conditionAnswers")

    model_config = {"populate_by_name": True}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/discover", response_model=DiscoveryResult)
def post_discover(req: DiscoverRequest) -> DiscoveryResult:
    return discover(kb, req.query, req.language)


@app.post("/ask", response_model=GroundedResponse)
def post_ask(req: AskRequest) -> GroundedResponse:
    return ask(kb, provider, req.query, req.language)


@app.get("/categories", response_model=list[ServiceCategory])
def get_categories() -> list[ServiceCategory]:
    return kb.all_categories()


@app.get("/services", response_model=list[ServiceRecord])
def get_services(category: ServiceCategory | None = Query(default=None)) -> list[ServiceRecord]:
    if category is not None:
        return kb.list_by_category(category)
    return kb.list_all()


@app.get("/services/{service_id}", response_model=ServiceRecord)
def get_service(service_id: str) -> ServiceRecord:
    record = kb.get_by_id(service_id)
    if record is None:
        raise HTTPException(status_code=404, detail="service not found")
    return record


@app.post("/checklist/evaluate", response_model=ReadinessResult)
def post_checklist(req: ChecklistRequest) -> ReadinessResult:
    service = kb.get_by_id(req.service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="service not found")
    return evaluate_readiness(service, set(req.held), req.condition_answers)
