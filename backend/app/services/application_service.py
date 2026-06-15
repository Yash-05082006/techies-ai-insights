"""Application CRUD and trace-key lookup."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.schemas.application import ApplicationCreate
from app.utils.providers import normalize_provider
from app.utils.trace_keys import generate_trace_key

DEFAULT_UPSTREAM_URLS: dict[str, str] = {
    "openai": "https://api.openai.com/v1",
    "anthropic": "https://api.anthropic.com/v1",
    "google": "https://generativelanguage.googleapis.com/v1beta",
    "gemini": "https://generativelanguage.googleapis.com/v1beta",
    "deepseek": "https://api.deepseek.com/v1",
}


def resolve_upstream_base_url(provider: str, upstream_base_url: str | None) -> str:
    """Use explicit URL or fall back to provider default."""
    if upstream_base_url:
        return upstream_base_url.rstrip("/")
    key = normalize_provider(provider)
    if key == "google":
        return DEFAULT_UPSTREAM_URLS["google"]
    return DEFAULT_UPSTREAM_URLS.get(provider.lower(), DEFAULT_UPSTREAM_URLS["openai"])


async def create_application(db: AsyncSession, payload: ApplicationCreate) -> Application:
    """Create an application with a generated trace key."""
    application = Application(
        application_name=payload.application_name,
        provider=payload.provider,
        default_model=payload.default_model,
        trace_key=generate_trace_key(),
        upstream_base_url=resolve_upstream_base_url(payload.provider, payload.upstream_base_url),
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def list_applications(db: AsyncSession) -> list[Application]:
    """Return all applications ordered by creation time."""
    result = await db.execute(select(Application).order_by(Application.created_at.desc()))
    return list(result.scalars().all())


async def get_application(db: AsyncSession, application_id: uuid.UUID) -> Application | None:
    """Fetch a single application by primary key."""
    result = await db.execute(select(Application).where(Application.id == application_id))
    return result.scalar_one_or_none()


async def get_application_by_trace_key(db: AsyncSession, trace_key: str) -> Application | None:
    """Resolve an application from the x-trace-key header value."""
    result = await db.execute(select(Application).where(Application.trace_key == trace_key))
    return result.scalar_one_or_none()
