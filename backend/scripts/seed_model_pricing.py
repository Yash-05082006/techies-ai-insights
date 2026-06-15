#!/usr/bin/env python3
"""Seed model_pricing with common LLM rates for cost calculation.

Usage (from backend/):
    python scripts/seed_model_pricing.py
"""

import asyncio
import sys
from datetime import date
from decimal import Decimal
from pathlib import Path

# Allow running as: python scripts/seed_model_pricing.py
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import delete, select

from app import database
from app.models.model_pricing import ModelPricing

# Prices per 1M tokens (USD) — hackathon reference rates.
PRICING_ROWS = [
    # OpenAI
    ("openai", "gpt-4o", Decimal("5.00"), Decimal("15.00")),
    ("openai", "gpt-4o-mini", Decimal("0.15"), Decimal("0.60")),
    # Anthropic
    ("anthropic", "claude-sonnet-4-5", Decimal("3.00"), Decimal("15.00")),
    ("anthropic", "claude-sonnet-4-20250514", Decimal("3.00"), Decimal("15.00")),
    # Google
    ("google", "gemini-1.5-pro", Decimal("3.50"), Decimal("10.50")),
    ("google", "gemini-2.5-pro", Decimal("3.50"), Decimal("10.50")),
    # DeepSeek
    ("deepseek", "deepseek-v3", Decimal("0.14"), Decimal("0.28")),
    ("deepseek", "deepseek-chat", Decimal("0.14"), Decimal("0.28")),
]

EFFECTIVE_FROM = date(2025, 1, 1)


async def seed() -> None:
    await database.init_db()
    if database.async_session_factory is None:
        raise RuntimeError("Database session factory not initialized")

    async with database.async_session_factory() as session:
        existing = await session.execute(select(ModelPricing.id).limit(1))
        if existing.scalar_one_or_none() is not None:
            await session.execute(delete(ModelPricing))

        for provider, model, input_price, output_price in PRICING_ROWS:
            session.add(
                ModelPricing(
                    provider=provider,
                    model=model,
                    input_price_per_million=input_price,
                    output_price_per_million=output_price,
                    effective_from=EFFECTIVE_FROM,
                )
            )

        await session.commit()
        print(f"Seeded {len(PRICING_ROWS)} model pricing rows (effective_from={EFFECTIVE_FROM})")

    await database.close_db()


if __name__ == "__main__":
    asyncio.run(seed())
