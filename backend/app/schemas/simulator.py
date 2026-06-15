"""Pydantic schemas for what-if cost simulator (Phase 4+)."""

from decimal import Decimal

from pydantic import BaseModel, Field


class WhatIfRequest(BaseModel):
    current_model: str
    alternative_model: str
    monthly_requests: int = Field(ge=1)
    avg_input_tokens: int = Field(ge=1)
    avg_output_tokens: int = Field(ge=1)


class WhatIfResponse(BaseModel):
    current_model: str
    alternative_model: str
    current_monthly_cost: Decimal
    projected_monthly_cost: Decimal
    savings_amount: Decimal
    savings_percentage: float
    recommendation: str
