"""Async SQLAlchemy engine, session factory, and connectivity helpers."""

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

engine: AsyncEngine | None = None
async_session_factory: async_sessionmaker[AsyncSession] | None = None


def _build_connect_args() -> dict:
    """asyncpg SSL settings for Neon."""
    if settings.database_requires_ssl:
        return {"ssl": True}
    return {}


async def init_db() -> None:
    """Create the async engine and session factory (lifespan startup)."""
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
    """Dispose of the connection pool (lifespan shutdown)."""
    global engine, async_session_factory

    if engine is not None:
        await engine.dispose()
    engine = None
    async_session_factory = None


async def check_database_connection() -> bool:
    """Ping the database with SELECT 1."""
    if engine is None:
        return False

    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a request-scoped async session."""
    if async_session_factory is None:
        raise RuntimeError("Database is not initialized. Did the app lifespan run?")

    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
