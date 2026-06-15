"""TRACEai FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import close_db, init_db
from app.routers import health

logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage startup and shutdown resources (database connection pool)."""
    logger.info("Starting TRACEai API — initializing database pool")
    await init_db()
    yield
    logger.info("Shutting down TRACEai API — closing database pool")
    await close_db()


app = FastAPI(
    title="TRACEai API",
    description="LLM Observability & AI Cost Optimization Platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
