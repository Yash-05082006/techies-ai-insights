"""TRACEai FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_database_connection, close_db, init_db
from app.proxy.router import router as proxy_router
from app.routers import analytics, applications, health

logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize resources on startup and clean up on shutdown."""
    logger.info("Starting TRACEai API")
    await init_db()

    if not await check_database_connection():
        await close_db()
        raise RuntimeError("Database connection failed at startup — check DATABASE_URL")

    logger.info("Database connection verified")
    yield

    logger.info("Shutting down TRACEai API")
    await close_db()


app = FastAPI(
    title="TRACEai API",
    description="LLM Observability & AI Cost Optimization Platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(applications.router)
app.include_router(proxy_router)
app.include_router(analytics.router)
