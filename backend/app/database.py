"""Async SQLAlchemy engine and session factory."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

# Module-level engine and session factory — initialized during app lifespan.
engine: AsyncEngine | None = None
async_session_factory: async_sessionmaker[AsyncSession] | None = None


def _build_connect_args() -> dict:
    """Build asyncpg connect arguments (SSL for Neon / cloud Postgres)."""
    if settings.database_requires_ssl:
        return {"ssl": True}
    return {}


async def init_db() -> None:
    """Create the async engine and session factory.

    Called once when the FastAPI application starts (lifespan startup).
    """
    global engine, async_session_factory

    engine = create_async_engine(
        settings.async_database_url,
        echo=settings.log_level.upper() == "DEBUG",
        pool_pre_ping=True,
        connect_args=_build_connect_args(),
    )
    async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


async def close_db() -> None:
    """Dispose of the connection pool on application shutdown."""
    global engine, async_session_factory

    if engine is not None:
        await engine.dispose()
    engine = None
    async_session_factory = None


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session for request-scoped dependency injection."""
    if async_session_factory is None:
        raise RuntimeError("Database is not initialized. Did the app lifespan run?")

    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
