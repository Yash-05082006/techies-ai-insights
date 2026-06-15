"""LLM model pricing reference table."""

from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ModelPricing(Base):
    """Per-model token pricing used to calculate request cost."""

    __tablename__ = "model_pricing"
    __table_args__ = (UniqueConstraint("provider", "model", "effective_from", name="uq_model_pricing"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    input_price_per_million: Mapped[Decimal] = mapped_column(Numeric(12, 6), nullable=False)
    output_price_per_million: Mapped[Decimal] = mapped_column(Numeric(12, 6), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
