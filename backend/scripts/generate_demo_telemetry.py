#!/usr/bin/env python3
"""Generate realistic demo telemetry for dashboard and analytics development.

Usage (from backend/):
    python scripts/generate_demo_telemetry.py
    python scripts/generate_demo_telemetry.py --count 2500
    python scripts/generate_demo_telemetry.py --count 2000 --clear
"""

from __future__ import annotations

import argparse
import asyncio
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import delete, select

from app import database
from app.models.application import Application
from app.models.llm_request import LLMRequest
from app.utils.trace_keys import generate_trace_key

# ---------------------------------------------------------------------------
# Reference pricing (USD per 1M tokens) — mirrors seed_model_pricing.py
# ---------------------------------------------------------------------------
PRICING: dict[tuple[str, str], tuple[Decimal, Decimal]] = {
    ("openai", "gpt-4o"): (Decimal("5.00"), Decimal("15.00")),
    ("openai", "gpt-4o-mini"): (Decimal("0.15"), Decimal("0.60")),
    ("anthropic", "claude-sonnet-4-5"): (Decimal("3.00"), Decimal("15.00")),
    ("google", "gemini-1.5-pro"): (Decimal("3.50"), Decimal("10.50")),
    ("google", "gemini-2.5-pro"): (Decimal("3.50"), Decimal("10.50")),
    ("deepseek", "deepseek-chat"): (Decimal("0.14"), Decimal("0.28")),
}

PROVIDER_WEIGHTS: list[tuple[str, float]] = [
    ("openai", 0.55),
    ("anthropic", 0.20),
    ("google", 0.15),
    ("deepseek", 0.10),
]

MODELS_BY_PROVIDER: dict[str, list[str]] = {
    "openai": ["gpt-4o", "gpt-4o-mini"],
    "anthropic": ["claude-sonnet-4-5"],
    "google": ["gemini-1.5-pro", "gemini-2.5-pro"],
    "deepseek": ["deepseek-chat"],
}

# Within-provider model weights (premium vs economical)
MODEL_WEIGHTS: dict[str, list[tuple[str, float]]] = {
    "openai": [("gpt-4o", 0.35), ("gpt-4o-mini", 0.65)],
    "google": [("gemini-1.5-pro", 0.40), ("gemini-2.5-pro", 0.60)],
}

FEATURES = ["chat", "summarization", "classification", "support-bot", "knowledge-search"]

FEATURE_WEIGHTS: list[tuple[str, float]] = [
    ("chat", 0.28),
    ("summarization", 0.22),
    ("classification", 0.18),
    ("support-bot", 0.20),
    ("knowledge-search", 0.12),
]

ENDPOINTS_BY_PROVIDER: dict[str, list[str]] = {
    "openai": ["/proxy/v1/chat/completions", "/v1/chat/completions"],
    "anthropic": ["/proxy/v1/chat/completions", "/v1/messages"],
    "google": ["/proxy/v1/chat/completions"],
    "deepseek": ["/proxy/v1/chat/completions", "/v1/chat/completions"],
}

STATUS_WEIGHTS: list[tuple[int, float]] = [
    (200, 0.95),
    (429, 0.03),
    (500, 0.02),
]

PROMPT_SNIPPETS: dict[str, list[str]] = {
    "chat": [
        "Explain quantum computing in simple terms.",
        "Draft a friendly follow-up email to a prospect.",
        "What are three ideas for a team offsite agenda?",
    ],
    "summarization": [
        "Summarize the following quarterly report into 5 bullet points...",
        "Condense this 12-page policy document into executive highlights.",
        "TL;DR this meeting transcript focusing on action items.",
    ],
    "classification": [
        "Classify this ticket into billing, technical, or account.",
        "Label sentiment: positive, negative, or neutral.",
        "Route this message to sales, support, or engineering.",
    ],
    "support-bot": [
        "A customer asks why their invoice shows $49 instead of $29...",
        "User cannot reset password — draft a troubleshooting reply.",
        "Explain our refund policy for annual subscriptions.",
    ],
    "knowledge-search": [
        "Given retrieved context, answer: what is the SLA for enterprise?",
        "Using the docs below, explain how to rotate API keys.",
        "RAG query: compare Pro vs Enterprise feature matrix.",
    ],
}

