"""Pydantic schemas for application endpoints (Phase 2+)."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ApplicationBase(BaseModel):
    application_name: str = Field(..., max_length=255)
    provider: str = Field(..., max_length=64)
    default_model: str | None = Field(default=None, max_length=128)
    upstream_base_url: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationResponse(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trace_key: str
    created_at: datetime
    proxy_url: str = "/proxy/v1"
