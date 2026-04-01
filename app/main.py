"""
Operis — Operational Intelligence System
FastAPI entry point.
"""

import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base
from app.models import event, signal, digest, project_health, monitoring_cycle  # noqa

from app.api.routes import monitoring_routes, signal_routes, digest_routes, health_routes
from app.scheduler.monitoring_scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("operis.main")


async def safe_start_scheduler():
    await asyncio.sleep(3)
    try:
        logger.info("Starting scheduler...")
        start_scheduler()
        logger.info("Scheduler started")
    except Exception as e:
        logger.error(f"Scheduler failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Operis initializing")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema ready")
    except Exception as e:
        logger.error(f"DB init failed: {e}")

    asyncio.create_task(safe_start_scheduler())

    yield   # ← NO while True here. FastAPI holds the app alive.

    try:
        stop_scheduler()
        logger.info("Scheduler stopped")
    except Exception as e:
        logger.error(f"Scheduler shutdown error: {e}")
    logger.info("Operis shutdown complete")


app = FastAPI(
    title="Operis — Operational Intelligence System",
    description="Decision Intelligence for Founders",
    version="2.0.0",
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
        "system":  "Operis",
        "version": "2.0.0",
        "status":  "operational",
        "pipeline": "dataset → events → signals → suppression → decisions → digest",
    }