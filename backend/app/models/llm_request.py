"""Captured LLM request telemetry model."""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class LLMRequest(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One proxied LLM API call and its usage metrics."""

    __tablename__ = "llm_requests"
    __table_args__ = (
        Index("ix_llm_requests_application_id_created_at", "application_id", "created_at"),
        Index("ix_llm_requests_model_created_at", "model", "created_at"),
        Index("ix_llm_requests_status_created_at", "status", "created_at"),
    )

    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
    )
    endpoint: Mapped[str] = mapped_column(String(255), nullable=False)
    model: Mapped[str] = mapped_column(String(128), nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    completion_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    cost: Mapped[Decimal] = mapped_column(Numeric(12, 6), nullable=False, default=Decimal("0"))
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ttft_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    feature: Mapped[str | None] = mapped_column(String(128), nullable=True)
    user_ref: Mapped[str | None] = mapped_column(String(128), nullable=True)
    prompt_preview: Mapped[str | None] = mapped_column(Text, nullable=True)
    completion_preview: Mapped[str | None] = mapped_column(Text, nullable=True)

    application: Mapped["Application"] = relationship("Application", back_populates="llm_requests")
