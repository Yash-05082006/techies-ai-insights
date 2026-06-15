"""Token cost calculation using the model_pricing table."""

from app.utils.providers import normalize_provider

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.model_pricing import ModelPricing

# Fallback model names when exact pricing row is missing.
_MODEL_ALIASES: dict[tuple[str, str], str] = {
    ("google", "gemini-pro"): "gemini-1.5-pro",
    ("google", "gemini-2.0-flash"): "gemini-2.5-pro",
}


async def get_model_pricing(
    db: AsyncSession,
    provider: str,
    model: str,
) -> ModelPricing | None:
    """Return the latest pricing row for a provider + model pair."""
    normalized_provider = normalize_provider(provider)
    normalized_model = model.removeprefix("models/")

    for candidate in (normalized_model, _MODEL_ALIASES.get((normalized_provider, normalized_model))):
        if not candidate:
            continue
        result = await db.execute(
            select(ModelPricing)
            .where(
                ModelPricing.provider == normalized_provider,
                ModelPricing.model == candidate,
            )
            .order_by(ModelPricing.effective_from.desc())
            .limit(1)
        )
        pricing = result.scalar_one_or_none()
        if pricing is not None:
            return pricing

    return None


async def calculate_cost(
    db: AsyncSession,
    provider: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
) -> Decimal:
    """Compute USD cost from per-million token rates.

    Formula:
        (prompt_tokens * input_price + completion_tokens * output_price) / 1_000_000
    """
    pricing = await get_model_pricing(db, provider, model)
    if pricing is None:
        return Decimal("0")

    input_cost = Decimal(prompt_tokens) * pricing.input_price_per_million
    output_cost = Decimal(completion_tokens) * pricing.output_price_per_million
    return (input_cost + output_cost) / Decimal("1000000")