COMPLETION_SNIPPETS: dict[str, list[str]] = {
    "chat": ["Here is a concise explanation...", "Sure — here's a draft you can send..."],
    "summarization": ["• Revenue grew 18% YoY\n• Margin expanded 220bps\n• Guidance raised"],
    "classification": ["billing", "neutral", "support"],
    "support-bot": ["Hi there — thanks for reaching out. The $49 charge reflects..."],
    "knowledge-search": ["Per the enterprise SLA documentation, uptime is 99.9%..."],
}

DEMO_APP_PREFIX = "demo-telemetry-"


def _weighted_choice(options: list[tuple], rng: random.Random):
    items, weights = zip(*options)
    return rng.choices(items, weights=weights, k=1)[0]


def _token_profile(feature: str, model: str, rng: random.Random) -> tuple[int, int]:
    """Return realistic (prompt_tokens, completion_tokens) for feature + model."""
    if feature == "classification":
        prompt = rng.randint(80, 350)
        completion = rng.randint(5, 40)
    elif feature == "summarization":
        prompt = rng.randint(1200, 4800)
        completion = rng.randint(150, 600)
    elif feature == "knowledge-search":
        prompt = rng.randint(1800, 6200)
        completion = rng.randint(120, 500)
    elif feature == "support-bot":
        prompt = rng.randint(200, 900)
        completion = rng.randint(80, 350)
    else:  # chat
        prompt = rng.randint(120, 1800)
        completion = rng.randint(40, 450)

    # Economical models skew toward shorter requests
    if model in {"gpt-4o-mini", "deepseek-chat"}:
        prompt = int(prompt * rng.uniform(0.55, 0.85))
        completion = int(completion * rng.uniform(0.6, 0.9))

    return max(prompt, 1), max(completion, 1)


def _latency_ms(model: str, status: int, total_tokens: int, rng: random.Random) -> int:
    if status != 200:
        return rng.randint(800, 4200)
    base = {
        "gpt-4o": 1400,
        "gpt-4o-mini": 420,
        "claude-sonnet-4-5": 1100,
        "gemini-1.5-pro": 950,
        "gemini-2.5-pro": 880,
        "deepseek-chat": 620,
    }.get(model, 900)
    scale = 1 + (total_tokens / 4000)
    return int(rng.gauss(base * scale, base * 0.18))


def _calculate_cost(provider: str, model: str, prompt_tokens: int, completion_tokens: int) -> Decimal:
    rates = PRICING.get((provider, model))
    if not rates:
        return Decimal("0")
    input_price, output_price = rates
    return (
        Decimal(prompt_tokens) * input_price + Decimal(completion_tokens) * output_price
    ) / Decimal("1000000")


def _random_timestamp(rng: random.Random, now: datetime) -> datetime:
    """Spread records across 24h / 7d / 30d windows with realistic density."""
    bucket = _weighted_choice([(24, 0.40), (168, 0.35), (720, 0.25)], rng)
    if bucket == 24:
        offset_hours = rng.uniform(0, 24)
    elif bucket == 168:
        offset_hours = rng.uniform(24, 168)
    else:
        offset_hours = rng.uniform(168, 720)
    return now - timedelta(hours=offset_hours, minutes=rng.uniform(0, 59))


def _pick_model(provider: str, rng: random.Random) -> str:
    if provider in MODEL_WEIGHTS:
        return _weighted_choice(MODEL_WEIGHTS[provider], rng)
    return rng.choice(MODELS_BY_PROVIDER[provider])


