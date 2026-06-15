"""Pydantic schemas for optimization agent endpoints (Phase 4+)."""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OptimizationReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    application_id: UUID
    issue: str
    recommendation: str
    projected_savings: Decimal | None = None
    priority: str | None = None
    confidence_score: Decimal | None = None
    evidence: str | None = None
    reasoning: str | None = None
    lever: str | None = None
    status: str = "active"


class OptimizationAnalyzeRequest(BaseModel):
    application_id: UUID
    lookback_days: int = Field(default=30, ge=1, le=365)


class OptimizationAnalyzeResponse(BaseModel):
    current_monthly_spend: Decimal
    total_identified_savings: Decimal
    projected_spend: Decimal
    recommendations: list[OptimizationReportResponse]
