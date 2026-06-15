"""Optimization agent recommendation model."""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OptimizationReport(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Telemetry-grounded cost optimization recommendation."""

    __tablename__ = "optimization_reports"

    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    issue: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    projected_savings: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    priority: Mapped[str | None] = mapped_column(String(16), nullable=True)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(4, 3), nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    lever: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active", server_default="active")

    application: Mapped["Application"] = relationship(
        "Application",
        back_populates="optimization_reports",
    )
