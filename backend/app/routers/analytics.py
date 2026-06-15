"""Analytics endpoints powering dashboard and explorer screens."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.schemas.analytics import (
    ApplicationMetricsResponse,
    OverviewResponse,
    ProviderStats,
    RequestLogPage,
    TrendPoint,
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get("/overview", response_model=OverviewResponse)
async def analytics_overview(
    db: DbSession,
    range: str = Query(default="24h"),
) -> OverviewResponse:
    data = await analytics_service.get_overview(db, range_key=range)
    return OverviewResponse(**data)


@router.get("/cost-trend", response_model=list[TrendPoint])
async def analytics_cost_trend(
    db: DbSession,
    range: str = Query(default="24h"),
) -> list[TrendPoint]:
    rows = await analytics_service.get_cost_trend(db, range_key=range)
    return [TrendPoint(**row) for row in rows]


@router.get("/token-trend", response_model=list[TrendPoint])
async def analytics_token_trend(
    db: DbSession,
    range: str = Query(default="24h"),
) -> list[TrendPoint]:
    rows = await analytics_service.get_token_trend(db, range_key=range)
    return [TrendPoint(**row) for row in rows]


@router.get("/providers", response_model=list[ProviderStats])
async def analytics_providers(
    db: DbSession,
    range: str = Query(default="30d"),
) -> list[ProviderStats]:
    rows = await analytics_service.get_providers(db, range_key=range, include_pct=False)
    return [ProviderStats(**row) for row in rows]


@router.get("/provider-breakdown", response_model=list[ProviderStats])
async def analytics_provider_breakdown(
    db: DbSession,
    range: str = Query(default="30d"),
) -> list[ProviderStats]:
    rows = await analytics_service.get_providers(db, range_key=range, include_pct=True)
    return [ProviderStats(**row) for row in rows]


@router.get("/requests", response_model=RequestLogPage)
async def analytics_requests(
    db: DbSession,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    range: str | None = Query(default=None),
    status: str | None = Query(default=None),
    provider: str | None = Query(default=None),
    q: str | None = Query(default=None),
) -> RequestLogPage:
    data = await analytics_service.get_requests(
        db,
        limit=limit,
        offset=offset,
        range_key=range,
        status_filter=status,
        provider=provider,
        search=q,
    )
    return RequestLogPage(**data)


@router.get("/application/{application_id}", response_model=ApplicationMetricsResponse)
async def analytics_application(
    application_id: uuid.UUID,
    db: DbSession,
    range: str = Query(default="30d"),
) -> ApplicationMetricsResponse:
    data = await analytics_service.get_application_metrics(
        db,
        application_id,
        range_key=range,
    )
    if data is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationMetricsResponse(**data)


@router.get("/request-volume", response_model=list[TrendPoint])
async def analytics_request_volume(
    db: DbSession,
    range: str = Query(default="24h"),
) -> list[TrendPoint]:
    rows = await analytics_service.get_request_volume_trend(db, range_key=range)
    return [TrendPoint(**row) for row in rows]


@router.get("/latency-trend", response_model=list[TrendPoint])
async def analytics_latency_trend(
    db: DbSession,
    range: str = Query(default="24h"),
) -> list[TrendPoint]:
    rows = await analytics_service.get_latency_trend(db, range_key=range)
    return [TrendPoint(**row) for row in rows]