def _build_record(
    application_id: uuid.UUID,
    rng: random.Random,
    now: datetime,
) -> LLMRequest:
    provider = _weighted_choice(PROVIDER_WEIGHTS, rng)
    model = _pick_model(provider, rng)
    feature = _weighted_choice(FEATURE_WEIGHTS, rng)
    status = _weighted_choice(STATUS_WEIGHTS, rng)

    prompt_tokens, completion_tokens = _token_profile(feature, model, rng)
    total_tokens = prompt_tokens + completion_tokens
    latency_ms = _latency_ms(model, status, total_tokens, rng)
    cost = _calculate_cost(provider, model, prompt_tokens, completion_tokens)

    if status != 200:
        completion_tokens = 0 if status == 429 else rng.randint(0, 20)
        total_tokens = prompt_tokens + completion_tokens
        cost = _calculate_cost(provider, model, prompt_tokens, completion_tokens) if prompt_tokens else Decimal("0")

    ttft_ms = None
    if status == 200:
        ttft_ms = max(50, int(latency_ms * rng.uniform(0.12, 0.35)))

    endpoint = rng.choice(ENDPOINTS_BY_PROVIDER[provider])
    created_at = _random_timestamp(rng, now)

    return LLMRequest(
        application_id=application_id,
        endpoint=endpoint,
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        cost=cost,
        latency_ms=latency_ms,
        ttft_ms=ttft_ms,
        status=status,
        provider=provider,
        feature=feature,
        user_ref=f"u_{rng.randint(1000, 9999)}",
        prompt_preview=rng.choice(PROMPT_SNIPPETS[feature]),
        completion_preview=(
            rng.choice(COMPLETION_SNIPPETS[feature]) if status == 200 else None
        ),
        created_at=created_at,
    )


async def _ensure_demo_application(session) -> Application:
    """Reuse or create a single demo application for seeded telemetry."""
    result = await session.execute(
        select(Application).where(Application.application_name == f"{DEMO_APP_PREFIX}platform")
    )
    app = result.scalar_one_or_none()
    if app:
        return app

    app = Application(
        application_name=f"{DEMO_APP_PREFIX}platform",
        provider="openai",
        default_model="gpt-4o-mini",
        trace_key=generate_trace_key(),
        upstream_base_url="https://api.openai.com/v1",
    )
    session.add(app)
    await session.flush()
    return app


async def generate(count: int, clear: bool, seed: int) -> int:
    rng = random.Random(seed)
    now = datetime.now(timezone.utc)

    await database.init_db()
    if database.async_session_factory is None:
        raise RuntimeError("Database session factory not initialized")

    inserted = 0
    async with database.async_session_factory() as session:
        app = await _ensure_demo_application(session)
        await session.commit()
        await session.refresh(app)

        if clear:
            result = await session.execute(
                delete(LLMRequest).where(LLMRequest.application_id == app.id)
            )
            print(f"Cleared {result.rowcount or 0} existing demo telemetry rows")

        batch_size = 250
        batch: list[LLMRequest] = []

        for _ in range(count):
            batch.append(_build_record(app.id, rng, now))
            if len(batch) >= batch_size:
                session.add_all(batch)
                await session.commit()
                inserted += len(batch)
                batch.clear()

        if batch:
            session.add_all(batch)
            await session.commit()
            inserted += len(batch)

        print(f"Demo application id: {app.id}")
        print(f"Demo trace key:      {app.trace_key}")

    await database.close_db()
    return inserted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate demo llm_requests telemetry")
    parser.add_argument(
        "--count",
        type=int,
        default=2000,
        help="Number of records to insert (recommended: 1000-3000)",
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Delete existing telemetry for the demo application before inserting",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    if not 1000 <= args.count <= 3000:
        print(f"Warning: count {args.count} is outside 1000-3000; proceeding anyway.")

    inserted = await generate(count=args.count, clear=args.clear, seed=args.seed)
    print(f"Inserted {inserted} telemetry records into llm_requests")


if __name__ == "__main__":
    asyncio.run(main())
