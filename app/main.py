"""
Operis — Operational Intelligence System
FastAPI application entry point.
Registers routers, initializes PostgreSQL schema, and safely manages scheduler lifecycle.
"""

import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base

# Register all models
from app.models import event, signal, digest, project_health, monitoring_cycle  # noqa: F401

from app.api.routes import monitoring_routes, signal_routes, digest_routes, health_routes
from app.scheduler.monitoring_scheduler import start_scheduler, stop_scheduler


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("operis.main")


async def safe_start_scheduler():
    """Delay scheduler start to ensure DB + env ready."""
    await asyncio.sleep(5)

    try:
        logger.info("Starting monitoring scheduler...")
        start_scheduler()
        logger.info("Scheduler started successfully")

    except Exception as e:
        logger.error(f"Scheduler failed to start: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown safely."""
    logger.info("Operis backend initializing")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema ready")

    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    asyncio.create_task(safe_start_scheduler())

    yield

    try:
        stop_scheduler()
        logger.info("Scheduler stopped")

    except Exception as e:
        logger.error(f"Scheduler shutdown error: {e}")

    logger.info("Operis backend shutdown complete")


app = FastAPI(
    title="Operis — Operational Intelligence System",
    description="Cross-Tool Signal Detection, Risk Monitoring, and Action Recommendation for Founders",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(monitoring_routes.router)
app.include_router(signal_routes.router)
app.include_router(digest_routes.router)
app.include_router(health_routes.router)


@app.get("/", tags=["System"])
def root():
    return {
        "system": "Operis",
        "status": "operational",
        "version": "1.0.0",
    }