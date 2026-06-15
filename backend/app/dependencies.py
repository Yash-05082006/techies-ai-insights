"""FastAPI dependency injection helpers."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide an async SQLAlchemy session to route handlers."""
    async for session in get_db_session():
        yield session
