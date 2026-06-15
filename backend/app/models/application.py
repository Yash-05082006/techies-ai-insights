"""Connected LLM application model."""

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Application(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A customer application instrumented through the TRACEai proxy."""

    __tablename__ = "applications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    application_name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    default_model: Mapped[str | None] = mapped_column(String(128), nullable=True)
    trace_key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    upstream_base_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="applications")
    llm_requests: Mapped[list["LLMRequest"]] = relationship(
        "LLMRequest",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    optimization_reports: Mapped[list["OptimizationReport"]] = relationship(
        "OptimizationReport",
        back_populates="application",
        cascade="all, delete-orphan",
    )
