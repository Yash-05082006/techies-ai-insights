"""Application management endpoints (single-user — no auth)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.services import application_service

router = APIRouter(prefix="/applications", tags=["applications"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


def _to_response(application) -> ApplicationResponse:
    return ApplicationResponse(
        id=application.id,
        application_name=application.application_name,
        provider=application.provider,
        default_model=application.default_model,
        upstream_base_url=application.upstream_base_url,
        trace_key=application.trace_key,
        created_at=application.created_at,
        proxy_url="/proxy/v1",
    )


@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(payload: ApplicationCreate, db: DbSession) -> ApplicationResponse:
    """Register a new instrumented application and receive a trace key."""
    application = await application_service.create_application(db, payload)
    return _to_response(application)


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(db: DbSession) -> list[ApplicationResponse]:
    """List all registered applications."""
    applications = await application_service.list_applications(db)
    return [_to_response(app) for app in applications]


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: uuid.UUID, db: DbSession) -> ApplicationResponse:
    """Get a single application by ID."""
    application = await application_service.get_application(db, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return _to_response(application)
