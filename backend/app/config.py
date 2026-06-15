"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_CORS_ORIGINS = ",".join(
    [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
    ]
)


class Settings(BaseSettings):
    """Runtime settings for the TRACEai API (single-user hackathon mode)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = Field(..., description="PostgreSQL connection URL (Neon)")
    openai_api_key: str | None = Field(default=None)
    gemini_api_key: str | None = Field(default=None)
    log_level: str = Field(default="INFO")
    cors_origins: str = Field(
        default=DEFAULT_CORS_ORIGINS,
        description="Comma-separated browser origins allowed for CORS",
    )

    @property
    def async_database_url(self) -> str:
        """Return asyncpg-compatible URL without unsupported query parameters."""
        base_url = self.database_url.split("?")[0]
        if base_url.startswith("postgresql+asyncpg://"):
            return base_url
        if base_url.startswith("postgresql://"):
            return base_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return base_url

    @property
    def database_requires_ssl(self) -> bool:
        """Whether SSL is required (Neon / cloud Postgres)."""
        return "sslmode=require" in self.database_url or "neon" in self.database_url

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated (or newline-separated) CORS origins."""
        seen: set[str] = set()
        origins: list[str] = []
        for part in self.cors_origins.replace("\n", ",").split(","):
            origin = part.strip().rstrip("/")
            if origin and origin not in seen:
                seen.add(origin)
                origins.append(origin)
        return origins


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()
