"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for the TRACEai API.

    Values are read from environment variables and optional ``backend/.env``.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = Field(..., description="PostgreSQL connection URL")
    jwt_secret: str = Field(default="dev-secret-change-in-production")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expire_minutes: int = Field(default=60)
    cors_origins: str = Field(default="http://localhost:8080")
    openai_api_key: str | None = Field(default=None)
    log_level: str = Field(default="INFO")

    @property
    def async_database_url(self) -> str:
        """Return a SQLAlchemy async URL suitable for asyncpg.

        Neon and other providers often supply ``postgresql://`` URLs with
        query parameters (``sslmode``, ``channel_binding``) that asyncpg
        does not accept on the URL string. We strip those and pass SSL via
        ``connect_args`` in ``database.py`` instead.
        """
        base_url = self.database_url.split("?")[0]
        if base_url.startswith("postgresql+asyncpg://"):
            return base_url
        if base_url.startswith("postgresql://"):
            return base_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return base_url

    @property
    def database_requires_ssl(self) -> bool:
        """Whether the configured database URL requests SSL."""
        return "sslmode=require" in self.database_url or "neon" in self.database_url

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — safe to call on every request."""
    return Settings()


settings = get_settings()
