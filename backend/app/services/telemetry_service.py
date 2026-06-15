"""Persist captured LLM telemetry to the database."""

import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.llm_request import LLMRequest
from app.proxy.capture import CapturedTelemetry
from app.proxy.pricing import calculate_cost


async def store_llm_request(
    db: AsyncSession,
    *,
    application_id: uuid.UUID,
    endpoint: str,
    telemetry: CapturedTelemetry,
    cost: Decimal | None = None,
    feature: str | None = None,
    user_ref: str | None = None,
) -> LLMRequest:
    """Insert an llm_requests row from captured proxy telemetry."""
    if cost is None:
        cost = await calculate_cost(
            db,
            telemetry.provider,
            telemetry.model,
            telemetry.prompt_tokens,
            telemetry.completion_tokens,
        )

    record = LLMRequest(
        application_id=application_id,
        endpoint=endpoint,
        model=telemetry.model,
        prompt_tokens=telemetry.prompt_tokens,
        completion_tokens=telemetry.completion_tokens,
        total_tokens=telemetry.total_tokens,
        cost=cost,
        latency_ms=telemetry.latency_ms,
        status=telemetry.status,
        provider=telemetry.provider,
        feature=feature,
        user_ref=user_ref,
        prompt_preview=telemetry.prompt_preview,
        completion_preview=telemetry.completion_preview,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record
